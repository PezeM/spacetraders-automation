import {IGame} from "./types/game.interface";
import {GameState} from "./state/gameState";
import {API} from "./API";
import {waitFor} from "./utils/general";
import {UserStartupService} from "./services/userStartupService";
import {CONFIG} from "./config";
import logger from "./logger";
import {marketplaceService} from "./services/marketplaceService";
import {TradeService} from "./services/tradeService";
import {LoanService} from "./services/loanService";
import {createExpressServer} from "./expressServer";
import {UserService} from "./services/userService";
import {ShipShopService} from "./services/shipShopService";
import {DatabaseService} from "./services/databaseService";

export class Game implements IGame {
    public readonly state: GameState;
    private readonly _tradeService: TradeService;
    private _gameLoopInterval: NodeJS.Timeout;
    private _utilityInterval: NodeJS.Timeout;
    private _shipShopService: ShipShopService;
    private _databaseService: DatabaseService;

    constructor(private _token: string, private _username: string) {
        logger.info('Initialized game instance');
        this.state = new GameState(this);
        this._tradeService = new TradeService(this);
        this._shipShopService = new ShipShopService(this.state);
        this._databaseService = new DatabaseService();

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

                createExpressServer(this);
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
                this.state.marketplaceState.getTradesBy(CONFIG.get('sortProfitBy'), CONFIG.get('strategy')).length > 0,
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
        const {userState} = this.state;

        await this._shipShopService.buyRequiredShips();
        await new UserService().syncUser(userState);

        // Pay loans
        if (CONFIG.has('payLoans')) {
            const loanService = new LoanService();
            await loanService.payLoans(userState);
        }

        await this._databaseService.saveShipsCount(userState);
    }
}
