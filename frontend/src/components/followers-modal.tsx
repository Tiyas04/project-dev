"use client";

import React, { useEffect, useState } from "react";
import { X, User } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

interface UserItem {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  type: "followers" | "following" | "friends";
}

export function FollowersModal({ isOpen, onClose, username, type }: FollowersModalProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !username) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/users/profile/${username}/${type}`);
        if (res.data?.success) {
          setUsers(res.data.data);
        } else {
          setError(`Failed to load ${type}`);
        }
      } catch (err: any) {
        console.error(err);
        setError(`Failed to load ${type}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, username, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sketch-black/40 backdrop-blur-xs">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-md border-2 border-sketch-black p-6 shadow-[8px_8px_0px_#171717] relative flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-sketch-black/20 pb-3 mb-4 shrink-0">
          <h3 className="font-sketch text-2xl text-sketch-black capitalize">
            {type === "followers" ? "Followers" : type === "following" ? "Following" : "Friends"} ({users.length})
          </h3>
          <button
            onClick={onClose}
            className="text-sketch-black hover:text-blueprint-blue transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto pr-1 font-mono text-sm space-y-3 min-h-[200px]">
          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-12 bg-gray-100 border-2 border-sketch-black/5 animate-pulse rounded"></div>
              <div className="h-12 bg-gray-100 border-2 border-sketch-black/5 animate-pulse rounded"></div>
              <div className="h-12 bg-gray-100 border-2 border-sketch-black/5 animate-pulse rounded"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 font-bold">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-sketch-black/40 font-bold uppercase tracking-wider">
              {type === "followers" ? "No followers yet" : type === "following" ? "Not following anyone yet" : "No friends yet"}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((item) => (
                <Link
                  key={item._id || item.username}
                  href={`/user/${item.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 bg-paper border-2 border-sketch-black hover:border-blueprint-blue hover:-translate-y-0.5 shadow-[2px_2px_0px_#171717] hover:shadow-[2px_2px_0px_#1E3A8A] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-dashed border-blueprint-blue bg-white flex items-center justify-center shrink-0">
                    {item.avatar && item.avatar !== "https://cdn-icons-png.flaticon.com/512/5951/5951752.png" ? (
                      <img
                        src={item.avatar.replace("http://", "https://")}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-sketch-black/30">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sketch-black truncate group-hover:text-blueprint-blue transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-sketch-black/50">@{item.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
