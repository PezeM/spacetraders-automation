import {ShipShopState} from "./shipShopState";
import {IGame} from "../types/game.interface";
import {LocationsState} from "./locationsState";
import {UserState} from "./userState";
import {MarketplaceState} from "./marketplaceState";

export class GameState {
    public readonly shipShopState: ShipShopState;
    public readonly locationState: LocationsState;
    public readonly userState: UserState;
    public readonly marketplaceState: MarketplaceState;

    constructor(private readonly _game: IGame) {
        this.shipShopState = new ShipShopState(_game);
        this.locationState = new LocationsState(_game);
        this.userState = new UserState(_game);
        this.marketplaceState = new MarketplaceState(_game);
    }

    async initializeStates() {
        console.log('Initializing game state');

        await Promise.all([
            this.shipShopState.initializeState(),
            this.locationState.initializeState(),
            this.userState.initializeState(),
            this.marketplaceState.initializeState()
        ]);
    }
}