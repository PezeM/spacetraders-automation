import {IGame} from "../types/game.interface";
import {buyShip, getCheapestShip} from "../utils/ship";
import {LoanService} from "./loanService";
import {API} from "../API";

export class UserStartupService {
    public async prepareGame(game: IGame) {
        const {shipShopState, userState} = game.state;
        const cheapestShip = getCheapestShip(shipShopState.data);
        await new LoanService().checkIfLoanIsNeeded(game, userState);

        if (userState.data.ships.length < 2) {
            while (userState.data.ships.length < 2) {
                await buyShip(game, cheapestShip.purchaseLocation.location, cheapestShip.ship.type);
            }
        }
    }

    /**
     * Checks if user with given username exists. Throw error if it doesn't
     * @param username
     * @param token
     */
    public async throwIfUserDoesntExist(username: string, token: string) {
        const result = await API.user.getUser(token, username);
        if (!result) throw new Error(`User with username ${username} doesnt exists.`);
    }
}