import { GoogleGenAI } from "@google/genai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AiChat } from "../models/aiChat.model.js";
import { ConnectedAccount } from "../models/connectedAccount.model.js";
import { ragService } from "../services/rag.service.js";

const callGeminiWithFallback = async (operationFn, preferredModel) => {
    const defaultModels = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-2.5-flash"];
    const modelsToTry = preferredModel 
        ? [preferredModel, ...defaultModels.filter(m => m !== preferredModel)]
        : defaultModels;

    let lastError = null;
    for (const modelName of modelsToTry) {
        try {
            return await operationFn(modelName);
        } catch (error) {
            console.warn(`Gemini Model ${modelName} failed. Error:`, error.message || error);
            lastError = error;
        }
    }
    throw lastError || new Error("All fallback models failed.");
};

const buildContextString = (account) => {
    if (!account) return "No connected accounts.";
    let context = [];
    if (account.leetcode && account.leetcode.username) {
        context.push(`LeetCode: ${account.leetcode.stats?.problemsSolved || 0} problems solved, Rating: ${account.leetcode.stats?.currentRating || 'N/A'}`);
    }
    if (account.codeforces && account.codeforces.username) {
        context.push(`Codeforces: ${account.codeforces.stats?.problemsSolved || 0} problems solved, Rating: ${account.codeforces.stats?.currentRating || 'N/A'}`);
    }
    if (account.github && account.github.username) {
        context.push(`GitHub: ${account.github.stats?.publicRepos || 0} public repos, ${account.github.stats?.contributions || 0} recent contributions`);
    }
    return context.length > 0 ? context.join("\n") : "No active stats across platforms.";
};

const getSystemInstruction = (contextStr) => {
    return `You are an AI Coach for DevArena, a platform for competitive programmers and developers.
Your job is to provide personalized guidance, roadmaps, and coding advice.
Keep your responses encouraging, highly technical, and concise. Format responses in Markdown.

Here is the user's current profile context:
${contextStr}`;
};

