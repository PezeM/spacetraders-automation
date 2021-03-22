import 'reflect-metadata';
import {CONFIG} from './config';
import {Game} from "./game";
import {RegisterUserResponse} from "spacetraders-api-sdk";
import {API} from "./API";
import logger from "./logger";

async function createNewAccount(): Promise<RegisterUserResponse> {
    try {
        return await API.user.registerUser(`User-${Date.now()}`);
    } catch (e) {
        logger.error("Couldn't register new account", e);
        throw e;
    }
}

async function start() {
    if (!CONFIG.has('token') && CONFIG.has('username')) {
        logger.error('Specify token in config file');
        return;
    }

    let username = '';
    let token = '';

    if (!CONFIG.has("token") || !CONFIG.get("token")) {
        const newAccount = await createNewAccount();
        username = newAccount.user.username;
        token = newAccount.token;
        logger.info(`Created new account named ${username} with token ${token}`);
    } else {
        username = CONFIG.get('username');
        token = CONFIG.get('token');
    }

    const game = new Game(token, username);
}

start();