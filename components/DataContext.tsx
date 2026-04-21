'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { mockAccount, mockVideos, mockCompetitors, mockIdeas, mockTrends, mockGenerations } from "@/lib/mockData";

export interface GlobalData {
  account: any;
  videos: any[];
  competitors: any[];
  ideas: any[];
  trends: any[];
  generations: any[];
  isLoading: boolean;
  error: string | null;
  refreshData: (handle: string) => Promise<void>;
  clearData: () => void;
}

const DataContext = createContext<GlobalData | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState(mockAccount);
  const [videos, setVideos] = useState(mockVideos);
  const [competitors, setCompetitors] = useState(mockCompetitors);
  const [ideas, setIdeas] = useState(mockIdeas);
  const [trends, setTrends] = useState(mockTrends);
  const [generations, setGenerations] = useState(mockGenerations);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TARGET_HANDLE = "rasayel_podcast"; // Hardcoded specific account

  // Load from local storage and auto-sync on mount
  useEffect(() => {
    const saved = localStorage.getItem("tiktok-real-data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.account) setAccount(parsed.account);
        if (parsed.videos) setVideos(parsed.videos);
      } catch (e) {}
    }

    // Auto-sync data in the background instantly
    refreshData(TARGET_HANDLE);

    // Continue to sync every 15 minutes to keep it fresh
    const interval = setInterval(() => {
      refreshData(TARGET_HANDLE);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const refreshData = async (handle: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch TikTok data");
      }
      const data = await res.json();
      
      const newAccount = {
        username: "@" + data.profile.name,
        followers: data.profile.fans,
        followersGrowth: 0,
        avgEngagement: 0,
        engagementChange: 0,
        weeklyViews: data.videos.reduce((sum: number, v: any) => sum + (v.playCount || 0), 0),
        weeklyViewsChange: 0,
        actionItems: data.videos.filter((v: any) => (v.playCount || 0) < 1000).length || 0,
      };

      const newVideos = data.videos.map((v: any, i: number) => ({
        id: v.id || String(i),
        title: (v.text || "No caption").substring(0, 50) + "...",
        views: v.playCount || 0,
        likes: v.diggCount || 0,
        comments: v.commentCount || 0,
        shares: v.shareCount || 0,
        posted: v.createTime ? new Date(v.createTime * 1000).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        score: Math.min(100, Math.round(((v.playCount || 0) / (data.profile.fans || 1)) * 100)),
        hook: Math.round(Math.random() * 30 + 60), // Mocked for real videos since AI can't watch
        pacing: Math.round(Math.random() * 30 + 60),
        caption: v.text ? Math.min(100, v.text.length) : 50,
        hashtags: v.hashtags?.length ? Math.min(100, v.hashtags.length * 20) : 40,
        cta: Math.round(Math.random() * 30 + 50),
        issue: v.playCount < 1000 ? "Low view count implies hook failure." : "Metrics are decent but caption could be optimized.",
        suggestion: "Use the Claude AI agent to generate a much stronger hook and caption rewriting.",
        originalData: v // Pass full payload so Claude sees it
      }));

      setAccount(newAccount);
      setVideos(newVideos);
      
      localStorage.setItem("tiktok-real-data", JSON.stringify({ account: newAccount, videos: newVideos }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    localStorage.removeItem("tiktok-real-data");
    setAccount(mockAccount);
    setVideos(mockVideos);
  };

  return (
    <DataContext.Provider value={{ account, videos, competitors, ideas, trends, generations, isLoading, error, refreshData, clearData }}>
      {children}
    </DataContext.Provider>
  );
}
