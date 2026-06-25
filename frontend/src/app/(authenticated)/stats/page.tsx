"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart2, Calendar, Target, Zap, Code2, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const getDifficultyColor = (diff?: string) => {
  if (!diff) return "bg-gray-100 text-gray-700 border-gray-300";
  const d = diff.toLowerCase();
  if (d === "easy") return "bg-green-100 text-green-700 border-green-300";
  if (d === "medium") return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-red-100 text-red-700 border-red-300";
};

const getCellBg = (count: number) => {
  if (count === 0) return "bg-slate-50 border-sketch-black/5 hover:bg-slate-100";
  if (count <= 2) return "bg-blueprint-blue/20 hover:bg-blueprint-blue/30 border-blueprint-blue/10";
  if (count <= 4) return "bg-blueprint-blue/50 hover:bg-blueprint-blue/60 border-blueprint-blue/20";
  if (count <= 6) return "bg-blueprint-blue/75 hover:bg-blueprint-blue/85 border-blueprint-blue/30";
  return "bg-blueprint-blue hover:bg-blue-900 border-blueprint-blue/40";
};

const getAlignedHeatmap = (rawHeatmap?: number[]) => {
  const data = rawHeatmap || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 83);
  const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  const paddedStart = Array(startDayOfWeek).fill(null);
  const mappedData = data.map((count, idx) => ({ count, idx }));
  const combined = [...paddedStart, ...mappedData];
  
  const remainder = combined.length % 7;
  if (remainder !== 0) {
    const padEnd = Array(7 - remainder).fill(null);
    return [...combined, ...padEnd];
  }
  return combined;
};

