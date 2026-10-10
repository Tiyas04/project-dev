import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import {
    queueUserDataSync,
    queueAchievementCheck,
    queueAnalyticsRecalculation,
    getQueueMetrics,
} from "../jobs/queues.js";
import { ConnectedAccount } from "../models/connectedAccount.model.js";

/**
 * Returns current status and metrics of BullMQ queues.
 */
export const getJobsStatus = asyncHandler(async (req, res) => {
    const metrics = await getQueueMetrics();
    return res.status(200).json(
        new ApiResponse(200, metrics, "Queue and background job status fetched successfully")
    );
});

/**
 * Dispatches an asynchronous platform data sync job for the authenticated user.
 */
export const triggerUserSync = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const platforms = req.body?.platforms || ["leetcode", "codeforces", "github"];

    const result = await queueUserDataSync(userId, platforms);

    return res.status(200).json(
        new ApiResponse(
            200,
            { ...result, userId, platforms },
            "Background platform synchronization queued successfully"
        )
    );
});

/**
 * Dispatches an asynchronous achievement verification job for the authenticated user.
 */
export const triggerAchievementCheck = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const result = await queueAchievementCheck(userId);

    return res.status(200).json(
        new ApiResponse(
            200,
            { ...result, userId },
            "Background achievement verification queued successfully"
        )
    );
});

/**
 * Dispatches sync jobs for all connected users.
 */
export const triggerSyncAllUsers = asyncHandler(async (req, res) => {
    const accounts = await ConnectedAccount.find({
        $or: [
            { "leetcode.username": { $ne: "" } },
            { "codeforces.username": { $ne: "" } },
            { "github.username": { $ne: "" } },
        ],
    }).select("user");

    let queuedCount = 0;
    for (const acc of accounts) {
        if (acc.user) {
            await queueUserDataSync(acc.user.toString());
            queuedCount++;
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { totalUsers: accounts.length, queuedCount },
            `Enqueued background synchronization for ${queuedCount} users`
        )
    );
});
