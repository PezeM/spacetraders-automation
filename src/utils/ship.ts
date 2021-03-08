import {GoodType, ShopShip, UserShip} from "spacetraders-api-sdk";
import {CheapestShip} from "../types/ship.type";
import {API} from "../API";
import {IGame} from "../types/game.interface";

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

export const buyShip = async (game: IGame, location: string, shipType: string): Promise<UserShip> => {
    try {
        const result = await API.user.buyShip(game.token, game.username, location, shipType);
        const newShip = result.user.ships[result.user.ships.length - 1];
        console.log(`Bought new ship ${shipType}`);
        game.state.userState.updateData(result.user);
        return newShip;
    } catch (e) {
        console.error(`Couldn't buy ship type ${shipType}. Remaining credit ${game.state.userState.data.credits}`);
        throw e;
    }
}

export const remainingCargoSpace = (ship: UserShip): number => ship.maxCargo - ship.cargo.reduce((p, c) => p + c.quantity, 0);
export const shipCargoQuantity = (ship: UserShip, good: GoodType): number => ship.cargo.find(c => c.good === good)?.quantity ?? 0;