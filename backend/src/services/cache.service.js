import { getRedisClient, isRedisReady } from "../config/redis.js";

const CACHE_PREFIX = "devarena:";

// In-memory fallback cache store for environments without an active Redis instance
class MemoryCache {
    constructor() {
        this.store = new Map();
        // Periodically purge expired keys from memory every 60 seconds
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
        if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref();
        }
    }

    get(key) {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    set(key, value, ttlSeconds = 300) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    del(key) {
        return this.store.delete(key);
    }

    delPattern(pattern) {
        const regexStr = pattern.replace(/\*/g, ".*");
        const regex = new RegExp(`^${regexStr}$`);
        let count = 0;
        for (const key of this.store.keys()) {
            if (regex.test(key)) {
                this.store.delete(key);
                count++;
            }
        }
        return count;
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiresAt) {
                this.store.delete(key);
            }
        }
    }

    clear() {
        this.store.clear();
    }

    size() {
        return this.store.size;
    }
}

const memoryCache = new MemoryCache();

let stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    startedAt: Date.now(),
};

class CacheService {
    /**
     * Resolves the full key with namespace prefix
     */
    _formatKey(key) {
        return `${CACHE_PREFIX}${key}`;
    }

    /**
     * Retrieves a cached value by key.
     * Checks Redis first; if unavailable, falls back to memory cache.
     * @param {string} key
     * @returns {Promise<any|null>}
     */
    async get(key) {
        const fullKey = this._formatKey(key);

        if (isRedisReady()) {
            try {
                const client = getRedisClient();
                const data = await client.get(fullKey);
                if (data !== null) {
                    stats.hits++;
                    try {
                        return JSON.parse(data);
                    } catch {
                        return data;
                    }
                }
            } catch (err) {
                console.warn("[Cache Service] Redis get failed, checking memory fallback:", err.message);
            }
        }

        // Fallback to memory
        const memoryData = memoryCache.get(fullKey);
        if (memoryData !== null) {
            stats.hits++;
            return memoryData;
        }

        stats.misses++;
        return null;
    }

    /**
     * Sets a value in the cache with a Time-To-Live (TTL).
     * @param {string} key
     * @param {any} value
     * @param {number} ttlSeconds Default: 300 (5 minutes)
     * @returns {Promise<boolean>}
     */
    async set(key, value, ttlSeconds = 300) {
        const fullKey = this._formatKey(key);
        stats.sets++;

        // Always save in memory cache as hot layer
        memoryCache.set(fullKey, value, ttlSeconds);

        if (isRedisReady()) {
            try {
                const client = getRedisClient();
                const serialized = typeof value === "string" ? value : JSON.stringify(value);
                await client.setex(fullKey, ttlSeconds, serialized);
                return true;
            } catch (err) {
                console.warn("[Cache Service] Redis setex failed, stored in memory:", err.message);
            }
        }

        return true;
    }

    /**
     * Deletes a specific key from cache.
     * @param {string} key
     * @returns {Promise<boolean>}
     */
    async del(key) {
        const fullKey = this._formatKey(key);
        stats.deletes++;
        memoryCache.del(fullKey);

        if (isRedisReady()) {
            try {
                const client = getRedisClient();
                await client.del(fullKey);
                return true;
            } catch (err) {
                console.warn("[Cache Service] Redis del error:", err.message);
            }
        }

        return true;
    }

    /**
     * Deletes all keys matching a wildcard pattern (e.g. "leaderboard:*", "profile:*").
     * Uses non-blocking SCAN in Redis.
     * @param {string} pattern
     * @returns {Promise<number>} Number of keys deleted
     */
    async delPattern(pattern) {
        const searchPattern = this._formatKey(pattern);
        stats.deletes++;

        // Delete from memory cache
        const memoryDeleted = memoryCache.delPattern(searchPattern);

        if (!isRedisReady()) {
            return memoryDeleted;
        }

        let redisDeleted = 0;
        try {
            const client = getRedisClient();
            let cursor = "0";

            do {
                const [nextCursor, keys] = await client.scan(
                    cursor,
                    "MATCH",
                    searchPattern,
                    "COUNT",
                    100
                );
                cursor = nextCursor;

                if (keys && keys.length > 0) {
                    await client.unlink(...keys);
                    redisDeleted += keys.length;
                }
            } while (cursor !== "0");

            return Math.max(memoryDeleted, redisDeleted);
        } catch (err) {
            console.warn("[Cache Service] Redis delPattern error:", err.message);
            return memoryDeleted;
        }
    }

    /**
     * Cache-aside helper: returns cached value or executes fetchFn, caches result, and returns.
     * @param {string} key
     * @param {Function} fetchFn
     * @param {number} ttlSeconds
     * @returns {Promise<any>}
     */
    async getOrSet(key, fetchFn, ttlSeconds = 300) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        const freshData = await fetchFn();
        if (freshData !== null && freshData !== undefined) {
            await this.set(key, freshData, ttlSeconds);
        }
        return freshData;
    }

    /**
     * Clears all DevArena cache entries.
     */
    async flush() {
        memoryCache.clear();
        if (isRedisReady()) {
            try {
                await this.delPattern("*");
            } catch (err) {
                console.warn("[Cache Service] Redis flush error:", err.message);
            }
        }
        return true;
    }

    /**
     * Returns operational cache diagnostics and statistics.
     */
    async getStats() {
        let redisKeyCount = 0;
        const redisActive = isRedisReady();

        if (redisActive) {
            try {
                const client = getRedisClient();
                const [_, keys] = await client.scan("0", "MATCH", `${CACHE_PREFIX}*`, "COUNT", 500);
                redisKeyCount = keys ? keys.length : 0;
            } catch {
                redisKeyCount = 0;
            }
        }

        return {
            status: "healthy",
            activeEngine: redisActive ? "redis" : "in_memory_fallback",
            isRedisConnected: redisActive,
            metrics: {
                ...stats,
                hitRate: stats.hits + stats.misses > 0 
                    ? `${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%` 
                    : "0%",
                memoryKeyCount: memoryCache.size(),
                redisKeyCount,
            },
            uptimeSeconds: Math.floor((Date.now() - stats.startedAt) / 1000),
        };
    }
}

export const cacheService = new CacheService();
export default cacheService;
