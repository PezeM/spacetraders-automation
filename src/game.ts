import {IGame} from "./types/game.interface";
import {GameState} from "./state/gameState";
import {API} from "./API";
import {remainingCargoSpace, shipCargoQuantity} from "./utils/ship";
import {wait} from "./utils/general";
import {UserStartupService} from "./services/userStartupService";
import {Ship} from "./models/ship";
import {GoodType} from "spacetraders-api-sdk";

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
                await new UserStartupService().throwIfUserDoesntExist(this._username, this._token);
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

        await new UserStartupService().prepareGame(this);
        // await marketplaceService.initializeService(this);
        // await waitFor(() => marketplaceState.bestProfit.length > 0);
        // console.log(`After wait for`, await marketplaceState.isInitialized, marketplaceState.bestProfit);

        setInterval(() => {
            // console.log('In the fucking interval');
            const ships = userState.getShips(false);

            for (const ship of ships) {
                if (ship.isBusy) return;
                this.trade(ship);
            }
        }, 1000);
    }

    private async trade(ship: Ship) {
        const {userState, marketplaceState} = this.state;

        ship.isBusy = true;

        const refuel = async (wantedFuel: number = 30) => {
            const fuelInCargo = shipCargoQuantity(ship, GoodType.FUEL);
            const neededFuel = wantedFuel - fuelInCargo;
            if (neededFuel <= 0) return;

            await buy(ship, GoodType.FUEL, wantedFuel);
        }

        const buy = async (ship: Ship, goodType: GoodType, amount: number) => {
            const marketplaceResponse = await API.game.getLocationMarketplace(this._token, ship.location);
            marketplaceState.addMarketplaceData(marketplaceResponse.planet);
            const item = marketplaceState.getMarketplaceData(ship.location)?.find(i => i.symbol === goodType);
            if (!item) return;

            const creditsCanAfford = userState.data.credits / item.pricePerUnit;
            const spaceCanAfford = ship.spaceAvailable / item.volumePerUnit;
            const toBuy = Math.min(creditsCanAfford, spaceCanAfford, item.quantityAvailable, amount);

            if (isNaN(toBuy) || toBuy <= 0) return;
            await buyGood(ship, goodType, toBuy);
        }

        const buyGood = async (ship: Ship, goodType: GoodType, amount: number) => {
            const response = await API.user.buyGood(this.token, this.username, ship.id, amount, goodType);
            userState.updateData(response);
            const order = response?.order?.find(o => o.good === goodType);
            if (!order) return;
            console.log(`Bought ${order.quantity}x${order.good} for ${order.total}$ (${order.pricePerUnit}$)`)
        }

        const sell = async (ship: Ship, goodType: GoodType, amount: number) => {
            if (amount <= 0) return;
            const response = await API.user.sellGood(this._token, this._username, ship.id, amount, goodType);
            userState.updateData(response);
            const order = response?.order?.find(o => o.good === goodType);
            if (!order) return;
            console.log(`Sold ${order.quantity}x${order.good} for ${order.total}$ (${order.pricePerUnit}$)`)
        }

        const fly = async (ship: Ship, destination: string) => {
            if (ship.location === destination) return;
            ship.isTraveling = true;

            const flyInfo = await API.user.createFlightPlan(this._token, this._username, ship.id, destination);
            console.log(`Ship ${ship.id} flying to ${destination}. Time ${flyInfo.flightPlan.timeRemainingInSeconds}s`);
            await wait(flyInfo.flightPlan.timeRemainingInSeconds * 1000 + 2000); // Extra 2s for docking
            console.log(`Ship ${ship.id} arrived at ${destination}`);

            const remainingFuel = flyInfo.flightPlan.fuelRemaining;
            ship.updateCargo(GoodType.FUEL, {totalVolume: remainingFuel, quantity: remainingFuel});
            ship.isTraveling = false;
        }

        const buyLocation = 'OE-PM';
        const sellLocation = 'OE-PM-TR';
        const itemToTrade = GoodType.WORKERS;

        try {
            // Refuel
            await refuel();

            // Buy
            // Fly to buy location
            await fly(ship, buyLocation);
            await buy(ship, itemToTrade, remainingCargoSpace(ship));

            // Fly to sell location
            // Sell
            // Refuel
            await fly(ship, sellLocation);
            const toSellAmount = shipCargoQuantity(ship, itemToTrade);
            await sell(ship, itemToTrade, toSellAmount);
            await refuel();
            // End
        } catch (e) {
            console.log(`Error while trading with ship ${ship.id}`, e);
            ship.isTraveling = false;
        }

        ship.isBusy = false;
    }
}
