import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {ShipController} from "../shipController";

export const shipRoutes = (game: IGame) => {
    const router = Router();
    const shipController = new ShipController(game);

    router.get('/', shipController.getShips);
    router.get('/ship/:id', shipController.getShip);
    router.get('/cheapest-ship', shipController.getCheapestShip);
    router.get('/best-trade', shipController.getBestTradeForShip);
    router.delete('/:id', shipController.sellShip);

    return router;
}