import {IGame} from "../types/game.interface";

export class BaseController {
    protected constructor(protected _game: IGame) {
        this.bindMethods();
    }

    private bindMethods() {
        const prototype = Object.getPrototypeOf(this);
        const methods = [...Object.getOwnPropertyNames(prototype)];

        // Bind every method except constructor
        for (const method of methods) {
            if (method !== 'constructor') {
                // @ts-ignore
                this[method] = this[method].bind(this);
            }
        }
    }

}