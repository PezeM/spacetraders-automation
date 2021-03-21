import {Location} from "spacetraders-api-sdk";
import {LocationWithDistance} from "../types/location.interface";
import {distance} from "./math";
import {IVector2} from "../types/math.interface";

export const sortLocationsByDistance = (locations: Location[]): LocationWithDistance[] => {
    const loc = [...locations] as LocationWithDistance[];
    const center: IVector2 = {x: 0, y: 0};
    loc.forEach(l => l.distance = distance({x: l.x, y: l.y}, center));

    return loc.sort((a, b) => a.distance - b.distance);
}