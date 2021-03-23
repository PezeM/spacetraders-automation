import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {ShipController} from "../shipController";

export const shipRoutes = (game: IGame) => {
    const router = Router();
    const shipRouter = new ShipController(game);

    router.get('/', shipRouter.getShips);
    router.get('/:id', shipRouter.getShip);

    return router;
}