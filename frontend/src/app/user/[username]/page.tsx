"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Trophy, 
  TrendingUp, 
  Code2, 
  Medal, 
  Target, 
  Activity, 
  Flame, 
  Link as LinkIcon, 
  Award, 
  Calendar, 
  Zap, 
  BookOpen, 
  User as UserIcon,
  UserPlus,
  UserMinus,
  Sparkles,
  Lock
} from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LoggedInNavbar } from "@/components/loggedin-navbar";
import { LoggedInFooter } from "@/components/loggedin-footer";
import { FollowersModal } from "@/components/followers-modal";

// Constant total problems pool mapping to align with analysis page
const LEETCODE_TOTAL_PROBLEMS: { [key: string]: number } = {
  "array": 1650, "arrays": 1650, "string": 750, "strings": 750, "hash-table": 580, "hash table": 580,
  "math": 520, "dynamic-programming": 500, "dynamic programming": 500, "dp": 500, "sorting": 380,
  "greedy": 380, "depth-first-search": 420, "depth first search": 420, "dfs": 420,
  "breadth-first-search": 320, "breadth first search": 320, "bfs": 320, "tree": 280, "trees": 280,
  "binary-tree": 200, "binary tree": 200, "binary-search": 280, "binary search": 280,
  "two-pointers": 220, "two pointers": 220, "matrix": 210, "matrices": 210, "stack": 180, "design": 160,
  "graph": 180, "graphs": 180, "backtracking": 110, "linked-list": 90, "linked list": 90,
  "bit-manipulation": 170, "bit manipulation": 170, "recursion": 80, "sliding-window": 110,
  "sliding window": 110, "queue": 80, "heap": 110, "heap (priority queue)": 110, "priority queue": 110,
  "binary-search-tree": 60, "binary search tree": 60, "bst": 60, "union-find": 90, "union find": 90,
  "trie": 50, "segment-tree": 55, "segment tree": 55, "simulation": 140, "divide-and-conquer": 60,
  "divide and conquer": 60, "topological-sort": 40, "topological sort": 40, "prefix-sum": 100,
  "prefix sum": 100, "monotonic-stack": 45, "monotonic stack": 45, "monotonic-queue": 25,
  "monotonic queue": 25, "geometry": 40, "randomized": 30, "combinatorics": 30, "game-theory": 25, "game theory": 25,
};

