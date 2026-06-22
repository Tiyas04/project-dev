import https from "https";
import http from "http";

/**
 * Starts a self-pinging background routine to keep the server awake on hosting providers like Render.
 * It detects the public URL from RENDER_EXTERNAL_URL (set automatically by Render) or a custom SERVER_URL.
 */
export const startKeepAlive = () => {
    const url = process.env.SERVER_URL;

    if (!url) {
        console.log("[Keep-Alive] No public URL found (SERVER_URL is undefined). Self-pinging routine skipped.");
        return;
    }

    // Normalize URL to always target the ping endpoint
    const targetUrl = url.endsWith("/api/v1/ping") 
        ? url 
        : `${url.replace(/\/$/, "")}/api/v1/ping`;

    console.log(`[Keep-Alive] Initializing self-pinging interval targeting: ${targetUrl}`);

    // Perform an initial ping on startup
    ping(targetUrl);

    // Set interval to ping every 10 minutes (10 * 60 * 1000 ms)
    setInterval(() => {
        ping(targetUrl);
    }, 10 * 60 * 1000);
};

const ping = (url) => {
    const client = url.startsWith("https") ? https : http;

    client.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[Keep-Alive] Ping successful - Status: ${res.statusCode} at ${new Date().toISOString()}`);
        } else {
            console.warn(`[Keep-Alive] Ping received non-success response - Status: ${res.statusCode} at ${new Date().toISOString()}`);
        }
    }).on("error", (err) => {
        console.error(`[Keep-Alive] Error during self-ping: ${err.message}`);
    });
};
