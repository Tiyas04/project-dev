import React from "react";
import { Activity, Trophy, Code2, BrainCircuit } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Unified Profile",
      description: "Connect LeetCode and Codeforces to track all your problem-solving stats and ratings in one single dashboard.",
      icon: <Activity className="w-8 h-8 text-blueprint-blue" />,
    },
    {
      title: "Rating Analytics",
      description: "Visualize your rating growth, contest performance, and monthly progress with detailed charts and filters.",
      icon: <Trophy className="w-8 h-8 text-blueprint-blue" />,
    },
    {
      title: "Topic Analysis",
      description: "Automatically categorize solved problems to identify your strong topics and pinpoint areas for improvement.",
      icon: <Code2 className="w-8 h-8 text-blueprint-blue" />,
    },
    {
      title: "AI Coach",
      description: "Get personalized improvement suggestions, learning roadmaps, and topic recommendations based on your weak areas.",
      icon: <BrainCircuit className="w-8 h-8 text-blueprint-blue" />,
    },
  ];

  return (
    <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col items-center mb-16 relative">
        <h2 className="font-sketch text-5xl md:text-6xl text-sketch-black font-bold relative inline-block">
          Features
          <div className="absolute -bottom-2 left-0 w-full h-[3px] bg-blueprint-blue transform -rotate-1"></div>
          <div className="absolute -bottom-4 right-0 w-3/4 h-[2px] bg-blueprint-blue-light transform rotate-2"></div>
        </h2>
        <p className="mt-8 font-mono text-center text-sketch-black/80 max-w-2xl">
          Everything you need to level up your programming journey, designed with precision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="group relative bg-white p-6 rough-border hover:-translate-y-2 transition-transform duration-300 shadow-[6px_6px_0px_#171717]"
          >
            {/* Sketchy pin at the top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blueprint-blue shadow-sm border border-sketch-black z-10"></div>
            
            <div className="mb-4 p-3 bg-blueprint-bg inline-block rough-border-blue transform -rotate-3 group-hover:rotate-0 transition-transform">
              {feature.icon}
            </div>
            <h3 className="font-sketch text-2xl font-bold mb-2 text-sketch-black">
              {feature.title}
            </h3>
            <p className="font-mono text-sm text-sketch-black/70 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
