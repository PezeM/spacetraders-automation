import {MarketplaceSeller} from "./game.interface";
import {GoodType} from "spacetraders-api-sdk";

export interface BestProfit {
    symbol: GoodType;
    buy: MarketplaceSeller;
    sell: MarketplaceSeller;
    profitPerItem: number;
    profitPerItemPercentage: number;
    profitPerThousandDollars: number;
    distance: number;
}