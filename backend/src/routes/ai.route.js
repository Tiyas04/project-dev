import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateTopicAnalysis } from "../controllers/ai.controller.js";

const router = Router();

router.post("/analyze-topics", verifyJWT, generateTopicAnalysis);

export default router;
