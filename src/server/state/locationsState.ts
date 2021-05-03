import {BaseState} from "./baseState";
import {Location} from "spacetraders-api-sdk";
import {IGame} from "../types/game.interface";
import {LOCATION_SYMBOLS} from "../constants/planets";
import {API} from "../API";
import logger from "../logger";

export class LocationsState extends BaseState<Location[]> {
    constructor(game: IGame) {
        super(game, []);
    }

    public async initializeState(): Promise<void> {
        if (await this.isInitialized) return;

        this._isInitialized = new Promise<boolean>(async (resolve, reject) => {
            this.fetchLocationsInSystem().then(_ => {
                logger.info(`Initialized locations state with ${this._data.length} locations.`);
                resolve(true);
            }, reject).catch(reject);
        });

        await this._isInitialized;
    }

    public async fetchLocationsInSystem(): Promise<void> {
        let newData: Location[] = [];

        for (const symbol of LOCATION_SYMBOLS) {
            const locations = await API.game.getLocations(symbol);
            if (!locations || locations.locations?.length === 0) continue;

            newData = newData.concat(locations.locations);
        }

        this._data = newData;
    }

    public getLocationData(symbol: string): Location {
        const location = this._data.find(l => l.symbol === symbol);
        if (!location) {
            throw new Error(`Location with symbol ${symbol} not found`);
        }

        return location;
    }
}