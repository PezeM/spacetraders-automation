import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {LocationController} from "../locationController";

export const locationRoutes = (game: IGame) => {
    const router = Router();
    const locationController = new LocationController(game);

    router.get('/all', locationController.all);
    router.get('/all/:id', locationController.getLocation);

    return router;
}