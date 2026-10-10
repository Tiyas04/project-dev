import { Router } from "express";
import {
    getMyAchievements,
    getUserPublicAchievements,
    checkMyAchievements,
} from "../controllers/achievement.controller.js";
import { verifyJWT, optionalJWT } from "../middlewares/auth.middleware.js";
import { cacheResponse } from "../middlewares/cache.middleware.js";

const router = Router();

router.get("/my", verifyJWT, getMyAchievements);
router.post("/check", verifyJWT, checkMyAchievements);
router.get("/user/:username", optionalJWT, cacheResponse(180), getUserPublicAchievements);

export default router;
