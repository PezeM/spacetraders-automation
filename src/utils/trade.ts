import {CONFIG} from "../config";
import {ITradeData} from "../types/config.interface";
import {GoodType} from "spacetraders-api-sdk";
import {MarketplaceState} from "../state/marketplaceState";
import {MarketplaceProfit} from "../types/marketplace.interface";
import {TradeStrategy} from "../types/enums/trade.enum";

export const getBestTrade = (marketplaceState: MarketplaceState, strategy: TradeStrategy = TradeStrategy.Profit): ITradeData => {
    const defaultTrade = strategy === TradeStrategy.Profit ? {
        source: 'OE-PM',
        destination: 'OE-PM-TR',
        itemToTrade: GoodType.WORKERS
    } : {
        source: 'OE-PM',
        destination: 'OE-PM-TR',
        itemToTrade: GoodType.WORKERS
    }

    const bestMarketplaceState = marketplaceState.getBestTradeBy(CONFIG.get('sortProfitBy'), strategy);
    if (bestMarketplaceState) return marketplaceProfitToTradeData(bestMarketplaceState);

    return CONFIG.has('defaultTrade') ? CONFIG.get('defaultTrade') as ITradeData : defaultTrade;
}

export const marketplaceProfitToTradeData = (marketplaceProfit: MarketplaceProfit): ITradeData => {
    return {
        itemToTrade: marketplaceProfit.symbol,
        source: marketplaceProfit.buy.location.symbol,
        destination: marketplaceProfit.sell.location.symbol
    }
}