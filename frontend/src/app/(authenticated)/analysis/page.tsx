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

const LEETCODE_TOTAL_PROBLEMS: { [key: string]: number } = {
  "array": 1650,
  "arrays": 1650,
  "string": 750,
  "strings": 750,
  "hash-table": 580,
  "hash table": 580,
  "math": 520,
  "dynamic-programming": 500,
  "dynamic programming": 500,
  "dp": 500,
  "sorting": 380,
  "greedy": 380,
  "depth-first-search": 420,
  "depth first search": 420,
  "dfs": 420,
  "breadth-first-search": 320,
  "breadth first search": 320,
  "bfs": 320,
  "tree": 280,
  "trees": 280,
  "binary-tree": 200,
  "binary tree": 200,
  "binary-search": 280,
  "binary search": 280,
  "two-pointers": 220,
  "two pointers": 220,
  "matrix": 210,
  "matrices": 210,
  "stack": 180,
  "design": 160,
  "graph": 180,
  "graphs": 180,
  "backtracking": 110,
  "linked-list": 90,
  "linked list": 90,
  "bit-manipulation": 170,
  "bit manipulation": 170,
  "recursion": 80,
  "sliding-window": 110,
  "sliding window": 110,
  "queue": 80,
  "heap": 110,
  "heap (priority queue)": 110,
  "priority queue": 110,
  "binary-search-tree": 60,
  "binary search tree": 60,
  "bst": 60,
  "union-find": 90,
  "union find": 90,
  "trie": 50,
  "segment-tree": 55,
  "segment tree": 55,
  "simulation": 140,
  "divide-and-conquer": 60,
  "divide and conquer": 60,
  "topological-sort": 40,
  "topological sort": 40,
  "prefix-sum": 100,
  "prefix sum": 100,
  "monotonic-stack": 45,
  "monotonic stack": 45,
  "monotonic-queue": 25,
  "monotonic queue": 25,
  "geometry": 40,
  "randomized": 30,
  "combinatorics": 30,
  "game-theory": 25,
  "game theory": 25,
};

const CODEFORCES_TOTAL_PROBLEMS: { [key: string]: number } = {
  "implementation": 3200,
  "math": 3000,
  "greedy": 2800,
  "dp": 2200,
  "dynamic-programming": 2200,
  "dynamic programming": 2200,
  "data structures": 1600,
  "data-structures": 1600,
  "sortings": 1200,
  "sorting": 1200,
  "graphs": 1200,
  "graph": 1200,
  "constructive algorithms": 1800,
  "constructive-algorithms": 1800,
  "brute force": 1500,
  "brute-force": 1500,
  "binary search": 1100,
  "binary-search": 1100,
  "dfs and similar": 1000,
  "dfs-and-similar": 1000,
  "dfs": 1000,
  "trees": 800,
  "tree": 800,
  "strings": 700,
  "string": 700,
  "two pointers": 700,
  "two-pointers": 700,
  "number theory": 600,
  "number-theory": 600,
  "geometry": 500,
  "combinatorics": 550,
  "probabilities": 300,
  "probability": 300,
  "bitmasks": 600,
  "shortest paths": 400,
  "shortest-paths": 400,
  "divide and conquer": 400,
  "divide-and-conquer": 400,
  "matrices": 200,
  "matrix": 200,
  "games": 250,
  "game": 250,
  "hashing": 300,
  "hash": 300,
  "interactive": 300,
  "flows": 200,
  "string suffix structures": 150,
  "fft": 100,
  "graph matchings": 150,
  "ternary search": 100,
  "expression parsing": 100,
  "meet-in-the-middle": 100,
  "2-sat": 60,
  "chinese remainder theorem": 50,
  "schedules": 50,
};

const normalizeKey = (key: string) => {
  return key.toLowerCase().replace(/[^a-z0-9]/g, " ").trim().replace(/\s+/g, " ");
};

const getPlatformTotal = (platform: "LeetCode" | "Codeforces", topicName: string): number => {
  const norm = normalizeKey(topicName);
  const map = platform === "LeetCode" ? LEETCODE_TOTAL_PROBLEMS : CODEFORCES_TOTAL_PROBLEMS;
  
  if (map[norm]) return map[norm];
  
  if (norm.endsWith("s")) {
    const singular = norm.slice(0, -1);
    if (map[singular]) return map[singular];
  } else {
    const plural = norm + "s";
    if (map[plural]) return map[plural];
  }
  
  return platform === "LeetCode" ? 300 : 800;
};

