"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, Mail, Link as LinkIcon, Code2, Camera, Download, QrCode, Trash2, Trophy } from "lucide-react";
import { toPng } from "html-to-image";
import { useAuth } from "@/context/AuthContext";
import { FollowersModal } from "@/components/followers-modal";
import { useQRCode } from "next-qrcode";

export default function Profile() {
  const { user, updateAvatar, updateProfile, connectPlatform, disconnectPlatform } = useAuth();
  const { Canvas } = useQRCode();

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [issueDate, setIssueDate] = useState("");
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [lcUsername, setLcUsername] = useState("");
  const [cfUsername, setCfUsername] = useState("");
  const [ghUsername, setGhUsername] = useState("");

  const [isConnecting, setIsConnecting] = useState<Record<string, boolean>>({});
  const [isDisconnecting, setIsDisconnecting] = useState<Record<string, boolean>>({});
  const [connectionError, setConnectionError] = useState<Record<string, string>>({});

  // Follower/Following modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following" | "friends">("followers");

  // Data URLs for card capture to bypass CORS taint
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");

  const hasConnections = !!(user?.leetcode || user?.codeforces || user?.github);
  const connectedPlatformsCount = [user?.leetcode, user?.codeforces, user?.github].filter(Boolean).length;

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

  // Generate profile URL for the QR code
  useEffect(() => {
    if (typeof window !== "undefined" && user?.username) {
      setProfileUrl(`${window.location.origin}/user/${user.username}`);
    }
  }, [user?.username]);

  // Fetch Avatar as Base64 to prevent canvas taint during download
  useEffect(() => {
    if (user?.avatar && user.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png") {
      const imgUrl = user.avatar.replace("http://", "https://");
      fetch(imgUrl)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setAvatarDataUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        })
        .catch(err => {
          console.error("Failed to load avatar as Data URL:", err);
          setAvatarDataUrl(imgUrl);
        });
    } else {
      setAvatarDataUrl("");
    }
  }, [user?.avatar]);

  const handleConnect = async (platform: "leetcode" | "codeforces" | "github", usernameVal: string) => {
    if (!usernameVal.trim()) return;
    setIsConnecting(prev => ({ ...prev, [platform]: true }));
    setConnectionError(prev => ({ ...prev, [platform]: "" }));
    try {
      await connectPlatform(platform, usernameVal.trim());
      if (platform === "leetcode") setLcUsername("");
      if (platform === "codeforces") setCfUsername("");
      if (platform === "github") setGhUsername("");
    } catch (err: any) {
      console.error(err);
      setConnectionError(prev => ({
        ...prev,
        [platform]: err.response?.data?.message || `Failed to connect to ${platform}. Please check the username.`
      }));
    } finally {
      setIsConnecting(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleDisconnect = async (platform: "leetcode" | "codeforces" | "github") => {
    setIsDisconnecting(prev => ({ ...prev, [platform]: true }));
    setConnectionError(prev => ({ ...prev, [platform]: "" }));
    try {
      await disconnectPlatform(platform);
    } catch (err: any) {
      console.error(err);
      setConnectionError(prev => ({
        ...prev,
        [platform]: err.response?.data?.message || `Failed to disconnect from ${platform}.`
      }));
    } finally {
      setIsDisconnecting(prev => ({ ...prev, [platform]: false }));
    }
  };

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

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await updateProfile({ name, email, username });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to save changes", err);
      setSaveError(err.response?.data?.message || "Failed to update profile details.");
    } finally {
      setIsSaving(false);
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
            <p className="font-mono text-sm text-sketch-black/60 mb-2">@{username || "user"}</p>
            
            {/* Clickable followers and following stats */}
            <div className="flex flex-wrap gap-2 font-mono text-xs font-bold mb-4">
              <button
                type="button"
                onClick={() => {
                  setModalType("followers");
                  setModalOpen(true);
                }}
                className="flex items-center gap-1 bg-paper border border-sketch-black/10 px-2 py-1 rounded shadow-sm hover:border-blueprint-blue hover:text-blueprint-blue transition-colors cursor-pointer"
              >
                Followers: <span className="text-blueprint-blue">{user?.followersCount ?? 0}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalType("following");
                  setModalOpen(true);
                }}
                className="flex items-center gap-1 bg-paper border border-sketch-black/10 px-2 py-1 rounded shadow-sm hover:border-blueprint-blue hover:text-blueprint-blue transition-colors cursor-pointer"
              >
                Following: <span className="text-blueprint-blue">{user?.followingCount ?? 0}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalType("friends");
                  setModalOpen(true);
                }}
                className="flex items-center gap-1 bg-paper border border-sketch-black/10 px-2 py-1 rounded shadow-sm hover:border-green-600 hover:text-green-600 transition-colors cursor-pointer"
              >
                Friends: <span className="text-green-600">{user?.friendsCount ?? 0}</span>
              </button>
            </div>
            
            {/* Share Profile button */}
            <button
              onClick={() => {
                const profileUrl = `${window.location.origin}/user/${username}`;
                navigator.clipboard.writeText(profileUrl);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-sketch-black bg-blueprint-blue hover:bg-blue-900 text-white font-mono text-xs font-bold shadow-[2px_2px_0px_#171717] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
            >
              <LinkIcon size={14} />
              {shareCopied ? "Copied!" : "Share Profile"}
            </button>
          </div>

          <div className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717] mb-8">
            <h3 className="font-mono text-lg font-bold text-sketch-black mb-2 flex items-center gap-2">
              <Trophy size={18} className="text-blueprint-blue" />
              DevArena Score
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-sketch font-bold text-sketch-black">{user?.devArenaScore || 0}</span>
              <span className="text-sm font-mono text-sketch-black/60 pb-1">pts</span>
            </div>
            <p className="font-mono text-[10px] text-sketch-black/50 mt-2">Calculated from LeetCode, Codeforces, & GitHub.</p>
          </div>

          <div className="bg-white p-6 rough-border shadow-[4px_4px_0px_#171717]">
            <h3 className="font-mono text-lg font-bold text-sketch-black mb-4 flex items-center gap-2">
              <LinkIcon size={18} />
              Connected Platforms
            </h3>
            <div className="flex flex-col gap-4">
              {/* LeetCode */}
              <div className="flex flex-col gap-2 p-3 bg-paper rough-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sketch-black">
                    <Code2 size={14} className="text-orange-500" />
                    LeetCode
                  </div>
                  {user?.leetcode ? (
                    <span className="text-[10px] font-mono bg-green-100 border border-green-400 text-green-700 px-1.5 py-0.5 rounded font-bold">Connected</span>
                  ) : (
                    <span className="text-[10px] font-mono bg-gray-100 border border-gray-400 text-gray-600 px-1.5 py-0.5 rounded font-medium">Disconnected</span>
                  )}
                </div>
                {user?.leetcode ? (
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-sm text-sketch-black font-bold">@{user.leetcode}</span>
                    <button
                      type="button"
                      disabled={isDisconnecting["leetcode"]}
                      onClick={() => handleDisconnect("leetcode")}
                      className="text-xs font-mono text-red-500 hover:text-red-700 font-bold underline disabled:opacity-50 cursor-pointer"
                    >
                      {isDisconnecting["leetcode"] ? "Disconnecting..." : "Disconnect"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Username..."
                      value={lcUsername}
                      disabled={isConnecting["leetcode"]}
                      onChange={(e) => setLcUsername(e.target.value)}
                      className="w-full px-2 py-1 bg-white rough-border text-xs font-mono outline-none disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      disabled={isConnecting["leetcode"] || !lcUsername.trim()}
                      onClick={() => handleConnect("leetcode", lcUsername)}
                      className="w-full text-xs font-mono bg-blueprint-blue text-white py-1.5 font-bold border-2 border-sketch-black shadow-[2px_2px_0px_#171717] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-center block disabled:opacity-55"
                    >
                      {isConnecting["leetcode"] ? "Connecting..." : "Connect LeetCode"}
                    </button>
                  </div>
                )}
                {connectionError["leetcode"] && (
                  <p className="text-[10px] font-mono text-red-500 mt-1 font-bold">{connectionError["leetcode"]}</p>
                )}
              </div>

              {/* Codeforces */}
              <div className="flex flex-col gap-2 p-3 bg-paper rough-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sketch-black">
                    <Code2 size={14} className="text-blue-500" />
                    Codeforces
                  </div>
                  {user?.codeforces ? (
                    <span className="text-[10px] font-mono bg-green-100 border border-green-400 text-green-700 px-1.5 py-0.5 rounded font-bold">Connected</span>
                  ) : (
                    <span className="text-[10px] font-mono bg-gray-100 border border-gray-400 text-gray-600 px-1.5 py-0.5 rounded font-medium">Disconnected</span>
                  )}
                </div>
                {user?.codeforces ? (
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-sm text-sketch-black font-bold">@{user.codeforces}</span>
                    <button
                      type="button"
                      disabled={isDisconnecting["codeforces"]}
                      onClick={() => handleDisconnect("codeforces")}
                      className="text-xs font-mono text-red-500 hover:text-red-700 font-bold underline disabled:opacity-50 cursor-pointer"
                    >
                      {isDisconnecting["codeforces"] ? "Disconnecting..." : "Disconnect"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Username..."
                      value={cfUsername}
                      disabled={isConnecting["codeforces"]}
                      onChange={(e) => setCfUsername(e.target.value)}
                      className="w-full px-2 py-1 bg-white rough-border text-xs font-mono outline-none disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      disabled={isConnecting["codeforces"] || !cfUsername.trim()}
                      onClick={() => handleConnect("codeforces", cfUsername)}
                      className="w-full text-xs font-mono bg-blueprint-blue text-white py-1.5 font-bold border-2 border-sketch-black shadow-[2px_2px_0px_#171717] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-center block disabled:opacity-55"
                    >
                      {isConnecting["codeforces"] ? "Connecting..." : "Connect Codeforces"}
                    </button>
                  </div>
                )}
                {connectionError["codeforces"] && (
                  <p className="text-[10px] font-mono text-red-500 mt-1 font-bold">{connectionError["codeforces"]}</p>
                )}
              </div>

              {/* GitHub */}
              <div className="flex flex-col gap-2 p-3 bg-paper rough-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-sketch-black">
                    <Code2 size={14} className="text-sketch-black" />
                    GitHub
                  </div>
                  {user?.github ? (
                    <span className="text-[10px] font-mono bg-green-100 border border-green-400 text-green-700 px-1.5 py-0.5 rounded font-bold">Connected</span>
                  ) : (
                    <span className="text-[10px] font-mono bg-gray-100 border border-gray-400 text-gray-600 px-1.5 py-0.5 rounded font-medium">Disconnected</span>
                  )}
                </div>
                {user?.github ? (
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-sm text-sketch-black font-bold">@{user.github}</span>
                    <button
                      type="button"
                      disabled={isDisconnecting["github"]}
                      onClick={() => handleDisconnect("github")}
                      className="text-xs font-mono text-red-500 hover:text-red-700 font-bold underline disabled:opacity-50 cursor-pointer"
                    >
                      {isDisconnecting["github"] ? "Disconnecting..." : "Disconnect"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Username..."
                      value={ghUsername}
                      disabled={isConnecting["github"]}
                      onChange={(e) => setGhUsername(e.target.value)}
                      className="w-full px-2 py-1 bg-white rough-border text-xs font-mono outline-none disabled:bg-gray-100"
                    />
                    <button
                      type="button"
                      disabled={isConnecting["github"] || !ghUsername.trim()}
                      onClick={() => handleConnect("github", ghUsername)}
                      className="w-full text-xs font-mono bg-blueprint-blue text-white py-1.5 font-bold border-2 border-sketch-black shadow-[2px_2px_0px_#171717] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-center block disabled:opacity-55"
                    >
                      {isConnecting["github"] ? "Connecting..." : "Connect GitHub"}
                    </button>
                  </div>
                )}
                {connectionError["github"] && (
                  <p className="text-[10px] font-mono text-red-500 mt-1 font-bold">{connectionError["github"]}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rough-border shadow-[4px_4px_0px_#171717]">
            <h3 className="font-mono text-xl font-bold text-sketch-black mb-6 border-b-2 border-dashed border-sketch-black pb-4">
              Account Details
            </h3>

            <form className="space-y-6" onSubmit={handleSaveChanges}>
              {saveError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-mono text-sm">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded font-mono text-sm">
                  Profile details updated successfully!
                </div>
              )}

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
                    required
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
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-paper rough-border focus:outline-none focus:border-blueprint-blue font-mono transition-colors"
                  />
                </div>
                <p className="text-xs font-mono text-sketch-black/50">Username must be unique.</p>
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
                    required
                    className="w-full pl-10 pr-4 py-3 bg-paper rough-border focus:outline-none focus:border-blueprint-blue font-mono transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="group relative flex items-center justify-center w-full mt-8 px-8 py-4 bg-blueprint-blue text-white font-bold font-mono text-lg rough-border-blue hover:-translate-y-1 transition-transform shadow-[4px_4px_0px_#171717] disabled:opacity-55 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Changes"}
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

            <div className="flex justify-center items-center overflow-hidden h-[220px] min-[380px]:h-[250px] sm:h-[300px] w-full">
              {/* Scale wrapper so html-to-image captures unscaled bounds */}
              <div className="scale-[0.7] min-[380px]:scale-[0.85] sm:scale-100 origin-center shrink-0">
                {/* The actual ID card element to capture */}
                <div
                  ref={cardRef}
                  className="w-[400px] h-[280px] bg-paper rough-border p-6 flex flex-col justify-between relative overflow-hidden text-left"
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
                      {avatarDataUrl ? (
                        <img
                          src={avatarDataUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : user?.avatar && user.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png" ? (
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

                {!hasConnections ? (
                  <div className="bg-white/50 p-4 border-2 border-dashed border-sketch-black/20 flex items-center justify-center my-4 h-[56px] w-full">
                    <p className="text-xs font-mono text-sketch-black/40 text-center uppercase tracking-wider font-bold">
                      Connect platforms to show stats
                    </p>
                  </div>
                ) : (
                  <div className={`grid gap-4 my-3 font-mono ${connectedPlatformsCount === 1
                      ? "grid-cols-1"
                      : connectedPlatformsCount === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}>
                    {user?.leetcode && (
                      <div className="bg-white p-2 border-2 border-sketch-black shadow-sm">
                        <p className="text-[10px] text-sketch-black/60 font-bold uppercase">LeetCode Solved</p>
                        <p className="text-xl font-bold text-sketch-black">{user.stats?.leetcode?.problemsSolved ?? 0}</p>
                      </div>
                    )}
                    {user?.codeforces && (
                      <div className="bg-white p-2 border-2 border-sketch-black shadow-sm">
                        <p className="text-[10px] text-sketch-black/60 font-bold uppercase">CF Rating</p>
                        <p className="text-xl font-bold text-blueprint-blue">{user.stats?.codeforces?.currentRating ?? 0}</p>
                      </div>
                    )}
                    {user?.github && (
                      <div className="bg-white p-2 border-2 border-sketch-black shadow-sm">
                        <p className="text-[10px] text-sketch-black/60 font-bold uppercase">Git Contributions</p>
                        <p className="text-xl font-bold text-green-600">{user.stats?.github?.contributions ?? 0}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-end border-t-2 border-sketch-black pt-2">
                  <p className="font-mono text-[10px] font-bold text-sketch-black/80">ISSUED: {issueDate || "..."}</p>
                  <div className="w-16 h-16 border-2 border-sketch-black bg-white flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                    {profileUrl ? (
                      <Canvas
                        text={profileUrl}
                        options={{
                          errorCorrectionLevel: 'L',
                          margin: 1,
                          width: 60,
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <FollowersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        username={user?.username || username}
        type={modalType}
      />
    </div>
  );
}
