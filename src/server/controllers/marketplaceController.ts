import {BaseController} from "./baseController";
import {IGame} from "../types/game.interface";
import {Request, Response} from "express";

export class MarketplaceController extends BaseController {
    constructor(game: IGame) {
        super(game);
    }

    all(req: Request, res: Response) {
        res.status(200).send(this._game.state.marketplaceState.data.data);
    }

    mostProfitable(req: Request, res: Response) {
        res.status(200).send(this._game.state.marketplaceState.bestProfit);
    }

    leastProfitable(req: Request, res: Response) {
        res.status(200).send(this._game.state.marketplaceState.worstProfit);
    }

    cacheStats(req: Request, res: Response) {
        res.status(200).send(this._game.state.marketplaceState.data.stats);
    }
}