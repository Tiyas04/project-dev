import axios from "axios";

class RAGService {
    constructor() {
        this.baseUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
        this.secret = process.env.INTERNAL_AI_SECRET || "devarena_rag_secret_key_2026";
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 90000,
            headers: {
                "Content-Type": "application/json",
                "x-ai-secret": this.secret
            }
        });
    }

    async checkHealth() {
        try {
            const res = await this.client.get("/health", { timeout: 3000 });
            return {
                online: true,
                ...res.data
            };
        } catch (error) {
            return {
                online: false,
                error: error.message || "RAG service offline"
            };
        }
    }

    async askCoach({ message, userContext, chatHistory, model }) {
        const payload = {
            message,
            user_context: userContext || null,
            chat_history: chatHistory || null,
            model: model || null
        };
        const res = await this.client.post("/api/rag/coach", payload);
        return res.data;
    }

    async getProgressiveHints({ problemQuery, userRating, model }) {
        const payload = {
            problem_query: problemQuery,
            user_rating: userRating || null,
            model: model || null
        };
        const res = await this.client.post("/api/rag/hints", payload);
        return res.data;
    }

    async generateStudyPlan({ topic, targetRatingGain, currentRating, model }) {
        const payload = {
            topic,
            target_rating_gain: targetRatingGain || 150,
            current_rating: currentRating || 1400,
            model: model || null
        };
        const res = await this.client.post("/api/rag/plan", payload);
        return res.data;
    }

    async reviewContest({ contestTitle, missedProblems, errorType, model }) {
        const payload = {
            contest_title: contestTitle,
            missed_problems: missedProblems || [],
            error_type: errorType || "TLE",
            model: model || null
        };
        const res = await this.client.post("/api/rag/review", payload);
        return res.data;
    }

    async getPatterns(category = null) {
        const params = category ? { category } : {};
        const res = await this.client.get("/api/rag/patterns", { params });
        return res.data;
    }

    async getProblems(topic = null, platform = null) {
        const params = {};
        if (topic) params.topic = topic;
        if (platform) params.platform = platform;
        const res = await this.client.get("/api/rag/problems", { params });
        return res.data;
    }
}

export const ragService = new RAGService();
