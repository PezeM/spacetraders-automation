import express from 'express';
import {IGame} from "./types/game.interface";
import logger from "./logger";
import helmet from "helmet";
import bodyParser from "body-parser";
import cors from 'cors';
import {createRoutes} from "./controllers/routes";
import {CONFIG} from "./config";

export const createExpressServer = (game: IGame) => {
    const app = express();
    const PORT = CONFIG.get('expressServerPort');

    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());
    app.use("/", createRoutes(game));

    app.listen(PORT, () => {
        logger.info(`Server is running at http://localhost:${PORT}`);
    });
}