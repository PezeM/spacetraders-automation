import {ShopShip} from "spacetraders-api-sdk";
import {CheapestShip} from "../types/ship.type";

/**
 * Returns cheapest ship from ships list
 * @param ships List of ships to search from
 * @param shipType Will look for ship with given shipType, if found will return cheapest purchase location, otherwise will return cheapest ship
 */
export const getCheapestShip = (ships: ShopShip[], shipType?: string): CheapestShip => {
    if (shipType) {
        const ship = ships.find(s => s.type === shipType);
        if (ship) {
            const cheapestPurchaseLocation = ship.purchaseLocations
                .sort((a, b) => a.price - b.price)[0];
            return {ship, purchaseLocation: cheapestPurchaseLocation};
        }
    }

    for (const ship of ships) {
        ship.purchaseLocations = ship.purchaseLocations
            .sort((a, b) => a.price - b.price);
    }

    ships.sort((a, b) => a.purchaseLocations[0].price - b.purchaseLocations[0].price);

    return {ship: ships[0], purchaseLocation: ships[0].purchaseLocations[0]}
}