import {IGame} from "./types/game.interface";
import {GameState} from "./state/gameState";
import {API} from "./API";
import {CHEAPEST_SHIP} from "./constants/ships";
import {GoodType} from "spacetraders-api-sdk";
import {getCheapestShip} from "./utils/ship";
import {loanService} from "./services/loanService";

export class Game implements IGame {
    public readonly state: GameState;

    constructor(private _token: string, private _username: string) {
        console.info("Initialized game instance");
        this.state = new GameState(this);

        API.game.isOnline()
            .then(async (isServerOnline) => {
                if (!isServerOnline) {
                    console.error(`Spacetraders api is not available. Try later...`);
                    process.exit(0);
                }

                console.log('Spacetraders servers is available');
                await this.state.initializeStates();

                await this.initializeGame();
            });
    }

    get token(): string {
        return this._token;
    }

    get username(): string {
        return this._username;
    }

    private async initializeGame() {
        const {userState, locationState} = this.state;
        const promises: Promise<any>[] = [];

        const cheapestShip = getCheapestShip(this.state.shipShopState.data);
        await loanService.checkIfLoanIsNeeded(this, userState);
        console.log('cheapestShip2', cheapestShip);

        // for (const location of locationState.data) {
        //     if (cheapestShips.some(s => s.location === location.symbol)) continue;
        //     // Buy ship and fly it to location
        //
        //     try {
        //         const newUserState = await API.user.buyShip(this._token, this._username, cheapestShip.purchaseLocations[0].location, cheapestShip.type);
        //         if (!newUserState) continue;
        //         console.log('New user state', newUserState);
        //         const newShips = newUserState.user.ships.filter(s => s.type === cheapestShip.type && s.location === cheapestShip.purchaseLocations[0].location);
        //         const newShip = newShips[newShips.length - 1];
        //         if (!newShip) continue;
        //
        //         console.log(`Purchased new ship ${cheapestShip.type}`);
        //         userState.addNewShip(newShip);
        //
        //         // Buy fuel
        //         await API.user.buyGood(this._token, this._username, newShip.id, 50, GoodType.FUEL);
        //
        //         // Fly to new location
        //         const flyInfo = await API.user.createFlightPlan(this._token, this._username, newShip.id, location.symbol);
        //         promises.push(wait(flyInfo.flightPlan.timeRemainingInSeconds * 1000));
        //         console.log(`Flying ship ${newShip.id} to ${location.symbol}`);
        //     } catch (e) {
        //         console.log(`Couldn't buy a new ship`, e);
        //     }
        // }
        //
        // await Promise.all(promises);
        // console.log(`Ready`);
    }
}
