"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Code2, Flame, Award, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const getIntensityColor = (count: number) => {
  if (count === 0) return "bg-gray-100";
  if (count === 1) return "bg-blue-300";
  if (count === 2) return "bg-blue-500";
  if (count <= 4) return "bg-blue-700";
  return "bg-blue-900";
};

// Framer Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

export default function ProgressPage() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<"LeetCode" | "Codeforces" | "GitHub">("LeetCode");

  const hasConnections = !!(user?.leetcode || user?.codeforces || user?.github);

  const connectedTabs = (["LeetCode", "Codeforces", "GitHub"] as const).filter((p) => {
    if (p === "LeetCode") return !!user?.leetcode;
    if (p === "Codeforces") return !!user?.codeforces;
    if (p === "GitHub") return !!user?.github;
    return false;
  });

  useEffect(() => {
    if (connectedTabs.length > 0 && !connectedTabs.includes(platform)) {
      setPlatform(connectedTabs[0]);
    }
  }, [user]);

  // Extract platform-specific dynamic statistics
  const platformKey = platform.toLowerCase();
  const platformStats = user?.stats?.[platformKey as keyof typeof user.stats] as any;

  const currentStreak = platform === "GitHub" ? platformStats?.currentStreak ?? 0 : platformStats?.maxStreak ?? 0;
  const maxStreak = platformStats?.bestRating ? platformStats?.maxStreak ?? currentStreak : currentStreak;

  const heatmap = platformStats?.heatmap || Array.from({ length: 84 }).fill(0);

  // Dynamic Achievements generator based on real stats
  const getAchievements = () => {
    const list: { title: string; desc: string; date: string }[] = [];
    if (!platformStats) {
      return [{ title: "Platform Locked", desc: "Connect profile to start unlocking achievements.", date: "LOCKED" }];
    }

    if (platform === "LeetCode") {
      const solved = platformStats.problemsSolved || 0;
      const streakVal = platformStats.maxStreak || 0;
      const contests = platformStats.contests || 0;

      if (solved > 0) {
        list.push({ title: "First Blood", desc: "Solve your first problem on LeetCode", date: "UNLOCKED" });
      }
      if (streakVal >= 30) {
        list.push({ title: "Consistency", desc: "Maintain a 30+ day streak on LeetCode", date: "UNLOCKED" });
      }
      if (solved >= 100) {
        list.push({ title: "Centurion", desc: "Solve 100+ problems on LeetCode", date: "UNLOCKED" });
      }
      if (solved >= 300) {
        list.push({ title: "Elite Solver", desc: "Solve 300+ problems on LeetCode", date: "UNLOCKED" });
      }
      if (contests > 0) {
        list.push({ title: "Weekend Warrior", desc: "Attend your first LeetCode contest", date: "UNLOCKED" });
      }
    } else if (platform === "Codeforces") {
      const solved = platformStats.problemsSolved || 0;
      const rating = platformStats.currentRating || 0;
      const contests = platformStats.contests || 0;

      if (solved > 0) {
        list.push({ title: "First Contest Solved", desc: "Solve your first problem on Codeforces", date: "UNLOCKED" });
      }
      if (contests > 0) {
        list.push({ title: "CF Contender", desc: "Participate in your first Codeforces contest", date: "UNLOCKED" });
      }
      if (rating >= 1200) {
        list.push({ title: "Pupil Rank", desc: "Reach Pupil rank on Codeforces (1200+)", date: "UNLOCKED" });
      }
      if (rating >= 1400) {
        list.push({ title: "Specialist Rank", desc: "Reach Specialist rank on Codeforces (1400+)", date: "UNLOCKED" });
      }
      if (rating >= 1600) {
        list.push({ title: "Expert Rank", desc: "Reach Expert rank on Codeforces (1600+)", date: "UNLOCKED" });
      }
    } else if (platform === "GitHub") {
      const repos = platformStats.publicRepos || 0;
      const contributions = platformStats.contributions || 0;
      const stars = platformStats.starsReceived || 0;
      const prs = platformStats.pullRequests || 0;

      if (repos > 0) {
        list.push({ title: "First Repo", desc: "Create a public repository on GitHub", date: "UNLOCKED" });
      }
      if (contributions >= 100) {
        list.push({ title: "Active Contributor", desc: "Reach 100+ contributions this year", date: "UNLOCKED" });
      }
      if (prs >= 10) {
        list.push({ title: "PR Champion", desc: "Open 10+ pull requests on GitHub", date: "UNLOCKED" });
      }
      if (stars >= 5) {
        list.push({ title: "Star Catcher", desc: "Receive 5+ stars on your repositories", date: "UNLOCKED" });
      }
    }

    if (list.length === 0) {
      list.push({ title: "Getting Started", desc: "Solve problems or push code to unlock badges!", date: "IN PROGRESS" });
    }
    return list;
  };

  const achievements = getAchievements();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-3xl rough-border-blue transform -rotate-6 shadow-[4px_4px_0px_#171717]">
            <TrendingUp size={28} />
          </div>
          <h1 className="font-sketch text-4xl md:text-5xl text-sketch-black">Progress</h1>
        </div>
      </motion.div>

      {!hasConnections ? (
        <section className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform rotate-6">
            <TrendingUp size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-sketch text-3xl text-sketch-black">No Progress Tracking Available</h2>
            <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
              Connect your competitive programming or GitHub accounts in the profile settings to view your commit heatmaps, set custom goals, and unlock coder achievements.
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
          <div className="flex gap-4 border-b-2 border-dashed border-sketch-black/20 pb-4">
            {connectedTabs.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlatform(p);
                }}
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
                {/* Activity Heatmap */}
                <motion.section variants={itemVariants} className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b-2 border-dashed border-sketch-black/10 pb-4">
                    <h3 className="font-mono text-xl font-bold text-sketch-black flex items-center gap-2">
                      <Calendar size={20} className="text-blueprint-blue" />
                      {platform === "GitHub" ? "Commit Contributions Grid" : "Activity Grid"}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-paper rough-border font-mono text-sm shadow-[2px_2px_0px_#171717]">
                        <span className="font-bold text-blueprint-blue">{currentStreak}</span> Current Streak
                      </div>
                      <div className="px-4 py-2 bg-paper rough-border font-mono text-sm shadow-[2px_2px_0px_#171717]">
                        <span className="font-bold text-blueprint-blue">{maxStreak}</span> Max Streak
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-6">
                    <div className="inline-grid grid-rows-7 grid-flow-col gap-[4px] md:gap-2">
                      {heatmap.map((intensity: number, i: number) => (
                        <div key={i} className="relative group">
                          <div
                            className={`w-4 h-4 md:w-5 md:h-5 rounded-sm ${getIntensityColor(
                              intensity
                            )} hover:ring-2 hover:ring-sketch-black transition-all cursor-pointer shadow-sm`}
                          />
                          {/* Custom Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-sketch-black text-white text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                            {intensity} {platform === "GitHub" ? (intensity === 1 ? "contribution" : "contributions") : (intensity === 1 ? "submission" : "submissions")}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-sketch-black"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 font-mono text-xs text-sketch-black/60 pt-4 border-t-2 border-dashed border-sketch-black/10">
                    <span>Less</span>
                    <div className="w-3 h-3 rounded-sm bg-gray-100 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-sm bg-blue-300 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-sm bg-blue-500 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-sm bg-blue-700 shadow-sm"></div>
                    <div className="w-3 h-3 rounded-sm bg-blue-900 shadow-sm"></div>
                    <span>More</span>
                  </div>
                </motion.section>

                <div className="w-full">
                  {/* Achievements / Badges */}
                  <motion.section variants={itemVariants} className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] h-full">
                    <h3 className="font-mono text-xl font-bold text-sketch-black mb-8 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center gap-2">
                      <Award size={20} className="text-blueprint-blue" />
                      Unlocked Achievements ({platform})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {achievements.map((badge, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.03, y: -4 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="flex items-start gap-4 p-4 bg-paper rough-border group cursor-default hover:bg-sketch-black hover:text-white transition-colors duration-300 shadow-[2px_2px_0px_#171717] hover:shadow-[4px_4px_0px_#1E3A8A]"
                        >
                          <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center rough-border-blue text-blueprint-blue group-hover:text-sketch-black group-hover:bg-white group-hover:border-white transition-all duration-300">
                            <Award size={24} className="group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <h4 className="font-mono font-bold text-sm mb-1">{badge.title}</h4>
                            <p className="font-mono text-xs opacity-70 mb-2 leading-relaxed">{badge.desc}</p>
                            <p className="font-mono text-[10px] font-bold text-blueprint-blue group-hover:text-blue-300 uppercase tracking-wider">
                              {badge.date}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
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
