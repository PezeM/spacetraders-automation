import {Cargo, GoodType, ShopShip, UserShip} from "spacetraders-api-sdk";
import {CheapestShip} from "../types/ship.type";
import {API} from "../API";
import logger from "../logger";
import {UserState} from "../state/userState";
import {GameState} from "../state/gameState";
import {Ship} from "../models/ship";

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

export const buyShip = async (userState: UserState, location: string, shipType: string): Promise<UserShip> => {
    try {
        const result = await API.user.buyShip(location, shipType);
        const newShip = result.user.ships[result.user.ships.length - 1];
        logger.info(`Bought new ship ${shipType} ${newShip.id}`, {shipId: newShip.id});
        userState.updateData(result.user);
        logger.info(userState.toString());
        return newShip;
    } catch (e) {
        logger.error(`Couldn't buy ship type ${shipType}. Remaining credit ${userState.data.credits}`);
        throw e;
    }
}

export const remainingCargoSpace = (ship: UserShip): number => ship.maxCargo - ship.cargo.reduce((p, c) => p + c.totalVolume, 0);
export const shipCargoQuantity = (ship: UserShip, good: GoodType): number => ship.cargo.find(c => c.good === good)?.quantity ?? 0;

export const getScoutShipId = (state: GameState, isTraveling = false): string | undefined => {
    const {userState, shipShopState} = state;
    let ship = userState.data.ships.find(s => s.isScoutShip && s.isTraveling === isTraveling);
    if (ship) return ship.id;

    const cheapestShip = getCheapestShip(shipShopState.data);
    return userState.data.ships.find(s => s.type === cheapestShip.ship.type)?.id;
}

export const isValidCargo = (input: any): input is Cargo => {
    const schema: Record<keyof Cargo, string> = {
        good: 'string',
        quantity: 'number',
        totalVolume: 'number'
    };

    const missingProperties = Object.keys(schema)
        .filter(key => input[key] === undefined)
        .map(key => key as keyof Cargo)
        .map(key => new Error(`Document is missing ${key} ${schema[key]}`));

    return missingProperties.length === 0;
}

export const filterShipCargos = (ship: UserShip, goods: GoodType[]) => {
    return ship.cargo.filter(c => !goods.includes(c.good));
}