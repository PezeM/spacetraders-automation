import {IGame} from "../types/game.interface";
import {CONFIG} from "../config";
import {buyShip, getCheapestShip, getScoutShipId, remainingCargoSpace, shipCargoQuantity} from "../utils/ship";
import {API} from "../API";
import {GoodType} from "spacetraders-api-sdk";
import {wait} from "../utils/general";
import {IInitializeable} from "../types/initializeable.interface";

class MarketplaceService implements IInitializeable {
    private _isTimerRunning: boolean = false;
    private _isInitialized: boolean = false;
    private _timer?: NodeJS.Timeout;

    async initializeService(game: IGame) {
        // Interval to refresh marketplace
        if (this._isInitialized) return;

        this.fetchMarketplace(game);
        this._timer = setInterval(this.fetchMarketplace.bind(this, game), CONFIG.get('marketplaceRefreshTimer'));
        this._isInitialized = true;
        console.log('Initialized marketplace service');
    }

    private async fetchMarketplace(game: IGame) {
        if (this._isTimerRunning) return;
        this._isTimerRunning = true;
        console.log('Fetching marketplace');

        const {locationState, userState, marketplaceState} = game.state;

        // Get scout ship id, if no scout ship then buy one
        let shipId = getScoutShipId(game);
        if (!shipId) {
            const cheapestShip = getCheapestShip(game.state.shipShopState.data);
            const newShip = await buyShip(game, cheapestShip.purchaseLocation.location, cheapestShip.ship.type);
            shipId = newShip.id;
        }

        for (const location of locationState.data) {
            console.log(`Fetching marketplace data in location ${location.symbol}`);

            let ship = userState.getShipById(shipId);
            ship.isScoutShip = true;
            try {
                if (shipCargoQuantity(ship, GoodType.FUEL) < 50) {
                    // Refill fuel
                    const refuelAmount = Math.min(remainingCargoSpace(ship), 50 - shipCargoQuantity(ship, GoodType.FUEL));
                    console.log(`Refueling ${refuelAmount} fuel on ship ${ship.id}`);
                    const result = await API.user.buyGood(game.token, game.username, ship.id, refuelAmount, GoodType.FUEL);
                    userState.updateData(result);
                    ship.updateData(result.ship);
                }

                ship = userState.getShipById(shipId);
                if (ship.location !== location.symbol) {
                    // Fly to given location
                    console.log(`Ship: ${ship.id} flying to ${location.symbol}`);
                    const flyInfo = await API.user.createFlightPlan(game.token, game.username, ship.id, location.symbol);
                    console.log(`Flying time: ${flyInfo.flightPlan.timeRemainingInSeconds}s`);
                    await wait(flyInfo.flightPlan.timeRemainingInSeconds * 1000 + 1000);
                    console.log(`Ship: ${ship.id} arrived at: ${location.symbol}`);

                    const remainingFuel = flyInfo.flightPlan.fuelRemaining;
                    ship.updateCargo(GoodType.FUEL, {totalVolume: remainingFuel, quantity: remainingFuel});
                }

                // Get marketplace data
                const marketplaceResponse = await API.game.getLocationMarketplace(game.token, location.symbol);
                marketplaceState.addMarketplaceData(marketplaceResponse.planet);
                console.log(`Fetched marketplace location from planet ${location.symbol}`, marketplaceResponse.planet);
                console.log(`Most profitable`, JSON.stringify(marketplaceState.bestProfit, null, 2));
            } catch (e) {
                console.log(`Couldn't get marketplace data`, e);
            }
        }

        console.log(`Fetched all marketplace data`, JSON.stringify(marketplaceState.data, null, 2));
        console.log(`Most profitable`, JSON.stringify(marketplaceState.bestProfit, null, 2));
        this._isTimerRunning = false;
    }
}

export const marketplaceService = new MarketplaceService();