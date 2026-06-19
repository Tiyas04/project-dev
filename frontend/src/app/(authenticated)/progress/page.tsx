"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Code2, Flame, Award, CheckCircle2, TrendingUp, Target, Calendar, Plus, X } from "lucide-react";

// Mock Heatmap Data generator (deterministic to avoid hydration errors)
const generateHeatmap = () => {
  return Array.from({ length: 84 }).map((_, i) => {
    // Use a deterministic pattern based on index instead of Math.random
    const pseudoRand = (i * 13 + 7) % 100;
    if (pseudoRand < 40) return 0;
    if (pseudoRand < 70) return 1;
    if (pseudoRand < 85) return 2;
    if (pseudoRand < 95) return 3;
    return 4;
  });
};

const mockProgressData = {
  LeetCode: {
    heatmap: generateHeatmap(),
    currentStreak: 45,
    longestStreak: 120,
    goals: [
      { title: "Weekly Medium Problems", current: 8, target: 10 },
      { title: "Monthly Hard Problems", current: 3, target: 5 },
      { title: "100 Day Streak", current: 45, target: 100 },
    ],
    achievements: [
      { title: "First Blood", desc: "Solve your first problem", date: "Jan 12, 2024" },
      { title: "Consistency is Key", desc: "30 day streak", date: "Feb 15, 2024" },
      { title: "100 Club", desc: "Solve 100 problems", date: "Mar 10, 2024" },
      { title: "Weekend Warrior", desc: "Solve 5 problems on a weekend", date: "Apr 05, 2024" },
    ]
  },
  Codeforces: {
    heatmap: generateHeatmap(),
    currentStreak: 12,
    longestStreak: 25,
    goals: [
      { title: "Participate in Contests", current: 1, target: 4 },
      { title: "Reach Specialist (1400)", current: 1350, target: 1400 },
    ],
    achievements: [
      { title: "First Contest", desc: "Participate in your first rated contest", date: "Mar 01, 2024" },
      { title: "Pupil", desc: "Reach Pupil rank (1200+)", date: "Apr 20, 2024" },
    ]
  }
};

const getIntensityColor = (intensity: number) => {
  switch(intensity) {
    case 1: return "bg-blue-300";
    case 2: return "bg-blue-500";
    case 3: return "bg-blue-700";
    case 4: return "bg-blue-900";
    default: return "bg-gray-100";
  }
};

