import {IGame} from "./types/game.interface";
import {GameState} from "./state/gameState";
import {API} from "./API";
import {buyShip, remainingCargoSpace, shipCargoQuantity} from "./utils/ship";
import {wait} from "./utils/general";
import {UserStartupService} from "./services/userStartupService";
import {Ship} from "./models/ship";
import {GoodType} from "spacetraders-api-sdk";
import {CONFIG} from "./config";

export class Game implements IGame {
    public readonly state: GameState;
    private _gameLoopInterval: NodeJS.Timeout;
    private _utilityInterval: NodeJS.Timeout;

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
        await new UserStartupService().prepareGame(this);
        // await marketplaceService.initializeService(this);
        // await waitFor(() => marketplaceState.bestProfit.length > 0);
        // console.log(`After wait for`, await marketplaceState.isInitialized, marketplaceState.bestProfit);

        this._gameLoopInterval = setInterval(this.gameLoop, 1000);
        this._utilityInterval = setInterval(this.utilityLoop, 60000);
    }

    private gameLoop = async () => {
        const ships = this.state.userState.getShips(false);

        // There should be fetch for best trades
        for (const ship of ships) {
            if (ship.isBusy) return;
            this.trade(ship);
        }
    }

    private utilityLoop = async () => {
        // Buy ship
        if (CONFIG.has('shipToBuy')) {
            const shipToBuy = CONFIG.get('shipToBuy');
            if (!shipToBuy) return;
            let minMoneyLeft = CONFIG.has('minMoneyLeftAfterBuyingShip') ? CONFIG.get('minMoneyLeftAfterBuyingShip') : 30000;
            if (!minMoneyLeft || isNaN(minMoneyLeft)) return;

            await this.state.shipShopState.isInitialized;
            const ship = this.state.shipShopState.data.find(s => s.type === shipToBuy);
            if (!ship) {
                console.log(`Couldn't buy ship ${shipToBuy}. Ship is not available in any shop.`);
                return;
            }

            const shipPrice = ship.purchaseLocations[0].price;
            if (this.state.userState.data.credits - shipPrice < minMoneyLeft) return;

            await buyShip(this, ship.purchaseLocations[0].location, ship.type);
        }
    }

    private async trade(ship: Ship) {
        const {userState, marketplaceState} = this.state;

        ship.isBusy = true;

        const refuel = async (wantedFuel: number = 15) => {
            const fuelInCargo = shipCargoQuantity(ship, GoodType.FUEL);
            const neededFuel = wantedFuel - fuelInCargo;
            if (neededFuel <= 0) return;

            await buy(ship, GoodType.FUEL, neededFuel);
        }

        const buy = async (ship: Ship, goodType: GoodType, amount: number) => {
            // TODO: Fetch marketplace only if it's not cached
            const marketplaceResponse = await API.game.getLocationMarketplace(this._token, ship.location);
            marketplaceState.addMarketplaceData(marketplaceResponse.planet);
            const item = marketplaceState.getMarketplaceData(ship.location)?.find(i => i.symbol === goodType);
            if (!item) return;

            const creditsCanAfford = userState.data.credits / item.pricePerUnit;
            const spaceCanAfford = ship.spaceAvailable / item.volumePerUnit;
            const toBuy = Math.floor(Math.min(creditsCanAfford, spaceCanAfford, item.quantityAvailable, amount));

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
            ship.updateData({location: flyInfo.flightPlan.destination});
            ship.updateCargo(GoodType.FUEL, {totalVolume: remainingFuel, quantity: remainingFuel});
            ship.isTraveling = false;
        }

        const buyLocation = 'OE-PM';
        const sellLocation = 'OE-PM-TR';
        const itemToTrade = GoodType.WORKERS;

        try {
            // Buy
            // Fly to buy location
            const goods = shipCargoQuantity(ship, itemToTrade);
            if (!goods) {
                // Refuel
                await refuel();

                await fly(ship, buyLocation);
                await buy(ship, itemToTrade, remainingCargoSpace(ship));
            }

            // Fly to sell location
            // Sell
            // Refuel
            await fly(ship, sellLocation);
            const toSellAmount = shipCargoQuantity(ship, itemToTrade);
            await sell(ship, itemToTrade, toSellAmount);
            await refuel();
            // End

            console.log(userState.toString());
        } catch (e) {
            console.log(`Error while trading with ship ${ship.id}`, e);
            ship.isTraveling = false;
        }

        ship.isBusy = false;
    }
}
