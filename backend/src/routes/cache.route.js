import { Router } from "express";
import { getCacheStatus, clearCache, warmupCache } from "../controllers/cache.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/status", getCacheStatus);
router.post("/clear", verifyJWT, clearCache);
router.post("/warmup", verifyJWT, warmupCache);

export default router;
