import {IGame} from "../types/game.interface";
import {CONFIG} from "../config";
import {buyShip, getCheapestShip, getScoutShipId} from "../utils/ship";
import {API} from "../API";
import {IInitializeable} from "../types/initializeable.interface";
import logger from "../logger";
import {ShipActionService} from "./shipActionService";

class MarketplaceService implements IInitializeable {
    private _isTimerRunning: boolean = false;
    private _isInitialized: boolean = false;
    private _timer?: NodeJS.Timeout;

    async initializeService(game: IGame) {
        // Interval to refresh marketplace
        if (this._isInitialized) return;

        if (!CONFIG.has('shipsToScrapMarket')) return;

        this.fetchMarketplace(game);
        this._timer = setInterval(this.fetchMarketplace.bind(this, game), CONFIG.get('marketplaceRefreshTimer'));
        this._isInitialized = true;
    }

    private async fetchMarketplace(game: IGame) {
        if (this._isTimerRunning) return;
        const shipsToScrapMarket = CONFIG.get('shipsToScrapMarket');
        if (!shipsToScrapMarket || shipsToScrapMarket <= 0) return;
        const shipActionService = new ShipActionService(game.state);

        this._isTimerRunning = true;
        logger.info('Fetching marketplace');

        const {locationState, userState, marketplaceState} = game.state;

        // Get scout ship id, if no scout ship then buy one
        let shipId = getScoutShipId(game.state);
        if (!shipId) {
            const cheapestShip = getCheapestShip(game.state.shipShopState.data);
            const newShip = await buyShip(game.state.userState, cheapestShip.purchaseLocation.location, cheapestShip.ship.type);
            shipId = newShip.id;
        }

        for (const location of locationState.data) {
            logger.debug(`Fetching marketplace data in location ${location.symbol}`);

            let ship = userState.getShipById(shipId);
            ship.isScoutShip = true;
            ship.isBusy = true;
            try {
                await shipActionService.refuel(ship, 80);
                await shipActionService.fly(ship, location.symbol);
                await shipActionService.refuel(ship, 80);

                // Get marketplace data
                const marketplaceResponse = await API.game.getLocationMarketplace(location.symbol);
                marketplaceState.addMarketplaceData(marketplaceResponse.planet);
                logger.debug(`Fetched marketplace location from planet ${location.symbol}`);
                logger.debug('Most profitable', {mostProfitable: marketplaceState.bestProfit});
            } catch (e) {
                logger.error(`Couldn't get marketplace data`, e);
                ship.isBusy = false;
            }

            ship.isBusy = false;
        }

        logger.info('Fetched all marketplace data');
        logger.info('Most profitable', {mostProfitable: marketplaceState.bestProfit});
        this._isTimerRunning = false;
    }
}

export const marketplaceService = new MarketplaceService();