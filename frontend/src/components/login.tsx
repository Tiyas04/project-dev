"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rough-border shadow-[8px_8px_0px_#171717] relative">
      {/* Tape-like elements for sketch style */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-gray-200/80 -rotate-2 z-10"></div>
      
      <div className="text-center mb-8 relative z-20">
        <h2 className="font-sketch text-4xl sm:text-5xl font-bold text-blueprint-blue mb-2">Login</h2>
        <p className="font-mono text-sm text-sketch-black/60">Welcome back to the Arena.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-20">
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-mono text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-mono text-sm font-bold text-sketch-black" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-paper font-mono text-sm rough-border focus:outline-none focus:ring-2 focus:ring-blueprint-blue/30 transition-shadow placeholder:text-sketch-black/30"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-mono text-sm font-bold text-sketch-black flex justify-between" htmlFor="password">
            <span>Password</span>
            <Link href="#" className="text-blueprint-blue hover:underline text-xs">Forgot?</Link>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-paper font-mono text-sm rough-border focus:outline-none focus:ring-2 focus:ring-blueprint-blue/30 transition-shadow placeholder:text-sketch-black/30"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          className="group relative flex items-center justify-center w-full mt-4 px-8 py-4 bg-blueprint-blue text-white font-bold font-mono text-lg rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]"
        >
          <span className="w-4 h-5 bg-white rounded-sm inline-block transform -rotate-12 group-hover:rotate-0 transition-transform mr-3"></span>
          Sign In
        </button>

        <div className="flex items-center gap-4 my-2">
          <div className="flex-1 h-px bg-sketch-black/20"></div>
          <span className="font-mono text-xs text-sketch-black/50 font-bold">OR</span>
          <div className="flex-1 h-px bg-sketch-black/20"></div>
        </div>

        <button 
          type="button" 
          className="group relative flex items-center justify-center w-full px-8 py-4 bg-white text-sketch-black font-bold font-mono text-lg rough-border hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
      </form>
    </div>
  );
}