const generateTopicAnalysis = asyncHandler(async (req, res) => {
    const { topTopics, weakTopics, platform, model: preferredModel } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(500, "Gemini API Key is not configured on the server.");
    }

    if (!topTopics || !weakTopics || !platform) {
        throw new ApiError(400, "Missing required fields: topTopics, weakTopics, or platform.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an expert technical interviewer and competitive programming coach for a platform called DevArena. 
A user has requested a topic-wise analysis of their performance on ${platform}.

Here are their Top 5 Strongest Topics:
${topTopics.map(t => `- ${t.subject} (Score: ${t.score})`).join('\n')}

Here are their Top 5 Weakest Topics (Needs Practice):
${weakTopics.map(t => `- ${t.subject} (Score: ${t.score})`).join('\n')}

Please provide a personalized analysis and study roadmap formatted strictly in Markdown. 
Do not use any introductory conversational text like "Here is your roadmap".

Structure the response exactly with these headers:
### 🌟 Your Strengths
(Provide a brief, encouraging paragraph about their mastery of the strong topics.)

### 🎯 Areas for Improvement
(Briefly analyze why they might be struggling with the weak topics and how they connect.)

### 🚀 Actionable Study Plan
(Provide a 3-step action plan to improve the weak topics over the next 2-4 weeks.)`;

    try {
        console.log("Generating AI Insights with fallback...");
        const result = await callGeminiWithFallback(async (modelName) => {
            console.log(`Trying model: ${modelName}`);
            return await ai.models.generateContent({
                model: modelName,
                contents: prompt,
            });
        }, preferredModel);

        const responseText = result.text;
        
        return res.status(200).json(
            new ApiResponse(200, { analysis: responseText }, "AI analysis generated successfully")
        );
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new ApiError(500, "Failed to generate AI insights.");
    }
});

const getChatHistory = asyncHandler(async (req, res) => {
    const { model: preferredModel } = req.query;

    let chat = await AiChat.findOne({ user: req.user._id });

    if (!chat || chat.messages.length === 0) {
        // Generate initial welcome and roadmap
        const account = await ConnectedAccount.findOne({ user: req.user._id });
        const contextStr = buildContextString(account);
        const systemInstruction = getSystemInstruction(contextStr);

        let initialText = "";

        // Try Python RAG microservice first for grounded initial guidance
        try {
            const ragHealth = await ragService.checkHealth();
            if (ragHealth.online) {
                const ragRes = await ragService.askCoach({
                    message: "Generate a warm welcome message and a high-level roadmap based on my profile.",
                    userContext: account ? account.toObject() : null,
                    model: preferredModel
                });
                if (ragRes && ragRes.content) {
                    initialText = ragRes.content;
                }
            }
        } catch (e) {
            console.warn("RAG service initial message bypass:", e.message);
        }

        // Fallback to direct Gemini if needed
        if (!initialText) {
            if (!process.env.GEMINI_API_KEY) {
                initialText = "### 👋 Welcome to DevArena AI Coach!\n\nConnect your LeetCode and Codeforces profiles to unlock personalized competitive programming roadmaps.";
            } else {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                const prompt = `${systemInstruction}\n\nBased on my profile context above, please generate a warm welcome message and a customized high-level roadmap overview for me to improve my skills. Focus on my LeetCode/Codeforces stats and GitHub activity.\nUse Markdown formatting. Use headers like "### 👋 Welcome to AI Coach" and "### 🗺️ Your Personalized Roadmap".`;

                const result = await callGeminiWithFallback(async (modelName) => {
                    return await ai.models.generateContent({
                        model: modelName,
                        contents: prompt,
                    });
                }, preferredModel);
                initialText = result.text;
            }
        }

        if (!chat) {
            chat = new AiChat({ user: req.user._id, messages: [] });
        }
        
        chat.messages.push({ role: "model", content: initialText });
        await chat.save();
    }

    return res.status(200).json(
        new ApiResponse(200, { messages: chat.messages }, "Chat history fetched successfully")
    );
});

const chatWithAI = asyncHandler(async (req, res) => {
    const { message, model: preferredModel } = req.body;
    if (!message) {
        throw new ApiError(400, "Message is required.");
    }

    const account = await ConnectedAccount.findOne({ user: req.user._id });
    let chat = await AiChat.findOne({ user: req.user._id });
    if (!chat) {
        chat = new AiChat({ user: req.user._id, messages: [] });
    }

    let responseText = "";
    let retrievedPatterns = [];
    let retrievedProblems = [];
    let isGrounded = false;

    // 1. First attempt: Dedicated Python RAG Microservice
    try {
        const ragRes = await ragService.askCoach({
            message,
            userContext: account ? account.toObject() : null,
            chatHistory: chat.messages.map(m => ({ role: m.role, content: m.content })),
            model: preferredModel
        });

        if (ragRes && ragRes.content) {
            responseText = ragRes.content;
            retrievedPatterns = ragRes.retrieved_patterns || [];
            retrievedProblems = ragRes.retrieved_problems || [];
            isGrounded = ragRes.grounded || true;
        }
    } catch (ragError) {
        console.warn("[AI Controller] Python RAG service unreachable or failed. Falling back to direct Gemini:", ragError.message);
    }

    // 2. Resilient Fallback: Direct In-Process Gemini
    if (!responseText) {
        if (!process.env.GEMINI_API_KEY) {
            throw new ApiError(500, "Neither RAG service nor GEMINI_API_KEY is available.");
        }

        const contextStr = buildContextString(account);
        const systemInstruction = getSystemInstruction(contextStr);
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const history = chat.messages.map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        }));

        const enhancedMessage = `[System Context: ${systemInstruction}]\n\nUser Message: ${message}`;
        
        const result = await callGeminiWithFallback(async (modelName) => {
            const chatSession = ai.chats.create({
                model: modelName,
                history: history,
            });
            return await chatSession.sendMessage({ message: enhancedMessage });
        }, preferredModel);

        responseText = result.text;
    }

    // Save to MongoDB
    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "model", content: responseText });
    await chat.save();

    return res.status(200).json(
        new ApiResponse(200, {
            message: responseText,
            retrievedPatterns,
            retrievedProblems,
            grounded: isGrounded
        }, "Message sent successfully")
    );
});

const clearChatHistory = asyncHandler(async (req, res) => {
    await AiChat.findOneAndUpdate({ user: req.user._id }, { messages: [] });
    return res.status(200).json(
        new ApiResponse(200, {}, "Chat history cleared")
    );
});

// Phase 10: RAG Health & Service Status
const getRAGStatus = asyncHandler(async (req, res) => {
    const health = await ragService.checkHealth();
    return res.status(200).json(
        new ApiResponse(200, health, "RAG Service health check")
    );
});

// Phase 10: 4-Tier Progressive Hints
const getProgressiveHints = asyncHandler(async (req, res) => {
    const { problemQuery, userRating, model: preferredModel } = req.body;
    if (!problemQuery) {
        throw new ApiError(400, "problemQuery is required.");
    }

    try {
        const result = await ragService.getProgressiveHints({
            problemQuery,
            userRating,
            model: preferredModel
        });
        return res.status(200).json(
            new ApiResponse(200, result, "Progressive hints generated successfully")
        );
    } catch (error) {
        console.error("Progressive hint error:", error.message);
        throw new ApiError(500, error.message || "Failed to retrieve progressive hints.");
    }
});

// Phase 10: Dynamic Curated Study Planner
const generateStudyPlan = asyncHandler(async (req, res) => {
    const { topic, targetRatingGain, currentRating, model: preferredModel } = req.body;
    if (!topic) {
        throw new ApiError(400, "Topic is required.");
    }

    try {
        const result = await ragService.generateStudyPlan({
            topic,
            targetRatingGain,
            currentRating,
            model: preferredModel
        });
        return res.status(200).json(
            new ApiResponse(200, result, "Study plan generated successfully")
        );
    } catch (error) {
        console.error("Study planner error:", error.message);
        throw new ApiError(500, error.message || "Failed to generate study plan.");
    }
});

// Phase 10: Contest Post-Mortem Diagnostics
const reviewContest = asyncHandler(async (req, res) => {
    const { contestTitle, missedProblems, errorType, model: preferredModel } = req.body;
    if (!contestTitle || !missedProblems || !missedProblems.length) {
        throw new ApiError(400, "contestTitle and missedProblems are required.");
    }

    try {
        const result = await ragService.reviewContest({
            contestTitle,
            missedProblems,
            errorType,
            model: preferredModel
        });
        return res.status(200).json(
            new ApiResponse(200, result, "Contest review generated successfully")
        );
    } catch (error) {
        console.error("Contest review error:", error.message);
        throw new ApiError(500, error.message || "Failed to analyze contest performance.");
    }
});

// Phase 10: List Patterns & Problems
const getPatterns = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const patterns = await ragService.getPatterns(category);
    return res.status(200).json(
        new ApiResponse(200, { patterns }, "Patterns fetched")
    );
});

const getProblems = asyncHandler(async (req, res) => {
    const { topic, platform } = req.query;
    const problems = await ragService.getProblems(topic, platform);
    return res.status(200).json(
        new ApiResponse(200, { problems }, "Problems fetched")
    );
});

export {
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
};
