'use client';

import { useState } from "react";
import CompetitorCard from "@/components/CompetitorCard";
import { Search, RefreshCw, Zap } from "lucide-react";
import { dispatchAgentPrompt } from "@/components/AIChatBox";
import { useData } from "@/components/DataContext";

export default function CompetitorsPage() {
  const { competitors, scrapeCompetitor, scrapingHandles } = useData();
  const [newHandle, setNewHandle] = useState("");
  const [isScrapeAll, setIsScrapeAll] = useState(false);

  const handleCustomSpy = () => {
    if (!newHandle.trim()) return;
    dispatchAgentPrompt(
      `Spy on ${newHandle.trim()} — based on your knowledge of TikTok strategy in my niche (Egyptian market, podcasting, content creation), what are they likely doing well, what's their weakness, and what should I adapt from them? Compare to my current competitors if relevant.`
    );
    setNewHandle("");
  };

  // Scrape ALL at once — single API call, no race conditions
  const handleScrapeAll = async () => {
    setIsScrapeAll(true);
    try {
      await scrapeCompetitor("__all__");
    } catch {
      // individual errors shown in cards
    } finally {
      setIsScrapeAll(false);
    }
  };

  const anyScrapePending = scrapingHandles.size > 0 || isScrapeAll;

  // Check if any competitor has real data
  const hasAnyData = competitors.some((c: any) => !c.needsScrape && c.followers > 0);
  const lastScraped = competitors.find((c: any) => c.scrapedAt)?.scrapedAt;

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Competitor Intelligence</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Real-time analysis of your competitors — powered by Apify + Sarie AI.
            {lastScraped && (
              <span className="ml-2 text-[11px] opacity-60">
                Last synced: {new Date(lastScraped).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleScrapeAll}
          disabled={anyScrapePending}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw size={15} className={anyScrapePending ? "animate-spin" : ""} />
          {anyScrapePending ? "Scraping…" : hasAnyData ? "Refresh All" : "Scrape All Live"}
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
