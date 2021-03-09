import {BaseState} from "./baseState";
import {IGame, MarketplaceSeller} from "../types/game.interface";
import {GoodType, Marketplace, PlanetMarketplace} from "spacetraders-api-sdk";
import {MarketplaceProfit} from "../types/marketplace.interface";
import {distance} from "../utils/math";
import {API} from "../API";

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

    get bestSellers() {
        return this._bestSellers;
    }

    get bestBuyers() {
        return this._bestBuyers;
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
        return this._data.find(m => m.symbol === symbol)?.marketplace;
    }

    async getOrCreateMarketplaceData(location: string, token: string): Promise<Marketplace[]> {
        let marketplace = this.getMarketplaceData(location);
        if (marketplace) return marketplace;

        const marketplaceResponse = await API.game.getLocationMarketplace(token, location);
        this.addMarketplaceData(marketplaceResponse.planet);
        return marketplaceResponse.planet.marketplace;
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
    }

    computeBestProfit() {
        const bestProfit: MarketplaceProfit[] = [];

        this._bestBuyers.forEach((value, key) => {
            const bestSell = this._bestSellers.get(key);
            if (!bestSell || bestSell.pricePerUnit === value.pricePerUnit) return;

            bestProfit.push({
                symbol: key,
                buy: value,
                sell: bestSell,
                profitPerItem: bestSell.pricePerUnit - value.pricePerUnit,
                profitPerItemPercentage: Number(((bestSell.pricePerUnit - value.pricePerUnit) / value.pricePerUnit * 100).toFixed(0)),
                profitPerThousandDollars: Math.round((1000 / value.pricePerUnit) * (bestSell.pricePerUnit - value.pricePerUnit)),
                distance: Math.floor(distance(value.location, bestSell.location))
            });
        });

        bestProfit.sort((a, b) => b.profitPerItemPercentage - a.profitPerItemPercentage);
        this._bestProfit = bestProfit;
        this._isInitialized = new Promise(r => r(true));
        return this._bestProfit;
    }

    computeLeastProfitable() {
        const worstProfit: MarketplaceProfit[] = [];

        this._bestSellers.forEach((value, key) => {
            const bestBuy = this._bestBuyers.get(key);
            if (!bestBuy || bestBuy.pricePerUnit === value.pricePerUnit) return;

            worstProfit.push({
                symbol: key,
                buy: bestBuy,
                sell: value,
                profitPerItem: value.pricePerUnit - bestBuy.pricePerUnit,
                profitPerItemPercentage: Number(((value.pricePerUnit - bestBuy.pricePerUnit) / bestBuy.pricePerUnit * 100).toFixed(0)),
                profitPerThousandDollars: Math.round((1000 / bestBuy.pricePerUnit) * (value.pricePerUnit - bestBuy.pricePerUnit)),
                distance: Math.floor(distance(bestBuy.location, value.location))
            });
        });

        worstProfit.sort((a, b) => a.profitPerItemPercentage - b.profitPerItemPercentage);
        this._worstProfit = worstProfit;
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