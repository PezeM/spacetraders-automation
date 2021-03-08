import {GameState} from "../state/gameState";
import {Location} from "spacetraders-api-sdk";

export interface IGame {
    readonly token: string;
    readonly username: string;
    readonly state: GameState;
}

export interface MarketplaceSeller {
    location: Location;
    pricePerUnit: number;
    available: number;
}