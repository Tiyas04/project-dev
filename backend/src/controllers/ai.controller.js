import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

const generateTopicAnalysis = asyncHandler(async (req, res) => {
    const { topTopics, weakTopics, platform } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        throw new ApiError(500, "Gemini API Key is not configured on the server.");
    }

    if (!topTopics || !weakTopics || !platform) {
        throw new ApiError(400, "Missing required fields: topTopics, weakTopics, or platform.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        console.log("Generating AI Insights using gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);

        const responseText = result.response.text();
        
        return res.status(200).json(
            new ApiResponse(200, { analysis: responseText }, "AI analysis generated successfully")
        );
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new ApiError(500, "Failed to generate AI insights.");
    }
});

export { generateTopicAnalysis };
