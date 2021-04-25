import {IGame} from "../types/game.interface";
import {UserState} from "../state/userState";
import {API} from "../API";
import {LoanType, UserLoan} from "spacetraders-api-sdk";
import logger from "../logger";
import {LoanStatus} from "spacetraders-api-sdk/lib/types/user.enum";
import {CONFIG} from "../config";
import {PaidLoanInterface} from "../types/loan.interface";

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
            game.state.userState.updateData(response);
            logger.info(game.state.userState.toString());
            return true;
        } catch (e) {
            logger.error(`Couldn't take loan ${loanType}`, e);
            return false;
        }
    }

    async payLoan(userState: UserState, loan: UserLoan, requiredMoneyLeft?: number): Promise<PaidLoanInterface> {
        const result: PaidLoanInterface = {id: loan.id, repaymentAmount: loan.repaymentAmount, paid: false};
        if (loan.status !== LoanStatus.CURRENT) return result;
        if (requiredMoneyLeft && userState.data.credits - loan.repaymentAmount < requiredMoneyLeft) return result;

        try {
            const response = await API.user.payLoan(loan.id);
            userState.updateData(response.user);
            logger.info(`Paid loan ${loan.id} ${loan.repaymentAmount}$`);
            logger.info(userState.toString());
            result.paid = true;
            return result;
        } catch (e) {
            logger.error(`Error while trying to pay loan ${loan.id}`, e);
            return result
        }
    }

    async payLoans(userState: UserState): Promise<PaidLoanInterface[]> {
        const minMoneyLeftAfterLoanPayment = CONFIG.get('payLoans')?.minMoneyLeftAfterLoanPayment ?? 0;
        if (minMoneyLeftAfterLoanPayment) {
            const unpaidLoans = userState.data.loans.filter(l => l.status === LoanStatus.CURRENT);
            if (unpaidLoans.length > 0) {
                const results: PaidLoanInterface[] = [];

                for (const unpaidLoan of unpaidLoans) {
                    const result = await this.payLoan(userState, unpaidLoan, minMoneyLeftAfterLoanPayment);
                    results.push(result);
                }

                return results;
            }
        }

        return [];
    }
}