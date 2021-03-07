import {GameState} from "../state/gameState";

export interface IGame {
    readonly token: string;
    readonly username: string;
    readonly state: GameState;
}