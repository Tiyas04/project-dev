"use client";

import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Code2, Medal, Target, Activity, Flame, RefreshCw, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ActivityFeed } from "@/components/activity-feed";

export default function Dashboard() {
  const { user, syncUserStats } = useAuth();
  const [platform, setPlatform] = useState<"LeetCode" | "Codeforces" | "GitHub">("LeetCode");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");

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

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError("");
    try {
      await syncUserStats();
    } catch (err: any) {
      console.error(err);
      setSyncError("Sync failed. Try again.");
      setTimeout(() => setSyncError(""), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const getPlatformStats = () => {
    if (platform === "LeetCode") {
      const lc = user?.stats?.leetcode;
      return [
        { label: "Max Streak", value: lc?.maxStreak !== undefined ? `${lc.maxStreak} Days` : "0 Days", icon: <Flame size={24} className="text-orange-500" /> },
        { label: "Current Rating", value: lc?.currentRating?.toString() || "0", icon: <TrendingUp size={24} className="text-green-600" /> },
        { label: "Best Rating", value: lc?.bestRating?.toString() || "0", icon: <Medal size={24} className="text-yellow-600" /> },
        { label: "Problems Solved", value: lc?.problemsSolved?.toString() || "0", icon: <Code2 size={24} className="text-purple-600" /> },
        { label: "Global Ranking", value: lc?.globalRanking || "Unrated", icon: <Target size={24} className="text-red-600" /> },
        { label: "Contests", value: lc?.contests?.toString() || "0", icon: <Activity size={24} className="text-blue-600" /> },
      ];
    }
    if (platform === "Codeforces") {
      const cf = user?.stats?.codeforces;
      return [
        { label: "Max Streak", value: cf?.maxStreak !== undefined ? `${cf.maxStreak} Days` : "0 Days", icon: <Flame size={24} className="text-orange-500" /> },
        { label: "Current Rating", value: cf?.currentRating?.toString() || "0", icon: <TrendingUp size={24} className="text-green-600" /> },
        { label: "Best Rating", value: cf?.bestRating?.toString() || "0", icon: <Medal size={24} className="text-yellow-600" /> },
        { label: "Problems Solved", value: cf?.problemsSolved?.toString() || "0", icon: <Code2 size={24} className="text-purple-600" /> },
        { label: "Global Ranking", value: cf?.globalRanking || "unrated", icon: <Target size={24} className="text-red-600" /> },
        { label: "Contests", value: cf?.contests?.toString() || "0", icon: <Activity size={24} className="text-blue-600" /> },
      ];
    }
    if (platform === "GitHub") {
      const gh = user?.stats?.github;
      return [
        { label: "Public Repos", value: gh?.publicRepos?.toString() || "0", icon: <Code2 size={24} className="text-gray-800" /> },
        { label: "Contributions", value: gh?.contributions !== undefined ? `${gh.contributions} This Year` : "0 This Year", icon: <TrendingUp size={24} className="text-green-600" /> },
        { label: "Current Streak", value: gh?.currentStreak !== undefined ? `${gh.currentStreak} Days` : "0 Days", icon: <Flame size={24} className="text-orange-500" /> },
        { label: "Followers", value: gh?.followers?.toString() || "0", icon: <Target size={24} className="text-blue-600" /> },
        { label: "Stars Received", value: gh?.starsReceived?.toString() || "0", icon: <Medal size={24} className="text-yellow-600" /> },
        { label: "Pull Requests", value: gh?.pullRequests?.toString() || "0", icon: <Activity size={24} className="text-blue-600" /> },
      ];
    }
    return [];
  };

  const stats = getPlatformStats();

  const platformStats = user?.stats?.[platform.toLowerCase() as keyof typeof user.stats] as any;

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

    // We no longer populate the hardcoded activities array, using the ActivityFeed component instead.

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      {/* Welcome Banner */}
      <section className="relative p-8 md:p-12 bg-white rough-border-blue overflow-hidden shadow-[8px_8px_0px_#1E3A8A] flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="relative z-10">
          <h1 className="font-sketch text-4xl md:text-5xl text-sketch-black mb-4">
            Welcome back, <span className="text-blueprint-blue">{user?.name || "Coder"}!</span>
          </h1>
          <p className="font-mono text-sketch-black/80 max-w-2xl text-lg">
            {hasConnections 
              ? "You're currently in the top 15% of all users. Keep pushing your limits! Your next milestone is 600 problems solved."
              : "Welcome to DevArena! Connect your competitive programming or GitHub accounts to start tracking your progress and viewing your unified statistics."}
          </p>
        </div>
        
        {/* Score Badge */}
        {hasConnections && (
          <div className="relative z-10 flex flex-col items-center justify-center p-4 bg-blueprint-blue text-white border-2 border-sketch-black shadow-[4px_4px_0px_#171717] -rotate-2 shrink-0 min-w-[140px] hover:rotate-0 transition-transform cursor-default">
            <Trophy size={24} className="mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">DevArena Score</span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-sketch font-bold">{user?.devArenaScore || 0}</span>
              <span className="text-xs font-mono opacity-80 pb-1">pts</span>
            </div>
          </div>
        )}

        {/* Background decoration */}
        <div className="absolute -right-10 -bottom-20 text-[200px] text-blueprint-blue/5 font-sketch pointer-events-none transform rotate-12">
          DA
        </div>
      </section>


      {!hasConnections ? (
        <section className="bg-white p-8 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform rotate-6">
            <Code2 size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-sketch text-3xl text-sketch-black">Your Unified Dashboard is Empty</h2>
            <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
              Connect your competitive programming or GitHub accounts in the profile settings to unlock your ranking metrics, problem-solving history, and progress overview.
            </p>
          </div>
          <Link 
            href="/profile" 
            className="px-8 py-4 bg-blueprint-blue text-white font-bold font-mono text-lg rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]"
          >
            Go to Profile to Connect Accounts
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

          {/* KPI Stats Grid */}
          {connectedTabs.includes(platform) && stats && (
            <section>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="font-mono text-2xl font-bold text-sketch-black flex items-center gap-3">
                  <span className="w-8 h-[3px] bg-blueprint-blue inline-block"></span>
                  Overview ({platform})
                </h2>
                <div className="flex items-center gap-2">
                  {syncError && <span className="text-xs font-mono text-red-500 font-bold">{syncError}</span>}
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-blueprint-blue text-white font-mono text-xs font-bold rough-border hover:-translate-y-0.5 transition-transform disabled:opacity-55 cursor-pointer shadow-[2px_2px_0px_#171717]"
                  >
                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Syncing..." : "Sync Stats"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                  <div 
                    key={i} 
                    className="bg-white p-6 rough-border flex items-start justify-between shadow-[4px_4px_0px_#171717] hover:-translate-y-1 transition-transform group"
                  >
                    <div>
                      <p className="font-mono text-sm text-sketch-black/60 font-bold mb-2 uppercase tracking-wider">{stat.label}</p>
                      <h3 className="font-mono text-3xl font-bold text-sketch-black">{stat.value}</h3>
                    </div>
                    <div className="p-3 bg-paper rough-border-blue group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Achievements / Badges Section */}
          {connectedTabs.includes(platform) && achievements && (
            <section className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717]">
              <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center gap-2">
                <Trophy size={20} className="text-blueprint-blue" />
                Unlocked Achievements ({platform})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-paper rough-border group cursor-default hover:bg-sketch-black hover:text-white transition-colors duration-300 shadow-[2px_2px_0px_#171717] hover:shadow-[4px_4px_0px_#1E3A8A]"
                  >
                    <div className="w-12 h-12 shrink-0 bg-white rounded-full flex items-center justify-center rough-border-blue text-blueprint-blue group-hover:text-sketch-black group-hover:bg-white group-hover:border-white transition-all duration-300">
                      <Trophy size={24} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-sm mb-1">{badge.title}</h4>
                      <p className="font-mono text-xs opacity-70 mb-2 leading-relaxed">{badge.desc}</p>
                      <p className="font-mono text-[10px] font-bold text-blueprint-blue group-hover:text-blue-300 uppercase tracking-wider">
                        {badge.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent Activity / Setup Call to Action */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rough-border shadow-[4px_4px_0px_#171717] h-full overflow-y-auto max-h-[400px]">
              <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 flex justify-between items-center">
                Friend Activity
                <Link href="/leaderboard" className="text-blueprint-blue text-sm hover:underline">View Leaderboard &rarr;</Link>
              </h3>
              <ActivityFeed />
            </div>

            <div className="bg-blueprint-blue p-8 rough-border shadow-[4px_4px_0px_#171717] text-white flex flex-col justify-between h-full">
              <div>
                <h3 className="font-mono text-xl font-bold mb-4">Profile Settings</h3>
                <p className="font-mono text-white/80 mb-6 text-sm">
                  Manage your competitive programming and GitHub account connections to update your unified developer profile and share your coder ID card.
                </p>
              </div>
              <Link 
                href="/profile" 
                className="w-full py-3 px-4 bg-white text-blueprint-blue font-mono font-bold rough-border hover:bg-paper transition-colors text-center block"
              >
                Manage Connections
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