const getDifficultyColor = (diff?: string) => {
  if (!diff) return "bg-gray-100 text-gray-700 border-gray-300";
  const d = diff.toLowerCase();
  if (d === "easy") return "bg-green-100 text-green-700 border-green-300";
  if (d === "medium") return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-red-100 text-red-700 border-red-300";
};

const getStrengthCategory = (score: number) => {
  if (score <= 20) {
    return {
      label: "Unexplored",
      textClass: "text-slate-600 bg-slate-50 border-slate-200",
      dotClass: "bg-slate-400",
      textClr: "text-slate-500",
      barGrad: "from-slate-700 to-slate-400"
    };
  }
  if (score <= 40) {
    return {
      label: "Needs Practice",
      textClass: "text-red-600 bg-red-50 border-red-200",
      dotClass: "bg-red-500",
      textClr: "text-red-600",
      barGrad: "from-red-800 to-red-500"
    };
  }
  if (score <= 60) {
    return {
      label: "Improving",
      textClass: "text-orange-600 bg-orange-50 border-orange-200",
      dotClass: "bg-orange-500",
      textClr: "text-orange-500",
      barGrad: "from-orange-700 to-orange-500"
    };
  }
  if (score <= 80) {
    return {
      label: "Strong",
      textClass: "text-blue-600 bg-blue-50 border-blue-200",
      dotClass: "bg-blue-500",
      textClr: "text-blue-600",
      barGrad: "from-blue-800 to-blue-500"
    };
  }
  return {
    label: "Mastered",
    textClass: "text-green-600 bg-green-50 border-green-200",
    dotClass: "bg-green-500",
    textClr: "text-green-600",
    barGrad: "from-green-800 to-green-500"
  };
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

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [analysisPage, setAnalysisPage] = useState(1);
  const [topicPage, setTopicPage] = useState(1);
  const [topicSearch, setTopicSearch] = useState("");
  const [strengthFilter, setStrengthFilter] = useState("ALL");

  const recentSolved = platformStats?.recentSolvedQuestions || [];
  const allQuestions = platformStats?.accumulatedSolvedQuestions || [];

  useEffect(() => {
    setSelectedTopic(null);
    setAnalysisPage(1);
    setTopicPage(1);
    setTopicSearch("");
    setStrengthFilter("ALL");
  }, [platform]);

  useEffect(() => {
    setAnalysisPage(1);
  }, [selectedTopic]);

  // Extract topics dynamically from solved questions / repositories
  const dynamicTopicData = React.useMemo(() => {
    if (platform === "GitHub") {
      const langs = platformStats?.difficultySolved || [];
      const formatted = langs.map((lang: any) => {
        const repoCount = lang.value || 0;
        const targetRepos = 5;
        const strength = Math.min(100, Math.round((repoCount / targetRepos) * 100));
        return {
          subject: lang.name,
          A: strength,
          fullMark: 100,
          total: repoCount,
          color: lang.color,
        };
      });
      return [...formatted].sort((a, b) => b.total - a.total);
    }

    const topicsMap: { [key: string]: { subject: string; easySolved: number; mediumSolved: number; hardSolved: number; total: number } } = {};

    allQuestions.forEach((q: any) => {
      const diff = (q.difficulty || "medium").toLowerCase();
      const tags = q.topicTags || [];

      tags.forEach((tag: any) => {
        const name = tag.name
          .split(" ")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        if (!topicsMap[name]) {
          topicsMap[name] = {
            subject: name,
            easySolved: 0,
            mediumSolved: 0,
            hardSolved: 0,
            total: 0
          };
        }

        if (diff === "easy") {
          topicsMap[name].easySolved++;
        } else if (diff === "medium") {
          topicsMap[name].mediumSolved++;
        } else if (diff === "hard") {
          topicsMap[name].hardSolved++;
        }
        topicsMap[name].total++;
      });
    });

    const list = Object.values(topicsMap);

    const formattedList = list.map(t => {
      const totalOnPlatform = getPlatformTotal(platform as "LeetCode" | "Codeforces", t.subject);
      const targetSolved = Math.max(10, Math.min(50, Math.round(totalOnPlatform * 0.05)));
      const relativeStrength = Math.min(100, Math.round((t.total / targetSolved) * 100));
      return {
        subject: t.subject,
        A: relativeStrength,
        fullMark: 100,
        easySolved: t.easySolved,
        mediumSolved: t.mediumSolved,
        hardSolved: t.hardSolved,
        total: t.total,
        totalOnPlatform
      };
    });

    formattedList.sort((a, b) => b.total - a.total);
    return formattedList;
  }, [allQuestions, platform, platformStats]);

  const filteredQuestions = React.useMemo(() => {
    if (platform === "GitHub") {
      if (!selectedTopic) return recentSolved;
      return recentSolved.filter((repo: any) => {
        return (repo.language || "").toLowerCase() === selectedTopic.toLowerCase();
      });
    }
    if (!selectedTopic) {
      return allQuestions;
    }
    return allQuestions.filter((q: any) =>
      q.topicTags?.some((tag: any) => {
        const name = tag.name
          .split(" ")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        return name === selectedTopic;
      })
    );
  }, [allQuestions, selectedTopic, platform, recentSolved]);

  const analysisItemsPerPage = 10;
  const totalAnalysisPages = Math.ceil(filteredQuestions.length / analysisItemsPerPage);
  const analysisStartIndex = (analysisPage - 1) * analysisItemsPerPage;
  const paginatedFilteredQuestions = filteredQuestions.slice(analysisStartIndex, analysisStartIndex + analysisItemsPerPage);

  // Filter dynamicTopicData based on topicSearch and strengthFilter
  const filteredTopicData = React.useMemo(() => {
    return dynamicTopicData.filter((item: any) => {
      const matchesSearch = item.subject.toLowerCase().includes(topicSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (strengthFilter === "ALL") return true;
      const category = getStrengthCategory(item.A);
      return category.label.toUpperCase() === strengthFilter.toUpperCase();
    });
  }, [dynamicTopicData, topicSearch, strengthFilter]);

  const topicsPerPage = 5;
  const totalTopicPages = Math.ceil(filteredTopicData.length / topicsPerPage);
  const topicStartIndex = (topicPage - 1) * topicsPerPage;
  const paginatedTopics = filteredTopicData.slice(topicStartIndex, topicStartIndex + topicsPerPage);

  const rightColumnHeader = platform === "GitHub"
    ? selectedTopic
      ? `Repositories: ${selectedTopic} (${filteredQuestions.length})`
      : "Recently Updated Repositories"
    : selectedTopic
      ? `Solved Problems: ${selectedTopic} (${filteredQuestions.length})`
      : `All Solved Problems (${allQuestions.length})`;

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
          <div className="flex gap-2 sm:gap-4 border-b-2 border-dashed border-sketch-black/20 pb-4 overflow-x-auto select-none no-scrollbar">
            {connectedTabs.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex items-center gap-1.5 px-3 py-2 sm:px-6 sm:py-3 font-mono font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer shrink-0 ${
                  platform === p
                    ? "bg-blueprint-blue text-white rough-border shadow-[2px_2px_0px_#171717] -translate-y-0.5 sm:-translate-y-1 sm:shadow-[4px_4px_0px_#171717]"
                    : "bg-paper text-sketch-black rough-border hover:bg-gray-100"
                }`}
              >
                <Code2 size={14} className="sm:w-[18px] sm:h-[18px]" />
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
                      {platform === "GitHub" ? "Language Strengths" : `Topic Analysis (${platform})`}
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-2 mb-6 font-mono">
                      <input
                        type="text"
                        placeholder={platform === "GitHub" ? "Search language..." : "Search topic..."}
                        value={topicSearch}
                        onChange={(e) => {
                          setTopicSearch(e.target.value);
                          setTopicPage(1);
                        }}
                        className="flex-1 px-3 py-1 text-xs border-2 border-sketch-black bg-white focus:outline-none"
                      />
                      <select
                        value={strengthFilter}
                        onChange={(e) => {
                          setStrengthFilter(e.target.value);
                          setTopicPage(1);
                        }}
                        className="px-3 py-1 text-xs border-2 border-sketch-black bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">All Strengths</option>
                        <option value="UNEXPLORED">Unexplored (0-20)</option>
                        <option value="NEEDS PRACTICE">Needs Practice (21-40)</option>
                        <option value="IMPROVING">Improving (41-60)</option>
                        <option value="STRONG">Strong (61-80)</option>
                        <option value="MASTERED">Mastered (81-100)</option>
                      </select>
                    </div>

                    <div className="flex-1 space-y-4">
                      {filteredTopicData.length === 0 ? (
                        <div className="text-center py-8 font-mono text-sm text-sketch-black/40">
                          No {platform === "GitHub" ? "languages" : "topics"} found.
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            {paginatedTopics.map((item: any) => {
                              const isSelected = selectedTopic === item.subject;
                              const category = getStrengthCategory(item.A);
                              
                              return (
                                <div 
                                  key={item.subject} 
                                  onClick={() => {
                                    setSelectedTopic(isSelected ? null : item.subject);
                                  }}
                                  className={`p-4 space-y-3 font-mono transition-all border-2 rounded-md cursor-pointer select-none relative overflow-hidden group ${
                                    isSelected
                                      ? "bg-[#eff6ff] border-blueprint-blue shadow-[4px_4px_0px_#1E3A8A] -translate-y-1"
                                      : "bg-white hover:bg-slate-50 border-sketch-black/10 hover:border-sketch-black/40 hover:shadow-[2px_2px_0px_#171717] hover:-translate-y-0.5"
                                  }`}
                                >
                                  {/* Selected corner crosshairs for sketch/draft look */}
                                  {isSelected && (
                                    <>
                                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blueprint-blue"></div>
                                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blueprint-blue"></div>
                                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blueprint-blue"></div>
                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blueprint-blue"></div>
                                    </>
                                  )}

                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-0.5">
                                      <span className="font-bold text-sm md:text-base text-sketch-black tracking-tight group-hover:text-blueprint-blue transition-colors">
                                        {item.subject}
                                      </span>
                                      {platform !== "GitHub" ? (
                                        <div className="text-[10px] text-sketch-black/50 font-semibold flex items-center gap-1.5">
                                          <span>Platform total: {item.totalOnPlatform}</span>
                                          <span>•</span>
                                          <span>Solved: {item.total}</span>
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-sketch-black/50 font-semibold flex items-center gap-1.5">
                                          <span>Repositories: {item.total}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className={`font-sketch text-lg md:text-xl font-bold leading-none ${category.textClr}`}>
                                        {item.A}%
                                      </span>
                                      <div className="text-[9px] text-sketch-black/40 uppercase tracking-widest font-bold">
                                        STRENGTH
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Blueprint progress bar ruler */}
                                  <div className="relative w-full h-4 bg-slate-50 border border-sketch-black/10 rounded-sm overflow-hidden flex items-center">
                                    {/* Rule ticks (representing 10% divisions) */}
                                    <div className="absolute inset-0 flex justify-between pointer-events-none opacity-[0.08]">
                                      {[...Array(11)].map((_, idx) => (
                                        <div key={idx} className="w-[1.5px] h-full bg-sketch-black" />
                                      ))}
                                    </div>
                                    
                                    {/* Dynamic filled bar with category specific gradient */}
                                    <div 
                                      className={`h-full bg-linear-to-r ${category.barGrad} border-r-2 border-sketch-black shadow-[inset_-1px_0px_3px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out`} 
                                      style={{ 
                                        width: `${item.A}%`,
                                        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 4px, rgba(255,255,255,0) 4px, rgba(255,255,255,0) 8px)'
                                      }} 
                                    />
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-1">
                                    {/* Difficulty breakdown badges */}
                                    {platform !== "GitHub" ? (
                                      <div className="flex flex-wrap gap-2 text-[9px] font-bold">
                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-sm">
                                          <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                          Easy: {item.easySolved ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-sm">
                                          <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                          Med: {item.mediumSolved ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm">
                                          <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                                          Hard: {item.hardSolved ?? 0}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || '#737373' }}></span>
                                        <span className="text-[10px] font-mono text-sketch-black/60 font-semibold">{item.subject} Color</span>
                                      </div>
                                    )}

                                    {/* Dynamic Strength Category Badge */}
                                    <span className={`text-[9px] px-1.5 py-0.5 border border-dashed font-bold uppercase rounded-sm flex items-center gap-1 tracking-wider ${category.textClass}`}>
                                      <span className={`w-1 h-1 rounded-full ${category.dotClass}`}></span>
                                      {category.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Dynamic Topic List Pagination */}
                          {totalTopicPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-dashed border-sketch-black/10 font-mono">
                              <span className="text-[10px] text-sketch-black/60">
                                Showing {topicStartIndex + 1} to {Math.min(topicStartIndex + topicsPerPage, filteredTopicData.length)} of {filteredTopicData.length} topics
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setTopicPage(prev => Math.max(prev - 1, 1))}
                                  disabled={topicPage === 1}
                                  className="px-2 py-0.5 text-[10px] font-bold border-2 border-sketch-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[1px_1px_0px_#171717]"
                                >
                                  Prev
                                </button>
                                <span className="text-[10px] font-bold self-center px-1">
                                  {topicPage} of {totalTopicPages}
                                </span>
                                <button
                                  onClick={() => setTopicPage(prev => Math.min(prev + 1, totalTopicPages))}
                                  disabled={topicPage === totalTopicPages}
                                  className="px-2 py-0.5 text-[10px] font-bold border-2 border-sketch-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[1px_1px_0px_#171717]"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.section>

                  {/* Solved Problems / GitHub Repositories List */}
                  <motion.section 
                    variants={itemVariants} 
                    className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] lg:col-span-7 flex flex-col"
                  >
                     <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {platform === "GitHub" ? (
                          <>
                            <BookOpen size={20} className="text-blueprint-blue" />
                            <span>{rightColumnHeader}</span>
                          </>
                        ) : (
                          <>
                            <Award size={20} className="text-blueprint-blue" />
                            <span>{rightColumnHeader}</span>
                          </>
                        )}
                      </div>
                      {selectedTopic && (
                        <button 
                          onClick={() => setSelectedTopic(null)}
                          className="text-xs text-blueprint-blue hover:underline cursor-pointer border border-blueprint-blue/30 px-2 py-0.5 bg-blueprint-blue/5 rounded"
                        >
                          Clear Filter
                        </button>
                      )}
                    </h3>

                    {filteredQuestions.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded">
                        <Clock size={36} className="text-gray-300 mb-2 animate-pulse" />
                        <p className="font-mono text-sm text-sketch-black/40">No records found</p>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-4">
                        {platform === "GitHub" ? (
                          // Render GitHub Repositories list
                          <div className="space-y-4">
                            {paginatedFilteredQuestions.map((repo: any) => (
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
                            ))}
                          </div>
                        ) : (
                          // Render LeetCode / Codeforces Solved Problems list
                          <div className="space-y-4">
                            {paginatedFilteredQuestions.map((question: any, idx: number) => {
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
                                    <div className="flex flex-wrap gap-2 text-[10px] items-center">
                                      <span className="px-2 py-0.5 bg-blueprint-blue/10 text-blueprint-blue border border-blueprint-blue/20 rounded font-bold">
                                        {question.lang}
                                      </span>
                                      {question.difficulty && (
                                        <span className={`px-2 py-0.5 border rounded font-bold uppercase ${getDifficultyColor(question.difficulty)}`}>
                                          {question.difficulty}
                                        </span>
                                      )}
                                      {question.topicTags && question.topicTags.map((tag: any) => (
                                        <span 
                                          key={tag.slug || tag.name} 
                                          className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded font-bold"
                                        >
                                          {tag.name}
                                        </span>
                                      ))}
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
                            })}
                          </div>
                        )}

                        {/* Pagination Controls */}
                        {totalAnalysisPages > 1 && (
                          <div className="flex items-center justify-between pt-4 border-t border-dashed border-sketch-black/10 font-mono">
                            <span className="text-xs text-sketch-black/60">
                              Showing {analysisStartIndex + 1} to {Math.min(analysisStartIndex + analysisItemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} entries
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setAnalysisPage(prev => Math.max(prev - 1, 1))}
                                disabled={analysisPage === 1}
                                className="px-3 py-1 text-xs font-bold border-2 border-sketch-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Prev
                              </button>
                              <span className="text-xs font-bold self-center px-2">
                                Page {analysisPage} of {totalAnalysisPages}
                              </span>
                              <button
                                onClick={() => setAnalysisPage(prev => Math.min(prev + 1, totalAnalysisPages))}
                                disabled={analysisPage === totalAnalysisPages}
                                className="px-3 py-1 text-xs font-bold border-2 border-sketch-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Next
                              </button>
                            </div>
                          </div>
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
