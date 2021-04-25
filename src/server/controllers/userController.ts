import {BaseController} from "./baseController";
import {IGame} from "../types/game.interface";
import {Request, Response} from "express";
import {UserService} from "../services/userService";

export class UserController extends BaseController {
    constructor(game: IGame) {
        super(game);
    }

    getUser(req: Request, res: Response) {
        res.status(200)
            .send(this._game.state.userState.data);
    }

    getCredits(req: Request, res: Response) {
        res.status(200)
            .send(this._game.state.userState.data.credits.toString());
    }

    async resyncUser(req: Request, res: Response) {
        const user = await new UserService().syncUser(this._game.state.userState);

        if (!user) {
            res.status(500).send(`Couldn't resync the user`);
            return;
        }

        res.status(200).send(user);
    }
}