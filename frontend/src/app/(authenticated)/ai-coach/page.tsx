"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Bot, User, Trash2, Loader2, Code2 } from "lucide-react";
import { CustomMarkdown } from "@/components/custom-markdown";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export default function AiCoachPage() {
  const { user, checkAuth } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasConnections = !!(user?.leetcode || user?.codeforces || user?.github);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (hasConnections) {
      fetchChatHistory();
    } else {
      setLoading(false);
    }
  }, [hasConnections]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const modelMessage = res.data.data.message;
      setMessages((prev) => [...prev, { role: "model", content: modelMessage }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Sorry, I encountered an error. Please try again." },
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
      // Refetch to get the welcome message again
      fetchChatHistory();
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };

  if (!hasConnections && !loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 overflow-hidden">
        <div className="flex items-center gap-3">
          <Brain size={32} className="text-blueprint-blue" />
          <h1 className="font-sketch text-4xl text-sketch-black">AI Coach</h1>
        </div>
        <section className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform rotate-6">
            <Brain size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-sketch text-3xl text-sketch-black">No Profiles Connected</h2>
            <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
              Connect your LeetCode, Codeforces, or GitHub profiles so your AI Coach can analyze your stats and generate a personalized learning roadmap.
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
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-sketch text-4xl text-sketch-black flex items-center gap-3">
            <Brain size={32} className="text-blueprint-blue" />
            AI Coach
          </h1>
          <p className="font-mono text-sketch-black/60 mt-1">
            Your personalized competitive programming mentor.
          </p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center font-mono">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-sketch-black/60">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-2.5 py-1.5 bg-white border-2 border-sketch-black rounded-lg font-bold text-sketch-black cursor-pointer shadow-[2px_2px_0px_#171717] focus:outline-none focus:border-blueprint-blue"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Rec.)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Ultra)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            </select>
          </div>
          <button
            onClick={handleClearChat}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold text-red-600 bg-red-50 border-2 border-red-200 rough-border hover:-translate-y-0.5 transition-transform shadow-[2px_2px_0px_#fca5a5] cursor-pointer"
          >
            <Trash2 size={14} />
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white border-2 border-sketch-black shadow-[6px_6px_0px_#171717] flex flex-col overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-sketch-black/50 gap-4 bg-paper">
            <Loader2 size={40} className="animate-spin text-blueprint-blue" />
            <p className="font-mono font-bold animate-pulse">Initializing your AI Coach...</p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-paper custom-scrollbar">
              {messages.length === 0 && !loading && (
                <div className="text-center py-10 font-mono text-sketch-black/50">
                  No messages yet.
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
                    className={`max-w-[85%] sm:max-w-[75%] p-4 border-2 border-sketch-black font-mono text-sm leading-relaxed shadow-[4px_4px_0px_#171717] ${
                      msg.role === "user"
                        ? "bg-[#eff6ff] rounded-2xl rounded-tr-none"
                        : "bg-white rounded-2xl rounded-tl-none prose prose-sm max-w-none prose-headings:font-sketch prose-headings:text-blueprint-blue prose-a:text-blueprint-blue prose-strong:text-sketch-black"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <CustomMarkdown content={msg.content} />
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
                    placeholder="Ask for coding advice, topic explanations, or problem recommendations..."
                    className="w-full p-3 bg-transparent font-mono text-sm resize-none focus:outline-none min-h-[50px] max-h-[150px] custom-scrollbar"
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
    </div>
  );
}
