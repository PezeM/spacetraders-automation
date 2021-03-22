import {IGame} from "./game.interface";

export interface IInitializeable {
    initializeService(game: IGame): any;
}