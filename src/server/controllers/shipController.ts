import {BaseController} from "./baseController";
import {IGame} from "../types/game.interface";
import {Request, Response} from "express";
import {getBestTrade} from "../utils/trade";
import {getCheapestShip} from "../utils/ship";
import {Ship} from "../models/ship";
import {API} from "../API";
import {createApiErrorResponse, createApiResponse} from "../utils/apiResponse";
import {UserService} from "../services/userService";

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

    getBestTradeForShip(req: Request, res: Response) {
        const shipId = req.params.id;
        if (!shipId) {
            return res.status(400);
        }

        let ship: Ship;
        try {
            ship = this._game.state.userState.getShipById(shipId);
        } catch (e) {
            return res.status(404).send(e.toString());
        }


        res.status(200)
            .send(getBestTrade(this._game.state.marketplaceState, ship));
    }

    getCheapestShip(req: Request, res: Response) {
        res.status(200)
            .send(getCheapestShip(this._game.state.shipShopState.data));
    }

    async sellShip(req: Request, res: Response) {
        const shipId = req.params.id;
        if (!shipId) {
            return res.status(400);
        }

        const ship = this._game.state.userState.getShipById(shipId);
        if (!ship) {
            return res.status(404);
        }

        try {
            const result = await API.user.sellShip(shipId);
            console.log('result', result);

            await new UserService().syncUser(this._game.state.userState);
            res.status(201).json(createApiResponse("Successfully sold ship"));
        } catch (e) {
            res.status(401).send(createApiErrorResponse('Must in in shipyard to sell ship.'));
        }
    }
}