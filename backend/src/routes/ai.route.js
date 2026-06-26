import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { generateTopicAnalysis, getChatHistory, chatWithAI, clearChatHistory } from "../controllers/ai.controller.js";

const router = Router();

router.post("/analyze-topics", verifyJWT, generateTopicAnalysis);
router.get("/chat", verifyJWT, getChatHistory);
router.post("/chat", verifyJWT, chatWithAI);
router.delete("/chat", verifyJWT, clearChatHistory);

export default router;
