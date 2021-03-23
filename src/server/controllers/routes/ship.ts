import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {ShipController} from "../shipController";

export const shipRoutes = (game: IGame) => {
    const router = Router();
    const shipRouter = new ShipController(game);

    router.get('/', shipRouter.getShips);
    router.get('/:id', shipRouter.getShip);
    router.get('/cheapestShip', shipRouter.getCheapestShip);
    router.get('/bestTrade', shipRouter.getBestTradeForShip);

    return router;
}