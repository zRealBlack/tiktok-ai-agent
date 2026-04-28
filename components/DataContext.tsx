'use client';

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { mockCompetitors, mockTrends, mockGenerations } from "@/lib/mockData";
import type { TeamMember } from "@/lib/auth";

export interface GlobalData {
  account: any;
  videos: any[];
  competitors: any[];
  ideas: any[];
  trends: any[];
  generations: any[];
  isLoading: boolean;
  syncedAt: string | null;
  error: string | null;
  currentUser: Omit<TeamMember, 'password'> | null;
  refreshData: (handle: string) => Promise<void>;
  clearData: () => void;
  scrapeCompetitor: (handle: string) => Promise<void>;
  scrapingHandles: Set<string>;
}

const DataContext = createContext<GlobalData | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [competitors, setCompetitors] = useState<any[]>([...mockCompetitors]);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [trends, setTrends] = useState(mockTrends);
  const [generations, setGenerations] = useState(mockGenerations);
  const [isLoading, setIsLoading] = useState(true);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrapingHandles, setScrapingHandles] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<Omit<TeamMember, 'password'> | null>(null);

  const loadUser = useCallback(() => {
    try {
      const userStr = sessionStorage.getItem('mas_ai_authenticated_user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch {}
  }, []);

  // On mount: load account data AND competitor data from KV, and load user
  useEffect(() => {
    fetchFromKV();
    fetchCompetitorsFromKV();
    loadUser();

    // Listen for login events
    window.addEventListener("mas_user_login", loadUser);
    return () => window.removeEventListener("mas_user_login", loadUser);
  }, [loadUser]);

  const fetchFromKV = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/data");
      if (!res.ok) {
        if (res.status === 404) {
          setError("No live data yet. Run: node agent/sync.js");
        }
        return;
      }
      const data = await res.json();
      if (data.account) setAccount(data.account);
      if (data.videos)  setVideos(data.videos);
      if (data.generations) setGenerations(data.generations);
      if (data.trends)  setTrends(data.trends);
      if (data.syncedAt) setSyncedAt(data.syncedAt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load live competitor data from KV (populated by /api/competitors POST or cron)
  const fetchCompetitorsFromKV = async () => {
    try {
      const res = await fetch("/api/competitors", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      // GET always returns all tracked competitors (with seeds for unscraped ones)
      if (data.competitors && Array.isArray(data.competitors)) {
        setCompetitors(data.competitors);
      }
    } catch {
      // silently fall back to mock seed data
    }
  };

  // Scrape competitors via Apify REST (POST /api/competitors)
  // pass "__all__" to scrape everyone in one request (no race conditions)
  const scrapeCompetitor = useCallback(async (handle: string) => {
    const isAll = handle === "__all__";
    const cleanHandle = handle.replace("@", "").trim();

    if (isAll) {
      // Mark all handles as scraping
      setScrapingHandles(new Set(competitors.map((c: any) => c.handle.replace("@", ""))));
    } else {
      setScrapingHandles(prev => new Set(prev).add(cleanHandle));
    }

    try {
      const body = isAll ? {} : { handle: cleanHandle };
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      // POST always returns ALL competitors (merged with existing KV data)
      if (data.competitors && Array.isArray(data.competitors)) {
        setCompetitors(data.competitors);
      }
    } catch (err: any) {
      console.error("Competitor scrape failed:", err);
      throw err;
    } finally {
      setScrapingHandles(new Set());
    }
  }, [competitors]);

  // refreshData is kept for manual re-reads from KV (not Apify)
  const refreshData = async (_handle: string) => {
    await fetchFromKV();
  };

  const clearData = () => {
    setAccount(null);
    setVideos([]);
    setSyncedAt(null);
  };

  return (
    <DataContext.Provider value={{
      account, videos, competitors, ideas, trends, generations,
      isLoading, syncedAt, error, currentUser, refreshData, clearData,
      scrapeCompetitor, scrapingHandles,
    }}>
      {children}
    </DataContext.Provider>
  );
}
