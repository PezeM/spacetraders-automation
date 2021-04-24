import {GameState} from "../state/gameState";
import {CONFIG} from "../config";
import logger from "../logger";
import {buyShip} from "../utils/ship";
import {getSortedData} from "../utils/array";
import {ShopShip} from "spacetraders-api-sdk";
import {UserState} from "../state/userState";

export class ShipShopService {
    constructor(private _state: GameState) {

    }

    /***
     * Buys required ships specified in config
     */
    async buyRequiredShips() {
        if (!CONFIG.has('shipsToBuy')) return;
        const {userState, shipShopState} = this._state;

        await shipShopState.isInitialized;

        let minMoneyLeft = CONFIG.has('minMoneyLeftAfterBuyingShip') ? CONFIG.get('minMoneyLeftAfterBuyingShip') : 30000;
        if (!minMoneyLeft || isNaN(minMoneyLeft)) return;

        const shipsToBuy = CONFIG.get('shipsToBuy');

        for (const [key, value] of Object.entries(shipsToBuy)) {
            const shipToBuy = shipShopState.getShip(key);
            if (!shipToBuy) {
                logger.warn(`Ship ${key} is not available to buy`);
                continue;
            }

            // Check count of owned ships of type
            const ownedShips = userState.getShipsOfType(key);
            let numberOfShipsToBuy = value - ownedShips.length;
            if (numberOfShipsToBuy <= 0) continue;

            console.log(`Need to buy ${numberOfShipsToBuy} of ship ${key}`);
            await this.buyShip(numberOfShipsToBuy, shipToBuy, userState, minMoneyLeft);
        }
    }

    private async buyShip(numberOfShipsToBuy: number, shipToBuy: ShopShip, userState: UserState, minMoneyLeft: number) {
        while (numberOfShipsToBuy > 0) {
            const buyData = getSortedData(shipToBuy.purchaseLocations, 'price')[0];

            if (userState.data.credits - buyData.price > minMoneyLeft) {
                try {
                    await buyShip(userState, buyData.location, shipToBuy.type);
                    numberOfShipsToBuy--;
                } catch (e) {
                    break;
                }
            } else {
                break;
            }
        }
    }
}