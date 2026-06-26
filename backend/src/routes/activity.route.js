import { Router } from "express";
import { getFriendActivityFeed } from "../controllers/activity.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All activity routes require authentication

router.route("/friends").get(getFriendActivityFeed);

export default router;
