import config from 'config';
import {IConfig} from "./types/config.interface";

console.log(`Loaded config`, config);

// Adds type safety to config
class Config {
    util: config.IUtil = config.util;

    get<K extends keyof IConfig>(key: K): IConfig[K] {
        return config.get(key);
    }

    has<K extends keyof IConfig>(key: K): boolean {
        return config.has(key);
    }
}

export const CONFIG = new Config();