import {BaseState} from "./baseState";
import {ShopShip} from "spacetraders-api-sdk";
import {API} from "../API";
import {IGame} from "../types/game.interface";
import logger from "../logger";

export class ShipShopState extends BaseState<ShopShip[]> {
    constructor(game: IGame) {
        super(game, []);
    }

    public async initializeState(): Promise<void> {
        if (await this.isInitialized) return;

        this._isInitialized = new Promise<boolean>(async (resolve, reject) => {
            API.game.getAvailableShips().then(ships => {
                this._data = ships.ships;

                logger.info(`Initialized ship shop state with ${this._data.length} ships.`);
                resolve(true);
            }, reject).catch(reject);
        });

        await this._isInitialized;
    }

    getPriceOfShip(type: string): number | undefined {
        const shipData = this._data.find(s => s.type === type);
        if (!shipData) return undefined;
        return shipData.purchaseLocations[0].price;
    }
}