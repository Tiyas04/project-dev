import React from "react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
      
      {/* Top Left Text */}
      <div className="absolute top-12 left-12 hidden lg:flex flex-col gap-2 font-mono text-xs tracking-widest text-sketch-black/60 uppercase">
        <p>Competitive Programming</p>
        <p>Analytics Platform</p>
        <div className="flex gap-1 mt-2">
          <div className="w-8 h-8 bg-gray-200"></div>
          <div className="w-8 h-8 bg-gray-200 translate-y-4"></div>
        </div>
      </div>

      {/* Right side vertical text */}
      <div className="absolute top-1/2 -translate-y-1/2 right-12 hidden lg:flex flex-col gap-4 font-mono text-sm font-bold tracking-widest items-center">
        <div className="flex flex-col items-center gap-1">
          <span>A</span><span>N</span><span>A</span><span>L</span><span>Y</span><span>Z</span><span>E</span>
        </div>
        <div className="w-px h-8 bg-sketch-black rough-border"></div>
        <div className="flex flex-col items-center gap-1">
          <span>I</span><span>M</span><span>P</span><span>R</span><span>O</span><span>V</span><span>E</span>
        </div>
        <div className="w-px h-8 bg-sketch-black rough-border"></div>
        <div className="flex flex-col items-center gap-1">
          <span>C</span><span>L</span><span>I</span><span>M</span><span>B</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center max-w-5xl mx-auto w-full z-10">
        
        {/* Main Title Area with Measurements */}
        <div className="relative mb-24 mt-16 flex flex-col items-center">
          
          <div className="relative inline-flex items-center">
            
            {/* Dev Block */}
            <div className="relative px-2 md:px-4 py-2">
              {/* Vertical lines sticking out */}
              <div className="absolute -top-12 -bottom-8 left-0 w-px bg-sketch-black/30"></div>
              <div className="absolute -top-8 -bottom-12 right-0 w-px bg-sketch-black/30"></div>
              
              {/* Horizontal lines sticking out */}
              <div className="absolute -left-16 -right-8 top-4 h-px bg-sketch-black/30"></div>
              <div className="absolute -left-16 -right-8 bottom-8 h-px bg-sketch-black/30"></div>

              {/* 20cm measurement */}
              <div className="absolute -top-8 left-0 right-0 flex items-center text-sketch-black/60">
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M5 1L1 5L5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="flex-1 h-px bg-sketch-black/40"></div>
                <span className="px-2 text-xs font-mono">20cm</span>
                <div className="flex-1 h-px bg-sketch-black/40"></div>
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>

              {/* Text */}
              <span className="font-sketch text-7xl md:text-9xl lg:text-[140px] font-bold text-blueprint-blue leading-none tracking-tight">Dev</span>
            </div>

            {/* Gap Block 0.5cm */}
            <div className="relative w-8 md:w-12 flex items-center justify-center h-full">
              {/* 0.5cm measurement */}
              <div className="absolute -bottom-6 w-full flex flex-col items-center text-sketch-black/60">
                <div className="w-full flex items-center">
                  <svg width="4" height="8" viewBox="0 0 6 10" fill="none"><path d="M5 1L1 5L5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div className="flex-1 h-px bg-sketch-black/40"></div>
                  <svg width="4" height="8" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-[10px] font-mono mt-1">5cm</span>
              </div>
            </div>

            {/* Arena Block */}
            <div className="relative px-2 md:px-4 py-2">
              {/* Vertical lines */}
              <div className="absolute -top-4 -bottom-8 left-0 w-px bg-sketch-black/30"></div>
              <div className="absolute -top-8 -bottom-20 right-0 w-px bg-sketch-black/30"></div>

              {/* Horizontal lines */}
              <div className="absolute -left-4 -right-12 top-4 h-px bg-sketch-black/30"></div>
              <div className="absolute -left-4 -right-12 bottom-8 h-px bg-sketch-black/30"></div>

              {/* 25cm measurement */}
              <div className="absolute -top-6 left-0 right-0 flex items-center text-sketch-black/60">
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M5 1L1 5L5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="flex-1 h-px bg-sketch-black/40"></div>
                <span className="px-2 text-xs font-mono">25cm</span>
                <div className="flex-1 h-px bg-sketch-black/40"></div>
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>

              {/* Text */}
              <span 
                className="font-sketch text-7xl md:text-9xl lg:text-[140px] font-bold leading-none tracking-tight text-white drop-shadow-[4px_4px_0px_#171717]"
                style={{ WebkitTextStroke: '2px #171717' }}
              >
                Arena
              </span>
            </div>

          </div>
        </div>
        {/* Tagline */}
        <div className="font-mono text-xl md:text-2xl font-bold mt-12 mb-10 flex items-center justify-center gap-4 text-sketch-black">
          <span className="text-blueprint-blue">Track.</span>
          <span className="w-1.5 h-1.5 bg-sketch-black rounded-full"></span>
          <span>Analyze.</span>
          <span className="w-1.5 h-1.5 bg-sketch-black rounded-full"></span>
          <span>Dominate.</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 px-4">
          <Link href="/signup" className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-blueprint-blue text-white font-bold font-mono text-lg rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]">
            <span className="w-4 h-5 bg-white rounded-sm inline-block transform -rotate-12 group-hover:rotate-0 transition-transform"></span>
            Get Started
          </Link>
          <Link href="#features" className="flex items-center justify-center px-8 py-4 bg-white text-sketch-black font-bold font-mono text-lg rough-border border-sketch-black hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]">
             Learn More
          </Link>
        </div>

      </div>
    </section>
  );
}
