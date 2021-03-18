import {IGame} from "../types/game.interface";
import {filterShipCargos, remainingCargoSpace, shipCargoQuantity} from "../utils/ship";
import {Ship} from "../models/ship";
import logger from "../logger";
import {ITradeData} from "../types/config.interface";
import {wait} from "../utils/general";
import {CONFIG} from "../config";
import {getBestTrade} from "../utils/trade";
import {ShipActionService} from "./shipActionService";
import {Cargo, GoodType, UserShip} from "spacetraders-api-sdk";

export class TradeService {
    private readonly _shipActionService: ShipActionService;

    constructor(private _game: IGame) {
        this._shipActionService = new ShipActionService(this._game.state);
    }

    async tradeLoop(ships: Ship[]) {
        for (const ship of ships) {
            if (ship.isBusy) continue;
            const trade = getBestTrade(this._game.state.marketplaceState, ship, CONFIG.get('strategy'));
            if (!trade) continue;

            this.trade(ship, trade);
            await wait(1000);
        }
    }

    async trade(ship: Ship, trade: ITradeData) {
        if (ship.isBusy || !ship.location) return;

        ship.isBusy = true;

        try {
            if (CONFIG.get('sellNotUsedCargo')) {
                const extraCargo = filterShipCargos(ship, [trade.itemToTrade, GoodType.FUEL]);
                if (extraCargo && extraCargo.length > 0) {
                    await this.sellNotUsedCargo(ship, extraCargo);
                }
            }

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

    private async sellNotUsedCargo(ship: UserShip, cargos: Cargo[]) {
        for (const cargo of cargos) {
            const shipCargo = ship.cargo.find(c => c.good === cargo.good);
            if (!shipCargo) continue;

            try {
                await this._shipActionService.sell(ship, shipCargo.good, shipCargo.quantity);
            } catch (e) {
                console.warn(`Ship ${ship.id} couldn't sell not used cargo ${cargo.good}`);
            }
        }
    }
}