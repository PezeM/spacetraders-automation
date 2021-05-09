import {BaseController} from "./baseController";
import {IGame} from "../types/game.interface";
import {Request, Response} from "express";
import {memoryTransport} from "../logger";
import {getSortedData} from "../utils/array";

export class LogsController extends BaseController {
    constructor(game: IGame) {
        super(game);
    }

    all(req: Request, res: Response) {
        const logs = getSortedData(memoryTransport.writeOutput.concat(memoryTransport.errorOutput),
            'timestamp', false);

        res.status(200).send(logs);
    }

    errors(req: Request, res: Response) {
        const logs = getSortedData(memoryTransport.errorOutput, 'timestamp', false);

        res.status(200).send(logs);
    }
}