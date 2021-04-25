import {IGame} from "../types/game.interface";
import {CONFIG} from "../config";
import {buyShip, getCheapestShip} from "../utils/ship";
import {API} from "../API";
import {IInitializeable} from "../types/initializeable.interface";
import logger from "../logger";
import {ShipActionService} from "./shipActionService";
import {Location} from "spacetraders-api-sdk";
import {UserState} from "../state/userState";
import {ShipShopState} from "../state/shipShopState";
import {sortLocationsByDistance} from "../utils/location";
import {LocationWithDistance} from "../types/location.interface";
import {Ship} from "../models/ship";
import {waitFor} from "../utils/general";
import {MarketplaceState} from "../state/marketplaceState";
import {GameState} from "../state/gameState";

class MarketplaceService implements IInitializeable {
    private _isInitialized: boolean = false;
    private _loopFinished: boolean = false;

    async initializeService(game: IGame) {
        if (this._isInitialized) return;

        if (!CONFIG.has('shipsToScrapMarket')) return;

        await this.fetchMarketplace(game);
        this._isInitialized = true;
    }

    private async fetchMarketplace(game: IGame) {
        const {locationState, userState, shipShopState} = game.state;

        await locationState.isInitialized;
        let shipsToScrapMarket = CONFIG.get('shipsToScrapMarket');
        if (shipsToScrapMarket === "MAX") shipsToScrapMarket = locationState.data.length;

        if (!shipsToScrapMarket || shipsToScrapMarket <= 0) return;

        logger.info('Fetching marketplace');

        const scoutShips = await this.getScoutShips(userState, shipShopState, shipsToScrapMarket);
        scoutShips.forEach(s => s.isScoutShip = true);

        const skipLocation = CONFIG.has("skippedLocations") ? CONFIG.get("skippedLocations") ?? [] : [];
        const sortedLocations = sortLocationsByDistance(locationState.data)
            .filter(l => !skipLocation.includes(l.symbol));
        this.logSortedLocations(sortedLocations);
        this.startMarketFetching(sortedLocations, scoutShips, game);
    }

    private async startMarketFetching(locations: LocationWithDistance[], ships: Ship[], game: IGame) {
        const visitedLocations: string[] = [];
        this._loopFinished = false;
        let interval = setInterval(this.marketplaceLoop.bind(this, visitedLocations, locations, ships, game.state), 1000);

        await waitFor(() => this._loopFinished, undefined, 1000);
        clearInterval(interval);
        this._loopFinished = false;

        logger.info('Fetched all marketplace data');
        logger.info('Most profitable', {mostProfitable: game.state.marketplaceState.bestProfit});

        ships.forEach(s => s.isScoutShip = false);
        setTimeout(this.fetchMarketplace.bind(this, game), CONFIG.get('marketplaceRefreshTimer'));
    }

    private async marketplaceLoop(visitedLocations: string[], locations: LocationWithDistance[],
                                  ships: Ship[], state: GameState) {
        const {marketplaceState} = state;
        const shipActionService = new ShipActionService(state);

        for (const location of locations) {
            if (visitedLocations.includes(location.symbol)) continue;
            const ship = ships.find(s => !s.isTraveling && !s.isBusy);
            if (!ship || !ship.location) continue;

            this.visitLocation(ship, location, visitedLocations, shipActionService, marketplaceState);
        }

        this._loopFinished = visitedLocations.length === locations.length && ships.every(s => !s.isBusy);
    }

    private async visitLocation(ship: Ship, location: Location, visitedLocations: string[],
                                shipActionService: ShipActionService, marketplaceState: MarketplaceState) {
        ship.isBusy = true;
        visitedLocations.push(location.symbol);

        try {
            console.log(1);
            await shipActionService.refuel(ship, 100);
            console.log(2);
            await shipActionService.fly(ship, location.symbol);
            await shipActionService.refuel(ship, 100);
            console.log(3);

            // Get marketplace data
            const marketplaceResponse = await API.game.getLocationMarketplace(location.symbol);
            marketplaceState.addMarketplaceData(marketplaceResponse.location);
            logger.debug(`Fetched marketplace location from planet ${location.symbol}`);
            logger.debug('Most profitable', {mostProfitable: marketplaceState.bestProfit});
        } catch (e) {
            logger.verbose(`Couldn't fetch marketplace in system ${location.symbol}`, e);
        }

        ship.isTraveling = false;
        ship.isBusy = false;
    }

    private async getScoutShips(userState: UserState, shipShopState: ShipShopState, shipsToScrapMarket: number) {
        const scoutShips = userState.getShips(true);

        const cheapestShip = getCheapestShip(shipShopState.data);
        const cheapestShips = userState.data.ships
            .filter(s => s.type === cheapestShip.ship.type
                && s.manufacturer === cheapestShip.ship.manufacturer);

        for (const ship of cheapestShips) {
            if (scoutShips.length >= shipsToScrapMarket) break;
            scoutShips.push(ship);
        }

        if (scoutShips.length < shipsToScrapMarket) {
            while (scoutShips.length < shipsToScrapMarket) {
                try {
                    const newShip = await buyShip(userState, cheapestShip.purchaseLocation.location, cheapestShip.ship.type);
                    if (newShip) {
                        scoutShips.push(newShip);
                    }
                } catch (e) {
                    break;
                }
            }
        }

        return scoutShips;
    }

    private logSortedLocations(sortedLocations: LocationWithDistance[]) {
        logger.info('Marketplace locations in order:', {
                locations: sortedLocations.map(v => `${v.symbol} Dist: ${Math.floor(v.distance)} (x: ${v.x} y: ${v.y})`)
            }
        )
    }
}

export const marketplaceService = new MarketplaceService();