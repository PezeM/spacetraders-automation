import {IGame} from "../types/game.interface";
import {Ship} from "../models/ship";
import {API} from "../API";
import logger from "../logger";
import {wait} from "../utils/general";
import {GoodType} from "spacetraders-api-sdk";
import {shipCargoQuantity} from "../utils/ship";

export class ShipActionService {
    constructor(private _game: IGame) {

    }

    async refuel(ship: Ship, wantedFuel: number = 15) {
        const fuelInCargo = shipCargoQuantity(ship, GoodType.FUEL);
        const neededFuel = wantedFuel - fuelInCargo;
        if (neededFuel <= 0) return;

        await this.buy(ship, GoodType.FUEL, neededFuel);
    }

    async fly(ship: Ship, destination: string) {
        if (!ship.location || ship.location === destination) return;
        ship.isTraveling = true;

        const flyInfo = await API.user.createFlightPlan(this._game.token, this._game.username, ship.id, destination);
        logger.info(`Ship ${ship.id} flying to ${destination}. Time ${flyInfo.flightPlan.timeRemainingInSeconds}s`);
        await wait(flyInfo.flightPlan.timeRemainingInSeconds * 1000 + 2000); // Extra 2s for docking
        logger.info(`Ship ${ship.id} arrived at ${destination}`);

        const remainingFuel = flyInfo.flightPlan.fuelRemaining;
        ship.updateData({location: flyInfo.flightPlan.destination});
        ship.updateCargo(GoodType.FUEL, {totalVolume: remainingFuel, quantity: remainingFuel});
        ship.isTraveling = false;
    }


    async buy(ship: Ship, goodType: GoodType, amount: number) {
        const marketplaceData = await this._game.state.marketplaceState.getOrCreatePlanetMarketplace(ship.location, this._game.token);
        if (!marketplaceData || ship.location !== marketplaceData.symbol) return;
        const item = marketplaceData.marketplace.find(m => m.symbol === goodType);
        if (!item) return;

        const creditsCanAfford = this._game.state.userState.data.credits / item.pricePerUnit;
        const spaceCanAfford = ship.spaceAvailable / item.volumePerUnit;
        const toBuy = Math.floor(Math.min(creditsCanAfford, spaceCanAfford, item.quantityAvailable, amount));

        if (isNaN(toBuy) || toBuy <= 0) return;
        await this.buyGood(ship, goodType, toBuy);
    }

    async buyGood(ship: Ship, goodType: GoodType, amount: number) {
        const response = await API.user.buyGood(this._game.token, this._game.username, ship.id, amount, goodType);
        this._game.state.userState.updateData(response);
        logger.info('Buy order', {order: response.order});
        const order = response?.order?.find(o => o.good === goodType);
        if (!order) return;
        logger.info(`Bought ${order.quantity}x${order.good} for ${order.total}$ (${order.pricePerUnit}$)`);
    }

    async sell(ship: Ship, goodType: GoodType, amount: number) {
        if (amount <= 0) return;
        const response = await API.user.sellGood(this._game.token, this._game.username, ship.id, amount, goodType);
        this._game.state.userState.updateData(response);
        logger.info('Sell order', {order: response.order});
        const order = response?.order?.find(o => o.good === goodType);
        if (!order) return;
        logger.info(`Sold ${order.quantity}x${order.good} for ${order.total}$ (${order.pricePerUnit}$)`);
    }
}