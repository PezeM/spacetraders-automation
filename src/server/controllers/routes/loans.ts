import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {LoanController} from "../loanController";

export const loanRoutes = (game: IGame) => {
    const router = Router();
    const loanController = new LoanController(game);

    router.put('/pay/:id', loanController.payLoan);
    router.put('/pay-all', loanController.payLoans);

    return router;
}