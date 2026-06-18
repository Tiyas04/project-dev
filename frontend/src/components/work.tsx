"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PenTool } from "lucide-react";

export function Work() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Calculate the strokeDashoffset and pointer position to draw the path based on scroll
  // Mapping [0, 0.8] instead of [0, 1] makes it complete faster
  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const pointerY = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

  const steps = [
    {
      num: "1",
      title: "Connect Profiles",
      duration: "Phase 1 - Onboarding",
      desc: "Link your LeetCode, Codeforces, and GitHub accounts securely.",
    },
    {
      num: "2",
      title: "Data Aggregation",
      duration: "Phase 2 - Synchronization",
      desc: "Our engine syncs your rating, contest history, and solved problems.",
    },
    {
      num: "3",
      title: "Analyze & Train",
      duration: "Phase 3 - Insights",
      desc: "Get your personalized Arena Score and AI-driven study plans.",
    },
    {
      num: "4",
      title: "Climb Leaderboards",
      duration: "Phase 4 - Growth",
      desc: "Compete with friends and the community to improve your rank.",
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 md:px-12 max-w-6xl mx-auto relative z-10" ref={containerRef}>
      
      <div className="flex flex-col items-center mb-32 relative z-20">
        <h2 className="font-sketch text-5xl md:text-7xl text-blueprint-blue font-bold tracking-widest uppercase">
          How It Works
        </h2>
      </div>

      <div className="relative flex flex-col w-full">
        
        {/* Central Animated Timeline Line (Desktop) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 hidden md:block z-0 pointer-events-none">
          {/* The faded background track */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0 border-l-4 border-dashed border-gray-200"></div>
          
          {/* The animated solid blue line */}
          <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[6px] bg-blueprint-blue"
            style={{ height: pointerY }}
          ></motion.div>

          {/* THE POINTER */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-blueprint-blue flex items-center justify-center bg-white rounded-full p-1 border-2 border-sketch-black shadow-sm"
            style={{ top: pointerY }}
          >
             <PenTool size={24} className="transform -scale-x-100 -translate-x-1 text-sketch-black" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Left-Aligned Animated Timeline Line (Mobile) */}
        <div className="absolute top-0 bottom-0 left-6 w-4 block md:hidden z-0 pointer-events-none">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0 border-l-4 border-dashed border-gray-200"></div>
          <motion.div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[6px] bg-blueprint-blue"
            style={{ height: pointerY }}
          ></motion.div>
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-blueprint-blue flex items-center justify-center bg-white rounded-full p-1 border-2 border-sketch-black shadow-sm"
            style={{ top: pointerY }}
          >
             <PenTool size={16} className="transform -scale-x-100 -translate-x-0.5 text-sketch-black" strokeWidth={1.5} />
          </motion.div>
        </div>

        <div className="flex flex-col w-full mt-10 relative z-10">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;

            return (
              <div key={index} className={`flex flex-col md:flex-row items-start md:items-center w-full max-w-5xl mx-auto mb-20 md:mb-32 group relative pl-16 md:pl-0 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                
                {/* Number Side */}
                <div className={`w-full md:w-1/2 flex justify-start md:justify-center ${isEven ? 'md:justify-end md:pr-16' : 'md:justify-start md:pl-16'} relative`}>
                  <span className={`font-sketch text-[80px] md:text-[180px] leading-none text-sketch-black/40 select-none drop-shadow-sm inline-block transform ${isEven ? '-rotate-3' : 'rotate-3'}`}>
                    {step.num}
                  </span>
                </div>
                
                {/* Content Side */}
                <div className={`w-full md:w-1/2 flex flex-col pt-2 md:pt-12 items-start md:items-center text-left md:text-center ${isEven ? 'md:items-start md:text-left md:pl-16' : 'md:items-end md:text-right md:pr-16'}`}>
                  <h3 className="font-sketch tracking-wide text-2xl md:text-5xl font-bold text-blueprint-blue mb-2 md:mb-4">
                    {step.title}
                  </h3>
                  <div className="w-full max-w-[200px] md:max-w-md border-b-2 border-dashed border-sketch-black/30 mb-2 md:mb-4"></div>
                  <p className="font-mono font-bold text-sketch-black mb-2 tracking-wide text-sm md:text-base">
                    {step.duration}
                  </p>
                  <p className="font-mono text-sketch-black/80 leading-relaxed max-w-md text-sm md:text-base">
                    {step.desc}
                  </p>
                </div>

                {/* Central connecting node (Desktop) */}
                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-blueprint-blue rounded-full z-10 transition-transform group-hover:scale-150"></div>
                
                {/* Side connecting node (Mobile) */}
                <div className="block md:hidden absolute left-6 top-[40px] -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blueprint-blue rounded-full z-10 transition-transform group-hover:scale-150"></div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
