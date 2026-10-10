import { Router } from "express";
import {
    getJobsStatus,
    triggerUserSync,
    triggerAchievementCheck,
    triggerSyncAllUsers,
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/status", getJobsStatus);
router.post("/sync-now", verifyJWT, triggerUserSync);
router.post("/check-achievements", verifyJWT, triggerAchievementCheck);
router.post("/sync-all", verifyJWT, triggerSyncAllUsers);

export default router;
