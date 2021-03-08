import {IGame} from "./types/game.interface";
import {GameState} from "./state/gameState";
import {API} from "./API";
import {buyShip, getCheapestShip} from "./utils/ship";
import {LoanService} from "./services/loanService";
import {marketplaceService} from "./services/marketplaceService";
import {waitFor} from "./utils/general";

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
                // TODO: Check if user with given token and username exists
                await this.state.initializeStates();

                console.log(`Start state`, JSON.stringify(this.state.userState.data, null, 2));

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
        const {userState, locationState, marketplaceState} = this.state;

        const cheapestShip = getCheapestShip(this.state.shipShopState.data);
        await new LoanService().checkIfLoanIsNeeded(this, userState);

        if (userState.data.ships.length < 2) {
            while (userState.data.ships.length < 2) {
                await buyShip(this, cheapestShip.purchaseLocation.location, cheapestShip.ship.type);
            }
        }

        await marketplaceService.initializeService(this);
        await waitFor(() => marketplaceState.bestProfit.length > 0);
        console.log(`After wait for`, await marketplaceState.isInitialized, marketplaceState.bestProfit);
    }
}
