import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    generateTopicAnalysis,
    getChatHistory,
    chatWithAI,
    clearChatHistory,
    getRAGStatus,
    getProgressiveHints,
    generateStudyPlan,
    reviewContest,
    getPatterns,
    getProblems
} from "../controllers/ai.controller.js";

const router = Router();

// Legacy & Chat routes
router.post("/analyze-topics", verifyJWT, generateTopicAnalysis);
router.get("/chat", verifyJWT, getChatHistory);
router.post("/chat", verifyJWT, chatWithAI);
router.delete("/chat", verifyJWT, clearChatHistory);

// Phase 10: RAG Engine Endpoints
router.get("/status", verifyJWT, getRAGStatus);
router.post("/hints", verifyJWT, getProgressiveHints);
router.post("/plan", verifyJWT, generateStudyPlan);
router.post("/review", verifyJWT, reviewContest);
router.get("/patterns", verifyJWT, getPatterns);
router.get("/problems", verifyJWT, getProblems);

export default router;