// Framer Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function ProgressPage() {
  const [platform, setPlatform] = useState<"LeetCode" | "Codeforces">("LeetCode");
  
  // Interactive Goals State
  const [customGoals, setCustomGoals] = useState<Record<string, any[]>>({
    LeetCode: [...mockProgressData.LeetCode.goals],
    Codeforces: [...mockProgressData.Codeforces.goals]
  });
  
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", target: "", period: "1 Week" });

  const data = mockProgressData[platform];
  const currentGoals = customGoals[platform];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target) return;
    
    const targetNum = parseInt(newGoal.target);
    if (isNaN(targetNum) || targetNum <= 0) return;

    const goal = {
      title: `${newGoal.title} [${newGoal.period}]`,
      current: 0,
      target: targetNum
    };

    setCustomGoals(prev => ({
      ...prev,
      [platform]: [...prev[platform], goal]
    }));

    setNewGoal({ title: "", target: "", period: "1 Week" });
    setIsAddingGoal(false);
  };

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
          <h1 className="font-sketch text-4xl md:text-5xl text-sketch-black">
            Progress
          </h1>
        </div>
      </motion.div>

      {/* Platform Tabs */}
      <div className="flex gap-4 border-b-2 border-dashed border-sketch-black/20 pb-4">
        {["LeetCode", "Codeforces"].map((p) => (
          <button
            key={p}
            onClick={() => {
              setPlatform(p as "LeetCode" | "Codeforces");
              setIsAddingGoal(false);
            }}
            className={`flex items-center gap-2 px-6 py-3 font-mono font-bold transition-all duration-300 ${
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
                Activity Grid
              </h3>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-paper rough-border font-mono text-sm shadow-[2px_2px_0px_#171717]">
                  <span className="font-bold text-blueprint-blue">{data.currentStreak}</span> Current Streak
                </div>
                <div className="px-4 py-2 bg-paper rough-border font-mono text-sm shadow-[2px_2px_0px_#171717]">
                  <span className="font-bold text-blueprint-blue">{data.longestStreak}</span> Max Streak
                </div>
              </div>
            </div>

            <div className="overflow-x-auto pb-6">
              <div className="inline-grid grid-rows-7 grid-flow-col gap-[4px] md:gap-2">
                {data.heatmap.map((intensity, i) => (
                  <div key={i} className="relative group">
                    <div 
                      className={`w-4 h-4 md:w-5 md:h-5 rounded-sm ${getIntensityColor(intensity)} hover:ring-2 hover:ring-sketch-black transition-all cursor-pointer shadow-sm`}
                    />
                    {/* Custom Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-sketch-black text-white text-[10px] font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                      Level {intensity}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Goal Tracking */}
            <motion.section variants={itemVariants} className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] flex flex-col h-full">
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-dashed border-sketch-black/10">
                <h3 className="font-mono text-xl font-bold text-sketch-black flex items-center gap-2">
                  <Target size={20} className="text-blueprint-blue" />
                  Current Targets
                </h3>
                {!isAddingGoal && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddingGoal(true)}
                    className="flex items-center gap-1 font-mono text-sm font-bold text-white bg-blueprint-blue px-3 py-1.5 rough-border shadow-[2px_2px_0px_#171717]"
                  >
                    <Plus size={16} /> New Target
                  </motion.button>
                )}
              </div>

              {/* Add Goal Sliding Form */}
              <AnimatePresence>
                {isAddingGoal && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                    animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                    onSubmit={handleAddGoal} 
                  >
                    <div className="p-4 bg-paper rough-border border-dashed space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-mono font-bold text-sm text-blueprint-blue">Configure Target</h4>
                        <button type="button" onClick={() => setIsAddingGoal(false)} className="text-sketch-black/50 hover:text-red-500 transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="E.g. Solve Hard Problems" 
                          className="w-full bg-white p-3 font-mono text-sm rough-border outline-none focus:ring-2 ring-blueprint-blue shadow-inner"
                          value={newGoal.title}
                          onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                          required
                        />
                        <div className="flex gap-3">
                          <input 
                            type="number" 
                            placeholder="Target value (e.g. 5)" 
                            className="w-1/2 bg-white p-3 font-mono text-sm rough-border outline-none focus:ring-2 ring-blueprint-blue shadow-inner"
                            value={newGoal.target}
                            onChange={e => setNewGoal({...newGoal, target: e.target.value})}
                            required
                          />
                          <select 
                            className="w-1/2 bg-white p-3 font-mono text-sm rough-border outline-none focus:ring-2 ring-blueprint-blue cursor-pointer"
                            value={newGoal.period}
                            onChange={e => setNewGoal({...newGoal, period: e.target.value})}
                          >
                            <option>1 Week</option>
                            <option>1 Month</option>
                            <option>3 Months</option>
                            <option>6 Months</option>
                          </select>
                        </div>
                        <button type="submit" className="w-full bg-sketch-black text-white py-3 font-mono font-bold rough-border hover:bg-blueprint-blue transition-colors shadow-[2px_2px_0px_#1E3A8A]">
                          Confirm & Add Target
                        </button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="space-y-6 flex-1">
                {currentGoals.length === 0 && (
                  <p className="font-mono text-sm text-sketch-black/50 text-center py-8">No active targets. Set one above to stay motivated!</p>
                )}
                {currentGoals.map((goal, i) => {
                  const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
                  return (
                    <div key={i} className="space-y-2 group">
                      <div className="flex justify-between font-mono text-sm font-bold text-sketch-black">
                        <span className="group-hover:text-blueprint-blue transition-colors">{goal.title}</span>
                        <span>{goal.current} <span className="text-sketch-black/40">/ {goal.target}</span></span>
                      </div>
                      <div className="h-5 w-full bg-paper rough-border overflow-hidden p-[2px] shadow-inner relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                          className="h-full bg-blueprint-blue relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Achievements / Badges */}
            <motion.section variants={itemVariants} className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717] h-full">
              <h3 className="font-mono text-xl font-bold text-sketch-black mb-8 pb-4 border-b-2 border-dashed border-sketch-black/10 flex items-center gap-2">
                <Award size={20} className="text-blueprint-blue" />
                Unlocked Achievements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.achievements.map((badge, i) => (
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
                      <p className="font-mono text-[10px] font-bold text-blueprint-blue group-hover:text-blue-300 uppercase tracking-wider">{badge.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
