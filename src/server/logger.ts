import winston, {format} from "winston";
import {CONFIG} from "./config";
import * as fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";

if (!fs.existsSync(CONFIG.get('logsDir'))) {
    fs.mkdirSync(CONFIG.get('logsDir'));
}

const formatter = format.printf((info) => {
    const {level, message, timestamp, ...restMeta} = info;
    const meta = Object.keys(restMeta).length ? JSON.stringify(restMeta) : '';

    return `[${timestamp}] [${level}] ${message} ${meta}`;
});

const logger = winston.createLogger({
    level: CONFIG.get("logLevel") ?? "debug",
    handleExceptions: true,
    format: format.combine(
        format.splat(),
        format.json(),
        format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss'
        }),
        formatter
    ),
    transports: [
        new DailyRotateFile({
            level: CONFIG.get("logLevel") ?? "debug",
            handleExceptions: true,
            maxSize: "20m",
            maxFiles: "7d",
            filename: `${CONFIG.get('logsDir')}/log-%DATE%.log`,
        }),
        new DailyRotateFile({
            level: CONFIG.get("logLevel") ?? "debug",
            handleExceptions: true,
            maxSize: "20m",
            maxFiles: "7d",
            filename: `${CONFIG.get('logsDir')}/error-log-%DATE%.log`,
        }),
        new winston.transports.Console({
            format: format.combine(
                format.splat(),
                format.json(),
                format.colorize(),
                format.timestamp({
                    format: 'DD-MM-YYYY HH:mm:ss'
                }),
                formatter
            )
        })
    ],
    exitOnError: false
});

process.on('unhandledRejection', (reason, promise) => {
    throw reason;
});

export default logger;