import Transport from 'winston-transport';
import TransportStream from "winston-transport";
import {Readable} from "stream";
import {getSymbolFromObject, omitSymbols} from "./utils/object";

export interface LogData {
    message: string;
    fullMessage?: string;
    level: string;
    meta: Record<string, any>;
    timestamp?: string;
}

export interface Transformer {
    (logData: LogData): any;
}

export interface MemoryTransportOptions extends TransportStream.TransportStreamOptions {
    maxSize?: number;
    transformer?: Transformer;
    handleExceptions?: boolean;
}

export class MemoryTransport extends Transport {
    private readonly _writeOutput: LogData[];
    private readonly _errorOutput: LogData[];

    private readonly _maxSize: number;
    private readonly _transformer?: Transformer;
    private _source: Readable;

    constructor(options: MemoryTransportOptions) {
        super(options);

        this._writeOutput = [];
        this._errorOutput = [];

        this.handleExceptions = options.handleExceptions ?? false;
        this._maxSize = options.maxSize ?? 1000;
        this._transformer = options.transformer;

        this.on('pipe', (source) => {
            this._source = source;
        });

        this.on('error', (err) => {
            this._source.pipe(this); // re-pipes readable
        });
    }

    get writeOutput() {
        return this._writeOutput;
    }

    get errorOutput() {
        return this._errorOutput;
    }

    log(info: any, next: () => void) {
        if (this.silent) {
            next();
            return;
        }

        let {level, timestamp, message, fullMessage, ...rest} = info;
        const messageSymbol = getSymbolFromObject(rest, 'Symbol(message)');
        if (messageSymbol) {
            fullMessage = rest[messageSymbol];
        }

        const meta = omitSymbols(rest);

        setImmediate(() => {
            this.emit('logged', level);
        });

        const logData: LogData = {
            message,
            fullMessage,
            level,
            timestamp,
            meta,
        };

        const log = this._transformer ? this._transformer(logData) : logData;

        // Perform the writing to the remote service
        console.log("Log data", log);

        if (level === 'error' || level === 'warn') {
            this._errorOutput.push(log);
            if (this._errorOutput.length > this._maxSize) {
                this._errorOutput.shift();
            }
        } else {
            this._writeOutput.push(log);
            if (this._writeOutput.length > this._maxSize) {
                this._writeOutput.shift();
            }
        }

        next();
    }
}