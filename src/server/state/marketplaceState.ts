import {BaseState} from "./baseState";
import {IGame, MarketplaceSeller} from "../types/game.interface";
import {GoodType, Marketplace, PlanetMarketplace, UserShip} from "spacetraders-api-sdk";
import {MarketplaceProfit} from "../types/marketplace.interface";
import {distance} from "../utils/math";
import {API} from "../API";
import {MarketplaceProfitType} from "../types/marketplace.type";
import {TradeStrategy} from "../types/enums/trade.enum";
import logger from "../logger";
import {PROFIT_DIST_MULT} from "../constants/profit";
import NodeCache from "node-cache";
import {CONFIG} from "../config";
import {calculateRequiredFuel, calculateTravelTime} from "../utils/ship";

export class MarketplaceState extends BaseState<NodeCache> {
    private _bestSellers: Map<GoodType, MarketplaceSeller>;
    private _bestBuyers: Map<GoodType, MarketplaceSeller>;
    private _bestProfit: MarketplaceProfit[];
    private _worstProfit: MarketplaceProfit[];

    constructor(game: IGame) {
        super(game, new NodeCache({stdTTL: CONFIG.get('cacheTTL'), checkperiod: 300}));
        this._bestSellers = new Map<GoodType, MarketplaceSeller>();
        this._bestBuyers = new Map<GoodType, MarketplaceSeller>();
        this._bestProfit = [];
        this._worstProfit = [];
    }

    get bestProfit() {
        return this._bestProfit;
    }

    get worstProfit() {
        return this._worstProfit;
    }

    async initializeState(): Promise<void> {
        this._isInitialized = new Promise(r => r(false));
    }

    getMarketplaceData(symbol: string) {
        return symbol ? this._data.get<PlanetMarketplace>(symbol) : undefined;
    }

    async getOrCreatePlanetMarketplace(location: string): Promise<PlanetMarketplace> {
        const marketplace = this.getMarketplaceData(location);
        if (marketplace) return marketplace;

        const marketplaceResponse = await API.game.getLocationMarketplace(location);
        return this.addMarketplaceData(marketplaceResponse.location);
    }

    addMarketplaceData(planetMarketplace: PlanetMarketplace) {
        this._data.set(planetMarketplace.symbol, planetMarketplace);

        this.computeBestBuyers();
        this.computeBestSellers();
        this.computeBestProfit();
        this.computeLeastProfitable();

        return planetMarketplace;
    }

    getTradesBy(sortedBy: MarketplaceProfitType, strategy: TradeStrategy = TradeStrategy.Profit, ship?: UserShip) {
        let source = strategy === TradeStrategy.Profit ? this._bestProfit : this._worstProfit;
        if (ship) {
            // Add rate of return
            for (const marketplaceProfit of source) {
                marketplaceProfit.ror = this.calculateRateOfReturn(ship, marketplaceProfit.buy, marketplaceProfit.sell);
            }
        }

        const blockedTrades = CONFIG.get('blockedTradeItems');
        if (blockedTrades && blockedTrades.length > 0) {
            // Remove blocked trades from source
            source = source.filter(t => !blockedTrades.includes(t.symbol));
        }

        return source.sort((a, b) =>
            (b[sortedBy] ?? b["profitPerItem"]) - (a[sortedBy] ?? a["profitPerItem"]));
    }

    getBestTradeBy(sortedBy: MarketplaceProfitType, strategy: TradeStrategy = TradeStrategy.Profit, ship?: UserShip) {
        const bestTrade = this.getTradesBy(sortedBy, strategy, ship)[0];
        if (!bestTrade) return undefined;
        const property = bestTrade[sortedBy];
        // Check if the trade if even worth it
        if (!property || property <= 0) return undefined;
        return bestTrade;
    }

