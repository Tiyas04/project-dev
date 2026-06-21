"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  coverImage?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateAvatar: (file: File | null) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  updateProfile: (details: { name: string; email: string; username: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await api.get("/users/current-user");
      setUser(response.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    const response = await api.post("/users/login", credentials);
    setUser(response.data.data.user);
    router.push("/dashboard");
  };

  const googleLogin = async (credential: string) => {
    const response = await api.post("/users/google-auth", { credential });
    setUser(response.data.data.user);
    router.push("/dashboard");
  };

  const register = async (formData: FormData) => {
    // Requires multipart/form-data because of avatar
    const response = await api.post("/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // Can auto-login or redirect to login
    router.push("/auth?mode=login");
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      router.push("/auth");
    }
  };

  const updateAvatar = async (file: File | null) => {
    const formData = new FormData();
    if (file) {
      formData.append("avatar", file);
    }
    const response = await api.patch("/users/update-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // Update local user state
    setUser(response.data.data);
  };

  const updateProfile = async (details: { name: string; email: string; username: string }) => {
    const response = await api.patch("/users/update-account", details);
    // Update local user state
    setUser(response.data.data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, updateAvatar, googleLogin, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
