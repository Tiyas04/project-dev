"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Zap, 
  Brain, 
  ExternalLink, 
  Star, 
  GitFork, 
  Code2, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Award,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const pulseAnimation: any = {
  scale: [1, 1.05, 1],
  opacity: [0.6, 1, 0.6],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const getDifficultyColor = (diff?: string) => {
  if (!diff) return "bg-gray-100 text-gray-700 border-gray-300";
  const d = diff.toLowerCase();
  if (d === "easy") return "bg-green-100 text-green-700 border-green-300";
  if (d === "medium") return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-red-100 text-red-700 border-red-300";
};

export default function AnalysisPage() {
  const { user, checkAuth } = useAuth();
  const [platform, setPlatform] = useState<"LeetCode" | "Codeforces" | "GitHub">("LeetCode");

  const hasConnections = !!(user?.leetcode || user?.codeforces || user?.github);

  const connectedTabs = (["LeetCode", "Codeforces", "GitHub"] as const).filter((p) => {
    if (p === "LeetCode") return !!user?.leetcode;
    if (p === "Codeforces") return !!user?.codeforces;
    if (p === "GitHub") return !!user?.github;
    return false;
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (connectedTabs.length > 0 && !connectedTabs.includes(platform)) {
      setPlatform(connectedTabs[0]);
    }
  }, [user]);

  const platformKey = platform.toLowerCase();
  const platformStats = user?.stats?.[platformKey as keyof typeof user.stats] as any;

  const recentSolved = platformStats?.recentSolvedQuestions || [];
  const topicData = platformStats?.topicData || [];

  // Format date helper
  const formatDate = (val: string | number) => {
    if (!val) return "";
    let d: Date;
    if (typeof val === "number") {
      // Handle Unix timestamps
      d = new Date(val * 1000);
    } else {
      d = new Date(val);
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-3xl rough-border-blue transform -rotate-6 shadow-[4px_4px_0px_#171717]">
            <Brain size={28} />
          </div>
          <h1 className="font-sketch text-4xl md:text-5xl text-sketch-black">Code Analysis</h1>
        </div>
      </motion.div>

      {!hasConnections ? (
        <section className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform rotate-6">
            <Brain size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-sketch text-3xl text-sketch-black">No Profiles Connected</h2>
            <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
              Connect your LeetCode, Codeforces, or GitHub profiles to get in-depth topic analyses, repository scans, and future AI review recommendations.
            </p>
          </div>
          <Link
            href="/profile"
            className="px-8 py-4 bg-blueprint-blue text-white font-bold font-mono text-lg rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]"
          >
            Connect Profiles
          </Link>
        </section>
      ) : (
        <>
          {/* Platform Tabs */}
          <div className="flex gap-4 border-b-2 border-dashed border-sketch-black/20 pb-4">
            {connectedTabs.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex items-center gap-2 px-6 py-3 font-mono font-bold transition-all duration-300 cursor-pointer ${
                  platform === p
                    ? "bg-blueprint-blue text-white rough-border shadow-[4px_4px_0px_#171717] -translate-y-1"
                    : "bg-paper text-sketch-black rough-border hover:bg-gray-100"
                }`}
              >
                <Code2 size={18} />
                {p}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {connectedTabs.includes(platform) && platformStats && (
              <motion.div
                key={platform}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                className="space-y-8"
              >
                {/* Gemini AI Coder Review Placeholder Card */}
                <motion.section 
                  variants={itemVariants} 
                  className="relative overflow-hidden bg-linear-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-6 md:p-8 border-4 border-double border-blue-400/80 shadow-[6px_6px_0px_#171717]"
                >
                  {/* Decorative Glowing Elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-500/20 text-blue-300 flex items-center justify-center rounded-xl border border-blue-400/40 relative">
                        <Sparkles size={32} className="animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-sketch text-2xl text-blue-200 uppercase tracking-wide">Gemini AI Coder Review</h3>
                          <span className="px-2 py-[2px] bg-blue-500/30 text-blue-300 text-[10px] uppercase font-bold font-mono border border-blue-500/40 rounded">
                            AI Engine
                          </span>
                        </div>
                        <p className="font-mono text-xs text-slate-300 max-w-2xl leading-relaxed">
                          {platform === "GitHub" 
                            ? "Gemini will scan your public repositories to review architecture, code quality, dependency health, and test coverage, generating detailed code-style suggestions."
                            : "Gemini will analyze your dynamic topic strengths, submission times, and problem error patterns to map out personalized problem recommendations and efficiency insights."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-1 font-mono">
                      <div className="flex items-center gap-2">
                        <motion.div 
                          animate={pulseAnimation}
                          className="w-3.5 h-3.5 bg-blue-400 rounded-full shrink-0 shadow-[0_0_10px_#60a5fa]" 
                        />
                        <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Coming Soon</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Next Major Platform Update</span>
                    </div>
                  </div>
                </motion.section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Topic / Skill Strengths Analysis */}
                  <motion.section 
                    variants={itemVariants} 
                    className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] lg:col-span-5 flex flex-col"
                  >
                    <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center gap-2">
                      <TrendingUp size={20} className="text-blueprint-blue" />
                      {platform === "GitHub" ? "Repository Skill Strengths" : `Topic Analysis (${platform})`}
                    </h3>

                    <div className="flex-1 space-y-6">
                      {topicData.map((item: any) => (
                        <div key={item.subject} className="space-y-2 font-mono">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-sketch-black">{item.subject}</span>
                            <span className="font-bold text-blueprint-blue">{item.A}%</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full h-4 bg-gray-100 rough-border overflow-hidden">
                            <div 
                              className="h-full bg-blueprint-blue border-r border-sketch-black" 
                              style={{ width: `${item.A}%` }} 
                            />
                          </div>

                          {/* Difficulty breakdown badges (LeetCode/Codeforces only) */}
                          {platform !== "GitHub" && (
                            <div className="flex gap-3 text-[10px] pt-1">
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 font-bold rounded">
                                Easy: {item.easySolved ?? 0}
                              </span>
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-700 font-bold rounded">
                                Med: {item.mediumSolved ?? 0}
                              </span>
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 font-bold rounded">
                                Hard: {item.hardSolved ?? 0}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.section>

                  {/* Solved Problems / GitHub Repositories List */}
                  <motion.section 
                    variants={itemVariants} 
                    className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] lg:col-span-7 flex flex-col"
                  >
                    <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center gap-2">
                      {platform === "GitHub" ? (
                        <>
                          <BookOpen size={20} className="text-blueprint-blue" />
                          <span>Recently Updated Repositories</span>
                        </>
                      ) : (
                        <>
                          <Award size={20} className="text-blueprint-blue" />
                          <span>Recently Solved Problems</span>
                        </>
                      )}
                    </h3>

                    {recentSolved.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded">
                        <Clock size={36} className="text-gray-300 mb-2 animate-pulse" />
                        <p className="font-mono text-sm text-sketch-black/40">No recent records found</p>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-4">
                        {platform === "GitHub" ? (
                          // Render GitHub Repositories list
                          recentSolved.map((repo: any) => (
                            <div 
                              key={repo.title} 
                              className="p-4 bg-paper rough-border shadow-[2px_2px_0px_#171717] hover:shadow-[4px_4px_0px_#1E3A8A] transition-all flex flex-col gap-2 font-mono group"
                            >
                              <div className="flex items-center justify-between">
                                <a 
                                  href={repo.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="font-bold text-sketch-black group-hover:text-blueprint-blue flex items-center gap-1.5 hover:underline cursor-pointer"
                                >
                                  {repo.title}
                                  <ExternalLink size={14} className="opacity-60" />
                                </a>
                                <span className="text-[10px] text-sketch-black/60 flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatDate(repo.updatedAt)}
                                </span>
                              </div>
                              
                              <p className="text-xs text-sketch-black/60 leading-relaxed line-clamp-2">
                                {repo.description}
                              </p>

                              <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-sketch-black/10 mt-1">
                                <div className="flex items-center gap-3">
                                  <span className="px-2 py-0.5 bg-blueprint-blue/10 text-blueprint-blue border border-blueprint-blue/20 rounded font-bold">
                                    {repo.language}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sketch-black/70">
                                  <span className="flex items-center gap-1">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    {repo.stars}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <GitFork size={12} className="text-slate-500" />
                                    {repo.forks}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Render LeetCode / Codeforces Solved Problems list
                          recentSolved.map((question: any, idx: number) => {
                            const isCF = platform === "Codeforces";
                            const linkUrl = isCF 
                              ? `https://codeforces.com/contest/${question.contestId}/problem/${question.problemIndex}`
                              : `https://leetcode.com/problems/${question.titleSlug}`;
                            return (
                              <div 
                                key={idx} 
                                className="p-4 bg-paper rough-border shadow-[2px_2px_0px_#171717] hover:shadow-[4px_4px_0px_#1E3A8A] transition-all flex items-center justify-between gap-4 font-mono group"
                              >
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <a 
                                      href={linkUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="font-bold text-sketch-black group-hover:text-blueprint-blue flex items-center gap-1.5 hover:underline truncate cursor-pointer"
                                    >
                                      {isCF ? `CF ${question.contestId}${question.problemIndex}: ${question.title}` : question.title}
                                      <ExternalLink size={14} className="opacity-60" />
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px]">
                                    <span className="px-2 py-0.5 bg-blueprint-blue/10 text-blueprint-blue border border-blueprint-blue/20 rounded font-bold">
                                      {question.lang}
                                    </span>
                                    {question.difficulty && (
                                      <span className={`px-2 py-0.5 border rounded font-bold uppercase ${getDifficultyColor(question.difficulty)}`}>
                                        {question.difficulty}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] text-sketch-black/60 flex items-center gap-1 justify-end">
                                    <Clock size={10} />
                                    {formatDate(question.timestamp)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </motion.section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