    computeBestProfit() {
        const bestProfit: MarketplaceProfit[] = [];

        this._bestBuyers.forEach((value, key) => {
            const bestSell = this._bestSellers.get(key);
            if (!bestSell || bestSell.pricePerUnit === value.pricePerUnit) return;

            const gainPerItem = (bestSell.pricePerUnit - value.pricePerUnit) ?? 0;
            const dist = Math.round(distance(value.location, bestSell.location));
            const distFactor = dist * PROFIT_DIST_MULT;

            const profit = {
                gainPerItem: gainPerItem,
                gainPerVolume: Math.floor(gainPerItem / (!value.volumePerUnit ? 1 : value.volumePerUnit)),
                gainPerItemPercentage: Number((gainPerItem / value.pricePerUnit * 100).toFixed(0))
            }

            bestProfit.push({
                symbol: key,
                buy: value,
                sell: bestSell,
                profitPerItem: (profit.gainPerItem / distFactor) ?? 0,
                profitPerVolume: (profit.gainPerVolume / distFactor) ?? 0,
                profitPerItemPercentage: (profit.gainPerItemPercentage / distFactor) ?? 0,
                distance: dist,
                ...profit
            });
        });

        this._bestProfit = bestProfit.sort((a, b) => b.profitPerVolume - a.profitPerVolume);
        this._isInitialized = new Promise(r => r(true));
        logger.debug(`Most profitable trades`, {bestProfit: this._bestProfit});
        return this._bestProfit;
    }

    computeLeastProfitable() {
        const worstProfit: MarketplaceProfit[] = [];

        this._bestSellers.forEach((value, key) => {
            const bestBuy = this._bestBuyers.get(key);
            if (!bestBuy || bestBuy.pricePerUnit === value.pricePerUnit) return;

            const gainPerItem = (value.pricePerUnit - bestBuy.pricePerUnit) ?? 0;
            const dist = Math.round(distance(value.location, bestBuy.location));
            const distFactor = dist * PROFIT_DIST_MULT;

            const profit = {
                gainPerItem: gainPerItem,
                gainPerVolume: Math.floor(gainPerItem / (!value.volumePerUnit ? 1 : value.volumePerUnit)),
                gainPerItemPercentage: Number((gainPerItem / bestBuy.pricePerUnit * 100).toFixed(0))
            }

            worstProfit.push({
                symbol: key,
                buy: bestBuy,
                sell: value,
                profitPerItem: distFactor <= 0 ? 0 : profit.gainPerItem / distFactor,
                profitPerVolume: distFactor <= 0 ? 0 : profit.gainPerVolume / distFactor,
                profitPerItemPercentage: distFactor <= 0 ? 0 : profit.gainPerItemPercentage / distFactor,
                distance: dist,
                ...profit
            });
        });

        this._worstProfit = worstProfit.sort((a, b) => a.profitPerVolume - b.profitPerVolume);
        this._isInitialized = new Promise(r => r(true));
        return this._worstProfit;
    }

    private computeBestSellers() {
        const bestSellers = this.marketplaceSellersComputation(
            (a, b) => a.pricePerUnit > b.pricePerUnit, false);
        this._bestSellers = bestSellers;
        return bestSellers;
    }

    private computeBestBuyers() {
        const bestBuyer = this.marketplaceSellersComputation(
            (a, b) => a.pricePerUnit < b.pricePerUnit);
        this._bestBuyers = bestBuyer;
        return bestBuyer;
    }

    private marketplaceSellersComputation(priceCheck: (a: MarketplaceSeller, b: Marketplace) => boolean, buying = true) {
        const sellersMap = new Map<GoodType, MarketplaceSeller>();

        for (const key of this._data.keys()) {
            const planet = this._data.get<PlanetMarketplace>(key);
            if (!planet) continue;

            for (const product of planet.marketplace) {
                if (!product.quantityAvailable) continue;

                const addedProduct = sellersMap.get(product.symbol);
                if (addedProduct && priceCheck(addedProduct, product)) continue;

                sellersMap.set(product.symbol, {
                    pricePerUnit: buying ? product.purchasePricePerUnit : product.sellPricePerUnit,
                    volumePerUnit: product.volumePerUnit,
                    available: product.quantityAvailable,
                    location: {
                        symbol: planet.symbol,
                        name: planet.name,
                        type: planet.type,
                        x: planet.x,
                        y: planet.y
                    }
                });
            }
        }

        return sellersMap;
    }

    private calculateRateOfReturn(ship: UserShip, buy: MarketplaceSeller, sell: MarketplaceSeller) {
        const fuelNeeded = calculateRequiredFuel(buy.location, sell.location);
        const shipPrice = this._game.state.shipShopState.getPriceOfShip(ship.type) ?? 100000;
        const flightTimeInHours = calculateTravelTime(ship.speed, buy.location, sell.location) / 3600;

        const quantity = Math.min(buy.available, Math.floor((ship.maxCargo - fuelNeeded) / buy.volumePerUnit));

        return Math.pow((1 + (sell.pricePerUnit - buy.pricePerUnit) * quantity / (buy.pricePerUnit * quantity + shipPrice)), 1 / flightTimeInHours) - 1;
    }
}