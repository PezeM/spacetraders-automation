import {IGame} from "../types/game.interface";
import {remainingCargoSpace, shipCargoQuantity} from "../utils/ship";
import {Ship} from "../models/ship";
import logger from "../logger";
import {ITradeData} from "../types/config.interface";
import {wait} from "../utils/general";
import {CONFIG} from "../config";
import {getBestTrade} from "../utils/trade";
import {ShipActionService} from "./shipActionService";

export class TradeService {
    private readonly _shipActionService: ShipActionService;

    constructor(private _game: IGame) {
        this._shipActionService = new ShipActionService(this._game.state);
    }

    async tradeLoop(ships: Ship[]) {
        const trade = getBestTrade(this._game.state.marketplaceState, CONFIG.get('strategy'));

        for (const ship of ships) {
            if (ship.isBusy) continue;
            this.trade(ship, trade);
            await wait(1000);
        }
    }

    async trade(ship: Ship, trade: ITradeData) {
        if (ship.isBusy || !ship.location) return;

        ship.isBusy = true;

        try {
            // Buy
            // Fly to buy location
            const goods = shipCargoQuantity(ship, trade.itemToTrade);
            if (!goods) {
                // Refuel
                await this._shipActionService.refuel(ship);

                await this._shipActionService.fly(ship, trade.source);
                await this._shipActionService.buy(ship, trade.itemToTrade, remainingCargoSpace(ship));
            }

            // Fly to sell location
            // Sell
            // Refuel
            await this._shipActionService.fly(ship, trade.destination);
            const toSellAmount = shipCargoQuantity(ship, trade.itemToTrade);
            await this._shipActionService.sell(ship, trade.itemToTrade, toSellAmount);
            await this._shipActionService.refuel(ship);
            // End

            logger.info(this._game.state.userState.toString());
        } catch (e) {
            logger.error(`Error while trading with ship ${ship.id}`, e);
            ship.isTraveling = false;
        }

        ship.isBusy = false;
    }
}