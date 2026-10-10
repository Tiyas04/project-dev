import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import app from "./app.js";
import { startKeepAlive } from "./utils/keepAlive.js";
import { initRedis, closeRedis } from "./config/redis.js";
import { startScheduler, stopScheduler } from "./jobs/scheduler.js";

dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 3000;

connectDB()
    .then(async () => {
        // Initialize Redis cache connection
        initRedis();

        // Start background job scheduler & workers
        await startScheduler();

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            startKeepAlive();
        });

        // Graceful shutdown
        const shutdown = async (signal) => {
            console.log(`\nReceived ${signal}. Gracefully shutting down...`);
            server.close(async () => {
                await stopScheduler();
                await closeRedis();
                process.exit(0);
            });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });