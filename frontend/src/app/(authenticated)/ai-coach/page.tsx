"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Bot,
  User,
  Trash2,
  Loader2,
  Code2,
  Sparkles,
  Lightbulb,
  Compass,
  Stethoscope,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Flame,
  BookOpen,
  AlertCircle,
  RotateCw
} from "lucide-react";
import { CustomMarkdown } from "@/components/custom-markdown";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "model";
  content: string;
  retrievedPatterns?: string[];
  retrievedProblems?: string[];
  grounded?: boolean;
}

interface ProgressiveHints {
  problem_title: string;
  platform: string;
  rating?: number;
  difficulty?: string;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  source: string;
}

interface StudyPlanResult {
  topic: string;
  current_rating: number;
  target_rating: number;
  roadmap: string;
  recommended_problems: Array<{
    title: string;
    platform: string;
    rating?: number;
    difficulty?: string;
    topic_tags?: string[];
  }>;
}

interface ContestReviewResult {
  contest_title: string;
  error_type: string;
  analysis: string;
  associated_patterns: string[];
}

export default function AiCoachPage() {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<"chat" | "hints" | "planner" | "review">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // RAG Engine Status
  const [ragStatus, setRagStatus] = useState<{ online: boolean; patterns?: number; problems?: number } | null>(null);

  // Hints State
  const [hintQuery, setHintQuery] = useState("");
  const [hintRating, setHintRating] = useState<number>(1400);
  const [hintLoading, setHintLoading] = useState(false);
  const [hints, setHints] = useState<ProgressiveHints | null>(null);
  const [unlockedTiers, setUnlockedTiers] = useState<number[]>([1]); // Tier 1 unlocked by default

  // Planner State
  const [plannerTopic, setPlannerTopic] = useState("Dynamic Programming");
  const [plannerGain, setPlannerGain] = useState(150);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlanResult | null>(null);

  // Review State
  const [contestName, setContestName] = useState("");
  const [missedProblemInput, setMissedProblemInput] = useState("");
  const [errorType, setErrorType] = useState("TLE");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [contestReview, setContestReview] = useState<ContestReviewResult | null>(null);

  const hasConnections = !!(user?.leetcode || user?.codeforces || user?.github);

  useEffect(() => {
    checkAuth();
    checkRAGStatus();
  }, []);

  useEffect(() => {
    if (hasConnections) {
      fetchChatHistory();
    } else {
      setLoading(false);
    }
  }, [hasConnections]);

  const checkRAGStatus = async () => {
    try {
      const res = await api.get("/ai/status");
      if (res.data?.data) {
        setRagStatus({
          online: !!res.data.data.online,
          patterns: res.data.data.indexed_patterns || 14,
          problems: res.data.data.indexed_problems || 12
        });
      }
    } catch (e) {
      setRagStatus({ online: false });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/chat?model=${selectedModel}`);
      setMessages(res.data.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      const res = await api.post("/ai/chat", { message: userMessage, model: selectedModel });
      const data = res.data.data;
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: data.message,
          retrievedPatterns: data.retrievedPatterns,
          retrievedProblems: data.retrievedProblems,
          grounded: data.grounded
        }
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear your chat history?")) return;
    try {
      await api.delete("/ai/chat");
      setMessages([]);
      fetchChatHistory();
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };

  // 4-Tier Progressive Hints Handler
  const handleGenerateHints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hintQuery.trim()) return;
    try {
      setHintLoading(true);
      setHints(null);
      setUnlockedTiers([1]);
      const res = await api.post("/ai/hints", {
        problemQuery: hintQuery,
        userRating: hintRating || 1400,
        model: selectedModel
      });
      setHints(res.data.data);
    } catch (error) {
      console.error("Failed to generate progressive hints:", error);
      alert("Failed to retrieve hints. Please try again.");
    } finally {
      setHintLoading(false);
    }
  };

  const toggleTier = (tier: number) => {
    if (unlockedTiers.includes(tier)) {
      setUnlockedTiers(unlockedTiers.filter((t) => t !== tier));
    } else {
      setUnlockedTiers([...unlockedTiers, tier]);
    }
  };

  // Study Planner Handler
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPlannerLoading(true);
      setStudyPlan(null);
      const res = await api.post("/ai/plan", {
        topic: plannerTopic,
        targetRatingGain: plannerGain,
        currentRating: hintRating || 1400,
        model: selectedModel
      });
      setStudyPlan(res.data.data);
    } catch (error) {
      console.error("Failed to generate study plan:", error);
      alert("Failed to generate study plan. Please try again.");
    } finally {
      setPlannerLoading(false);
    }
  };

  // Contest Diagnostics Handler
  const handleReviewContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestName.trim() || !missedProblemInput.trim()) return;
    try {
      setReviewLoading(true);
      setContestReview(null);
      const missed = missedProblemInput.split(",").map((p) => p.trim()).filter(Boolean);
      const res = await api.post("/ai/review", {
        contestTitle: contestName,
        missedProblems: missed,
        errorType: errorType,
        model: selectedModel
      });
      setContestReview(res.data.data);
    } catch (error) {
      console.error("Failed to review contest:", error);
      alert("Failed to analyze contest performance.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (!hasConnections && !loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 overflow-hidden">
        <div className="flex items-center gap-3">
          <Brain size={32} className="text-blueprint-blue" />
          <h1 className="font-sketch text-4xl text-sketch-black">AI Coach & RAG Engine</h1>
        </div>
        <section className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform rotate-6">
            <Brain size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-sketch text-3xl text-sketch-black">No Profiles Connected</h2>
            <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
              Connect your LeetCode, Codeforces, or GitHub profiles so your RAG-powered AI Coach can retrieve grounded algorithms and generate personalized improvement roadmaps.
            </p>
          </div>
          <Link
            href="/profile"
            className="px-8 py-4 bg-blueprint-blue text-white font-bold font-mono text-lg rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]"
          >
            Connect Profiles
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white p-4 sm:p-5 border-2 border-sketch-black shadow-[4px_4px_0px_#171717]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sketch text-3xl sm:text-4xl text-sketch-black flex items-center gap-2">
              <Brain size={32} className="text-blueprint-blue" />
              AI Coach & RAG Engine
            </h1>
            {ragStatus?.online ? (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-green-50 text-green-700 border-2 border-green-600 rounded-full shadow-[2px_2px_0px_#16a34a]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                RAG Active ({ragStatus.patterns} Patterns)
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-amber-50 text-amber-700 border-2 border-amber-500 rounded-full shadow-[2px_2px_0px_#d97706]">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                In-Process Fallback
              </span>
            )}
          </div>
          <p className="font-mono text-xs sm:text-sm text-sketch-black/60 mt-1">
            Grounded competitive programming mentor with progressive hints & contest diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center font-mono">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-sketch-black/60">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-2.5 py-1.5 bg-white border-2 border-sketch-black rounded-lg font-bold text-sketch-black cursor-pointer shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue text-xs"
              >
                <optgroup label="Google Gemini">
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fast)</option>
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                </optgroup>
                <optgroup label="Groq (Ultra-Fast LPUs)">
                  <option value="qwen/qwen3.8-27b">Groq Qwen 3.8 27B (Ultra Fast)</option>
                  <option value="openai/gpt-oss-120b">Groq GPT-OSS 120B</option>
                </optgroup>
                <optgroup label="OpenAI ChatGPT">
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                </optgroup>
                <optgroup label="Anthropic Claude">
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                </optgroup>
              </select>
          </div>
          {activeTab === "chat" && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-red-600 bg-red-50 border-2 border-red-200 rough-border hover:-translate-y-0.5 transition-transform shadow-[2px_2px_0px_#fca5a5] cursor-pointer"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-sketch-black pb-2">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold border-2 border-sketch-black transition-all ${
            activeTab === "chat"
              ? "bg-blueprint-blue text-white shadow-[4px_4px_0px_#171717] -translate-y-0.5"
              : "bg-white text-sketch-black hover:bg-slate-100 shadow-[2px_2px_0px_#171717]"
          }`}
        >
          <Bot size={16} />
          AI Coach Chat
        </button>

        <button
          onClick={() => setActiveTab("hints")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold border-2 border-sketch-black transition-all ${
            activeTab === "hints"
              ? "bg-blueprint-blue text-white shadow-[4px_4px_0px_#171717] -translate-y-0.5"
              : "bg-white text-sketch-black hover:bg-slate-100 shadow-[2px_2px_0px_#171717]"
          }`}
        >
          <Lightbulb size={16} />
          4-Tier Progressive Hints
        </button>

        <button
          onClick={() => setActiveTab("planner")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold border-2 border-sketch-black transition-all ${
            activeTab === "planner"
              ? "bg-blueprint-blue text-white shadow-[4px_4px_0px_#171717] -translate-y-0.5"
              : "bg-white text-sketch-black hover:bg-slate-100 shadow-[2px_2px_0px_#171717]"
          }`}
        >
          <Compass size={16} />
          Curated Study Planner
        </button>

        <button
          onClick={() => setActiveTab("review")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold border-2 border-sketch-black transition-all ${
            activeTab === "review"
              ? "bg-blueprint-blue text-white shadow-[4px_4px_0px_#171717] -translate-y-0.5"
              : "bg-white text-sketch-black hover:bg-slate-100 shadow-[2px_2px_0px_#171717]"
          }`}
        >
          <Stethoscope size={16} />
          Contest Diagnostics
        </button>
      </div>

      {/* Tab 1: AI Coach Chat */}
      {activeTab === "chat" && (
        <div className="flex-1 bg-white border-2 border-sketch-black shadow-[6px_6px_0px_#171717] flex flex-col h-150 overflow-hidden relative">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-sketch-black/50 gap-4 bg-paper">
              <Loader2 size={40} className="animate-spin text-blueprint-blue" />
              <p className="font-mono font-bold animate-pulse">Initializing your RAG AI Coach...</p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-paper custom-scrollbar">
                {messages.length === 0 && !loading && (
                  <div className="text-center py-10 font-mono text-sketch-black/50">
                    No messages yet. Ask any competitive programming question!
                  </div>
                )}
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full border-2 border-sketch-black shadow-[2px_2px_0px_#171717] ${
                        msg.role === "user" ? "bg-white text-sketch-black" : "bg-blueprint-blue text-white"
                      }`}
                    >
                      {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div
                      className={`max-w-[85%] sm:max-w-[78%] p-4 border-2 border-sketch-black text-sm leading-relaxed shadow-[4px_4px_0px_#171717] ${
                        msg.role === "user"
                          ? "bg-[#eff6ff] rounded-2xl rounded-tr-none font-mono"
                          : "bg-white rounded-2xl rounded-tl-none font-sans"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <>
                          <CustomMarkdown content={msg.content} />
                          {msg.retrievedPatterns && msg.retrievedPatterns.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-sketch-black/20 flex flex-wrap items-center gap-1.5 text-xs text-sketch-black/70">
                              <span className="font-bold flex items-center gap-1 text-blueprint-blue">
                                <Sparkles size={13} /> Grounded Patterns:
                              </span>
                              {msg.retrievedPatterns.map((pat, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-blue-50 border border-blueprint-blue text-blueprint-blue rounded text-[11px] font-bold"
                                >
                                  {pat}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full border-2 border-sketch-black shadow-[2px_2px_0px_#171717] bg-blueprint-blue text-white">
                      <Bot size={20} />
                    </div>
                    <div className="p-4 border-2 border-sketch-black bg-white rounded-2xl rounded-tl-none shadow-[4px_4px_0px_#171717] flex items-center gap-2">
                      <div className="w-2 h-2 bg-blueprint-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blueprint-blue rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blueprint-blue rounded-full animate-bounce delay-200"></div>
                      <span className="font-mono text-xs text-sketch-black/60 ml-2">Retrieving knowledge & synthesizing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t-2 border-sketch-black bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex-1 border-2 border-sketch-black bg-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] focus-within:border-blueprint-blue focus-within:ring-1 focus-within:ring-blueprint-blue transition-all">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Ask how to solve a problem, optimize complexity, or understand an algorithm..."
                      className="w-full p-3 bg-transparent font-mono text-sm resize-none focus:outline-none min-h-12.5 max-h-35 custom-scrollbar"
                      rows={2}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="px-6 py-3 bg-blueprint-blue text-white font-mono font-bold h-full flex items-center justify-center border-2 border-sketch-black shadow-[2px_2px_0px_#171717] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#171717] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={18} className={sending ? "opacity-0" : ""} />
                    {sending && <Loader2 size={18} className="absolute animate-spin" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: 4-Tier Progressive Hints */}
      {activeTab === "hints" && (
        <div className="space-y-6">
          <section className="bg-white p-6 border-2 border-sketch-black shadow-[6px_6px_0px_#171717]">
            <h2 className="font-sketch text-2xl text-sketch-black flex items-center gap-2 mb-2">
              <Lightbulb size={24} className="text-blueprint-blue" />
              Progressive 4-Tier Problem Hints
            </h2>
            <p className="font-mono text-sm text-sketch-black/60 mb-6">
              Stuck on a problem during practice? Progressive hints unlock nudges step-by-step so you solve it yourself without spoiling the answer!
            </p>

            <form onSubmit={handleGenerateHints} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-mono text-xs font-bold text-sketch-black/70">Problem Title, Link, or Core Concept:</label>
                  <input
                    type="text"
                    value={hintQuery}
                    onChange={(e) => setHintQuery(e.target.value)}
                    placeholder="e.g. Subarray Sum Equals K or Koko Eating Bananas"
                    className="w-full p-3 bg-white border-2 border-sketch-black font-mono text-sm shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold text-sketch-black/70">Target Rating / Difficulty:</label>
                  <select
                    value={hintRating}
                    onChange={(e) => setHintRating(Number(e.target.value))}
                    className="w-full p-3 bg-white border-2 border-sketch-black font-mono text-sm shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue"
                  >
                    <option value={1000}>1000 — Div3 / LeetCode Easy</option>
                    <option value={1400}>1400 — Div2B / LeetCode Medium</option>
                    <option value={1700}>1700 — Div2C / LeetCode Hard</option>
                    <option value={2000}>2000 — Div2D / Grandmaster</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-sketch-black/60">
                  <span className="font-bold">Quick Examples:</span>
                  {["Subarray Sum Equals K", "Daily Temperatures", "Network Delay Time", "Longest Increasing Subsequence"].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setHintQuery(ex)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-sketch-black rounded cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!hintQuery.trim() || hintLoading}
                  className="px-6 py-2.5 bg-blueprint-blue text-white font-mono font-bold flex items-center gap-2 border-2 border-sketch-black shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {hintLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Get Hints
                </button>
              </div>
            </form>
          </section>

          {/* Hint Accordion */}
          {hints && (
            <div className="bg-white p-6 border-2 border-sketch-black shadow-[6px_6px_0px_#171717] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-sketch-black gap-2">
                <div>
                  <span className="font-mono text-xs uppercase px-2 py-0.5 bg-blue-100 text-blueprint-blue font-bold rounded">
                    {hints.platform}
                  </span>
                  <h3 className="font-sketch text-2xl text-sketch-black mt-1">{hints.problem_title}</h3>
                </div>
                <div className="font-mono text-xs text-sketch-black/60">
                  Difficulty: <span className="font-bold text-sketch-black">{hints.difficulty || "Medium"}</span>
                  {hints.rating && ` (${hints.rating})`}
                </div>
              </div>

              {/* Tier 1 */}
              <div className="border-2 border-sketch-black p-4 bg-[#f8fafc] shadow-[2px_2px_0px_#171717]">
                <div
                  onClick={() => toggleTier(1)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 font-sketch text-lg text-sketch-black">
                    <Lightbulb size={20} className="text-amber-500" />
                    Tier 1: High-Level Conceptual Intuition
                  </div>
                  <button className="text-xs font-mono font-bold flex items-center gap-1 text-blueprint-blue">
                    {unlockedTiers.includes(1) ? <EyeOff size={14} /> : <Eye size={14} />}
                    {unlockedTiers.includes(1) ? "Hide" : "Reveal"}
                  </button>
                </div>
                {unlockedTiers.includes(1) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-sketch-black/20 font-mono text-sm leading-relaxed text-sketch-black">
                    {hints.tier1}
                  </motion.div>
                )}
              </div>

              {/* Tier 2 */}
              <div className="border-2 border-sketch-black p-4 bg-[#f8fafc] shadow-[2px_2px_0px_#171717]">
                <div
                  onClick={() => toggleTier(2)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 font-sketch text-lg text-sketch-black">
                    <Brain size={20} className="text-blueprint-blue" />
                    Tier 2: Algorithmic Pattern Recommendation
                  </div>
                  <button className="text-xs font-mono font-bold flex items-center gap-1 text-blueprint-blue">
                    {unlockedTiers.includes(2) ? <EyeOff size={14} /> : <Eye size={14} />}
                    {unlockedTiers.includes(2) ? "Hide" : "Reveal"}
                  </button>
                </div>
                {unlockedTiers.includes(2) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-sketch-black/20 font-mono text-sm leading-relaxed text-sketch-black">
                    {hints.tier2}
                  </motion.div>
                )}
              </div>

              {/* Tier 3 */}
              <div className="border-2 border-sketch-black p-4 bg-[#f8fafc] shadow-[2px_2px_0px_#171717]">
                <div
                  onClick={() => toggleTier(3)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 font-sketch text-lg text-sketch-black">
                    <Code2 size={20} className="text-emerald-600" />
                    Tier 3: Key Mathematical Invariant & State Transition
                  </div>
                  <button className="text-xs font-mono font-bold flex items-center gap-1 text-blueprint-blue">
                    {unlockedTiers.includes(3) ? <EyeOff size={14} /> : <Eye size={14} />}
                    {unlockedTiers.includes(3) ? "Hide" : "Reveal"}
                  </button>
                </div>
                {unlockedTiers.includes(3) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-sketch-black/20 font-mono text-sm leading-relaxed text-sketch-black">
                    {hints.tier3}
                  </motion.div>
                )}
              </div>

              {/* Tier 4 */}
              <div className="border-2 border-sketch-black p-4 bg-[#f8fafc] shadow-[2px_2px_0px_#171717]">
                <div
                  onClick={() => toggleTier(4)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 font-sketch text-lg text-sketch-black">
                    <ShieldCheck size={20} className="text-rose-600" />
                    Tier 4: Complexity Benchmarks & Corner Cases
                  </div>
                  <button className="text-xs font-mono font-bold flex items-center gap-1 text-blueprint-blue">
                    {unlockedTiers.includes(4) ? <EyeOff size={14} /> : <Eye size={14} />}
                    {unlockedTiers.includes(4) ? "Hide" : "Reveal"}
                  </button>
                </div>
                {unlockedTiers.includes(4) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-sketch-black/20 font-mono text-sm leading-relaxed text-sketch-black">
                    {hints.tier4}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Curated Study Planner */}
      {activeTab === "planner" && (
        <div className="space-y-6">
          <section className="bg-white p-6 border-2 border-sketch-black shadow-[6px_6px_0px_#171717]">
            <h2 className="font-sketch text-2xl text-sketch-black flex items-center gap-2 mb-2">
              <Compass size={24} className="text-blueprint-blue" />
              Dynamic Curated Study Planner
            </h2>
            <p className="font-mono text-sm text-sketch-black/60 mb-6">
              Generate a structured 3-week study roadmap targeting your weak topics, complete with real indexed problems at your rating frontier.
            </p>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold text-sketch-black/70">Focus Topic:</label>
                  <select
                    value={plannerTopic}
                    onChange={(e) => setPlannerTopic(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-sketch-black font-mono text-sm shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue"
                  >
                    <option value="Dynamic Programming">Dynamic Programming (Knapsack, LIS, Interval)</option>
                    <option value="Graph Theory">Graph Theory (Shortest Paths, Topological Sort, DSU)</option>
                    <option value="Data Structures">Data Structures (Segment Trees, Fenwick, Monotonic Stack)</option>
                    <option value="Arrays & Strings">Arrays & Strings (Two Pointers, Sliding Window, Prefix Sum)</option>
                    <option value="Search & Optimization">Search & Optimization (Binary Search on Answer Space)</option>
                    <option value="Bit Manipulation & Trie">Bit Manipulation & Trie (XOR Trie)</option>
                    <option value="Math & Combinatorics">Math & Combinatorics (Modular Inverse, Sieve)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold text-sketch-black/70">Target Rating Gain:</label>
                  <select
                    value={plannerGain}
                    onChange={(e) => setPlannerGain(Number(e.target.value))}
                    className="w-full p-3 bg-white border-2 border-sketch-black font-mono text-sm shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue"
                  >
                    <option value={100}>+100 Points (Steady Progress)</option>
                    <option value={150}>+150 Points (Standard Goal)</option>
                    <option value={250}>+250 Points (Aggressive Growth)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={plannerLoading}
                  className="px-6 py-2.5 bg-blueprint-blue text-white font-mono font-bold flex items-center gap-2 border-2 border-sketch-black shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {plannerLoading ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />}
                  Generate 3-Week Roadmap
                </button>
              </div>
            </form>
          </section>

          {studyPlan && (
            <div className="bg-white p-6 border-2 border-sketch-black shadow-[6px_6px_0px_#171717] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b-2 border-sketch-black">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-100 text-blueprint-blue rounded">
                    ROADMAP TARGET
                  </span>
                  <h3 className="font-sketch text-3xl text-sketch-black mt-1">{studyPlan.topic}</h3>
                </div>
                <div className="text-right font-mono text-sm">
                  <span className="text-sketch-black/60">Rating Target:</span>{" "}
                  <span className="font-bold text-blueprint-blue">{studyPlan.current_rating} &rarr; {studyPlan.target_rating}</span>
                </div>
              </div>

              <div className="w-full">
                <CustomMarkdown content={studyPlan.roadmap} />
              </div>

              {studyPlan.recommended_problems && studyPlan.recommended_problems.length > 0 && (
                <div className="pt-4 border-t-2 border-sketch-black">
                  <h4 className="font-sketch text-xl text-sketch-black mb-3">🎯 Indexed Practice Problems for this Plan:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {studyPlan.recommended_problems.map((prob, i) => (
                      <div key={i} className="p-3 border-2 border-sketch-black bg-[#fafafa] shadow-[2px_2px_0px_#171717]">
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-blueprint-blue">
                          <span>{prob.platform}</span>
                          <span>Rating: {prob.rating || "N/A"}</span>
                        </div>
                        <p className="font-bold text-sm text-sketch-black mt-1">{prob.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Contest Post-Mortem Diagnostics */}
      {activeTab === "review" && (
        <div className="space-y-6">
          <section className="bg-white p-6 border-2 border-sketch-black shadow-[6px_6px_0px_#171717]">
            <h2 className="font-sketch text-2xl text-sketch-black flex items-center gap-2 mb-2">
              <Stethoscope size={24} className="text-blueprint-blue" />
              Contest Post-Mortem Diagnostics
            </h2>
            <p className="font-mono text-sm text-sketch-black/60 mb-6">
              Diagnose why submissions failed in your recent contest (TLE, WA, MLE) and receive targeted recovery drills.
            </p>

            <form onSubmit={handleReviewContest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold text-sketch-black/70">Contest Name:</label>
                  <input
                    type="text"
                    value={contestName}
                    onChange={(e) => setContestName(e.target.value)}
                    placeholder="e.g. Codeforces Round 950 or Biweekly Contest 120"
                    className="w-full p-3 bg-white border-2 border-sketch-black font-mono text-sm shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold text-sketch-black/70">Missed Problems:</label>
                  <input
                    type="text"
                    value={missedProblemInput}
                    onChange={(e) => setMissedProblemInput(e.target.value)}
                    placeholder="e.g. Problem C, Problem D (comma-separated)"
                    className="w-full p-3 bg-white border-2 border-sketch-black font-mono text-sm shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-xs font-bold text-sketch-black/70">Failure Symptom:</label>
                  <select
                    value={errorType}
                    onChange={(e) => setErrorType(e.target.value)}
                    className="w-full p-3 bg-white border-2 border-sketch-black font-mono text-sm shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue"
                  >
                    <option value="TLE">TLE — Time Limit Exceeded (Complexity Bottleneck)</option>
                    <option value="WA">WA — Wrong Answer (Missed Invariant / Corner Case)</option>
                    <option value="MLE">MLE — Memory Limit Exceeded (Unbounded State Storage)</option>
                    <option value="RE">RE — Runtime Error (Array Out of Bounds / Stack Overflow)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={!contestName.trim() || !missedProblemInput.trim() || reviewLoading}
                  className="px-6 py-2.5 bg-blueprint-blue text-white font-mono font-bold flex items-center gap-2 border-2 border-sketch-black shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {reviewLoading ? <Loader2 size={16} className="animate-spin" /> : <Stethoscope size={16} />}
                  Run Post-Mortem Diagnostic
                </button>
              </div>
            </form>
          </section>

          {contestReview && (
            <div className="bg-white p-6 border-2 border-sketch-black shadow-[6px_6px_0px_#171717] space-y-4">
              <div className="flex items-center justify-between pb-4 border-b-2 border-sketch-black">
                <div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded">
                    POST-MORTEM DIAGNOSTIC
                  </span>
                  <h3 className="font-sketch text-2xl text-sketch-black mt-1">{contestReview.contest_title}</h3>
                </div>
                <div className="font-mono text-xs px-3 py-1 bg-amber-100 text-amber-800 font-bold border border-amber-300 rounded">
                  Symptom: {contestReview.error_type}
                </div>
              </div>

              <div className="w-full">
                <CustomMarkdown content={contestReview.analysis} />
              </div>

              {contestReview.associated_patterns && contestReview.associated_patterns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sketch-black/20 flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-sketch-black">Prescribed Pattern Focus:</span>
                  {contestReview.associated_patterns.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-50 border border-blueprint-blue text-blueprint-blue rounded font-bold">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
