import {BaseController} from "./baseController";
import {IGame} from "../types/game.interface";
import {Request, Response} from "express";

export class ShipController extends BaseController {
    constructor(game: IGame) {
        super(game);
    }

    getShips(req: Request, res: Response) {
        res.status(200).send(this._game.state.userState.data.ships);
    }

    getShip(req: Request, res: Response) {
        const shipId = req.params.id;
        if (!shipId) {
            return res.status(400);
        }

        const ship = this._game.state.userState.getShipById(shipId);
        if (!ship) {
            return res.status(404);
        }

        res.status(200).send(ship);
    }
}