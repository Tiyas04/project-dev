"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Mail, Link as LinkIcon, Code2, Camera, Download, QrCode, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const { user, updateAvatar } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [issueDate, setIssueDate] = useState("");
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set date only on client side to avoid SSR hydration mismatch
    setIssueDate(new Date().toLocaleDateString());
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUpdatingAvatar(true);
      try {
        await updateAvatar(e.target.files[0]);
      } catch (err) {
        console.error("Failed to update avatar", err);
      } finally {
        setIsUpdatingAvatar(false);
      }
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUpdatingAvatar(true);
    try {
      await updateAvatar(null);
    } catch (err) {
      console.error("Failed to delete avatar", err);
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleDownloadCard = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { 
          backgroundColor: "#f8f9fa", // Match bg-paper approximately
          pixelRatio: 2, // High-res capture
          skipFonts: true // Skip web font embedding to prevent CORS SecurityError from external stylesheets
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${username}-coder-card.png`;
        link.click();
      } catch (err) {
        console.error("Failed to generate image:", err);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
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
                {user?.avatar && user.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png" ? (
                  <img 
                    src={user.avatar.replace("http://", "https://")} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    crossOrigin="anonymous"
                  />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-sketch-black/30">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdatingAvatar}
                className="absolute bottom-0 right-0 bg-blueprint-blue text-white p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-50">
                <Camera size={18} />
              </button>
              {user?.avatar && user.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png" && (
                <button 
                  onClick={handleDeleteAvatar}
                  disabled={isUpdatingAvatar}
                  className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-50">
                  <Trash2 size={16} />
                </button>
              )}
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </div>
            <h2 className="font-mono text-xl font-bold text-sketch-black">{name || "Coder"}</h2>
            <p className="font-mono text-sm text-sketch-black/60">@{username || "user"}</p>
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
        <div className="md:col-span-2 space-y-8">
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

          {/* ID Card Generator Section */}
          <div className="bg-white p-8 rough-border shadow-[4px_4px_0px_#171717]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b-2 border-dashed border-sketch-black pb-4">
              <div>
                <h3 className="font-mono text-xl font-bold text-sketch-black flex items-center gap-2">
                  <Code2 size={24} className="text-blueprint-blue" />
                  Coder ID Card
                </h3>
                <p className="font-mono text-xs text-sketch-black/60 mt-1">Download and share your stats!</p>
              </div>
              <button 
                onClick={handleDownloadCard}
                className="flex items-center gap-2 px-4 py-2 bg-sketch-black text-white font-mono font-bold rough-border hover:bg-blueprint-blue transition-colors shadow-[2px_2px_0px_#1E3A8A]"
              >
                <Download size={18} />
                Download PNG
              </button>
            </div>

            <div className="flex justify-center overflow-x-auto pb-4">
              {/* The actual ID card element to capture */}
              <div 
                ref={cardRef} 
                className="w-[400px] h-[250px] bg-paper rough-border p-6 flex flex-col justify-between relative overflow-hidden"
                style={{ 
                  backgroundImage: "radial-gradient(#ccc 1px, transparent 1px)", 
                  backgroundSize: "20px 20px" 
                }}
              >
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 w-full h-4 bg-blueprint-blue" />
                
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <h2 className="font-sketch text-3xl text-sketch-black uppercase leading-none tracking-wide">{name || "Coder"}</h2>
                    <p className="font-mono text-xs font-bold text-blueprint-blue mt-1">@{username || "user"} // ELITE CODER</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-sketch-black overflow-hidden bg-white shrink-0 shadow-sm flex items-center justify-center">
                    {user?.avatar && user.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png" ? (
                      <img 
                        src={user.avatar.replace("http://", "https://")} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-sketch-black/30">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 font-mono">
                  <div className="bg-white p-2 border-2 border-sketch-black shadow-sm">
                    <p className="text-[10px] text-sketch-black/60 font-bold uppercase">LeetCode Solved</p>
                    <p className="text-xl font-bold text-sketch-black">342</p>
                  </div>
                  <div className="bg-white p-2 border-2 border-sketch-black shadow-sm">
                    <p className="text-[10px] text-sketch-black/60 font-bold uppercase">CF Rating</p>
                    <p className="text-xl font-bold text-blueprint-blue">1450</p>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t-2 border-sketch-black pt-2">
                  <p className="font-mono text-[10px] font-bold text-sketch-black/80">ISSUED: {issueDate || "..."}</p>
                  <QrCode size={32} className="text-sketch-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
