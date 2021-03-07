import {IGame} from "../types/game.interface";

export abstract class BaseState<T> {
    protected _data: T;
    protected _isInitialized: Promise<boolean> = new Promise<boolean>(r => r(false));

    protected constructor(protected readonly _game: IGame, defaultDataValue: T) {
        this._data = defaultDataValue;
    }

    get data(): T {
        return this._data;
    }

    get isInitialized(): Promise<boolean> {
        return this._isInitialized;
    }

    public abstract initializeState(): Promise<void>;
}