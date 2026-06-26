import { GoogleGenAI } from "@google/genai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AiChat } from "../models/aiChat.model.js";
import { ConnectedAccount } from "../models/connectedAccount.model.js";

const callGeminiWithFallback = async (operationFn, preferredModel) => {
    const defaultModels = ["gemini-3.5-flash", "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];
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
    return context.length > 0 ? context.join("\\n") : "No active stats across platforms.";
};

const getSystemInstruction = (contextStr) => {
    return `You are an AI Coach for DevArena, a platform for competitive programmers and developers.
Your job is to provide personalized guidance, roadmaps, and coding advice.
Keep your responses encouraging, highly technical, and concise. Format responses in Markdown.

Here is the user's current profile context:
${contextStr}`;
}

const getChatHistory = asyncHandler(async (req, res) => {
    const { model: preferredModel } = req.query;

    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(500, "Gemini API Key is not configured on the server.");
    }

    let chat = await AiChat.findOne({ user: req.user._id });

    if (!chat || chat.messages.length === 0) {
        // Generate initial welcome and roadmap
        const account = await ConnectedAccount.findOne({ user: req.user._id });
        const contextStr = buildContextString(account);
        const systemInstruction = getSystemInstruction(contextStr);

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `${systemInstruction}
        
Based on my profile context above, please generate a warm welcome message and a customized high-level roadmap overview for me to improve my skills. Focus on my LeetCode/Codeforces stats and GitHub activity.
Use Markdown formatting. Use headers like "### 👋 Welcome to AI Coach" and "### 🗺️ Your Personalized Roadmap".`;

        try {
            const result = await callGeminiWithFallback(async (modelName) => {
                console.log(`Trying model: ${modelName}`);
                return await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                });
            }, preferredModel);
            const initialText = result.text;

            if (!chat) {
                chat = new AiChat({ user: req.user._id, messages: [] });
            }
            
            chat.messages.push({ role: "model", content: initialText });
            await chat.save();
        } catch (error) {
            console.error("Error generating initial roadmap:", error);
            throw new ApiError(500, "Failed to generate initial AI roadmap.");
        }
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

    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(500, "Gemini API Key is not configured on the server.");
    }

    const account = await ConnectedAccount.findOne({ user: req.user._id });
    const contextStr = buildContextString(account);
    const systemInstruction = getSystemInstruction(contextStr);

    let chat = await AiChat.findOne({ user: req.user._id });
    if (!chat) {
        chat = new AiChat({ user: req.user._id, messages: [] });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Format history for gemini
    const history = chat.messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
    }));

    // Inject system instruction into the first message or dynamically
    // Gemini Pro API supports system instructions, but for simplicity we can just prepend it to the current message internally if it's the first user message, or start a chat session.
    
    try {
        // Pass context silently in the prompt for this turn to ensure it remembers
        const enhancedMessage = `[System Context: ${systemInstruction}]\n\nUser Message: ${message}`;
        
        const result = await callGeminiWithFallback(async (modelName) => {
            console.log(`Trying model: ${modelName}`);
            const chatSession = ai.chats.create({
                model: modelName,
                history: history,
            });
            return await chatSession.sendMessage({ message: enhancedMessage });
        }, preferredModel);
        
        const responseText = result.text;

        // Save to DB
        chat.messages.push({ role: "user", content: message });
        chat.messages.push({ role: "model", content: responseText });
        await chat.save();

        return res.status(200).json(
            new ApiResponse(200, { message: responseText }, "Message sent successfully")
        );
    } catch (error) {
        console.error("AI Chat Error:", error);
        throw new ApiError(500, "Failed to get AI response.");
    }
});

const clearChatHistory = asyncHandler(async (req, res) => {
    await AiChat.findOneAndUpdate({ user: req.user._id }, { messages: [] });
    return res.status(200).json(
        new ApiResponse(200, {}, "Chat history cleared")
    );
});

export { generateTopicAnalysis, getChatHistory, chatWithAI, clearChatHistory };
