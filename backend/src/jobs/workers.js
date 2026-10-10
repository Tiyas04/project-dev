import { Worker } from "bullmq";
import { QUEUE_NAMES, queueAnalyticsRecalculation, queueAchievementCheck, queueUserDataSync } from "./queues.js";
import { createRedisConnection, isRedisReady } from "../config/redis.js";
import { ConnectedAccount } from "../models/connectedAccount.model.js";
import { User } from "../models/user.model.js";
import {
    fetchLeetCodeStats,
    fetchCodeforcesStats,
    fetchGitHubStats,
} from "../utils/platformFetchers.js";
import { updateArenaScore } from "../utils/arenaScore.util.js";
import { checkAndAwardAchievements } from "../services/achievement.service.js";
import { cacheService } from "../services/cache.service.js";

let workers = {};
let workersStarted = false;

/**
 * Worker handler for synchronizing platform statistics
 */
export async function processDataSyncJob(job) {
    const { userId, platforms = ["leetcode", "codeforces", "github"] } = job.data;
    console.log(`[DataSync Worker] Processing stats sync for user ${userId}...`);

    const connectedAccount = await ConnectedAccount.findOne({ user: userId });
    if (!connectedAccount) {
        console.log(`[DataSync Worker] No connected account found for user ${userId}`);
        return { success: false, reason: "No connected account" };
    }

    const updateFields = {};
    const syncResults = {};

    for (const platform of platforms) {
        const username = connectedAccount[platform]?.username;
        if (!username) continue;

        try {
            let stats;
            if (platform === "leetcode") {
                stats = await fetchLeetCodeStats(username, connectedAccount.leetcode?.stats);
            } else if (platform === "codeforces") {
                stats = await fetchCodeforcesStats(username, connectedAccount.codeforces?.stats);
            } else if (platform === "github") {
                stats = await fetchGitHubStats(username);
            }

            if (stats) {
                updateFields[`${platform}.stats`] = stats;
                updateFields[`${platform}.lastSyncedAt`] = new Date();
                syncResults[platform] = "success";
            }
        } catch (err) {
            console.error(`[DataSync Worker] Failed to sync ${platform} for ${username}:`, err.message);
            syncResults[platform] = `failed: ${err.message}`;
        }
    }

    if (Object.keys(updateFields).length > 0) {
        await ConnectedAccount.findOneAndUpdate(
            { user: userId },
            { $set: updateFields }
        );
    }

    // Trigger dependent background jobs: Arena Score update & Achievement checks
    await queueAnalyticsRecalculation(userId);
    await queueAchievementCheck(userId);

    // Invalidate user cache
    const user = await User.findById(userId).select("username");
    if (user) {
        await cacheService.delPattern(`*${user.username}*`);
        await cacheService.delPattern(`*user_${userId}*`);
    }

    console.log(`[DataSync Worker] Completed sync for user ${userId}`, syncResults);
    return { success: true, syncResults };
}

/**
 * Worker handler for recalculating Arena Score & Analytics
 */
export async function processAnalyticsJob(job) {
    const { userId } = job.data;
    console.log(`[Analytics Worker] Recalculating Arena Score for user ${userId}...`);

    const newScore = await updateArenaScore(userId);

    // Invalidate leaderboard cache
    await cacheService.delPattern("leaderboard:*");
    await cacheService.delPattern("route:/api/v1/leaderboard*");

    console.log(`[Analytics Worker] Updated Arena Score to ${newScore} for user ${userId}`);
    return { success: true, arenaScore: newScore };
}

/**
 * Worker handler for evaluating and unlocking achievements
 */
export async function processAchievementJob(job) {
    const { userId } = job.data;
    console.log(`[Achievement Worker] Checking achievements for user ${userId}...`);

    const newlyAwarded = await checkAndAwardAchievements(userId);

    console.log(`[Achievement Worker] Awarded ${newlyAwarded.length} new badges for user ${userId}`);
    return { success: true, newlyAwardedCount: newlyAwarded.length };
}

/**
 * Worker handler for periodic sweeps across all users
 */
export async function processScheduledJob(job) {
    console.log("[Scheduled Worker] Starting periodic platform synchronization sweep...");

    const accounts = await ConnectedAccount.find({
        $or: [
            { "leetcode.username": { $ne: "" } },
            { "codeforces.username": { $ne: "" } },
            { "github.username": { $ne: "" } },
        ],
    }).select("user");

    console.log(`[Scheduled Worker] Found ${accounts.length} users with connected accounts to sync.`);

    let queuedCount = 0;
    for (const account of accounts) {
        if (account.user) {
            await queueUserDataSync(account.user.toString());
            queuedCount++;
        }
    }

    return { success: true, totalAccounts: accounts.length, queuedCount };
}

/**
 * Starts BullMQ background workers
 */
export function initWorkers() {
    if (workersStarted || !isRedisReady()) {
        return;
    }

    try {
        const createWorker = (queueName, processor, concurrency = 2) => {
            const connection = createRedisConnection();
            const worker = new Worker(queueName, processor, {
                connection,
                concurrency,
            });

            worker.on("completed", (job) => {
                console.log(`[BullMQ Worker] Job ${job.name} (ID: ${job.id}) completed.`);
            });

            worker.on("failed", (job, err) => {
                console.error(`[BullMQ Worker] Job ${job?.name} (ID: ${job?.id}) failed:`, err?.message);
            });

            worker.on("error", (err) => {
                console.warn(`[BullMQ Worker Error on ${queueName}]:`, err.message);
            });

            return worker;
        };

        workers[QUEUE_NAMES.DATA_SYNC] = createWorker(QUEUE_NAMES.DATA_SYNC, processDataSyncJob, 2);
        workers[QUEUE_NAMES.ANALYTICS] = createWorker(QUEUE_NAMES.ANALYTICS, processAnalyticsJob, 5);
        workers[QUEUE_NAMES.ACHIEVEMENT] = createWorker(QUEUE_NAMES.ACHIEVEMENT, processAchievementJob, 5);
        workers[QUEUE_NAMES.SCHEDULED] = createWorker(QUEUE_NAMES.SCHEDULED, processScheduledJob, 1);

        workersStarted = true;
        console.log("[BullMQ Workers] All background workers started and listening for jobs.");
    } catch (err) {
        console.warn("[BullMQ Workers Init Warning]:", err.message);
    }
}

/**
 * Closes workers gracefully on server shutdown
 */
export async function closeWorkers() {
    for (const [name, worker] of Object.entries(workers)) {
        try {
            await worker.close();
            console.log(`[BullMQ] Worker for ${name} closed.`);
        } catch {
            // Ignore error during shutdown
        }
    }
    workersStarted = false;
}
