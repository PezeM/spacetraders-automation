import {Router} from "express";
import {IGame} from "../../types/game.interface";

export const createRoutes = (game: IGame) => {
    const routes = Router();

    routes.get('/', (req, res) => {
        res.send('Test');
    })

    return routes;
}

