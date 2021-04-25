import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {UserController} from "../userController";

export const userRoutes = (game: IGame) => {
    const router = Router();
    const userController = new UserController(game);

    router.get('/', userController.getUser);
    router.get('/resync', userController.resyncUser);
    router.get('/credits', userController.getCredits);

    return router;
}