export default function Stats() {
  const { user, checkAuth } = useAuth();
  const [timeRange, setTimeRange] = useState("6M");
  const [platform, setPlatform] = useState<"LeetCode" | "Codeforces" | "GitHub">("LeetCode");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

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

  useEffect(() => {
    setCurrentPage(1);
    setSelectedTagFilter(null);
  }, [platform]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTagFilter]);

  // Extract stats dynamically
  const platformKey = platform.toLowerCase();
  const platformStats = user?.stats?.[platformKey as keyof typeof user.stats] as any;
  const allQuestions = platformStats?.accumulatedSolvedQuestions || [];

  const getHeatmapDayLabel = (index: number, count: number) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - index));
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const activityName = platform === "GitHub" ? "contribution" : "submission";
    return `${count} ${activityName}${count === 1 ? "" : "s"} on ${dateStr}`;
  };

  const getHeatmapRangeText = () => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 83);
    
    const format = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Activity from ${format(startDate)} to ${format(today)}`;
  };

  const currentData = platformStats
    ? {
        totalSolved: platform === "GitHub" ? platformStats.publicRepos || 0 : platformStats.problemsSolved || 0,
        ratingData: platformStats.ratingData || [],
        difficultyData: platformStats.difficultySolved || [],
        heatmap: platformStats.heatmap || [],
        // LeetCode & Codeforces specific metrics
        maxStreak: platformStats.maxStreak || 0,
        contests: platformStats.contests || 0,
        globalRanking: platformStats.globalRanking || "Unrated",
        // GitHub specific metrics
        currentStreak: platformStats.currentStreak || 0,
        contributions: platformStats.contributions || 0,
        starsReceived: platformStats.starsReceived || 0,
        pullRequests: platformStats.pullRequests || 0,
      }
    : null;

  // Filter rating growth chart based on selected time range
  const filteredRatingData = React.useMemo(() => {
    if (!currentData?.ratingData) return [];
    const data = currentData.ratingData;
    if (timeRange === "1M") return data.slice(-1);
    if (timeRange === "3M") return data.slice(-3);
    if (timeRange === "6M") return data.slice(-6);
    // "1Y" and "ALL" show all 6 months (the entire available dataset)
    return data;
  }, [currentData, timeRange]);

  // Get all unique tags from user's solved questions for the select filter dropdown
  const uniqueTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    allQuestions.forEach((q: any) => {
      q.topicTags?.forEach((tag: any) => {
        if (tag.name) {
          tagsSet.add(tag.name);
        }
      });
    });
    return Array.from(tagsSet).sort();
  }, [allQuestions]);

  // Filter questions dynamically by selected tag
  const filteredQuestions = React.useMemo(() => {
    if (!selectedTagFilter) return allQuestions;
    return allQuestions.filter((q: any) =>
      q.topicTags?.some((tag: any) => {
        const slug = (tag.slug || tag.name || "").toLowerCase();
        const filterSlug = selectedTagFilter.toLowerCase();
        return slug === filterSlug || slug.replace(/-/g, " ") === filterSlug;
      })
    );
  }, [allQuestions, selectedTagFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (val: string | number) => {
    if (!val) return "";
    let d: Date;
    if (typeof val === "number") {
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

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rough-border shadow-[2px_2px_0px_#171717] font-mono text-xs">
          <p className="font-bold text-sketch-black">{label}</p>
          <p className="text-blueprint-blue">{`${platform === "GitHub" ? "Contributions" : "Rating"}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-3xl rough-border-blue transform rotate-6">
            <BarChart2 size={28} />
          </div>
          <h1 className="font-sketch text-4xl md:text-5xl text-sketch-black">Analytics</h1>
        </div>

        {/* Time Filter */}
        {hasConnections && (
          <div className="flex bg-paper rough-border p-1">
            {["1M", "3M", "6M", "1Y", "ALL"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1 font-mono text-sm font-bold transition-colors cursor-pointer ${
                  timeRange === range ? "bg-blueprint-blue text-white" : "text-sketch-black hover:bg-gray-100"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {!hasConnections ? (
        <section className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform -rotate-6">
            <BarChart2 size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-sketch text-3xl text-sketch-black">No Analytics Available</h2>
            <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
              Please connect your competitive programming or GitHub accounts in the profile settings to view detailed growth metrics, language breakdowns, and topic strength graphs.
            </p>
          </div>
          <Link
            href="/profile"
            className="px-8 py-4 bg-blueprint-blue text-white font-bold font-mono text-lg rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]"
          >
            Connect Accounts
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

          {/* Main Graph: Rating History */}
          {currentData && (
            <>
              <section className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717]">
                <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-blueprint-blue" />
                  {platform === "GitHub" ? "GitHub Commits Growth" : `${platform} Rating Growth`}
                </h3>
                <div className="h-[300px] md:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredRatingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" stroke="#171717" fontFamily="var(--font-space-mono)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#171717" fontFamily="var(--font-space-mono)" tick={{ fontSize: 12 }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#1E3A8A"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#1E3A8A", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6, fill: "#1E3A8A", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Problem Difficulty / Language Distribution */}
                <section className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] lg:col-span-5 flex flex-col">
                  <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 flex items-center gap-2">
                    <Target size={20} className="text-blueprint-blue" />
                    {platform === "GitHub" ? "Languages Breakdown" : `Problems Solved (${platform})`}
                  </h3>
                  <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8">
                    <div className="h-[200px] w-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={currentData.difficultyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {currentData.difficultyData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-col gap-4 w-full lg:w-auto">
                      <div className="text-center lg:text-left mb-2">
                        <p className="font-mono text-sm text-sketch-black/60">
                          {platform === "GitHub" ? "Total Repos" : "Total Solved"}
                        </p>
                        <p className="font-mono text-3xl font-bold text-sketch-black">{currentData.totalSolved}</p>
                      </div>
                      {currentData.difficultyData.map((item: any) => (
                        <div key={item.name} className="flex items-center justify-between gap-4 font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Submission Activity Heatmap Grid */}
                <section className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] lg:col-span-7 flex flex-col justify-between">
                  <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 flex items-center gap-2">
                    <Calendar size={20} className="text-blueprint-blue" />
                    {platform === "GitHub" ? "Commit & Contribution Activity" : `Submission Activity (${platform})`}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Sidebar Stats Panel */}
                    <div className="w-full sm:w-1/3 grid grid-cols-2 sm:grid-cols-1 gap-3 font-mono">
                      {platform === "GitHub" ? (
                        <>
                          <div className="p-3 bg-paper border border-sketch-black/15 shadow-[2px_2px_0px_#171717] flex flex-col justify-between">
                            <span className="text-[9px] text-sketch-black/50 font-bold uppercase tracking-wider">Current Streak</span>
                            <span className="text-xl font-bold text-blueprint-blue font-sketch mt-1">{currentData.currentStreak} Days</span>
                          </div>
                          <div className="p-3 bg-paper border border-sketch-black/15 shadow-[2px_2px_0px_#171717] flex flex-col justify-between">
                            <span className="text-[9px] text-sketch-black/50 font-bold uppercase tracking-wider">Year Contribs</span>
                            <span className="text-xl font-bold text-sketch-black font-sketch mt-1">{currentData.contributions}</span>
                          </div>
                          <div className="p-3 bg-paper border border-sketch-black/15 shadow-[2px_2px_0px_#171717] flex flex-col justify-between">
                            <span className="text-[9px] text-sketch-black/50 font-bold uppercase tracking-wider">Stars Received</span>
                            <span className="text-xl font-bold text-amber-600 font-sketch mt-1">{currentData.starsReceived} ⭐</span>
                          </div>
                          <div className="p-3 bg-paper border border-sketch-black/15 shadow-[2px_2px_0px_#171717] flex flex-col justify-between">
                            <span className="text-[9px] text-sketch-black/50 font-bold uppercase tracking-wider">Pull Requests</span>
                            <span className="text-xl font-bold text-indigo-600 font-sketch mt-1">{currentData.pullRequests} PRs</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-paper border border-sketch-black/15 shadow-[2px_2px_0px_#171717] flex flex-col justify-between">
                            <span className="text-[9px] text-sketch-black/50 font-bold uppercase tracking-wider">Max Streak</span>
                            <span className="text-xl font-bold text-blueprint-blue font-sketch mt-1">{currentData.maxStreak} Days</span>
                          </div>
                          <div className="p-3 bg-paper border border-sketch-black/15 shadow-[2px_2px_0px_#171717] flex flex-col justify-between">
                            <span className="text-[9px] text-sketch-black/50 font-bold uppercase tracking-wider">Contests</span>
                            <span className="text-xl font-bold text-sketch-black font-sketch mt-1">{currentData.contests}</span>
                          </div>
                          <div className="p-3 bg-paper border border-sketch-black/15 shadow-[2px_2px_0px_#171717] col-span-2 sm:col-span-1 flex flex-col justify-between">
                            <span className="text-[9px] text-sketch-black/50 font-bold uppercase tracking-wider">Global Ranking</span>
                            <span className="text-sm font-bold text-sketch-black font-sketch mt-1 truncate">{currentData.globalRanking}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Heatmap Grid Panel */}
                    <div className="w-full sm:w-2/3 flex flex-col justify-center">
                      <div className="flex items-start gap-1 overflow-x-auto pb-1 select-none">
                        {/* Weekday Row Labels */}
                        <div className="grid grid-rows-7 gap-1 text-[8px] font-mono text-sketch-black/40 justify-items-end pr-1 pt-[2px] select-none leading-3">
                          <div></div>
                          <div>Mon</div>
                          <div></div>
                          <div>Wed</div>
                          <div></div>
                          <div>Fri</div>
                          <div></div>
                        </div>

                        {/* Grid Container */}
                        <div className="grid grid-rows-7 grid-flow-col gap-1">
                          {getAlignedHeatmap(currentData.heatmap).map((item, index) => {
                            if (item === null) {
                              return (
                                <div 
                                  key={`empty-${index}`} 
                                  className="w-3 h-3 bg-transparent border border-dashed border-sketch-black/5 rounded-xs"
                                />
                              );
                            }
                            const { count, idx } = item;
                            return (
                              <div key={`cell-${idx}`} className="relative group">
                                <div className={`w-3 h-3 rounded-xs border border-sketch-black/10 transition-colors ${getCellBg(count)}`} />
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                                  <div className="bg-slate-900 text-white text-[9px] font-mono py-0.5 px-2 rounded-xs shadow-md whitespace-nowrap leading-none">
                                    {getHeatmapDayLabel(idx, count)}
                                  </div>
                                  <div className="w-1 h-1 bg-slate-900 rotate-45 -mt-0.5"></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend and range */}
                      <div className="flex flex-col xl:flex-row items-center justify-between gap-2 mt-3 font-mono text-[9px] text-sketch-black/50">
                        <span className="text-center xl:text-left">{getHeatmapRangeText()}</span>
                        <div className="flex items-center gap-1">
                          <span>Less</span>
                          <div className="w-2.5 h-2.5 rounded-xs bg-slate-50 border border-sketch-black/10" />
                          <div className="w-2.5 h-2.5 rounded-xs bg-blueprint-blue/20" />
                          <div className="w-2.5 h-2.5 rounded-xs bg-blueprint-blue/50" />
                          <div className="w-2.5 h-2.5 rounded-xs bg-blueprint-blue/75" />
                          <div className="w-2.5 h-2.5 rounded-xs bg-blueprint-blue" />
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {platform !== "GitHub" && (
                <section className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] w-full">
                  <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dashed border-sketch-black/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Code2 size={20} className="text-blueprint-blue" />
                      <span>Solved Problems ({platform})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sketch-black/60">Filter Tag:</span>
                      <select
                        value={selectedTagFilter || ""}
                        onChange={(e) => setSelectedTagFilter(e.target.value || null)}
                        className="px-3 py-1 font-mono text-xs border-2 border-sketch-black bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="">All Tags</option>
                        {uniqueTags.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                      {selectedTagFilter && (
                        <button
                          onClick={() => setSelectedTagFilter(null)}
                          className="px-2 py-1 font-mono text-[10px] font-bold border border-red-500 bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </h3>
                  
                  {allQuestions.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-gray-200 rounded text-center font-mono text-sm text-sketch-black/40">
                      No solved problems found.
                    </div>
                  ) : (
                    <div className="space-y-4 font-mono">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b-2 border-sketch-black text-sm">
                              <th className="py-3 px-4 font-bold text-sketch-black">Problem</th>
                              <th className="py-3 px-4 font-bold text-sketch-black">Language</th>
                              <th className="py-3 px-4 font-bold text-sketch-black">Difficulty</th>
                              <th className="py-3 px-4 font-bold text-sketch-black">Date Solved</th>
                              <th className="py-3 px-4 font-bold text-sketch-black">Topics</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedQuestions.map((q: any, idx: number) => {
                              const isCF = platform === "Codeforces";
                              const linkUrl = isCF 
                                ? `https://codeforces.com/contest/${q.contestId}/problem/${q.problemIndex}`
                                : `https://leetcode.com/problems/${q.titleSlug}`;
                              return (
                                <tr key={idx} className="border-b border-sketch-black/10 hover:bg-gray-50 text-xs">
                                  <td className="py-3 px-4">
                                    <a 
                                      href={linkUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="font-bold text-sketch-black hover:text-blueprint-blue flex items-center gap-1.5 hover:underline"
                                    >
                                      {isCF ? `CF ${q.contestId}${q.problemIndex}: ${q.title}` : q.title}
                                      <ExternalLink size={12} className="opacity-60" />
                                    </a>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-0.5 bg-blueprint-blue/10 text-blueprint-blue border border-blueprint-blue/20 rounded font-bold">
                                      {q.lang}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2 py-0.5 border rounded font-bold uppercase ${getDifficultyColor(q.difficulty)}`}>
                                      {q.difficulty}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-sketch-black/60">
                                    {formatDate(q.timestamp)}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                                      {q.topicTags && q.topicTags.map((tag: any) => (
                                        <span 
                                          key={tag.slug || tag.name} 
                                          onClick={() => setSelectedTagFilter(selectedTagFilter === tag.name ? null : tag.name)}
                                          className={`px-1.5 py-0.5 border rounded text-[9px] font-bold cursor-pointer transition-colors ${
                                            selectedTagFilter === tag.name 
                                              ? "bg-blueprint-blue text-white border-blueprint-blue"
                                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                          }`}
                                        >
                                          {tag.name}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-sketch-black/10">
                          <span className="text-xs text-sketch-black/60">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} entries
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className={`px-3 py-1 text-xs font-bold border-2 border-sketch-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              Prev
                            </button>
                            <span className="text-xs font-bold self-center px-2">
                              Page {currentPage} of {totalPages}
                            </span>
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className={`px-3 py-1 text-xs font-bold border-2 border-sketch-black bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
