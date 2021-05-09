import {IGame} from "../../types/game.interface";
import {Router} from "express";
import {LogsController} from "../logsController";

export const logsRoutes = (game: IGame) => {
    const router = Router();
    const logsController = new LogsController(game);

    router.get('/', logsController.all);
    router.get('/errors', logsController.errors);

    return router;
}