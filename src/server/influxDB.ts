import {HttpError, InfluxDB} from "@influxdata/influxdb-client";
import {CONFIG} from "./config";
import {BucketsAPI, OrgsAPI} from "@influxdata/influxdb-client-apis";
import logger from "./logger";

const {org, url, bucket, token} = CONFIG.get('fluxConfig');

export const influxDB = new InfluxDB({url, token});
const writeApi = influxDB.getWriteApi(org, bucket, 'ms');
const queryApi = influxDB.getQueryApi(org);

let isInitialized: Promise<boolean> = new Promise<boolean>(r => r(false));

async function createBucket() {
    const orgsApi = new OrgsAPI(influxDB);
    const orgs = await orgsApi.getOrgs({org});
    if (!orgs || !orgs.orgs || !orgs.orgs.length) {
        throw new Error(`Organization named ${org} not found`);
    }

    const orgID = orgs.orgs[0].id;
    if (!orgID) {
        throw new Error(`Organization named ${org} not found`);
    }

    const bucketApi = new BucketsAPI(influxDB);

    // Check if bucket exits
    try {
        const existingBuckets = await bucketApi.getBuckets({orgID, name: bucket});

        if (existingBuckets && existingBuckets.buckets && existingBuckets.buckets.length > 0) {
            logger.info(`Bucket named ${bucket} already exists`);
            isInitialized = new Promise<boolean>(r => r(true));
            return;
        }
    } catch (e) {
        if (e instanceof HttpError && e.statusCode == 404) {
            // Bucket not found
        } else {
            throw e
        }
    }

    // Create new bucket
    const newBucket = await bucketApi.postBuckets({
        body: {
            name: bucket,
            orgID: orgID,
            retentionRules: [
                {type: "expire", everySeconds: 30 * 24 * 60 * 60} // 30 days
            ]
        }
    });

    logger.info(`Created new InfluxDB bucket named ${bucket}`, {newBucket});
    isInitialized = new Promise<boolean>(r => r(true));
}

createBucket();

async function onShutdown() {
    try {
        await writeApi.close();
        process.exit(0);
    } catch (error) {
        logger.error(`Error on closing write api`);
        process.exit(1);
    }
}

process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);

export const getWriteApi = async () => {
    await isInitialized;
    return writeApi;
}

export const getQueryApi = async () => {
    await isInitialized;
    return queryApi;
}