import {MarketplaceSeller} from "./game.interface";
import {GoodType} from "spacetraders-api-sdk";

export interface MarketplaceProfitPer {
    profitPerItem: number;
    profitPerVolume: number;
    profitPerItemPercentage: number;
}

export interface MarketplaceProfit extends MarketplaceProfitPer {
    symbol: GoodType;
    buy: MarketplaceSeller;
    sell: MarketplaceSeller;
    distance: number;
    gainPerItem: number;
    gainPerVolume: number;
    gainPerItemPercentage: number;
}