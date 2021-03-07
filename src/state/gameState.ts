import {ShipShopState} from "./shipShopState";
import {IGame} from "../types/game.interface";
import {LocationsState} from "./locationsState";
import {UserState} from "./userState";

export class GameState {
    public readonly shipShopState: ShipShopState;
    public readonly locationState: LocationsState;
    public readonly userState: UserState;

    constructor(private readonly _game: IGame) {
        this.shipShopState = new ShipShopState(_game);
        this.locationState = new LocationsState(_game);
        this.userState = new UserState(_game);
    }

    async initializeStates() {
        console.log('Initializing game state');

        await Promise.all([
            this.shipShopState.initializeState(),
            this.locationState.initializeState(),
            this.userState.initializeState()
        ]);
    }
}