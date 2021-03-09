import {IGame} from "../types/game.interface";
import {CONFIG} from "../config";
import {buyShip, getCheapestShip, getScoutShipId, remainingCargoSpace, shipCargoQuantity} from "../utils/ship";
import {API} from "../API";
import {GoodType} from "spacetraders-api-sdk";
import {wait} from "../utils/general";
import {IInitializeable} from "../types/initializeable.interface";
import logger from "../logger";

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
    }

    private async fetchMarketplace(game: IGame) {
        if (this._isTimerRunning) return;
        this._isTimerRunning = true;
        logger.info('Fetching marketplace');

        const {locationState, userState, marketplaceState} = game.state;

        // Get scout ship id, if no scout ship then buy one
        let shipId = getScoutShipId(game);
        if (!shipId) {
            const cheapestShip = getCheapestShip(game.state.shipShopState.data);
            const newShip = await buyShip(game, cheapestShip.purchaseLocation.location, cheapestShip.ship.type);
            shipId = newShip.id;
        }

        for (const location of locationState.data) {
            logger.debug(`Fetching marketplace data in location ${location.symbol}`);

            let ship = userState.getShipById(shipId);
            ship.isScoutShip = true;
            try {
                if (shipCargoQuantity(ship, GoodType.FUEL) < 50) {
                    // Refill fuel
                    const refuelAmount = Math.min(remainingCargoSpace(ship), 50 - shipCargoQuantity(ship, GoodType.FUEL));
                    const result = await API.user.buyGood(game.token, game.username, ship.id, refuelAmount, GoodType.FUEL);
                    userState.updateData(result);
                }

                ship = userState.getShipById(shipId);
                if (ship.location !== location.symbol) {
                    // Fly to given location
                    const flyInfo = await API.user.createFlightPlan(game.token, game.username, ship.id, location.symbol);
                    await wait(flyInfo.flightPlan.timeRemainingInSeconds * 1000 + 1000);

                    const remainingFuel = flyInfo.flightPlan.fuelRemaining;
                    ship.updateCargo(GoodType.FUEL, {totalVolume: remainingFuel, quantity: remainingFuel});
                }

                // Get marketplace data
                const marketplaceResponse = await API.game.getLocationMarketplace(game.token, location.symbol);
                marketplaceState.addMarketplaceData(marketplaceResponse.planet);
                logger.debug(`Fetched marketplace location from planet ${location.symbol}`);
                logger.debug('Most profitable', {mostProfitable: marketplaceState.bestProfit});
            } catch (e) {
                logger.error(`Couldn't get marketplace data`, e);
            }
        }

        logger.info('Fetched all marketplace data');
        logger.info('Most profitable', {mostProfitable: marketplaceState.bestProfit});
        this._isTimerRunning = false;
    }
}

export const marketplaceService = new MarketplaceService();