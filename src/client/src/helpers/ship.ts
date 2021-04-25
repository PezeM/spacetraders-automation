import {Ship} from "../../../server/models/ship";

export const sumShipCargoQuantity = (ship: Ship): number => {
    return ship.cargo.reduce((previousValue, currentValue) => previousValue + currentValue.quantity, 0);
}
