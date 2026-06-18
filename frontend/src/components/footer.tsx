import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

const TwitterIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.076H5.078z"/>
  </svg>
);

const GithubIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="w-full py-16 px-6 md:px-12 mt-20 relative bg-white border-t-4 border-sketch-black border-dashed">
      
      {/* Decorative blueprint elements */}
      <div className="absolute top-[-10px] left-[10%] w-[2px] h-[20px] bg-sketch-black"></div>
      <div className="absolute top-[-10px] right-[10%] w-[2px] h-[20px] bg-sketch-black"></div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start text-center md:text-left relative z-10">
        
        {/* Left Side: Brand */}
        <div className="col-span-1 md:col-span-5 flex flex-col gap-4 items-center md:items-start">
          <div className="font-sketch text-4xl font-bold text-sketch-black flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-2xl rough-border-blue transform -rotate-3 hover:rotate-0 transition-transform">
              DA
            </div>
            DevArena
          </div>
          <p className="font-mono font-bold text-sketch-black/70 max-w-sm">
            The ultimate analytical platform for competitive programmers and ambitious developers.
          </p>
          <div className="flex gap-4 mt-2">
             <Link href="#" className="w-10 h-10 flex items-center justify-center bg-white border-2 border-sketch-black text-sketch-black hover:bg-blueprint-blue hover:text-white hover:border-blueprint-blue transition-colors transform -rotate-2 hover:rotate-2 shadow-[2px_2px_0px_#171717]">
               <TwitterIcon size={20} />
             </Link>
             <Link href="#" className="w-10 h-10 flex items-center justify-center bg-white border-2 border-sketch-black text-sketch-black hover:bg-blueprint-blue hover:text-white hover:border-blueprint-blue transition-colors transform rotate-3 hover:-rotate-3 shadow-[2px_2px_0px_#171717]">
               <GithubIcon size={20} />
             </Link>
             <Link href="mailto:hello@devarena.app" className="w-10 h-10 flex items-center justify-center bg-white border-2 border-sketch-black text-sketch-black hover:bg-blueprint-blue hover:text-white hover:border-blueprint-blue transition-colors transform -rotate-1 hover:rotate-1 shadow-[2px_2px_0px_#171717]">
               <Mail size={20} />
             </Link>
          </div>
        </div>

        {/* Middle: Links */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-3 font-mono text-sm uppercase tracking-widest text-sketch-black font-bold items-center md:items-start mt-2">
          <h4 className="text-blueprint-blue mb-2 font-sketch text-2xl tracking-wide normal-case">Navigation</h4>
          <Link href="#features" className="hover:text-blueprint-blue transition-colors relative group w-fit">
            Features
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
          <Link href="#about" className="hover:text-blueprint-blue transition-colors relative group w-fit">
            About
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
          <Link href="#how-it-works" className="hover:text-blueprint-blue transition-colors relative group w-fit">
            How it Works
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
          <Link href="#faqs" className="hover:text-blueprint-blue transition-colors relative group w-fit">
            FAQs
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
          </Link>
        </div>

        {/* Right Side: CTA */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-4 items-center md:items-start mt-2">
          <div className="font-sketch text-3xl font-bold text-sketch-black">
            Engineer Your <span className="text-blueprint-blue">Rating Growth.</span>
          </div>
          <p className="font-mono text-sm text-sketch-black/70 font-bold mb-2">
            Join the beta and start climbing the leaderboards today.
          </p>
          <Link href="/signup" className="px-6 py-3 bg-blueprint-blue text-white font-mono font-bold text-sm rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]">
            Get Early Access
          </Link>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t-2 border-sketch-black/20 flex flex-col md:flex-row items-center justify-between font-mono text-xs font-bold text-sketch-black/50 gap-4">
        <p>Built with ❤️ for developers.</p>
        <p>© {new Date().getFullYear()} DevArena. All rights reserved.</p>
      </div>
    </footer>
  );
}
