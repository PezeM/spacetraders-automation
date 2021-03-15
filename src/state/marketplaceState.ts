import {BaseState} from "./baseState";
import {IGame, MarketplaceSeller} from "../types/game.interface";
import {GoodType, Marketplace, PlanetMarketplace} from "spacetraders-api-sdk";
import {MarketplaceProfit} from "../types/marketplace.interface";
import {distance} from "../utils/math";
import {API} from "../API";
import {MarketplaceProfitType} from "../types/marketplace.type";
import {TradeStrategy} from "../types/enums/trade.enum";
import logger from "../logger";
import {PROFIT_DIST_MULT} from "../constants/profit";
import NodeCache from "node-cache";
import {CONFIG} from "../config";

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

    async initializeState(): Promise<void> {
        this._isInitialized = new Promise(r => r(false));
    }

    getMarketplaceData(symbol: string) {
        return this._data.get<PlanetMarketplace>(symbol);
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

    getTradesBy(sortedBy: MarketplaceProfitType, strategy: TradeStrategy = TradeStrategy.Profit) {
        let source = strategy === TradeStrategy.Profit ? this._bestProfit : this._worstProfit;
        return source.sort((a, b) => b[sortedBy] - a[sortedBy]);
    }

    getBestTradeBy(sortedBy: MarketplaceProfitType, strategy: TradeStrategy = TradeStrategy.Profit) {
        return this.getTradesBy(sortedBy, strategy)[0];
    }

    computeBestProfit() {
        const bestProfit: MarketplaceProfit[] = [];

        this._bestBuyers.forEach((value, key) => {
            const bestSell = this._bestSellers.get(key);
            if (!bestSell || bestSell.pricePerUnit === value.pricePerUnit) return;

            const gainPerItem = bestSell.pricePerUnit - value.pricePerUnit;
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
                profitPerItem: profit.gainPerItem / distFactor,
                profitPerVolume: profit.gainPerVolume / distFactor,
                profitPerItemPercentage: profit.gainPerItemPercentage / distFactor,
                distance: dist,
                ...profit
            });
        });

        this._bestProfit = bestProfit.sort((a, b) => b.profitPerVolume - a.profitPerVolume);
        this._isInitialized = new Promise(r => r(true));
        logger.debug(`Most profitable trades`, {bestProfit: this._bestProfit})
        return this._bestProfit;
    }

    computeLeastProfitable() {
        const worstProfit: MarketplaceProfit[] = [];

        this._bestSellers.forEach((value, key) => {
            const bestBuy = this._bestBuyers.get(key);
            if (!bestBuy || bestBuy.pricePerUnit === value.pricePerUnit) return;

            const gainPerItem = value.pricePerUnit - bestBuy.pricePerUnit;
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
                profitPerItem: profit.gainPerItem / distFactor,
                profitPerVolume: profit.gainPerVolume / distFactor,
                profitPerItemPercentage: profit.gainPerItemPercentage / distFactor,
                distance: dist,
                ...profit
            });
        });

        this._worstProfit = worstProfit.sort((a, b) => a.profitPerVolume - b.profitPerVolume);
        this._isInitialized = new Promise(r => r(true));
        return this._worstProfit;
    }

    private computeBestSellers() {
        const bestSellers = this.marketplaceSellersComputation((a, b) => a.pricePerUnit > b.pricePerUnit);
        this._bestSellers = bestSellers;
        return bestSellers;
    }

    private computeBestBuyers() {
        const bestBuyer = this.marketplaceSellersComputation((a, b) => a.pricePerUnit < b.pricePerUnit);
        this._bestBuyers = bestBuyer;
        return bestBuyer;
    }

    private marketplaceSellersComputation(priceCheck: (a: MarketplaceSeller, b: Marketplace) => boolean) {
        const sellersMap = new Map<GoodType, MarketplaceSeller>();

        for (const key of this._data.keys()) {
            const planet = this._data.get<PlanetMarketplace>(key);
            if (!planet) continue;

            for (const product of planet.marketplace) {
                if (!product.quantityAvailable) continue;

                const addedProduct = sellersMap.get(product.symbol);
                if (addedProduct && priceCheck(addedProduct, product)) continue;

                sellersMap.set(product.symbol, {
                    pricePerUnit: product.pricePerUnit,
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
}