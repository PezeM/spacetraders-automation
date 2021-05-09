import {Router} from "express";
import {IGame} from "../../types/game.interface";
import {userRoutes} from "./user";
import {shipRoutes} from "./ship";
import {loanRoutes} from "./loans";
import {marketplaceRoutes} from "./marketplace";
import {shipShopRoutes} from "./shipShop";
import {locationRoutes} from "./location";
import {logsRoutes} from "./logs";

export const createRoutes = (game: IGame) => {
    const routes = Router();

    routes.get('/', (req, res) => {
        res.send('Test');
    })

    routes.use('/user', userRoutes(game));
    routes.use('/ship', shipRoutes(game));
    routes.use('/loan', loanRoutes(game));
    routes.use('/marketplace', marketplaceRoutes(game));
    routes.use('/ship-shop', shipShopRoutes(game));
    routes.use('/location', locationRoutes(game));
    routes.use('/logs', logsRoutes(game));

    return routes;
}

