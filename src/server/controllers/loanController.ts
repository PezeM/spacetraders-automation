import {BaseController} from "./baseController";
import {IGame} from "../types/game.interface";
import {Request, Response} from "express";
import {LoanService} from "../services/loanService";

export class LoanController extends BaseController {
    private readonly _loanService: LoanService;

    constructor(game: IGame) {
        super(game);

        this._loanService = new LoanService();
    }

    async payLoan(req: Request, res: Response) {
        const loanId = req.params.id;
        if (!loanId) {
            return res.status(400);
        }

        const userState = this._game.state.userState;
        const loan = userState.data.loans.find(l => l.id === loanId);
        if (!loan) {
            return res.status(400);
        }

        const result = this._loanService.payLoans(userState);
        res.status(200).send(result);
    }

    async payLoans(req: Request, res: Response) {
        const result = this._loanService.payLoans(this._game.state.userState);
        res.status(200).send(result);
    }
}