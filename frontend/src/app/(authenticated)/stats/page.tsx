"use client";

import React, { useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { BarChart2, Calendar, Target, Zap, Code2 } from "lucide-react";

type PlatformData = {
  ratingData: { name: string, rating: number }[];
  difficultyData: { name: string, value: number, color: string }[];
  topicData: { subject: string, A: number, fullMark: number }[];
  totalSolved: number;
};

const mockData: Record<string, PlatformData> = {
  LeetCode: {
    totalSolved: 350,
    ratingData: [
      { name: "Jan", rating: 1400 },
      { name: "Feb", rating: 1450 },
      { name: "Mar", rating: 1520 },
      { name: "Apr", rating: 1600 },
      { name: "May", rating: 1680 },
      { name: "Jun", rating: 1750 },
    ],
    difficultyData: [
      { name: "Easy", value: 100, color: "#22c55e" },
      { name: "Medium", value: 200, color: "#eab308" },
      { name: "Hard", value: 50, color: "#ef4444" },
    ],
    topicData: [
      { subject: "Arrays", A: 95, fullMark: 100 },
      { subject: "Strings", A: 80, fullMark: 100 },
      { subject: "DP", A: 60, fullMark: 100 },
      { subject: "Graphs", A: 65, fullMark: 100 },
      { subject: "Trees", A: 85, fullMark: 100 },
      { subject: "Math", A: 45, fullMark: 100 },
    ]
  },
  Codeforces: {
    totalSolved: 205,
    ratingData: [
      { name: "Jan", rating: 1100 },
      { name: "Feb", rating: 1200 },
      { name: "Mar", rating: 1250 },
      { name: "Apr", rating: 1180 },
      { name: "May", rating: 1300 },
      { name: "Jun", rating: 1420 },
    ],
    difficultyData: [
      { name: "Easy", value: 20, color: "#22c55e" },
      { name: "Medium", value: 140, color: "#eab308" },
      { name: "Hard", value: 45, color: "#ef4444" },
    ],
    topicData: [
      { subject: "Arrays", A: 80, fullMark: 100 },
      { subject: "Strings", A: 70, fullMark: 100 },
      { subject: "DP", A: 75, fullMark: 100 },
      { subject: "Graphs", A: 80, fullMark: 100 },
      { subject: "Trees", A: 60, fullMark: 100 },
      { subject: "Math", A: 85, fullMark: 100 },
    ]
  },
};

export default function Stats() {
  const [timeRange, setTimeRange] = useState("6M");
  const [platform, setPlatform] = useState<"LeetCode" | "Codeforces">("LeetCode");

  const currentData = mockData[platform];

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rough-border shadow-[2px_2px_0px_#171717] font-mono">
          <p className="font-bold text-sketch-black">{label}</p>
          <p className="text-blueprint-blue">{`Rating: ${payload[0].value}`}</p>
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
          <h1 className="font-sketch text-4xl md:text-5xl text-sketch-black">
            Analytics
          </h1>
        </div>
        
        {/* Time Filter */}
        <div className="flex bg-paper rough-border p-1">
          {["1M", "3M", "6M", "1Y", "ALL"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1 font-mono text-sm font-bold transition-colors ${
                timeRange === range 
                  ? "bg-blueprint-blue text-white" 
                  : "text-sketch-black hover:bg-gray-100"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-4 border-b-2 border-dashed border-sketch-black/20 pb-4">
        {["LeetCode", "Codeforces"].map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p as any)}
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

      {/* Main Graph: Rating History */}
      <section className="bg-white p-6 md:p-8 rough-border shadow-[4px_4px_0px_#171717]">
        <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 flex items-center gap-2">
          <Zap size={20} className="text-blueprint-blue" />
          {platform} Rating Growth
        </h3>
        <div className="h-[300px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData.ratingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#171717" fontFamily="var(--font-space-mono)" tick={{fontSize: 12}} />
              <YAxis stroke="#171717" fontFamily="var(--font-space-mono)" tick={{fontSize: 12}} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Problem Difficulty Distribution */}
        <section className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] flex flex-col">
          <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 flex items-center gap-2">
            <Target size={20} className="text-blueprint-blue" />
            Problems Solved ({platform})
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
                    {currentData.difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <div className="text-center lg:text-left mb-2">
                <p className="font-mono text-sm text-sketch-black/60">Total Solved</p>
                <p className="font-mono text-3xl font-bold text-sketch-black">{currentData.totalSolved}</p>
              </div>
              {currentData.difficultyData.map((item) => (
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

        {/* Topic Strengths Radar */}
        <section className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] flex flex-col">
          <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-blueprint-blue" />
            Topic Strengths ({platform})
          </h3>
          <div className="flex-1 h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={currentData.topicData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#171717', fontSize: 12, fontFamily: 'var(--font-space-mono)' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#1E3A8A"
                  fill="#1E3A8A"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
