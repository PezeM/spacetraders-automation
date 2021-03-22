import express from 'express';
import {IGame} from "./types/game.interface";
import logger from "./logger";
import helmet from "helmet";
import bodyParser from "body-parser";
import cors from 'cors';

export const createExpressServer = (game: IGame) => {
    const app = express();
    const PORT = 8000;

    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    // define a route handler for the default home page
    app.get("/", (req, res) => {
        res.send("Hello world!");
    });

    app.listen(PORT, () => {
        logger.info(`Server is running at http://localhost:${PORT}`);
    });
}