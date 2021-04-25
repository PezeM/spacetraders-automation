import {Ship} from "../models/ship";
import {API} from "../API";
import logger from "../logger";
import {wait} from "../utils/general";
import {FlightPlanResponse, GoodType, UserShip} from "spacetraders-api-sdk";
import {shipCargoQuantity} from "../utils/ship";
import {GameState} from "../state/gameState";

export class ShipActionService {
    constructor(private _state: GameState) {

    }

    async refuel(ship: Ship, wantedFuel: number = 25) {
        const fuelInCargo = shipCargoQuantity(ship, GoodType.FUEL);
        const neededFuel = wantedFuel - fuelInCargo;
        if (neededFuel <= 0) return;

        await this.buy(ship, GoodType.FUEL, neededFuel);
    }

    async fly(ship: Ship, destination: string) {
        if (!ship.location || ship.location === destination) return;
        ship.isTraveling = true;

        let flyInfo: FlightPlanResponse;
        try {
            // TODO: If not enough fuel try to refuel
            flyInfo = await API.user.createFlightPlan(ship.id, destination);
            ship.flightPlan = flyInfo.flightPlan;
            logger.info(`Ship ${ship.id} flying to ${destination}. Time ${flyInfo.flightPlan.timeRemainingInSeconds}s`);
            await wait(flyInfo.flightPlan.timeRemainingInSeconds * 1000 + 5000); // Extra 2s for docking
            logger.info(`Ship ${ship.id} arrived at ${destination}`);
            ship.flightPlan = undefined;
        } catch (e) {
            await this.refuel(ship, shipCargoQuantity(ship, GoodType.FUEL) + 15);
            return;
        }


        const remainingFuel = flyInfo.flightPlan.fuelRemaining;
        ship.updateData({location: flyInfo.flightPlan.destination});
        ship.updateCargo(GoodType.FUEL, {totalVolume: remainingFuel, quantity: remainingFuel});
        ship.isTraveling = false;
    }

    async buy(ship: Ship, goodType: GoodType, amount: number) {
        const marketplaceData = await this._state.marketplaceState.getOrCreatePlanetMarketplace(ship.location);
        if (!marketplaceData || ship.location !== marketplaceData.symbol) return;
        const item = marketplaceData.marketplace.find(m => m.symbol === goodType);
        if (!item) return;

        const creditsCanAfford = Math.floor(this._state.userState.data.credits / item.pricePerUnit);
        const spaceCanAfford = Math.floor(ship.spaceAvailable / item.volumePerUnit);
        const toBuy = Math.floor(Math.min(creditsCanAfford, spaceCanAfford, item.quantityAvailable, amount));

        if (isNaN(toBuy) || toBuy <= 0) return;
        await this.buyGood(ship, goodType, toBuy);
    }

    async buyGood(ship: UserShip, goodType: GoodType, amount: number) {
        const response = await API.user.buyGood(ship.id, amount, goodType);
        this._state.userState.updateData(response);
        const order = response.order;
        logger.info(`Bought ${order.quantity}x${order.good} for ${order.total}$ (${order.pricePerUnit}$) in ${ship.location} ${ship.id}`);
    }

    async sell(ship: UserShip, goodType: GoodType, amount: number) {
        if (amount <= 0) return;
        const response = await API.user.sellGood(ship.id, amount, goodType);
        this._state.userState.updateData(response);
        const order = response.order;
        logger.info(`Sold ${order.quantity}x${order.good} for ${order.total}$ (${order.pricePerUnit}$) in ${ship.location} ${ship.id}`);
    }
}