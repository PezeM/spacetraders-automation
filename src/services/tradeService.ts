import {IGame} from "../types/game.interface";
import {shipCargoQuantity} from "../utils/ship";
import {GoodType} from "spacetraders-api-sdk";
import {Ship} from "../models/ship";
import {API} from "../API";

export class TradeService {
    constructor(private _game: IGame) {

    }

    async refuel(ship: Ship, wantedFuel: number = 15) {
        const fuelInCargo = shipCargoQuantity(ship, GoodType.FUEL);
        const neededFuel = wantedFuel - fuelInCargo;
        if (neededFuel <= 0) return;

        await this.buy(ship, GoodType.FUEL, neededFuel);
    }

    async buy(ship: Ship, goodType: GoodType, amount: number) {
        const marketplaceData = await this._game.state.marketplaceState.getOrCreateMarketplaceData(ship.location, this._game.token);
        if (!marketplaceData) return;
        const item = marketplaceData.find(m => m.symbol === goodType);
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
        const order = response?.order?.find(o => o.good === goodType);
        if (!order) return;
        console.log(`Bought ${order.quantity}x${order.good} for ${order.total}$ (${order.pricePerUnit}$)`)
    }

    async sell(ship: Ship, goodType: GoodType, amount: number) {
        if (amount <= 0) return;
        const response = await API.user.sellGood(this._game.token, this._game.username, ship.id, amount, goodType);
        this._game.state.userState.updateData(response);
        const order = response?.order?.find(o => o.good === goodType);
        if (!order) return;
        console.log(`Sold ${order.quantity}x${order.good} for ${order.total}$ (${order.pricePerUnit}$)`)
    }
}