const CODEFORCES_TOTAL_PROBLEMS: { [key: string]: number } = {
  "implementation": 3200, "math": 3000, "greedy": 2800, "dp": 2200, "dynamic-programming": 2200,
  "dynamic programming": 2200, "data structures": 1600, "data-structures": 1600, "sortings": 1200,
  "sorting": 1200, "graphs": 1200, "graph": 1200, "constructive algorithms": 1800, "constructive-algorithms": 1800,
  "brute force": 1500, "brute-force": 1500, "binary search": 1100, "binary-search": 1100,
  "dfs and similar": 1000, "dfs-and-similar": 1000, "dfs": 1000, "trees": 800, "tree": 800,
  "strings": 700, "string": 700, "two pointers": 700, "two-pointers": 700, "number theory": 600,
  "number-theory": 600, "geometry": 500, "combinatorics": 550, "probabilities": 300, "probability": 300,
  "bitmasks": 600, "shortest paths": 400, "shortest-paths": 400, "divide and conquer": 400,
  "divide-and-conquer": 400, "matrices": 200, "matrix": 200, "games": 250, "game": 250, "hashing": 300,
  "hash": 300, "interactive": 300, "flows": 200, "string suffix structures": 150, "fft": 100,
  "graph matchings": 150, "ternary search": 100, "expression parsing": 100, "meet-in-the-middle": 100,
  "2-sat": 60, "chinese remainder theorem": 50, "schedules": 50,
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
  const startDayOfWeek = startDate.getDay();
  
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

export default function PublicProfile() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  const username = (params.username as string) || "";
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("6M");
  const [platform, setPlatform] = useState<"LeetCode" | "Codeforces" | "GitHub">("LeetCode");
  const [shareCopied, setShareCopied] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");
  const [strengthFilter, setStrengthFilter] = useState("ALL");
  const [topicPage, setTopicPage] = useState(1);
  const [analysisPage, setAnalysisPage] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  // Follower/Following modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following">("followers");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/users/profile/${username}`);
      if (res.data?.success) {
        setProfile(res.data.data);
      } else {
        setError("Failed to load user profile");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "User profile not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const connectedTabs = useMemo(() => {
    return (["LeetCode", "Codeforces", "GitHub"] as const).filter((p) => {
      if (p === "LeetCode") return !!profile?.leetcode;
      if (p === "Codeforces") return !!profile?.codeforces;
      if (p === "GitHub") return !!profile?.github;
      return false;
    });
  }, [profile]);

  useEffect(() => {
    if (connectedTabs.length > 0 && !connectedTabs.includes(platform)) {
      setPlatform(connectedTabs[0]);
    }
  }, [profile, connectedTabs]);

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

  const handleFollowToggle = async () => {
    if (!profile || !currentUser) {
      router.push("/auth");
      return;
    }
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await api.post(`/users/unfollow/${profile.username}`);
        setProfile((prev: any) => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max(0, prev.followersCount - 1)
        }));
      } else {
        await api.post(`/users/follow/${profile.username}`);
        setProfile((prev: any) => ({
          ...prev,
          isFollowing: true,
          followersCount: (prev.followersCount || 0) + 1
        }));
      }
    } catch (err) {
      console.error("Failed to toggle follow status", err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Data processing states
  const platformKey = platform.toLowerCase();
  const platformStats = profile?.stats?.[platformKey] as any;
  const recentSolved = platformStats?.recentSolvedQuestions || [];
  const allQuestions = platformStats?.accumulatedSolvedQuestions || [];

  const currentData = useMemo(() => {
    if (!platformStats) return null;
    return {
      totalSolved: platform === "GitHub" ? platformStats.publicRepos || 0 : platformStats.problemsSolved || 0,
      ratingData: platformStats.ratingData || [],
      difficultyData: platformStats.difficultySolved || [],
      heatmap: platformStats.heatmap || [],
      maxStreak: platformStats.maxStreak || 0,
      contests: platformStats.contests || 0,
      globalRanking: platformStats.globalRanking || "Unrated",
      currentStreak: platformStats.currentStreak || 0,
      contributions: platformStats.contributions || 0,
      starsReceived: platformStats.starsReceived || 0,
      pullRequests: platformStats.pullRequests || 0,
    };
  }, [platformStats, platform]);

  const filteredRatingData = useMemo(() => {
    if (!currentData?.ratingData) return [];
    const data = currentData.ratingData;
    if (timeRange === "1M") return data.slice(-1);
    if (timeRange === "3M") return data.slice(-3);
    if (timeRange === "6M") return data.slice(-6);
    return data;
  }, [currentData, timeRange]);

  const dynamicTopicData = useMemo(() => {
    if (!platformStats) return [];
    if (platform === "GitHub") {
      const langs = platformStats.difficultySolved || [];
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

    recentSolved.forEach((q: any) => {
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

  const filteredQuestions = useMemo(() => {
    if (platform === "GitHub") {
      if (!selectedTopic) return recentSolved;
      return recentSolved.filter((repo: any) => {
        return (repo.language || "").toLowerCase() === selectedTopic.toLowerCase();
      });
    }
    if (!selectedTopic) {
    return recentSolved;
    }
    return recentSolved.filter((q: any) =>
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

  const filteredTopicData = useMemo(() => {
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
      : `Recently Solved Problems (${recentSolved.length})`;

  const getAchievements = () => {
    const list: { title: string; desc: string; date: string }[] = [];
    if (!platformStats) return [];

    if (platform === "LeetCode") {
      const solved = platformStats.problemsSolved || 0;
      const streakVal = platformStats.maxStreak || 0;
      const contests = platformStats.contests || 0;

      if (solved > 0) list.push({ title: "First Blood", desc: "Solve your first problem on LeetCode", date: "UNLOCKED" });
      if (streakVal >= 30) list.push({ title: "Consistency", desc: "Maintain a 30+ day streak on LeetCode", date: "UNLOCKED" });
      if (solved >= 100) list.push({ title: "Centurion", desc: "Solve 100+ problems on LeetCode", date: "UNLOCKED" });
      if (solved >= 300) list.push({ title: "Elite Solver", desc: "Solve 300+ problems on LeetCode", date: "UNLOCKED" });
      if (contests > 0) list.push({ title: "Weekend Warrior", desc: "Attend your first LeetCode contest", date: "UNLOCKED" });
    } else if (platform === "Codeforces") {
      const solved = platformStats.problemsSolved || 0;
      const rating = platformStats.currentRating || 0;
      const contests = platformStats.contests || 0;

      if (solved > 0) list.push({ title: "First Contest Solved", desc: "Solve your first problem on Codeforces", date: "UNLOCKED" });
      if (contests > 0) list.push({ title: "CF Contender", desc: "Participate in your first Codeforces contest", date: "UNLOCKED" });
      if (rating >= 1200) list.push({ title: "Pupil Rank", desc: "Reach Pupil rank on Codeforces (1200+)", date: "UNLOCKED" });
      if (rating >= 1400) list.push({ title: "Specialist Rank", desc: "Reach Specialist rank on Codeforces (1400+)", date: "UNLOCKED" });
      if (rating >= 1600) list.push({ title: "Expert Rank", desc: "Reach Expert rank on Codeforces (1600+)", date: "UNLOCKED" });
    } else if (platform === "GitHub") {
      const repos = platformStats.publicRepos || 0;
      const contributions = platformStats.contributions || 0;
      const stars = platformStats.starsReceived || 0;
      const prs = platformStats.pullRequests || 0;

      if (repos > 0) list.push({ title: "First Repo", desc: "Create a public repository on GitHub", date: "UNLOCKED" });
      if (contributions >= 100) list.push({ title: "Active Contributor", desc: "Reach 100+ contributions this year", date: "UNLOCKED" });
      if (prs >= 10) list.push({ title: "PR Champion", desc: "Open 10+ pull requests on GitHub", date: "UNLOCKED" });
      if (stars >= 5) list.push({ title: "Star Catcher", desc: "Receive 5+ stars on your repositories", date: "UNLOCKED" });
    }
    return list;
  };

  const achievements = getAchievements();

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

  const getHeatmapDayLabel = (index: number, count: number) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - index));
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${count} activity unit${count === 1 ? "" : "s"} on ${dateStr}`;
  };

  const getHeatmapRangeText = () => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 83);
    const format = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Activity from ${format(startDate)} to ${format(today)}`;
  };

  const pageContent = () => {
    if (loading) {
      return (
        <div className="w-full space-y-12 py-12 animate-pulse">
          <div className="h-44 bg-white border-2 border-sketch-black rounded-md w-full shadow-[4px_4px_0px_#171717]"></div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 h-96 bg-white border-2 border-sketch-black w-full shadow-[4px_4px_0px_#171717]"></div>
            <div className="md:col-span-8 h-96 bg-white border-2 border-sketch-black w-full shadow-[4px_4px_0px_#171717]"></div>
          </div>
        </div>
      );
    }

    if (error || !profile) {
      return (
        <div className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6 my-12">
          <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform rotate-6">
            <UserIcon size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="font-sketch text-3xl text-sketch-black">User Not Found</h2>
            <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
              We couldn't find a programmer matching username <span className="font-bold text-red-500">@{username}</span> on DevArena. Please check the spelling or search for another coder.
            </p>
          </div>
        </div>
      );
    }

    const isOwnProfile = currentUser?.username?.toLowerCase() === profile.username.toLowerCase();

    return (
      <div className="w-full space-y-12">
        {/* Profile Details Header Card */}
        <section className="relative p-6 md:p-8 bg-white border-2 border-sketch-black shadow-[8px_8px_0px_#1E3A8A] flex flex-col md:flex-row items-center md:items-start justify-between gap-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 w-full md:w-auto">
            {/* Avatar container */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-dashed border-blueprint-blue bg-paper flex items-center justify-center shrink-0 shadow-sm">
              {profile.avatar && profile.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png" ? (
                <img
                  src={profile.avatar.replace("http://", "https://")}
                  alt={`${profile.name}'s Avatar`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-sketch-black/30">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </div>
            {/* Info details */}
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="font-sketch text-3xl md:text-4xl text-sketch-black leading-tight flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {profile.name}
              </h2>
              <p className="font-mono text-sm text-sketch-black/60">@{profile.username}</p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 font-mono text-xs font-bold pt-1">
                <button
                  onClick={() => {
                    setModalType("followers");
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-1 bg-paper border border-sketch-black/10 px-2 py-0.5 rounded shadow-sm hover:border-blueprint-blue hover:text-blueprint-blue transition-colors cursor-pointer"
                >
                  Followers: <span className="text-blueprint-blue">{profile.followersCount ?? 0}</span>
                </button>
                <button
                  onClick={() => {
                    setModalType("following");
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-1 bg-paper border border-sketch-black/10 px-2 py-0.5 rounded shadow-sm hover:border-blueprint-blue hover:text-blueprint-blue transition-colors cursor-pointer"
                >
                  Following: <span className="text-blueprint-blue">{profile.followingCount ?? 0}</span>
                </button>
                <span className="text-sketch-black/50">Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center justify-center gap-3 w-full md:w-auto relative z-10 shrink-0 font-mono">
            {/* DevArena Score badge */}
            <div className="bg-blueprint-blue text-white px-4 py-2 border-2 border-sketch-black shadow-[2px_2px_0px_#171717] flex flex-col items-center justify-center -rotate-2">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">DevArena Score</span>
              <span className="text-xl font-sketch font-bold">{profile.devArenaScore || 0} pts</span>
            </div>
            {/* Follow/Unfollow Button */}
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-6 py-2 border-2 border-sketch-black font-bold text-xs shadow-[2px_2px_0px_#171717] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer flex items-center gap-2 ${
                  profile.isFollowing
                    ? "bg-slate-100 text-sketch-black hover:bg-slate-200"
                    : "bg-blueprint-blue text-white hover:bg-blue-900"
                }`}
              >
                {profile.isFollowing ? (
                  <>
                    <UserMinus size={14} />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    Follow
                  </>
                )}
              </button>
            )}

            {/* Share Link Button */}
            <button
              onClick={() => {
                const profileUrl = typeof window !== "undefined" ? window.location.href : "";
                navigator.clipboard.writeText(profileUrl);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="px-6 py-2 border-2 border-sketch-black bg-white hover:bg-slate-50 text-sketch-black font-bold text-xs shadow-[2px_2px_0px_#171717] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <LinkIcon size={14} />
              {shareCopied ? "Copied!" : "Share Link"}
            </button>
          </div>
          
          {/* Sketchy backdrop design element */}
          <div className="absolute -right-6 -bottom-12 text-[150px] text-blueprint-blue/5 font-sketch pointer-events-none transform rotate-6 select-none">
            CP
          </div>
        </section>

        {!currentUser ? (
          <section className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6 mt-8">
            <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform -rotate-6">
              <Lock size={36} />
            </div>
            <div className="space-y-4">
              <h2 className="font-sketch text-3xl text-sketch-black">Login to View Full Stats</h2>
              <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
                Log in to DevArena to view {profile.name}'s detailed coding stats, problem solving history, and GitHub contributions.
              </p>
              <Link 
                href="/auth"
                className="inline-block px-6 py-3 bg-blueprint-blue text-white font-bold font-mono text-sm border-2 border-sketch-black shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
              >
                Log In Now
              </Link>
            </div>
          </section>
        ) : connectedTabs.length === 0 ? (
          <section className="bg-white p-8 rough-border shadow-[4px_4px_0px_#171717] text-center">
            <h3 className="font-sketch text-2xl text-sketch-black mb-2">No Profiles Connected</h3>
            <p className="font-mono text-sm text-sketch-black/60 max-w-md mx-auto">
              This developer has not connected any competitive programming accounts or GitHub repositories to DevArena yet.
            </p>
          </section>
        ) : (
          <>
            {/* Dynamic tabs */}
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

            {/* KPI Cards Grid */}
            {connectedTabs.includes(platform) && currentData && (
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {platform === "LeetCode" && (
                  <>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Max Streak</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.maxStreak} Days</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Rating</p>
                      <p className="text-xl font-bold text-blueprint-blue mt-1">{currentData.ratingData.length > 0 ? currentData.ratingData[currentData.ratingData.length - 1].rating : "0"}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Best Rating</p>
                      <p className="text-xl font-bold text-amber-600 mt-1">{currentData.globalRanking !== "Unrated" ? currentData.ratingData.reduce((max: number, current: any) => Math.max(max, current.rating), 0) : "0"}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Problems Solved</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.totalSolved}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Global Ranking</p>
                      <p className="text-sm font-bold text-sketch-black mt-2 truncate">{currentData.globalRanking}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Contests</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.contests}</p>
                    </div>
                  </>
                )}
                {platform === "Codeforces" && (
                  <>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Max Streak</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.maxStreak} Days</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">CF Rating</p>
                      <p className="text-xl font-bold text-blueprint-blue mt-1">{currentData.ratingData.length > 0 ? currentData.ratingData[currentData.ratingData.length - 1].rating : "0"}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Best Rating</p>
                      <p className="text-xl font-bold text-amber-600 mt-1">{currentData.ratingData.reduce((max: number, current: any) => Math.max(max, current.rating), 0)}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Problems Solved</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.totalSolved}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Rank Status</p>
                      <p className="text-sm font-bold text-sketch-black mt-2 truncate uppercase">{currentData.globalRanking}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Contests</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.contests}</p>
                    </div>
                  </>
                )}
                {platform === "GitHub" && (
                  <>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Public Repos</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.totalSolved}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Contributions</p>
                      <p className="text-xl font-bold text-blueprint-blue mt-1">{currentData.contributions}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Active Streak</p>
                      <p className="text-xl font-bold text-orange-600 mt-1">{currentData.currentStreak} Days</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Followers</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.globalRanking}</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Stars Received</p>
                      <p className="text-xl font-bold text-amber-500 mt-1">{currentData.starsReceived} ⭐</p>
                    </div>
                    <div className="bg-white p-4 rough-border shadow-[3px_3px_0px_#171717]">
                      <p className="text-[10px] text-sketch-black/50 font-bold uppercase tracking-wider">Pull Requests</p>
                      <p className="text-xl font-bold text-sketch-black mt-1">{currentData.pullRequests}</p>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Growth Curves Charts */}
            {connectedTabs.includes(platform) && currentData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <section className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] md:col-span-2">
                  <div className="flex items-center justify-between gap-4 mb-6 font-mono">
                    <h3 className="text-lg font-bold text-sketch-black flex items-center gap-2">
                      <TrendingUp size={18} className="text-blueprint-blue" />
                      {platform === "GitHub" ? "Contribution Curve" : "Rating Progression"}
                    </h3>
                    <div className="flex bg-paper border border-sketch-black/20 p-0.5 text-xs">
                      {["3M", "6M", "ALL"].map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-2 py-0.5 font-bold transition-colors cursor-pointer ${
                            timeRange === range ? "bg-blueprint-blue text-white" : "text-sketch-black hover:bg-gray-100"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredRatingData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="name" stroke="#171717" fontFamily="var(--font-space-mono)" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#171717" fontFamily="var(--font-space-mono)" tick={{ fontSize: 10 }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          stroke="#1E3A8A"
                          strokeWidth={2.5}
                          dot={{ r: 3.5, fill: "#1E3A8A", strokeWidth: 1.5, stroke: "#fff" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Distribution Pie chart */}
                <section className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] md:col-span-1 flex flex-col justify-between">
                  <h3 className="font-mono text-lg font-bold text-sketch-black mb-4 flex items-center gap-2">
                    <Target size={18} className="text-blueprint-blue" />
                    {platform === "GitHub" ? "Languages" : "Difficulties"}
                  </h3>
                  <div className="flex-1 flex flex-row md:flex-col xl:flex-row items-center justify-center gap-6">
                    <div className="h-[120px] w-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={currentData.difficultyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={50}
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
                    <div className="flex flex-col gap-2 font-mono text-[10px] w-full xl:w-auto">
                      {currentData.difficultyData.map((item: any) => (
                        <div key={item.name} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Achievements Section */}
            {connectedTabs.includes(platform) && achievements.length > 0 && (
              <section className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717]">
                <h3 className="font-mono text-lg font-bold text-sketch-black mb-6 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center gap-2">
                  <Trophy size={18} className="text-blueprint-blue" />
                  Unlocked Achievements ({platform})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((badge, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 bg-paper rough-border group cursor-default shadow-[2px_2px_0px_#171717]"
                    >
                      <div className="w-10 h-10 shrink-0 bg-white rounded-full flex items-center justify-center rough-border-blue text-blueprint-blue">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h4 className="font-mono font-bold text-xs mb-1">{badge.title}</h4>
                        <p className="font-mono text-[10px] opacity-70 mb-1">{badge.desc}</p>
                        <p className="font-mono text-[8px] font-bold text-blueprint-blue uppercase">
                          {badge.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Section: Topic analysis (Left) and Problems List (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Topic Masteries */}
              <section className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] lg:col-span-5 flex flex-col">
                <h3 className="font-mono text-lg font-bold text-sketch-black mb-6 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blueprint-blue" />
                  {platform === "GitHub" ? "Language Strengths" : "Topic Strengths"}
                </h3>
                
                <div className="flex gap-2 mb-4 font-mono text-xs">
                  <input
                    type="text"
                    placeholder="Filter topic..."
                    value={topicSearch}
                    onChange={(e) => {
                      setTopicSearch(e.target.value);
                      setTopicPage(1);
                    }}
                    className="flex-1 px-2 py-1 border-2 border-sketch-black bg-white focus:outline-none"
                  />
                  <select
                    value={strengthFilter}
                    onChange={(e) => {
                      setStrengthFilter(e.target.value);
                      setTopicPage(1);
                    }}
                    className="px-2 py-1 border-2 border-sketch-black bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Strengths</option>
                    <option value="UNEXPLORED">Unexplored</option>
                    <option value="NEEDS PRACTICE">Needs Practice</option>
                    <option value="IMPROVING">Improving</option>
                    <option value="STRONG">Strong</option>
                    <option value="MASTERED">Mastered</option>
                  </select>
                </div>

                <div className="flex-1 space-y-4">
                  {filteredTopicData.length === 0 ? (
                    <div className="text-center py-8 font-mono text-xs text-sketch-black/40">
                      No matching topics found.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {paginatedTopics.map((item: any) => {
                          const isSelected = selectedTopic === item.subject;
                          const category = getStrengthCategory(item.A);
                          
                          return (
                            <div 
                              key={item.subject} 
                              onClick={() => setSelectedTopic(isSelected ? null : item.subject)}
                              className={`p-3 space-y-2 font-mono transition-all border-2 rounded cursor-pointer select-none relative overflow-hidden group ${
                                isSelected
                                  ? "bg-[#eff6ff] border-blueprint-blue shadow-[3px_3px_0px_#1E3A8A] -translate-y-0.5"
                                  : "bg-white hover:bg-slate-50 border-sketch-black/10 hover:border-sketch-black/40 hover:shadow-[1.5px_1.5px_0px_#171717]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-xs md:text-sm text-sketch-black">
                                    {item.subject}
                                  </span>
                                  {platform !== "GitHub" ? (
                                    <div className="text-[8px] text-sketch-black/50 font-bold flex items-center gap-1">
                                      <span>Platform total: {item.totalOnPlatform}</span>
                                      <span>•</span>
                                      <span>Solved: {item.total}</span>
                                    </div>
                                  ) : (
                                    <div className="text-[8px] text-sketch-black/50 font-bold">
                                      <span>Repositories: {item.total}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className={`font-sketch text-base font-bold leading-none ${category.textClr}`}>
                                    {item.A}%
                                  </span>
                                </div>
                              </div>
                              
                              <div className="relative w-full h-3.5 bg-slate-50 border border-sketch-black/10 rounded-sm overflow-hidden flex items-center">
                                <div 
                                  className={`h-full bg-linear-to-r ${category.barGrad} border-r border-sketch-black transition-all duration-500 ease-out`} 
                                  style={{ width: `${item.A}%` }} 
                                />
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                {platform !== "GitHub" ? (
                                  <div className="flex gap-1.5 text-[8px] font-bold">
                                    <span className="text-green-700">E: {item.easySolved ?? 0}</span>
                                    <span className="text-amber-700">M: {item.mediumSolved ?? 0}</span>
                                    <span className="text-rose-700">H: {item.hardSolved ?? 0}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#737373' }}></span>
                                    <span className="text-[8px] text-sketch-black/50">{item.subject} Color</span>
                                  </div>
                                )}
                                <span className={`text-[8px] px-1 py-0.5 border border-dashed font-bold uppercase rounded-sm flex items-center gap-0.5 tracking-wider ${category.textClass}`}>
                                  {category.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {totalTopicPages > 1 && (
                        <div className="flex items-center justify-between pt-3 border-t border-dashed border-sketch-black/10 font-mono text-[9px]">
                          <span>Showing {topicStartIndex + 1}-{Math.min(topicStartIndex + topicsPerPage, filteredTopicData.length)} of {filteredTopicData.length}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setTopicPage(prev => Math.max(prev - 1, 1))}
                              disabled={topicPage === 1}
                              className="px-1.5 py-0.5 border border-sketch-black bg-white disabled:opacity-50 cursor-pointer text-[8px] font-bold"
                            >
                              Prev
                            </button>
                            <button
                              onClick={() => setTopicPage(prev => Math.min(prev + 1, totalTopicPages))}
                              disabled={topicPage === totalTopicPages}
                              className="px-1.5 py-0.5 border border-sketch-black bg-white disabled:opacity-50 cursor-pointer text-[8px] font-bold"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* Solved Problems / GitHub repos */}
              <section className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] lg:col-span-7 flex flex-col">
                <h3 className="font-mono text-lg font-bold text-sketch-black mb-6 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center gap-2">
                  <Award size={18} className="text-blueprint-blue" />
                  {rightColumnHeader}
                </h3>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {paginatedFilteredQuestions.length === 0 ? (
                      <div className="text-center py-8 font-mono text-xs text-sketch-black/40">
                        No submissions recorded for this section.
                      </div>
                    ) : (
                      paginatedFilteredQuestions.map((q: any, idx: number) => (
                        <div 
                          key={q.titleSlug || idx} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-paper border border-sketch-black/10 hover:border-sketch-black/40 transition-colors rounded shadow-sm font-mono text-xs"
                        >
                          <div className="space-y-1">
                            {platform === "GitHub" ? (
                              <a href={q.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blueprint-blue hover:underline flex items-center gap-1.5">
                                {q.title}
                              </a>
                            ) : (
                              <p className="font-bold text-sketch-black">{q.title}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-[9px] text-sketch-black/60">
                              <span>Solved {formatDate(q.timestamp)}</span>
                              <span>•</span>
                              <span>Language: {q.lang || "C++"}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {platform === "GitHub" ? (
                              <>
                                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 border border-yellow-200 text-yellow-700 rounded-sm font-bold">
                                  ★ {q.stars}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 border border-blue-200 text-blue-700 rounded-sm font-bold">
                                  🔀 {q.forks}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className={`text-[9px] px-2 py-0.5 border rounded-sm font-bold capitalize ${getDifficultyColor(q.difficulty)}`}>
                                  {q.difficulty}
                                </span>
                                {q.topicTags?.slice(0, 2).map((t: any) => (
                                  <span key={t.slug} className="bg-slate-100 text-slate-600 border border-slate-300 text-[9px] px-1.5 py-0.5 rounded-sm font-bold">
                                    {t.name}
                                  </span>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {totalAnalysisPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-dashed border-sketch-black/10 font-mono text-[9px] mt-6">
                      <span>Showing {analysisStartIndex + 1}-{Math.min(analysisStartIndex + analysisItemsPerPage, filteredQuestions.length)} of {filteredQuestions.length}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setAnalysisPage(prev => Math.max(prev - 1, 1))}
                          disabled={analysisPage === 1}
                          className="px-2 py-0.5 border border-sketch-black bg-white disabled:opacity-50 cursor-pointer font-bold"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setAnalysisPage(prev => Math.min(prev + 1, totalAnalysisPages))}
                          disabled={analysisPage === totalAnalysisPages}
                          className="px-2 py-0.5 border border-sketch-black bg-white disabled:opacity-50 cursor-pointer font-bold"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    );
  };

  const showLoggedInNavbar = !!currentUser;

  return (
    <div className="flex flex-col min-h-screen">
      {showLoggedInNavbar ? <LoggedInNavbar /> : <Navbar />}
      <main className="flex-1 pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {pageContent()}
      </main>
      <FollowersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        username={profile?.username || username}
        type={modalType}
      />
      {showLoggedInNavbar ? <LoggedInFooter /> : <Footer />}
    </div>
  );
}
