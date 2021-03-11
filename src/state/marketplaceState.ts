import {BaseState} from "./baseState";
import {IGame, MarketplaceSeller} from "../types/game.interface";
import {GoodType, PlanetMarketplace} from "spacetraders-api-sdk";
import {MarketplaceProfit} from "../types/marketplace.interface";
import {distance} from "../utils/math";
import {API} from "../API";
import {MarketplaceProfitType} from "../types/marketplace.type";
import {TradeStrategy} from "../types/enums/trade.enum";
import logger from "../logger";

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

            const profitPerItem = bestSell.pricePerUnit - value.pricePerUnit;
            const dist = distance(value.location, bestSell.location);

            // TODO: Calculate profit based on distance, distance ranges between 4 - 100, need to calculate time by that

            bestProfit.push({
                symbol: key,
                buy: value,
                sell: bestSell,
                profitPerItem,
                profitPerVolume: Math.floor(profitPerItem / (!value.volumePerUnit ? 1 : value.volumePerUnit)),
                profitPerItemPercentage: Number((profitPerItem / value.pricePerUnit * 100).toFixed(0)),
                profitPerThousandDollars: Math.round((1000 / value.pricePerUnit) * profitPerItem),
                distance: dist
            });
        });

        this._bestProfit = bestProfit.sort((a, b) => b.profitPerItemPercentage - a.profitPerItemPercentage);
        this._isInitialized = new Promise(r => r(true));
        logger.debug(`Most profitable trades`, {bestProfit: this._bestProfit})
        return this._bestProfit;
    }

    computeLeastProfitable() {
        const worstProfit: MarketplaceProfit[] = [];

        this._bestSellers.forEach((value, key) => {
            const bestBuy = this._bestBuyers.get(key);
            if (!bestBuy || bestBuy.pricePerUnit === value.pricePerUnit) return;

            const profitPerItem = value.pricePerUnit - bestBuy.pricePerUnit;
            worstProfit.push({
                symbol: key,
                buy: bestBuy,
                sell: value,
                profitPerItem,
                profitPerVolume: Math.floor(profitPerItem / value.volumePerUnit ?? 1),
                profitPerItemPercentage: Number((profitPerItem / bestBuy.pricePerUnit * 100).toFixed(0)),
                profitPerThousandDollars: Math.round((1000 / bestBuy.pricePerUnit) * profitPerItem),
                distance: Math.floor(distance(bestBuy.location, value.location))
            });
        });

        this._worstProfit = worstProfit.sort((a, b) => a.profitPerItemPercentage - b.profitPerItemPercentage);
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