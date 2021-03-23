import {Router} from "express";
import {IGame} from "../../types/game.interface";
import {userRoutes} from "./user";
import {shipRoutes} from "./ship";
import {loanRoutes} from "./loans";

export const createRoutes = (game: IGame) => {
    const routes = Router();

    routes.get('/', (req, res) => {
        res.send('Test');
    })

    routes.use('/user', userRoutes(game));
    routes.use('/ship', shipRoutes(game));
    routes.use('/loan', loanRoutes(game));

    return routes;
}

