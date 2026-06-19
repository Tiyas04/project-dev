"use client";

import React, { useState } from "react";
import { Trophy, TrendingUp, Code2, Medal, Target, Activity, Flame } from "lucide-react";

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
  ]
};

export default function Dashboard() {
  const [platform, setPlatform] = useState<"LeetCode" | "Codeforces">("LeetCode");
  const stats = mockDashboardData[platform];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      {/* Welcome Banner */}
      <section className="relative p-8 md:p-12 bg-white rough-border-blue overflow-hidden shadow-[8px_8px_0px_#1E3A8A]">
        <div className="relative z-10">
          <h1 className="font-sketch text-4xl md:text-5xl text-sketch-black mb-4">
            Welcome back, <span className="text-blueprint-blue">Coder!</span>
          </h1>
          <p className="font-mono text-sketch-black/80 max-w-2xl text-lg">
            You're currently in the top 15% of all users. Keep pushing your limits! Your next milestone is 600 problems solved.
          </p>
        </div>
        {/* Background decoration */}
        <div className="absolute -right-10 -bottom-20 text-[200px] text-blueprint-blue/5 font-sketch pointer-events-none transform rotate-12">
          DA
        </div>
      </section>

      {/* Platform Tabs */}
      <div className="flex gap-4 border-b-2 border-dashed border-sketch-black/20 pb-4">
        {["LeetCode", "Codeforces"].map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p as "LeetCode" | "Codeforces")}
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

      {/* Recent Activity / Setup Call to Action */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rough-border shadow-[4px_4px_0px_#171717]">
          <h3 className="font-mono text-xl font-bold text-sketch-black mb-6">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 pb-4 border-b-2 border-dashed border-sketch-black/20">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="font-mono text-sm text-sketch-black"><span className="font-bold">Solved</span> "Two Sum" on LeetCode</p>
              <span className="font-mono text-xs text-sketch-black/50 ml-auto">2h ago</span>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b-2 border-dashed border-sketch-black/20">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="font-mono text-sm text-sketch-black"><span className="font-bold">Participated</span> in Codeforces Round 912</p>
              <span className="font-mono text-xs text-sketch-black/50 ml-auto">1d ago</span>
            </div>
            <div className="flex items-center gap-4 pb-4">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <p className="font-mono text-sm text-sketch-black"><span className="font-bold">Achievement</span> Unlocked 100 Day Streak!</p>
              <span className="font-mono text-xs text-sketch-black/50 ml-auto">3d ago</span>
            </div>
          </div>
        </div>

        <div className="bg-blueprint-blue p-8 rough-border shadow-[4px_4px_0px_#171717] text-white">
          <h3 className="font-mono text-xl font-bold mb-4">Complete Your Profile</h3>
          <p className="font-mono text-white/80 mb-6 text-sm">
            Connect your competitive programming accounts to get a unified dashboard and personalized AI recommendations.
          </p>
          <div className="flex flex-col gap-3">
            <button className="w-full py-3 px-4 bg-white text-blueprint-blue font-mono font-bold rough-border hover:bg-paper transition-colors text-center">
              Connect LeetCode
            </button>
            <button className="w-full py-3 px-4 bg-transparent text-white font-mono font-bold rough-border border-white hover:bg-white/10 transition-colors text-center">
              Connect Codeforces
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
