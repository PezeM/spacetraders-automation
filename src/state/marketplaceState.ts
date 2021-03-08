import {BaseState} from "./baseState";
import {IGame, MarketplaceSeller} from "../types/game.interface";
import {GoodType, PlanetMarketplace} from "spacetraders-api-sdk";
import {BestProfit} from "../types/marketplace.interface";

export class MarketplaceState extends BaseState<PlanetMarketplace[]> {
    private _bestSellers: Map<GoodType, MarketplaceSeller>;
    private _bestBuyers: Map<GoodType, MarketplaceSeller>;
    private _bestProfit: BestProfit[];

    constructor(game: IGame) {
        super(game, []);
        this._bestSellers = new Map<GoodType, MarketplaceSeller>();
        this._bestBuyers = new Map<GoodType, MarketplaceSeller>();
        this._bestProfit = [];
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

    async initializeState(): Promise<void> {
        this._isInitialized = new Promise(r => r(false));
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
    }

    computeBestSellers() {
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

    computeBestBuyers() {
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

    computeBestProfit() {
        const bestProfit: BestProfit[] = [];

        this._bestBuyers.forEach((value, key) => {
            const bestSell = this._bestSellers.get(key);
            if (!bestSell || bestSell.pricePerUnit === value.pricePerUnit) return;

            bestProfit.push({
                symbol: key,
                buy: value,
                sell: bestSell,
                profitPerItem: bestSell.pricePerUnit - value.pricePerUnit,
                profitPerItemPercentage: Number(((bestSell.pricePerUnit - value.pricePerUnit) / value.pricePerUnit * 100).toFixed(0)),
                profitPerThousandDollars: Math.round(1000 / value.pricePerUnit) * (bestSell.pricePerUnit - value.pricePerUnit)
            });
        });

        bestProfit.sort((a, b) => a.profitPerItem - b.profitPerItem);
        this._bestProfit = bestProfit;
        this._isInitialized = new Promise(r => r(true));
        return this._bestProfit;
    }
}