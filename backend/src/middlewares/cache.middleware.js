import { cacheService } from "../services/cache.service.js";

/**
 * Express middleware for intelligent HTTP response caching.
 * @param {number} ttlSeconds Time-to-live in seconds (default 120s)
 * @param {Function|null} keyGenerator Optional custom cache key builder: (req) => string
 */
export function cacheResponse(ttlSeconds = 120, keyGenerator = null) {
    return async (req, res, next) => {
        // Only cache idempotent GET requests
        if (req.method !== "GET") {
            return next();
        }

        // Allow clients to bypass cache if requested
        const bypass = 
            req.headers["cache-control"] === "no-cache" || 
            req.query.bypassCache === "true" ||
            req.query.noCache === "true";

        if (bypass) {
            res.setHeader("X-DevArena-Cache", "BYPASS");
            return next();
        }

        // Compute cache key
        let cacheKey;
        if (typeof keyGenerator === "function") {
            cacheKey = keyGenerator(req);
        } else {
            // Include authenticated user ID if present to prevent cross-user leak on personalized routes
            const userPart = req.user?._id ? `:user_${req.user._id}` : "";
            cacheKey = `route:${req.baseUrl || ""}${req.path}${userPart}:${JSON.stringify(req.query)}`;
        }

        try {
            const cachedBody = await cacheService.get(cacheKey);

            if (cachedBody !== null) {
                res.setHeader("X-DevArena-Cache", "HIT");
                res.setHeader("Cache-Control", `public, max-age=${ttlSeconds}`);
                return res.status(200).json(cachedBody);
            }
        } catch (err) {
            console.warn("[Cache Middleware] Get error:", err.message);
        }

        res.setHeader("X-DevArena-Cache", "MISS");

        // Intercept res.json to cache response body
        const originalJson = res.json.bind(res);

        res.json = (body) => {
            // Only cache successful 200/201 responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Store asynchronously without holding up HTTP response stream
                cacheService.set(cacheKey, body, ttlSeconds).catch((err) => {
                    console.warn("[Cache Middleware] Set error:", err.message);
                });
            }
            return originalJson(body);
        };

        next();
    };
}

/**
 * Utility to invalidate cache patterns (e.g. for user data or leaderboards)
 * @param {string|string[]} patterns
 */
export async function invalidateCachePatterns(patterns) {
    const list = Array.isArray(patterns) ? patterns : [patterns];
    for (const pattern of list) {
        await cacheService.delPattern(pattern);
    }
}
