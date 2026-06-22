"use client";

import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Code2, Medal, Target, Activity, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const mockDashboardData = {
  LeetCode: [
    { label: "Max Streak", value: "45 Days", icon: <Flame size={24} className="text-orange-500" /> },
    { label: "Current Rating", value: "1645", icon: <TrendingUp size={24} className="text-green-600" /> },
    { label: "Best Rating", value: "1720", icon: <Medal size={24} className="text-yellow-600" /> },
    { label: "Problems Solved", value: "350", icon: <Code2 size={24} className="text-purple-600" /> },
    { label: "Global Ranking", value: "Top 12%", icon: <Target size={24} className="text-red-600" /> },
    { label: "Contests", value: "28", icon: <Activity size={24} className="text-blue-600" /> },
  ],
  Codeforces: [
    { label: "Max Streak", value: "12 Days", icon: <Flame size={24} className="text-orange-500" /> },
    { label: "Current Rating", value: "1420", icon: <TrendingUp size={24} className="text-green-600" /> },
    { label: "Best Rating", value: "1420", icon: <Medal size={24} className="text-yellow-600" /> },
    { label: "Problems Solved", value: "205", icon: <Code2 size={24} className="text-purple-600" /> },
    { label: "Global Ranking", value: "Specialist", icon: <Target size={24} className="text-red-600" /> },
    { label: "Contests", value: "14", icon: <Activity size={24} className="text-blue-600" /> },
  ],
  GitHub: [
    { label: "Public Repos", value: "34", icon: <Code2 size={24} className="text-gray-800" /> },
    { label: "Contributions", value: "842 This Year", icon: <TrendingUp size={24} className="text-green-600" /> },
    { label: "Current Streak", value: "8 Days", icon: <Flame size={24} className="text-orange-500" /> },
    { label: "Followers", value: "128", icon: <Target size={24} className="text-blue-600" /> },
    { label: "Stars Received", value: "48", icon: <Medal size={24} className="text-yellow-600" /> },
    { label: "Pull Requests", value: "62", icon: <Activity size={24} className="text-blue-600" /> },
  ]
};

export default function Dashboard() {
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

  const stats = mockDashboardData[platform];

  const activities = [];
  if (user?.leetcode) {
    activities.push({
      platform: "LeetCode",
      color: "bg-green-500",
      content: <>Solved <span className="font-bold">"Two Sum"</span> on LeetCode</>,
      time: "2h ago"
    });
  }
  if (user?.codeforces) {
    activities.push({
      platform: "Codeforces",
      color: "bg-blue-500",
      content: <>Participated in <span className="font-bold">Codeforces Round 912</span></>,
      time: "1d ago"
    });
  }
  if (user?.github) {
    activities.push({
      platform: "GitHub",
      color: "bg-purple-500",
      content: <>Pushed <span className="font-bold">3 commits</span> to <span className="font-bold">project-dev</span> on GitHub</>,
      time: "4h ago"
    });
  }
  if (hasConnections) {
    activities.push({
      platform: "General",
      color: "bg-yellow-500",
      content: <>Achievement <span className="font-bold">Unlocked 100 Day Streak!</span></>,
      time: "3d ago"
    });
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      {/* Welcome Banner */}
      <section className="relative p-8 md:p-12 bg-white rough-border-blue overflow-hidden shadow-[8px_8px_0px_#1E3A8A]">
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
          <div className="flex gap-4 border-b-2 border-dashed border-sketch-black/20 pb-4">
            {connectedTabs.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex items-center gap-2 px-6 py-3 font-mono font-bold transition-transform ${
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

          {/* KPI Stats Grid */}
          {connectedTabs.includes(platform) && stats && (
            <section>
              <h2 className="font-mono text-2xl font-bold text-sketch-black mb-6 flex items-center gap-3">
                <span className="w-8 h-[3px] bg-blueprint-blue inline-block"></span>
                Overview ({platform})
              </h2>
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

          {/* Recent Activity / Setup Call to Action */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rough-border shadow-[4px_4px_0px_#171717] h-full">
              <h3 className="font-mono text-xl font-bold text-sketch-black mb-6">Recent Activity</h3>
              <div className="flex flex-col gap-4">
                {activities.map((act, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-4 pb-4 ${
                      i < activities.length - 1 ? "border-b-2 border-dashed border-sketch-black/20" : ""
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${act.color}`}></div>
                    <p className="font-mono text-sm text-sketch-black">{act.content}</p>
                    <span className="font-mono text-xs text-sketch-black/50 ml-auto">{act.time}</span>
                  </div>
                ))}
              </div>
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
