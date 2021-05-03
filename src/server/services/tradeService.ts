import {IGame} from "../types/game.interface";
import {calculateRequiredFuel, filterShipCargos, remainingCargoSpace, shipCargoQuantity} from "../utils/ship";
import {Ship} from "../models/ship";
import logger from "../logger";
import {ITradeData} from "../types/config.interface";
import {wait} from "../utils/general";
import {CONFIG} from "../config";
import {getBestTrade} from "../utils/trade";
import {ShipActionService} from "./shipActionService";
import {Cargo, GoodType, UserShip} from "spacetraders-api-sdk";
import {DatabaseService} from "./databaseService";
import {ShipShopService} from "./shipShopService";
import {GoodsTradeInterface} from "../types/trade.interface";

export class TradeService {
    private readonly _shipActionService: ShipActionService;
    private readonly _databaseService: DatabaseService;
    private readonly _shipShopService: ShipShopService;

    constructor(private _game: IGame) {
        this._shipActionService = new ShipActionService(this._game.state);
        this._databaseService = new DatabaseService();
        this._shipShopService = new ShipShopService(this._game.state);
    }

    async tradeLoop(ships: Ship[]) {
        const {marketplaceState, locationState} = this._game.state;

        for (const ship of ships) {
            if (ship.isBusy || !ship.location) continue;
            const trade = getBestTrade(marketplaceState, locationState, ship, CONFIG.get('strategy'));
            if (!trade) continue;

            if (trade.destination == trade.source) {
                logger.error(`Destination and source for trade is the same`, {trade});
                return;
            }

            this.trade(ship, trade);
            await wait(1000);
        }
    }

    async trade(ship: Ship, trade: GoodsTradeInterface) {
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
                await this._shipActionService.refuel(ship,
                    calculateRequiredFuel(ship, this._game.state.locationState.getLocationData(ship.location), trade.source));
                await this._shipActionService.fly(ship, trade.source.symbol);
                await this._shipActionService.buy(ship, trade.itemToTrade,
                    remainingCargoSpace(ship) - calculateRequiredFuel(ship, this._game.state.locationState.getLocationData(ship.location), trade.destination));
                await this._shipShopService.buyRequiredShips();
            }

            // Refuel
            // Fly to sell location
            // Sell
            await this._shipActionService.refuel(ship,
                calculateRequiredFuel(ship, this._game.state.locationState.getLocationData(ship.location), trade.destination));
            await this._shipActionService.fly(ship, trade.destination.symbol);
            await wait(1000);
            if (ship.location !== trade.destination.symbol) {
                logger.warn(`Ship #${ship.id} was on wrong planet while trading ${ship.location} to ${trade.destination.symbol}`);
                ship.isBusy = false;
                return;
            }

            const toSellAmount = shipCargoQuantity(ship, trade.itemToTrade);
            await this._shipActionService.sell(ship, trade.itemToTrade, toSellAmount);
            await this._shipActionService.refuel(ship, 10);
            await this._shipShopService.buyRequiredShips();

            logger.info(this._game.state.userState.toString());
            await this._databaseService.saveUserMoney(this._game.state.userState);
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