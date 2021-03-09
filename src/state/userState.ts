import {BaseState} from "./baseState";
import {UserShip} from "spacetraders-api-sdk";
import {IGame} from "../types/game.interface";
import {API} from "../API";
import {GameUser} from "../types/user.interface";
import {Ship} from "../models/ship";
import {ExtendedUserData} from "../types/user.type";

export class UserState extends BaseState<GameUser> {
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
                this._data = {
                    credits: user.user.credits,
                    loans: user.user.loans,
                    username: user.user.username,
                    ships: user.user.ships.map(s => Ship.createShip(s))
                }

                console.log(`Initialized user state with user named ${this._data.username}`);
                console.log(`Credits ${this._data.credits}`);
                console.log(`Ships ${this._data.ships.length}`);
                resolve(true);
            }, reject).catch(reject);
        })

        await this._isInitialized;
    }

    updateData(data: Partial<ExtendedUserData>) {
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
            for (const ship of data.ships) {
                const userShip = this._data.ships.find(s => s.id === ship.id);
                if (userShip) {
                    const index = this._data.ships.indexOf(userShip);
                    this._data.ships[index] = Ship.createShipFromExist(userShip, ship);
                } else {
                    this._data.ships.push(Ship.createShip(ship));
                }
            }
        }

        if (data.ship) {
            const ship = this.data.ships.find(s => s.id === data.ship?.id);
            if (ship) {
                ship.updateData(data.ship);
            }
        }
    }

    getShipById(shipId: string): Ship {
        const ship = this._data.ships.find(s => s.id === shipId);
        if (!ship) throw new Error(`Ship with id ${shipId} not found`);
        return ship;
    }

    updateShip(ship: UserShip) {
        const index = this._data.ships.findIndex(s => s.id === ship.id);
        if (index === -1) return;
        this._data.ships[index] = Ship.createShipFromExist(this._data.ships[index], ship);
    }

    getShips(scoutShip = false) {
        return this.data.ships.filter(s => s.isScoutShip === scoutShip);
    }
}