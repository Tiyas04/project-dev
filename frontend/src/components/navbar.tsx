import Link from "next/link";
import React from "react";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full py-4 px-6 md:px-12 flex items-center justify-between z-50 bg-white border-b-2 border-sketch-black border-dashed">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 flex-1">
        <div className="w-10 h-10 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-2xl rough-border-blue transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
          DA
        </div>
      </div>
      
      {/* Middle: Links */}
      <nav className="hidden md:flex flex-1 justify-center gap-8 font-mono text-sm uppercase tracking-widest text-sketch-black font-bold">
        <Link href="/" className="hover:text-blueprint-blue transition-colors relative group">
          Home
          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
        </Link>
        <Link href="#features" className="hover:text-blueprint-blue transition-colors relative group">
          Features
          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
        </Link>
        <Link href="#about" className="hover:text-blueprint-blue transition-colors relative group">
          About
          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
        </Link>
        <Link href="#how-it-works" className="hover:text-blueprint-blue transition-colors relative group">
          How It Works
          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
        </Link>
        <Link href="#faqs" className="hover:text-blueprint-blue transition-colors relative group">
          FAQs
          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blueprint-blue origin-left scale-x-0 transition-transform group-hover:scale-x-100 rough-border"></span>
        </Link>
      </nav>

      {/* Right: Auth Buttons */}
      <div className="hidden md:flex flex-1 justify-end items-center gap-4">
        <Link href="/login" className="font-mono font-bold text-sketch-black hover:text-blueprint-blue transition-colors">
          Login
        </Link>
        <Link href="/signup" className="px-6 py-2 bg-blueprint-blue text-white font-mono font-bold rough-border-blue hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_#171717]">
          Sign Up
        </Link>
      </div>

      {/* Mobile menu button */}
      <button className="md:hidden rough-border p-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>
    </header>
  );
}
