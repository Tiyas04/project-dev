"use client";

import React, { useState } from "react";
import { Login } from "@/components/login";
import { Signup } from "@/components/signup";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
    <Navbar />
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center mt-8 py-20 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-40 left-10 md:left-20 w-32 h-32 border-2 border-sketch-black/20 rounded-full border-dashed pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 md:right-20 w-40 h-40 border-2 border-blueprint-blue/20 rotate-45 pointer-events-none"></div>
      
      {/* Ruler-like line */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-64 border-r-2 border-sketch-black/20 pointer-events-none hidden md:flex flex-col justify-between py-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full h-px bg-sketch-black/20"></div>
        ))}
      </div>

      <div className="w-full max-w-md mb-8 flex justify-center z-10 relative">
        <div className="inline-flex bg-paper rough-border p-1 shadow-[4px_4px_0px_#171717]">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-8 py-2 font-mono font-bold text-sm transition-colors rounded-xl ${
              isLogin 
                ? "bg-sketch-black text-white" 
                : "text-sketch-black hover:bg-gray-100"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-8 py-2 font-mono font-bold text-sm transition-colors rounded-xl ${
              !isLogin 
                ? "bg-sketch-black text-white" 
                : "text-sketch-black hover:bg-gray-100"
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {isLogin ? <Login /> : <Signup />}
      </div>
      
      {/* Decorative text */}
      <div className="mt-12 text-center font-mono text-xs text-sketch-black/40 uppercase tracking-widest pointer-events-none">
        <p>Authentication Module</p>
        <p>Secure Access Required</p>
      </div>
    </div>
    <Footer />
    </>
  );
}
