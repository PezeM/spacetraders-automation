import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {MarketplaceController} from "../marketplaceController";

export const marketplaceRoutes = (game: IGame) => {
    const router = Router();
    const marketplaceController = new MarketplaceController(game);

    router.get('/', marketplaceController.all);
    router.get('/least-profitable', marketplaceController.leastProfitable);
    router.get('/most-profitable', marketplaceController.mostProfitable);
    router.get('/cache-stats', marketplaceController.cacheStats);

    return router;
}