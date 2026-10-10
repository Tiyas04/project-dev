import { Queue } from "bullmq";
import { getRedisClient, isRedisReady } from "../config/redis.js";

// Queue Names
export const QUEUE_NAMES = {
    DATA_SYNC: "devarena-data-sync",
    ANALYTICS: "devarena-analytics",
    ACHIEVEMENT: "devarena-achievement",
    SCHEDULED: "devarena-scheduled",
};

let queues = {};
let queuesInitialized = false;

/**
 * Initializes BullMQ queues using the shared Redis configuration.
 */
export function initQueues() {
    if (queuesInitialized) return queues;

    const redis = getRedisClient();

    const defaultQueueOptions = {
        connection: redis,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: {
                count: 100, // Keep last 100 completed jobs
                age: 24 * 3600, // 24 hours
            },
            removeOnFail: {
                count: 50,
            },
        },
    };

    try {
        queues[QUEUE_NAMES.DATA_SYNC] = new Queue(QUEUE_NAMES.DATA_SYNC, defaultQueueOptions);
        queues[QUEUE_NAMES.ANALYTICS] = new Queue(QUEUE_NAMES.ANALYTICS, defaultQueueOptions);
        queues[QUEUE_NAMES.ACHIEVEMENT] = new Queue(QUEUE_NAMES.ACHIEVEMENT, defaultQueueOptions);
        queues[QUEUE_NAMES.SCHEDULED] = new Queue(QUEUE_NAMES.SCHEDULED, defaultQueueOptions);

        queuesInitialized = true;
        console.log("[BullMQ] Queues initialized successfully.");
    } catch (err) {
        console.warn("[BullMQ Init Warning]:", err.message);
    }

    return queues;
}

/**
 * Enqueues a platform data sync job for a user.
 * @param {string} userId
 * @param {string[]} platforms Array of platforms to sync
 */
export async function queueUserDataSync(userId, platforms = ["leetcode", "codeforces", "github"]) {
    initQueues();

    if (isRedisReady() && queues[QUEUE_NAMES.DATA_SYNC]) {
        const job = await queues[QUEUE_NAMES.DATA_SYNC].add(
            "sync-user-platforms",
            { userId, platforms },
            { jobId: `sync_${userId}_${Date.now()}` }
        );
        return { queued: true, jobId: job.id, mode: "bullmq_redis" };
    }

    // Direct background dispatch fallback when Redis server is offline
    setImmediate(async () => {
        try {
            const { processDataSyncJob } = await import("./workers.js");
            await processDataSyncJob({ data: { userId, platforms } });
        } catch (err) {
            console.error("[Fallback Sync Runner Error]:", err.message);
        }
    });

    return { queued: true, jobId: `fallback_${userId}_${Date.now()}`, mode: "in_memory_async" };
}

/**
 * Enqueues an Arena Score & Analytics recalculation job.
 * @param {string} userId
 */
export async function queueAnalyticsRecalculation(userId) {
    initQueues();

    if (isRedisReady() && queues[QUEUE_NAMES.ANALYTICS]) {
        const job = await queues[QUEUE_NAMES.ANALYTICS].add(
            "recalculate-arena-score",
            { userId },
            { jobId: `analytics_${userId}_${Date.now()}` }
        );
        return { queued: true, jobId: job.id, mode: "bullmq_redis" };
    }

    setImmediate(async () => {
        try {
            const { processAnalyticsJob } = await import("./workers.js");
            await processAnalyticsJob({ data: { userId } });
        } catch (err) {
            console.error("[Fallback Analytics Runner Error]:", err.message);
        }
    });

    return { queued: true, jobId: `fallback_analytics_${userId}`, mode: "in_memory_async" };
}

/**
 * Enqueues an achievement check job for a user.
 * @param {string} userId
 */
export async function queueAchievementCheck(userId) {
    initQueues();

    if (isRedisReady() && queues[QUEUE_NAMES.ACHIEVEMENT]) {
        const job = await queues[QUEUE_NAMES.ACHIEVEMENT].add(
            "check-user-achievements",
            { userId },
            { jobId: `achievement_${userId}_${Date.now()}` }
        );
        return { queued: true, jobId: job.id, mode: "bullmq_redis" };
    }

    setImmediate(async () => {
        try {
            const { processAchievementJob } = await import("./workers.js");
            await processAchievementJob({ data: { userId } });
        } catch (err) {
            console.error("[Fallback Achievement Runner Error]:", err.message);
        }
    });

    return { queued: true, jobId: `fallback_achievement_${userId}`, mode: "in_memory_async" };
}

/**
 * Returns diagnostic counts for all queues.
 */
export async function getQueueMetrics() {
    initQueues();
    const metrics = {};

    if (!isRedisReady()) {
        return {
            status: "fallback_active",
            note: "Redis server is not currently connected; running in resilient asynchronous mode.",
            queues: {},
        };
    }

    for (const [name, queue] of Object.entries(queues)) {
        try {
            const [waiting, active, completed, failed, delayed] = await Promise.all([
                queue.getWaitingCount(),
                queue.getActiveCount(),
                queue.getCompletedCount(),
                queue.getFailedCount(),
                queue.getDelayedCount(),
            ]);

            metrics[name] = { waiting, active, completed, failed, delayed };
        } catch {
            metrics[name] = { status: "unavailable" };
        }
    }

    return {
        status: "connected",
        queues: metrics,
    };
}
