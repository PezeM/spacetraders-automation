import {ConfigStrategy} from "./enums/config.enum";

export interface IConfig {
    username: string;
    token: string;
    strategy: ConfigStrategy;
    shipsToScrapMarket: number | "MAX";
    marketplaceRefreshTimer: number;
}