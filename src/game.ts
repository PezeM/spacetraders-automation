import {IGame} from "./types/game.interface";
import {GameState} from "./state/gameState";
import {API} from "./API";
import {buyShip} from "./utils/ship";
import {waitFor} from "./utils/general";
import {UserStartupService} from "./services/userStartupService";
import {CONFIG} from "./config";
import logger from "./logger";
import {marketplaceService} from "./services/marketplaceService";
import {TradeService} from "./services/tradeService";

export class Game implements IGame {
    public readonly state: GameState;
    private readonly _tradeService: TradeService;
    private _gameLoopInterval: NodeJS.Timeout;
    private _utilityInterval: NodeJS.Timeout;

    constructor(private _token: string, private _username: string) {
        logger.info('Initialized game instance');
        this.state = new GameState(this);
        this._tradeService = new TradeService(this);

        API.game.isOnline()
            .then(async (isServerOnline) => {
                if (!isServerOnline) {
                    logger.crit('Spacetraders api is not available. Try later...');
                    process.exit(0);
                }

                API.initialize(this._username, this._token);
                logger.debug('Spacetraders server is available')
                await new UserStartupService().throwIfUserDoesntExist(this._username);
                await this.state.initializeStates();

                logger.info('Start user state', {userState: this.state.userState.data});
                logger.info(this.state.userState);
                logger.info(`Ships ${this.state.userState.data.ships.length}`);

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
        await marketplaceService.initializeService(this);
        if (!CONFIG.has('defaultTrade')) {
            logger.info(`Default trade not defined, waiting for any profitable trade`);
            await waitFor(() =>
                this.state.marketplaceState.getTradesBy("profitPerItem", CONFIG.get('strategy')).length > 0,
                undefined, 500);
        }

        this._gameLoopInterval = setInterval(this.gameLoop, 1000);
        this._utilityInterval = setInterval(this.utilityLoop, 60000);
    }

    private gameLoop = async () => {
        const ships = this.state.userState.getShips(false);

        await this._tradeService.tradeLoop(ships);
    }

    private utilityLoop = async () => {
        const {userState, shipShopState} = this.state;

        // Buy ship
        if (CONFIG.has('shipToBuy')) {
            const shipToBuy = CONFIG.get('shipToBuy');
            if (!shipToBuy) return;
            let minMoneyLeft = CONFIG.has('minMoneyLeftAfterBuyingShip') ? CONFIG.get('minMoneyLeftAfterBuyingShip') : 30000;
            if (!minMoneyLeft || isNaN(minMoneyLeft)) return;

            await shipShopState.isInitialized;
            const ship = shipShopState.data.find(s => s.type === shipToBuy);
            if (ship) {
                const shipPrice = ship.purchaseLocations[0].price;
                if (userState.data.credits - shipPrice > minMoneyLeft) {
                    await buyShip(userState, ship.purchaseLocations[0].location, ship.type);
                }
            } else {
                logger.warn(`Couldn't buy ship ${shipToBuy}. Ship is not available in any shop.`)
            }
        }

        // Synchronize api
        try {
            const response = await API.user.getUser();
            if (response) {
                userState.updateData(response.user);
            }
        } catch (e) {
            console.error(`Couldn't synchronize user state with server`, e);
        }

        // TODO: Pay loans
    }
}
