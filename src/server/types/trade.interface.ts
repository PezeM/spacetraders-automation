import {GoodType, Location} from "spacetraders-api-sdk";

export interface GoodsTradeInterface {
    itemToTrade: GoodType;
    source: Location;
    destination: Location;
}