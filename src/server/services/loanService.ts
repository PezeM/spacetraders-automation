import {IGame} from "../types/game.interface";
import {UserState} from "../state/userState";
import {API} from "../API";
import {LoanType, UserLoan} from "spacetraders-api-sdk";
import logger from "../logger";
import {LoanStatus} from "spacetraders-api-sdk/lib/types/user.enum";

export class LoanService {
    async checkIfLoanIsNeeded(game: IGame, userState: UserState, requiredMoney?: number): Promise<boolean> {
        if (userState.data.ships.length >= 2) return false;
        if (requiredMoney && userState.data.credits > requiredMoney) return false;

        // Take loan
        return this.takeLoan(game, LoanType.STARTUP);
    }

    async takeLoan(game: IGame, loanType = LoanType.STARTUP): Promise<boolean> {
        try {
            logger.info(`${game.username} is taking a loan of type ${loanType}`);
            const response = await API.user.requestLoan(loanType);
            game.state.userState.updateData(response.user);
            logger.info(game.state.userState.toString());
            return true;
        } catch (e) {
            logger.error(`Couldn't take loan ${loanType}`, e);
            return false;
        }
    }

    async payLoan(userState: UserState, loan: UserLoan, requiredMoneyLeft?: number): Promise<boolean> {
        if (loan.status !== LoanStatus.CURRENT) return false;
        if (requiredMoneyLeft && userState.data.credits - loan.repaymentAmount < requiredMoneyLeft) return false;

        try {
            const response = await API.user.payLoan(loan.id);
            userState.updateData(response.user);
            logger.info(`Paid loan ${loan.id} ${loan.repaymentAmount}$`);
            logger.info(userState.toString());
            return true;
        } catch (e) {
            logger.error(`Error while trying to pay loan ${loan.id}`, e);
            return false;
        }
    }
}