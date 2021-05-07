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
    dataStream?: boolean;
    apm?: any; // typeof Agent;
    timestamp?: () => string;
    level?: string;
    index?: string;
    indexPrefix?: string | Function;
    indexSuffixPattern?: string;
    transformer?: Transformer;
    indexTemplate?: { [key: string]: any };
    ensureIndexTemplate?: boolean;
    flushInterval?: number;
    waitForActiveShards?: number | 'all';
    handleExceptions?: boolean;
    pipeline?: string;
    buffering?: boolean;
    bufferLimit?: number;
    healthCheckTimeout?: string;
    healthCheckWaitForStatus?: string;
    healthCheckWaitForNodes?: string;
    source?: string;
    retryLimit?: number;
}

export class MemoryTransport extends Transport {
    private source: Readable;

    constructor(options: MemoryTransportOptions) {
        super(options);

        this.on('pipe', (source) => {
            this.source = source;
        });

        this.on('error', (err) => {
            this.source.pipe(this); // re-pipes readable
        });
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

        // Perform the writing to the remote service
        console.log("Log data", logData);

        next();
    }
}