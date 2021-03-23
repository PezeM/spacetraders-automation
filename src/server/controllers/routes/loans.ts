import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {LoanController} from "../loanController";

export const loanRoutes = (game: IGame) => {
    const router = Router();
    const loanRouter = new LoanController(game);

    router.put('/pay/:id', loanRouter.payLoan);
    router.put('/pay-all', loanRouter.payLoans);

    return router;
}