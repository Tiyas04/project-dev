import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { cacheService } from "../services/cache.service.js";
import { User } from "../models/user.model.js";

/**
 * Returns cache diagnostics, connection status, and hit/miss statistics.
 */
export const getCacheStatus = asyncHandler(async (req, res) => {
    const stats = await cacheService.getStats();
    return res.status(200).json(
        new ApiResponse(200, stats, "Cache status fetched successfully")
    );
});

/**
 * Clears cache entries. Accepts an optional pattern in body or query.
 */
export const clearCache = asyncHandler(async (req, res) => {
    const pattern = req.body?.pattern || req.query?.pattern;

    if (pattern) {
        const deleted = await cacheService.delPattern(pattern);
        return res.status(200).json(
            new ApiResponse(200, { pattern, deletedCount: deleted }, `Cache keys matching pattern '${pattern}' cleared`)
        );
    }

    await cacheService.flush();
    return res.status(200).json(
        new ApiResponse(200, { flushed: true }, "All DevArena cache entries flushed successfully")
    );
});

/**
 * Pre-warms hot caches such as the global leaderboard.
 */
export const warmupCache = asyncHandler(async (req, res) => {
    const topUsers = await User.find()
        .sort({ arenaScore: -1 })
        .limit(20)
        .select("name username avatar arenaScore");

    const total = await User.countDocuments();

    const leaderboardPayload = {
        statusCode: 200,
        data: {
            users: topUsers,
            totalPages: Math.ceil(total / 20),
            currentPage: 1,
        },
        message: "Global leaderboard fetched successfully",
        success: true,
    };

    // Cache page 1 for 180s
    await cacheService.set("route:/api/v1/leaderboard/global:{\"page\":\"1\"}", leaderboardPayload, 180);
    await cacheService.set("route:/api/v1/leaderboard/global:{}", leaderboardPayload, 180);

    return res.status(200).json(
        new ApiResponse(200, { warmed: ["global-leaderboard"] }, "Cache pre-warmed successfully")
    );
});
