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

    updateData(data: Partial<User>) {
        if (data.username) {
            this._data.username = data.username;
        }

        if (data.loans) {
            this._data.loans = data.loans;
        }

        if (data.credits !== undefined) {
            this._data.credits = data.credits;
        }

        if (data.ships) {
            this._data.ships = data.ships;
        }
    }

    getShipById(shipId: string): UserShip {
        const ship = this._data.ships.find(s => s.id === shipId);
        if (!ship) throw new Error(`Ship with id ${shipId} not found`);
        return ship;
    }

    updateShip(ship: UserShip) {
        let shipToUpdate = this._data.ships.find(s => s.id === ship.id);
        if (!shipToUpdate) return;
        Object.assign(shipToUpdate, ship);
    }
}