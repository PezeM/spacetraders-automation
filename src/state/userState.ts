import {BaseState} from "./baseState";
import {User, UserShip} from "spacetraders-api-sdk";
import {IGame} from "../types/game.interface";
import {API} from "../API";

export class UserState extends BaseState<User> {
    constructor(game: IGame) {
        super(game, {
            username: game.username,
            credits: 0,
            loans: [],
            ships: []
        });
    }

    async initializeState(): Promise<void> {
        if (await this.isInitialized) return;

        this._isInitialized = new Promise<boolean>(async (resolve, reject) => {
            API.user.getUser(this._game.token, this._game.username).then(user => {
                this._data = user.user;

                console.log(`Initialized user state with user named ${this._data.username}`);
                console.log(`Credits ${this._data.credits}`);
                console.log(`Ships ${this._data.ships.length}`);
                resolve(true);
            }, reject).catch(reject);
        })

        await this._isInitialized;
    }

    updateCreditsCount(newCredits: number) {
        this._data.credits = newCredits;
    }

    addNewShip(ship: UserShip) {
        if (this._data.ships.some(s => s.id === ship.id)) return;

        this._data.ships.push(ship);
    }
}