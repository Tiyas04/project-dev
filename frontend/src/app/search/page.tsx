"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LoggedInNavbar } from "@/components/loggedin-navbar";
import { LoggedInFooter } from "@/components/loggedin-footer";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { user: currentUser } = useAuth();
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        if (res.data?.success) {
          setResults(res.data.data);
        } else {
          setError("Failed to load search results");
        }
      } catch (err: any) {
        console.error(err);
        setError("Error fetching search results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const showLoggedInNavbar = !!currentUser;

  const renderContent = () => {
    if (!currentUser) {
      return (
        <div className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6 my-12">
          <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform rotate-6">
            <Search size={36} />
          </div>
          <div className="space-y-4">
            <h2 className="font-sketch text-3xl text-sketch-black">Login to View Search</h2>
            <p className="font-mono text-sketch-black/60 max-w-lg mx-auto text-sm leading-relaxed">
              You must be logged in to search for other programmers on DevArena.
            </p>
            <Link 
              href="/auth"
              className="inline-block px-6 py-3 bg-blueprint-blue text-white font-bold font-mono text-sm border-2 border-sketch-black shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
            >
              Log In Now
            </Link>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="w-full space-y-6 max-w-4xl mx-auto py-12 animate-pulse font-mono">
          <div className="h-10 bg-white border-2 border-sketch-black rounded w-1/3 shadow-[3px_3px_0px_#171717]"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="h-32 bg-white border-2 border-sketch-black rounded shadow-[4px_4px_0px_#171717]"></div>
            <div className="h-32 bg-white border-2 border-sketch-black rounded shadow-[4px_4px_0px_#171717]"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] text-center max-w-4xl mx-auto my-12 font-mono">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
        <h2 className="font-sketch text-3xl text-sketch-black">
          Search Results for <span className="text-blueprint-blue">"{query}"</span>
        </h2>
        
        {results.length === 0 ? (
          <div className="bg-white p-12 rough-border shadow-[8px_8px_0px_#171717] flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-blueprint-blue/10 text-blueprint-blue flex items-center justify-center font-sketch text-4xl rough-border-blue transform rotate-6">
              <Search size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="font-sketch text-2xl text-sketch-black">No Programmers Found</h3>
              <p className="font-mono text-sketch-black/60 max-w-md mx-auto text-sm leading-relaxed">
                We couldn't find any users whose username starts with "{query}". Try checking the spelling or look for different keywords.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {results.map((userItem: any) => (
              <Link 
                href={`/user/${userItem.username}`} 
                key={userItem.username}
                className="bg-white p-6 rough-border border-2 border-sketch-black shadow-[6px_6px_0px_#171717] hover:shadow-[6px_6px_0px_#1E3A8A] hover:-translate-y-0.5 transition-all flex items-center gap-4 group"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-blueprint-blue bg-paper flex items-center justify-center shrink-0">
                  {userItem.avatar && userItem.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png" ? (
                    <img
                      src={userItem.avatar.replace("http://", "https://")}
                      alt={`${userItem.name}'s Avatar`}
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

                {/* Details */}
                <div className="flex-1 min-w-0 font-mono space-y-1">
                  <h3 className="font-bold text-base text-sketch-black truncate group-hover:text-blueprint-blue transition-colors">
                    {userItem.name}
                  </h3>
                  <p className="text-xs text-sketch-black/60">@{userItem.username}</p>
                  
                  {/* Stats badge summary */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-blueprint-blue bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                      {userItem.followersCount ?? 0} follower{userItem.followersCount === 1 ? "" : "s"}
                    </span>
                    
                    {/* Platform icons indicator */}
                    <div className="flex gap-1 items-center ml-auto">
                      {userItem.leetcode && (
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" title="LeetCode Connected" />
                      )}
                      {userItem.codeforces && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blueprint-blue shadow-sm" title="Codeforces Connected" />
                      )}
                      {userItem.github && (
                        <span className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-sm" title="GitHub Connected" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {showLoggedInNavbar ? <LoggedInNavbar /> : <Navbar />}
      <main className="flex-1 pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>
      {showLoggedInNavbar ? <LoggedInFooter /> : <Footer />}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full animate-pulse">
          <div className="h-10 bg-white border-2 border-sketch-black rounded w-1/3 shadow-[3px_3px_0px_#171717]"></div>
        </main>
        <Footer />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
