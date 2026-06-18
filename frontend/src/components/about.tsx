import React from "react";

export function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 max-w-6xl mx-auto relative z-10">
      
      {/* Decorative Blueprint elements */}
      <div className="absolute top-10 left-0 w-24 h-24 border border-blueprint-blue/20 rounded-full border-dashed hidden md:block"></div>
      <div className="absolute bottom-10 right-0 w-32 h-32 border border-blueprint-blue/20 border-dashed hidden md:block"></div>
      <div className="absolute top-1/2 left-4 w-2 h-2 bg-blueprint-blue/50"></div>
      
      <div className="flex flex-col md:flex-row gap-12 items-center">
        
        <div className="flex-1">
          <h2 className="font-sketch text-5xl md:text-6xl text-sketch-black font-bold mb-6">
            About DevArena
          </h2>
          <p className="font-mono text-sketch-black/80 mb-6 leading-relaxed">
            DevArena is born from the need to have a unified view of your competitive programming journey. Instead of jumping between LeetCode, Codeforces, and other platforms, we bring all your stats into one powerful dashboard.
          </p>
          <p className="font-mono text-sketch-black/80 mb-8 leading-relaxed">
            Our goal is to help you analyze your weaknesses, track your rating growth over time, and provide actionable AI-driven insights so you can focus on what matters: climbing the leaderboard.
          </p>
        </div>

        <div className="flex-1 w-full relative">
          <div className="aspect-video bg-white flex flex-col items-center justify-center rough-border shadow-[8px_8px_0px_#171717] p-8">
             <div className="w-full flex justify-between items-end h-32 border-b-2 border-sketch-black mb-4 gap-4 px-4">
                <div className="w-1/4 bg-blueprint-blue/30 h-[40%] relative"><span className="absolute -top-6 text-xs font-mono w-full text-center">Week 1</span></div>
                <div className="w-1/4 bg-blueprint-blue/60 h-[60%] relative"><span className="absolute -top-6 text-xs font-mono w-full text-center">Week 2</span></div>
                <div className="w-1/4 bg-blueprint-blue h-[90%] relative"><span className="absolute -top-6 text-xs font-mono w-full text-center">Week 3</span></div>
             </div>
             <span className="font-sketch text-2xl text-sketch-black">Your Growth</span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
