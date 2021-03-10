import {MarketplaceSeller} from "./game.interface";
import {GoodType} from "spacetraders-api-sdk";

export interface MarketplaceProfitPer {
    profitPerItem: number;
    profitPerVolume: number;
    profitPerItemPercentage: number;
    profitPerThousandDollars: number;
}

export interface MarketplaceProfit extends MarketplaceProfitPer {
    symbol: GoodType;
    buy: MarketplaceSeller;
    sell: MarketplaceSeller;
    distance: number;
}