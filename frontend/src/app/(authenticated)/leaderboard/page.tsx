"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Trophy, Users, Search, Target, Medal, Flame } from "lucide-react";
import Link from "next/link";

interface LeaderboardUser {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  arenaScore: number;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"global" | "friends">("global");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLeaderboard(tab);
  }, [tab]);

  const fetchLeaderboard = async (currentTab: string) => {
    setLoading(true);
    try {
      const endpoint = currentTab === "global" ? "/leaderboard/global" : "/leaderboard/friends";
      const response = await api.get(endpoint);
      setUsers(response.data.data.users);
    } catch (err) {
      console.error("Error fetching leaderboard", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <div className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold font-mono border-2 border-sketch-black">1</div>;
    if (index === 1) return <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-800 flex items-center justify-center font-bold font-mono border-2 border-sketch-black">2</div>;
    if (index === 2) return <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-bold font-mono border-2 border-sketch-black">3</div>;
    return <div className="w-8 h-8 rounded-full bg-paper text-sketch-black flex items-center justify-center font-bold font-mono border-2 border-sketch-black/20">{index + 1}</div>;
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <section className="bg-blueprint-blue text-white p-8 md:p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-sketch text-4xl md:text-5xl mb-4 flex items-center gap-3">
            <Trophy size={40} className="text-yellow-400" />
            Arena Leaderboard
          </h1>
          <p className="font-mono text-white/80 text-lg">
            Compete with friends and developers worldwide. Rank up your Arena Score by solving problems and participating in contests!
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-40px] text-[180px] text-white/10 font-sketch pointer-events-none transform -rotate-12">
          #1
        </div>
      </section>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("global")}
            className={`flex items-center gap-2 px-6 py-3 font-mono font-bold text-sm transition-all duration-300 ${
              tab === "global"
                ? "bg-sketch-black text-white rough-border shadow-[4px_4px_0px_#1E3A8A] -translate-y-1"
                : "bg-paper text-sketch-black rough-border hover:bg-gray-200"
            }`}
          >
            <Trophy size={18} /> Global Rank
          </button>
          <button
            onClick={() => setTab("friends")}
            className={`flex items-center gap-2 px-6 py-3 font-mono font-bold text-sm transition-all duration-300 ${
              tab === "friends"
                ? "bg-sketch-black text-white rough-border shadow-[4px_4px_0px_#1E3A8A] -translate-y-1"
                : "bg-paper text-sketch-black rough-border hover:bg-gray-200"
            }`}
          >
            <Users size={18} /> Friends
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rough-border font-mono text-sm shadow-[2px_2px_0px_#171717] focus:outline-none focus:ring-2 focus:ring-blueprint-blue"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-sketch-black/50" />
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="bg-white p-6 md:p-8 rough-border shadow-[8px_8px_0px_#171717] min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64 font-mono font-bold text-lg animate-pulse">
            Loading arena ranks...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-sketch-black/60 font-mono text-center space-y-4">
            <Target size={48} className="opacity-50" />
            <p>No users found in this leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((u, i) => (
              <div 
                key={u._id} 
                className="flex items-center justify-between p-4 bg-paper rough-border hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1E3A8A] transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {getRankBadge(i)}
                  <Link href={`/user/${u.username}`}>
                    <img src={u.avatar} alt={u.username} className="w-12 h-12 rounded-full border-2 border-sketch-black" />
                  </Link>
                  <div>
                    <Link href={`/user/${u.username}`} className="font-mono font-bold text-lg hover:text-blueprint-blue hover:underline">
                      {u.name}
                    </Link>
                    <p className="font-mono text-xs text-sketch-black/70">@{u.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Flame size={20} className="text-orange-500" />
                  <span className="font-sketch font-bold text-2xl text-blueprint-blue">
                    {u.arenaScore || 0}
                  </span>
                  <span className="font-mono text-xs text-sketch-black/50">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
