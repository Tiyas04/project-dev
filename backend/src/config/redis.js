import Redis from "ioredis";

let redisClient = null;
let isConnected = false;
let connectionAttempted = false;

/**
 * Parses Redis connection options from environment variables.
 * Supports standard REDIS_URL (including rediss:// for Upstash) or individual parameters.
 */
function getRedisConfig() {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;

    if (redisUrl) {
        return redisUrl;
    }

    return {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379", 10),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_TLS === "true" ? {} : undefined,
    };
}

/**
 * Initializes the Redis client singleton with robust error resilience and BullMQ support.
 */
export function initRedis() {
    if (redisClient && connectionAttempted) {
        return redisClient;
    }

    connectionAttempted = true;
    const config = getRedisConfig();

    const commonOptions = {
        maxRetriesPerRequest: null, // Required by BullMQ
        enableReadyCheck: false,
        lazyConnect: true,
        connectTimeout: 5000,
        retryStrategy(times) {
            if (times > 5) {
                // Stop retrying continuously if no Redis server exists locally/in cloud
                return null;
            }
            return Math.min(times * 1000, 3000);
        },
    };

    try {
        if (typeof config === "string") {
            redisClient = new Redis(config, commonOptions);
        } else {
            redisClient = new Redis({ ...config, ...commonOptions });
        }

        redisClient.on("connect", () => {
            console.log("[Redis] Client connecting...");
        });

        redisClient.on("ready", () => {
            isConnected = true;
            console.log("[Redis] Connected successfully. Cache & Queue engine ready.");
        });

        redisClient.on("error", (err) => {
            isConnected = false;
            // Suppress unhandled exceptions when Redis is not running locally
            if (err.code === "ECONNREFUSED") {
                // Handled gracefully; in-memory fallback will be active
            } else {
                console.warn("[Redis Warning]:", err.message);
            }
        });

        redisClient.on("close", () => {
            isConnected = false;
        });

        // Attempt initial connection asynchronously without blocking server startup
        redisClient.connect().catch(() => {
            isConnected = false;
            console.log("[Redis] Server offline or unreachable. Transparent in-memory cache fallback active.");
        });

    } catch (error) {
        isConnected = false;
        console.warn("[Redis Init Warning]:", error.message);
    }

    return redisClient;
}

/**
 * Checks whether Redis is currently connected and ready.
 */
export function isRedisReady() {
    return isConnected && redisClient?.status === "ready";
}

/**
 * Gets the current Redis client singleton.
 */
export function getRedisClient() {
    if (!redisClient) {
        return initRedis();
    }
    return redisClient;
}

/**
 * Creates a duplicate Redis connection (required by BullMQ workers/subscribers).
 */
export function createRedisConnection() {
    const config = getRedisConfig();
    const commonOptions = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy(times) {
            if (times > 3) return null;
            return Math.min(times * 500, 2000);
        },
    };

    let client;
    if (typeof config === "string") {
        client = new Redis(config, commonOptions);
    } else {
        client = new Redis({ ...config, ...commonOptions });
    }

    client.on("error", () => {
        // Suppress unhandled connection errors on duplicate client
    });

    return client;
}

/**
 * Gracefully closes the Redis connection on shutdown.
 */
export async function closeRedis() {
    if (redisClient) {
        try {
            await redisClient.quit();
            console.log("[Redis] Connection closed cleanly.");
        } catch {
            redisClient.disconnect();
        }
        isConnected = false;
    }
}
