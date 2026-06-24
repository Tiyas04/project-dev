import { Router } from "express";
import {
    connectPlatform,
    disconnectPlatform,
    syncAllPlatforms,
} from "../controllers/connectedAccount.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);

router.route("/connect").post(connectPlatform);
router.route("/disconnect").post(disconnectPlatform);
router.route("/sync").post(syncAllPlatforms);

export default router;
