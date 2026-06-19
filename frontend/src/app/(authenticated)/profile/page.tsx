"use client";

import React, { useState } from "react";
import { User, Mail, Link as LinkIcon, Code2, Camera } from "lucide-react";

export default function Profile() {
  const [name, setName] = useState("John Doe");
  const [username, setUsername] = useState("johndoe_123");
  const [email, setEmail] = useState("john@example.com");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blueprint-blue text-white flex items-center justify-center font-sketch text-3xl rough-border-blue transform -rotate-6">
          <User size={28} />
        </div>
        <h1 className="font-sketch text-4xl md:text-5xl text-sketch-black">
          User Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Integrations */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-dashed border-blueprint-blue bg-paper flex items-center justify-center">
                <img src="https://cdn-icons-png.flaticon.com/512/5951/5951752.png" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 bg-blueprint-blue text-white p-2 rounded-full hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="font-mono text-xl font-bold text-sketch-black">{name}</h2>
            <p className="font-mono text-sm text-sketch-black/60">@{username}</p>
          </div>

          <div className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717]">
            <h3 className="font-mono text-lg font-bold text-sketch-black mb-4 flex items-center gap-2">
              <LinkIcon size={18} />
              Connected Platforms
            </h3>
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-between w-full py-3 px-4 bg-paper rough-border hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-sketch-black">
                  <Code2 size={16} />
                  LeetCode
                </div>
                <span className="text-xs font-mono bg-blueprint-blue text-white px-2 py-1 rounded">Connect</span>
              </button>
              
              <button className="flex items-center justify-between w-full py-3 px-4 bg-paper rough-border hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-sketch-black">
                  <Code2 size={16} />
                  Codeforces
                </div>
                <span className="text-xs font-mono bg-blueprint-blue text-white px-2 py-1 rounded">Connect</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rough-border shadow-[4px_4px_0px_#171717]">
            <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 border-b-2 border-dashed border-sketch-black pb-4">
              Account Details
            </h3>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Profile updated!"); }}>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm font-bold text-sketch-black" htmlFor="name">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sketch-black/50">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-paper rough-border focus:outline-none focus:border-blueprint-blue font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm font-bold text-sketch-black" htmlFor="username">Username</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sketch-black/50">
                    <span className="font-bold text-lg leading-none">@</span>
                  </div>
                  <input 
                    type="text" 
                    id="username"
                    value={username}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rough-border text-sketch-black/60 focus:outline-none font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-xs font-mono text-sketch-black/50">Username cannot be changed.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-sm font-bold text-sketch-black" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sketch-black/50">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-paper rough-border focus:outline-none focus:border-blueprint-blue font-mono transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="group relative flex items-center justify-center w-full mt-8 px-8 py-4 bg-blueprint-blue text-white font-bold font-mono text-lg rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717]"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
