import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {ShipShopController} from "../shipShopController";

export const shipShopRoutes = (game: IGame) => {
    const router = Router();
    const shipShopController = new ShipShopController(game);

    router.get('/', shipShopController.getShips);
    router.put('/buy', shipShopController.buyShip);

    return router;
}