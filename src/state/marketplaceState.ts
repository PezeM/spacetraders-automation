import {BaseState} from "./baseState";
import {IGame, MarketplaceSeller} from "../types/game.interface";
import {GoodType, PlanetMarketplace} from "spacetraders-api-sdk";
import {MarketplaceProfit} from "../types/marketplace.interface";
import {distance} from "../utils/math";
import {API} from "../API";
import {MarketplaceProfitType} from "../types/marketplace.type";
import {TradeStrategy} from "../types/enums/trade.enum";
import logger from "../logger";
import {PROFIT_DIST_MULT} from "../constants/profit";

export class MarketplaceState extends BaseState<PlanetMarketplace[]> {
    private _bestSellers: Map<GoodType, MarketplaceSeller>;
    private _bestBuyers: Map<GoodType, MarketplaceSeller>;
    private _bestProfit: MarketplaceProfit[];
    private _worstProfit: MarketplaceProfit[];

    constructor(game: IGame) {
        super(game, []);
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
        return this._data.find(m => m.symbol === symbol);
    }

    async getOrCreatePlanetMarketplace(location: string): Promise<PlanetMarketplace> {
        // TODO: Cache result for given time
        let marketplace = this.getMarketplaceData(location);
        if (marketplace) return marketplace;

        const marketplaceResponse = await API.game.getLocationMarketplace(location);
        return this.addMarketplaceData(marketplaceResponse.planet);
    }

    addMarketplaceData(planetMarketplace: PlanetMarketplace) {
        const index = this._data.findIndex(m => m.symbol === planetMarketplace.symbol);
        if (index !== -1) {
            this._data[index] = planetMarketplace;
        } else {
            this._data.push(planetMarketplace);
        }

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
        const bestSellers = new Map<GoodType, MarketplaceSeller>();

        for (const planet of this._data) {
            for (const product of planet.marketplace) {
                if (!product.quantityAvailable) continue;

                const addedProduct = bestSellers.get(product.symbol);
                if (addedProduct && addedProduct.pricePerUnit > product.pricePerUnit) continue;

                bestSellers.set(product.symbol, {
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

        this._bestSellers = bestSellers;
        return this._bestSellers;
    }

    private computeBestBuyers() {
        const bestBuyer = new Map<GoodType, MarketplaceSeller>();

        for (const planet of this._data) {
            for (const product of planet.marketplace) {
                if (!product.quantityAvailable) continue;

                const addedProduct = bestBuyer.get(product.symbol);
                if (addedProduct && addedProduct.pricePerUnit < product.pricePerUnit) continue;

                bestBuyer.set(product.symbol, {
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

        this._bestBuyers = bestBuyer;
        return this._bestBuyers;
    }
}