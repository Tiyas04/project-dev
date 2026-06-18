import React from "react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center pt-32 md:pt-20 pb-32 px-4 overflow-hidden">

            {/* Top Left Text */}
            <div className="absolute top-24 left-4 md:top-24 md:left-8 lg:top-20 lg:left-12 flex flex-col gap-1 md:gap-2 font-mono text-[8px] md:text-[10px] lg:text-xs tracking-widest text-sketch-black/40 lg:text-sketch-black/60 uppercase pointer-events-none z-0">
                <p>Competitive Programming</p>
                <p>Analytics Platform</p>
                <div className="flex gap-1 mt-1 lg:mt-2">
                    <div className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-gray-200/50 lg:bg-gray-200"></div>
                    <div className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-gray-200/50 lg:bg-gray-200 translate-y-2 md:translate-y-3 lg:translate-y-4"></div>
                </div>
            </div>

            {/* Right side vertical text */}
            <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 lg:right-12 flex flex-col gap-2 md:gap-4 font-mono text-[8px] md:text-[10px] lg:text-sm font-bold tracking-widest items-center text-sketch-black/30 lg:text-sketch-black pointer-events-none z-0">
                <div className="flex flex-col items-center gap-1">
                    <span>A</span><span>N</span><span>A</span><span>L</span><span>Y</span><span>Z</span><span>E</span>
                </div>
                <div className="w-px h-6 lg:h-8 bg-sketch-black/50 lg:bg-sketch-black rough-border"></div>
                <div className="flex flex-col items-center gap-1">
                    <span>I</span><span>M</span><span>P</span><span>R</span><span>O</span><span>V</span><span>E</span>
                </div>
                <div className="w-px h-6 lg:h-8 bg-sketch-black/50 lg:bg-sketch-black rough-border"></div>
                <div className="flex flex-col items-center gap-1">
                    <span>C</span><span>L</span><span>I</span><span>M</span><span>B</span>
                </div>
            </div>

            <div className="relative flex flex-col items-center max-w-5xl mx-auto w-full z-10">

                {/* Main Title Area with Measurements */}
                <div className="relative mb-24 mt-24 md:mt-16 flex flex-col items-center">

                    <div className="relative inline-flex items-center">

                        {/* Dev Block */}
                        <div className="relative px-1 md:px-4 py-2">
                            {/* Vertical lines sticking out */}
                            <div className="absolute -top-6 -bottom-4 md:-top-12 md:-bottom-8 left-0 w-px bg-sketch-black/30"></div>
                            <div className="absolute -top-4 -bottom-6 md:-top-8 md:-bottom-12 right-0 w-px bg-sketch-black/30"></div>

                            {/* Horizontal lines sticking out */}
                            <div className="absolute -left-4 -right-2 md:-left-16 md:-right-8 top-2 md:top-4 h-px bg-sketch-black/30"></div>
                            <div className="absolute -left-4 -right-2 md:-left-16 md:-right-8 bottom-4 md:bottom-8 h-px bg-sketch-black/30"></div>

                            {/* 20cm measurement */}
                            <div className="absolute -top-4 md:-top-8 left-0 right-0 flex items-center text-sketch-black/60">
                                <svg width="4" height="6" viewBox="0 0 6 10" fill="none" className="md:w-[6px] md:h-[10px]"><path d="M5 1L1 5L5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex-1 h-px bg-sketch-black/40"></div>
                                <span className="px-1 md:px-2 text-[8px] md:text-xs font-mono">20cm</span>
                                <div className="flex-1 h-px bg-sketch-black/40"></div>
                                <svg width="4" height="6" viewBox="0 0 6 10" fill="none" className="md:w-[6px] md:h-[10px]"><path d="M1 1L5 5L1 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>

                            {/* Text */}
                            <span className="font-sketch text-5xl sm:text-6xl md:text-8xl lg:text-[140px] font-bold text-blueprint-blue leading-none tracking-tight">Dev</span>
                        </div>

                        {/* Gap Block 0.5cm */}
                        <div className="relative w-4 sm:w-6 md:w-12 flex items-center justify-center h-full">
                            {/* 0.5cm measurement */}
                            <div className="absolute -bottom-4 md:-bottom-6 w-full flex flex-col items-center text-sketch-black/60">
                                <div className="w-full flex items-center">
                                    <svg width="2" height="4" viewBox="0 0 6 10" fill="none" className="md:w-[4px] md:h-[8px]"><path d="M5 1L1 5L5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <div className="flex-1 h-px bg-sketch-black/40"></div>
                                    <svg width="2" height="4" viewBox="0 0 6 10" fill="none" className="md:w-[4px] md:h-[8px]"><path d="M1 1L5 5L1 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                                <span className="text-[6px] md:text-[10px] font-mono mt-1">5cm</span>
                            </div>
                        </div>

                        {/* Arena Block */}
                        <div className="relative px-1 md:px-4 py-2">
                            {/* Vertical lines */}
                            <div className="absolute -top-2 -bottom-4 md:-top-4 md:-bottom-8 left-0 w-px bg-sketch-black/30"></div>
                            <div className="absolute -top-4 -bottom-10 md:-top-8 md:-bottom-20 right-0 w-px bg-sketch-black/30"></div>

                            {/* Horizontal lines */}
                            <div className="absolute -left-2 -right-4 md:-left-4 md:-right-12 top-2 md:top-4 h-px bg-sketch-black/30"></div>
                            <div className="absolute -left-2 -right-4 md:-left-4 md:-right-12 bottom-4 md:bottom-8 h-px bg-sketch-black/30"></div>

                            {/* 25cm measurement */}
                            <div className="absolute -top-4 md:-top-6 left-0 right-0 flex items-center text-sketch-black/60">
                                <svg width="4" height="6" viewBox="0 0 6 10" fill="none" className="md:w-[6px] md:h-[10px]"><path d="M5 1L1 5L5 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className="flex-1 h-px bg-sketch-black/40"></div>
                                <span className="px-1 md:px-2 text-[8px] md:text-xs font-mono">25cm</span>
                                <div className="flex-1 h-px bg-sketch-black/40"></div>
                                <svg width="4" height="6" viewBox="0 0 6 10" fill="none" className="md:w-[6px] md:h-[10px]"><path d="M1 1L5 5L1 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>

                            {/* Text */}
                            <span
                                className="font-sketch text-5xl sm:text-6xl md:text-8xl lg:text-[140px] font-bold leading-none tracking-tight text-white drop-shadow-[2px_2px_0px_#171717] md:drop-shadow-[4px_4px_0px_#171717]"
                                style={{ WebkitTextStroke: '2px #171717' }}
                            >
                                Arena
                            </span>
                        </div>

                    </div>
                </div>
                {/* Tagline */}
                <div className="font-mono text-sm sm:text-xl md:text-2xl font-bold mt-8 md:mt-12 mb-8 md:mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sketch-black">
                    <span className="text-blueprint-blue">Track.</span>
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-sketch-black rounded-full"></span>
                    <span>Analyze.</span>
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-sketch-black rounded-full"></span>
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
