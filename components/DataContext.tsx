'use client';

import { createContext, useContext, useState, useEffect } from "react";
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
  const [competitors, setCompetitors] = useState(mockCompetitors);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [trends, setTrends] = useState(mockTrends);
  const [generations, setGenerations] = useState(mockGenerations);
  const [isLoading, setIsLoading] = useState(true);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On mount: read from Vercel KV via /api/data — instant, no Apify wait
  useEffect(() => {
    fetchFromKV();
  }, []);

  const fetchFromKV = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/data");
      if (!res.ok) {
        // No KV data yet — stay on mock data but show a hint
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
      isLoading, syncedAt, error, refreshData, clearData
    }}>
      {children}
    </DataContext.Provider>
  );
}
