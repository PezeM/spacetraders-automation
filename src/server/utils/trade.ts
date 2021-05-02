import {CONFIG} from "../config";
import {ITradeData} from "../types/config.interface";
import {GoodType, UserShip} from "spacetraders-api-sdk";
import {MarketplaceState} from "../state/marketplaceState";
import {MarketplaceProfit} from "../types/marketplace.interface";
import {TradeStrategy} from "../types/enums/trade.enum";
import {GoodsTradeInterface} from "../types/trade.interface";
import {LocationsState} from "../state/locationsState";

export const getBestTrade = (marketplaceState: MarketplaceState, locationState: LocationsState,
                             ship: UserShip, strategy: TradeStrategy = TradeStrategy.Profit): GoodsTradeInterface => {
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

    return CONFIG.has('defaultTrade')
        ? tradeDataToGoodsTradeData(CONFIG.get('defaultTrade') as ITradeData, locationState)
        : tradeDataToGoodsTradeData(defaultTrade, locationState);
}

export const marketplaceProfitToTradeData = (marketplaceProfit: MarketplaceProfit): GoodsTradeInterface => {
    return {
        itemToTrade: marketplaceProfit.symbol,
        source: marketplaceProfit.buy.location,
        destination: marketplaceProfit.sell.location,
        ...marketplaceProfit
    }
}

const tradeDataToGoodsTradeData = (tradeData: ITradeData, locationState: LocationsState): GoodsTradeInterface => {
    return {
        itemToTrade: tradeData.itemToTrade,
        source: locationState.getLocationData(tradeData.source),
        destination: locationState.getLocationData(tradeData.destination),
    }
}