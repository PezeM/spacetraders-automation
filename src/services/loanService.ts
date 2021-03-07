import {IGame} from "../types/game.interface";
import {UserState} from "../state/userState";
import {API} from "../API";
import {LoanType} from "spacetraders-api-sdk";

class LoanService {
    async checkIfLoanIsNeeded(game: IGame, userState: UserState, requiredMoney?: number): Promise<boolean> {
        if (userState.data.ships.length >= 2) return false;
        if (requiredMoney && userState.data.credits > requiredMoney) return false;

        // Take loan
        return this.takeLoan(game, LoanType.STARTUP);
    }

    async takeLoan(game: IGame, loanType = LoanType.STARTUP): Promise<boolean> {
        try {
            const response = await API.user.takeoutLoan(game.token, game.username, loanType);
            // Probably update user
            game.state.userState.updateCreditsCount(response.user.credits);
            return true;
        } catch (e) {
            console.error(`Couldn't take ${loanType}`, e);
            return false;
        }
    }
}

export const loanService = new LoanService();