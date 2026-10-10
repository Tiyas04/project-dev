import { Router } from "express";
import { getGlobalLeaderboard, getFriendsLeaderboard } from "../controllers/leaderboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { cacheResponse } from "../middlewares/cache.middleware.js";

const router = Router();

// Cache global leaderboard for 120 seconds
router.route("/global").get(cacheResponse(120), getGlobalLeaderboard);

// Cache friends leaderboard for 60 seconds (per user key generated automatically)
router.route("/friends").get(verifyJWT, cacheResponse(60), getFriendsLeaderboard);

export default router;
