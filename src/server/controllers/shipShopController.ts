import {BaseController} from "./baseController";
import {IGame} from "../types/game.interface";
import {Request, Response} from "express";
import {buyShip} from "../utils/ship";

export class ShipShopController extends BaseController {
    constructor(game: IGame) {
        super(game);
    }

    async getShips(req: Request, res: Response) {
        await this._game.state.shipShopState.isInitialized;
        res.status(200)
            .send(this._game.state.shipShopState.data);
    }

    async buyShip(req: Request, res: Response) {
        await this._game.state.shipShopState.isInitialized;

        const {shipType, location} = req.body;

        if (!shipType || !location) {
            return res.status(400).send(`Ship type or location was not specified.`);
        }

        const ship = this._game.state.shipShopState.data.find(s => s.type === shipType);
        if (!ship) {
            return res.status(400).send(`Wrong ship type`);
        }

        try {
            const ship = await buyShip(this._game.state.userState, location, shipType);
            res.status(201).send({ship, text: "Bought ship successfully"});
        } catch (e) {
            res.status(400).send(e.toString());
        }
    }
}