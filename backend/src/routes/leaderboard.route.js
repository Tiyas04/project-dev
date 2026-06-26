import { Router } from "express";
import { getGlobalLeaderboard, getFriendsLeaderboard } from "../controllers/leaderboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/global").get(getGlobalLeaderboard);
router.route("/friends").get(verifyJWT, getFriendsLeaderboard);

export default router;
