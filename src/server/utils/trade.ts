import {CONFIG} from "../config";
import {ITradeData} from "../types/config.interface";
import {GoodType, UserShip} from "spacetraders-api-sdk";
import {MarketplaceState} from "../state/marketplaceState";
import {MarketplaceProfit} from "../types/marketplace.interface";
import {TradeStrategy} from "../types/enums/trade.enum";

export const getBestTrade = (marketplaceState: MarketplaceState, ship: UserShip, strategy: TradeStrategy = TradeStrategy.Profit): ITradeData => {
    const defaultTrade = strategy === TradeStrategy.Profit ? {
        source: 'OE-PM',
        destination: 'OE-PM-TR',
        itemToTrade: GoodType.SHIP_PLATING
    } : {
        source: 'OE-PM',
        destination: 'OE-PM-TR',
        itemToTrade: GoodType.SHIP_PLATING
    }

    const bestMarketTrade = marketplaceState.getBestTradeBy(CONFIG.get('sortProfitBy'), strategy, ship);
    if (bestMarketTrade && (bestMarketTrade.buy.available > 300))
        return marketplaceProfitToTradeData(bestMarketTrade);

    return CONFIG.has('defaultTrade') ? CONFIG.get('defaultTrade') as ITradeData : defaultTrade;
}

export const marketplaceProfitToTradeData = (marketplaceProfit: MarketplaceProfit): ITradeData => {
    return {
        itemToTrade: marketplaceProfit.symbol,
        source: marketplaceProfit.buy.location.symbol,
        destination: marketplaceProfit.sell.location.symbol,
        ...marketplaceProfit
    }
}