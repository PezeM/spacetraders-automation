import {GoodType} from "spacetraders-api-sdk";
import {MarketplaceProfitType} from "./marketplace.type";
import {TradeStrategy} from "./enums/trade.enum";

export interface IConfig {
    username: string;
    token: string;
    logsDir: string;
    logLevel: string;
    strategy: TradeStrategy;
    shipsToScrapMarket: number | "MAX";
    marketplaceRefreshTimer: number;
    sortProfitBy: MarketplaceProfitType;
    defaultTrade?: ITradeData;
    minMoneyLeftAfterBuyingShip: number;
    sellNotUsedCargo: boolean;
    cacheTTL: number;
    payLoans?: {
        minMoneyLeftAfterLoanPayment: number;
    },
    expressServerPort: number;
    blockedTradeItems: GoodType[];
    shipsToBuy?: Record<string, ShipBuyInfo>;
    skippedLocations?: string[];
}

export interface ShipBuyInfo {
    numberOfShips: number;
    minMoneyLeftAfterBuying: number;
}

export interface ITradeData {
    source: string;
    destination: string;
    itemToTrade: GoodType;
}