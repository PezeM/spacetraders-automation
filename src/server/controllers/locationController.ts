import {BaseController} from "./baseController";
import {IGame} from "../types/game.interface";
import {Request, Response} from "express";

export class LocationController extends BaseController {
    constructor(game: IGame) {
        super(game);
    }

    async all(req: Request, res: Response) {
        await this._game.state.locationState.fetchLocationsInSystem();

        res.status(200)
            .send(this._game.state.locationState.data);
    }

    async getLocation(req: Request, res: Response) {
        const locationSymbol = req.params.id;
        if (!locationSymbol) {
            return res.status(400);
        }

        await this._game.state.locationState.isInitialized;

        const location = this._game.state.locationState.getLocationData(locationSymbol);
        if (!location) {
            return res.status(404);
        }

        res.status(200)
            .send(location);
    }
}