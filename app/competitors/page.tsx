'use client';

import { useState, useEffect } from "react";
import CompetitorCard from "@/components/CompetitorCard";
import { Plus, Search, RefreshCw, Zap } from "lucide-react";
import { dispatchAgentPrompt } from "@/components/AIChatBox";
import { useData } from "@/components/DataContext";

export default function CompetitorsPage() {
  const { competitors, scrapeCompetitor, scrapingHandles } = useData();
  const [newHandle, setNewHandle] = useState("");
  const [isScrapeAll, setIsScrapeAll] = useState(false);
  const [autoScrapeTriggered, setAutoScrapeTriggered] = useState(false);

  // Auto-scrape any competitor that still has no data (needsScrape: true)
  useEffect(() => {
    if (autoScrapeTriggered) return;
    const needsData = competitors.filter((c: any) => c.needsScrape || c.followers === 0);
    if (needsData.length === 0) return;
    setAutoScrapeTriggered(true);
    // Stagger scrapes by 2s so we don't hit Apify concurrency limits
    needsData.forEach((c: any, i: number) => {
      setTimeout(() => {
        scrapeCompetitor(c.handle).catch(console.error);
      }, i * 2000);
    });
  }, [competitors, autoScrapeTriggered, scrapeCompetitor]);

  const handleCustomSpy = () => {
    if (!newHandle.trim()) return;
    dispatchAgentPrompt(
      `Spy on ${newHandle.trim()} — based on your knowledge of TikTok strategy in my niche (Egyptian market, podcasting, content creation), what are they likely doing well, what's their weakness, and what should I adapt from them? Compare to my current competitors if relevant.`
    );
    setNewHandle("");
  };

  const handleScrapeAll = async () => {
    setIsScrapeAll(true);
    try {
      await Promise.all(
        competitors.map((c: any) => scrapeCompetitor(c.handle))
      );
    } catch {
      // individual errors shown in cards
    } finally {
      setIsScrapeAll(false);
    }
  };

  const anyScrapePending = scrapingHandles.size > 0 || isScrapeAll;

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Competitor Intelligence</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Real-time analysis of your competitors — powered by Apify + Sarie AI.
          </p>
        </div>
        <button
          onClick={handleScrapeAll}
          disabled={anyScrapePending}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw size={15} className={anyScrapePending ? "animate-spin" : ""} />
          {anyScrapePending ? "Scraping…" : "Scrape All Live"}
        </button>
      </div>

      {/* Spy input */}
      <div className="glass-panel rounded-2xl p-5 mb-6">
        <h2 className="text-[13px] font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>Ask Sarie about any account</h2>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 glass-input rounded-xl px-4 py-2.5">
            <Search size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
            <input
              type="text"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSpy()}
              placeholder="@handle"
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-40"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <button
            onClick={handleCustomSpy}
            disabled={!newHandle.trim()}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-40"
          >
            <Zap size={15} /> Ask
          </button>
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-faint)' }}>
          Sarie will analyze the account based on TikTok strategy knowledge in the chat panel →
        </p>
      </div>

      {/* Tracked accounts */}
      <h2 className="text-[12px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
        Tracked Accounts ({competitors.length})
      </h2>
      <div className="grid grid-cols-2 xl:grid-cols-2 gap-5">
        {competitors.map((c: any) => (
          <CompetitorCard key={c.handle} competitor={c} />
        ))}
      </div>
    </div>
  );
}
