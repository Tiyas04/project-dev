import asyncHandler from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ConnectedAccount } from "../models/connectedAccount.model.js";
import { User } from "../models/user.model.js";
import { enrichUser } from "../utils/userEnricher.js";
import {
    fetchLeetCodeStats,
    fetchCodeforcesStats,
    fetchGitHubStats,
} from "../utils/platformFetchers.js";
import { updateArenaScore } from "../utils/arenaScore.util.js";
import { Activity } from "../models/activity.model.js";

/**
 * Connect a platform profile with username and run initial sync
 */
const connectPlatform = asyncHandler(async (req, res) => {
    const { platform, username } = req.body;

    if (!platform || !username) {
        throw new ApiError(400, "Platform and username are required");
    }

    const normalizedPlatform = platform.toLowerCase();
    if (!["leetcode", "codeforces", "github"].includes(normalizedPlatform)) {
        throw new ApiError(400, `Unsupported platform: ${platform}`);
    }

    // Try to fetch initial stats to validate username exists
    let stats;
    try {
        if (normalizedPlatform === "leetcode") {
            const existingAccount = await ConnectedAccount.findOne({ user: req.user._id });
            const existingStats = existingAccount?.leetcode?.stats;
            stats = await fetchLeetCodeStats(username, existingStats);
        } else if (normalizedPlatform === "codeforces") {
            const existingAccount = await ConnectedAccount.findOne({ user: req.user._id });
            const existingStats = existingAccount?.codeforces?.stats;
            stats = await fetchCodeforcesStats(username, existingStats);
        } else if (normalizedPlatform === "github") {
            stats = await fetchGitHubStats(username);
        }
    } catch (error) {
        throw new ApiError(400, `Failed to validate user on ${platform}: ${error.message}`);
    }

    // Upsert connection in database
    await ConnectedAccount.findOneAndUpdate(
        { user: req.user._id },
        {
            $set: {
                [`${normalizedPlatform}.username`]: username,
                [`${normalizedPlatform}.stats`]: stats,
                [`${normalizedPlatform}.lastSyncedAt`]: new Date(),
            },
        },
        { new: true, upsert: true }
    );

    await updateArenaScore(req.user._id);

    await Activity.create({
        user: req.user._id,
        type: 'ACCOUNT_LINKED',
        platform: normalizedPlatform,
        metadata: { username }
    });

    // Fetch and enrich user for response
    const dbUser = await User.findById(req.user._id);
    const enrichedUser = await enrichUser(dbUser);

    console.log(`Connected ${platform} for user ${req.user.username}`);
    return res.status(200).json(
        new ApiResponse(200, enrichedUser, `${platform} connected and synced successfully`)
    );
});

/**
 * Disconnect a platform profile
 */
const disconnectPlatform = asyncHandler(async (req, res) => {
    const { platform } = req.body;

    if (!platform) {
        throw new ApiError(400, "Platform is required");
    }

    const normalizedPlatform = platform.toLowerCase();
    if (!["leetcode", "codeforces", "github"].includes(normalizedPlatform)) {
        throw new ApiError(400, `Unsupported platform: ${platform}`);
    }

    // Clear platform fields
    await ConnectedAccount.findOneAndUpdate(
        { user: req.user._id },
        {
            $set: {
                [`${normalizedPlatform}.username`]: "",
                [`${normalizedPlatform}.stats`]: {
                    problemsSolved: 0,
                    currentRating: 0,
                    bestRating: 0,
                    globalRanking: "",
                    contests: 0,
                    maxStreak: 0,
                    publicRepos: 0,
                    contributions: 0,
                    currentStreak: 0,
                    followers: 0,
                    starsReceived: 0,
                    pullRequests: 0,
                },
                [`${normalizedPlatform}.lastSyncedAt`]: null,
            },
        }
    );

    await updateArenaScore(req.user._id);

    const dbUser = await User.findById(req.user._id);
    const enrichedUser = await enrichUser(dbUser);

    console.log(`Disconnected ${platform} for user ${req.user.username}`);
    return res.status(200).json(
        new ApiResponse(200, enrichedUser, `${platform} disconnected successfully`)
    );
});

/**
 * Manually sync all connected platform profiles
 */
const syncAllPlatforms = asyncHandler(async (req, res) => {
    const connectedAccount = await ConnectedAccount.findOne({ user: req.user._id });

    if (!connectedAccount) {
        const dbUser = await User.findById(req.user._id);
        const enrichedUser = await enrichUser(dbUser);
        return res.status(200).json(
            new ApiResponse(200, enrichedUser, "No platforms connected to sync")
        );
    }

    const platforms = ["leetcode", "codeforces", "github"];
    const updateFields = {};

    // Sync each platform sequentially with error boundaries to prevent one platform failure from aborting others
    for (const platform of platforms) {
        const username = connectedAccount[platform]?.username;
        if (username) {
            try {
                let stats;
                if (platform === "leetcode") {
                    stats = await fetchLeetCodeStats(username, connectedAccount.leetcode?.stats);
                } else if (platform === "codeforces") {
                    stats = await fetchCodeforcesStats(username, connectedAccount.codeforces?.stats);
                } else if (platform === "github") {
                    stats = await fetchGitHubStats(username);
                }
                
                updateFields[`${platform}.stats`] = stats;
                updateFields[`${platform}.lastSyncedAt`] = new Date();
            } catch (err) {
                console.error(`Error syncing ${platform} during manual sync:`, err.message);
                // Keep the current stats if fetching fails (due to rate-limiting or network issues)
            }
        }
    }

    if (Object.keys(updateFields).length > 0) {
        await ConnectedAccount.findOneAndUpdate(
            { user: req.user._id },
            { $set: updateFields }
        );
        await updateArenaScore(req.user._id);
    }

    const dbUser = await User.findById(req.user._id);
    const enrichedUser = await enrichUser(dbUser);

    console.log(`Synchronized all platforms for user ${req.user.username}`);
    return res.status(200).json(
        new ApiResponse(200, enrichedUser, "Platform stats synchronized successfully")
    );
});

export {
    connectPlatform,
    disconnectPlatform,
    syncAllPlatforms,
};
