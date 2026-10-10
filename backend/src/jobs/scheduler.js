import { initQueues, QUEUE_NAMES } from "./queues.js";
import { initWorkers, closeWorkers } from "./workers.js";
import { isRedisReady } from "../config/redis.js";

let localInterval = null;

/**
 * Initializes workers, repeatable queue jobs, and scheduled background sweeps.
 */
export async function startScheduler() {
    // 1. Initialize BullMQ queues and workers
    const queues = initQueues();

    if (isRedisReady() && queues[QUEUE_NAMES.SCHEDULED]) {
        try {
            // Schedule recurring sync sweep every 6 hours (6 * 60 * 60 * 1000 ms)
            await queues[QUEUE_NAMES.SCHEDULED].add(
                "periodic-sync-sweep",
                {},
                {
                    repeat: {
                        every: 6 * 3600 * 1000,
                    },
                    jobId: "scheduled_sync_sweep_repeatable",
                }
            );

            console.log("[BullMQ Scheduler] Recurring background sync sweep registered (every 6 hours).");
        } catch (err) {
            console.warn("[BullMQ Scheduler Warning]:", err.message);
        }

        initWorkers();
    } else {
        console.log("[Scheduler] Running in local asynchronous mode.");
    }
}

/**
 * Stops scheduler and closes workers on server shutdown.
 */
export async function stopScheduler() {
    if (localInterval) {
        clearInterval(localInterval);
        localInterval = null;
    }
    await closeWorkers();
}
