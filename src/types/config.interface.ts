import {ConfigStrategy} from "./enums/config.enum";
import {GoodType} from "spacetraders-api-sdk";

export interface IConfig {
    username: string;
    token: string;
    strategy: ConfigStrategy;
    shipsToScrapMarket: number | "MAX";
    marketplaceRefreshTimer: number;
    defaultTrade?: ITradeData;
    shipToBuy?: string;
    minMoneyLeftAfterBuyingShip: number;
}

export interface ITradeData {
    source: string;
    destination: string;
    itemToTrade: GoodType;
}