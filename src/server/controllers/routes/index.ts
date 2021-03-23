import {Router} from "express";
import {IGame} from "../../types/game.interface";
import {userRoutes} from "./user";

export const createRoutes = (game: IGame) => {
    const routes = Router();

    routes.get('/', (req, res) => {
        res.send('Test');
    })

    routes.use('/user', userRoutes(game));

    return routes;
}

