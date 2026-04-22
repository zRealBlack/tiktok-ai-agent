'use client';

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { mockCompetitors, mockTrends, mockGenerations } from "@/lib/mockData";

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

  // On mount: load account data AND competitor data from KV
  useEffect(() => {
    fetchFromKV();
    fetchCompetitorsFromKV();
  }, []);

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
      const res = await fetch("/api/competitors");
      if (!res.ok) return;
      const data = await res.json();
      if (data.competitors && Array.isArray(data.competitors) && data.competitors.length > 0) {
        setCompetitors(data.competitors);
      }
    } catch {
      // silently fall back to mock seed data
    }
  };

  // Scrape competitors via Apify REST (POST /api/competitors) — no SDK bundler issues
  const scrapeCompetitor = useCallback(async (handle: string) => {
    const cleanHandle = handle.replace("@", "").trim();
    setScrapingHandles(prev => new Set(prev).add(cleanHandle));

    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: cleanHandle }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      // The POST returns { competitors: [...all merged...] }
      if (data.competitors && Array.isArray(data.competitors)) {
        setCompetitors(data.competitors);
      }
    } catch (err: any) {
      console.error("Competitor scrape failed:", err);
      throw err;
    } finally {
      setScrapingHandles(prev => {
        const next = new Set(prev);
        next.delete(cleanHandle);
        return next;
      });
    }
  }, []);

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
      isLoading, syncedAt, error, refreshData, clearData,
      scrapeCompetitor, scrapingHandles,
    }}>
      {children}
    </DataContext.Provider>
  );
}
