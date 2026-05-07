'use client';

import { useState } from "react";
import CompetitorCard from "@/components/CompetitorCard";
import { Search, RefreshCw, Zap } from "lucide-react";
import { dispatchAgentPrompt } from "@/lib/events";
import { useData } from "@/components/DataContext";

const card: React.CSSProperties = {
  background: 'var(--glass-bg)',
  borderRadius: 24,
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--glass-shadow)',
};

export default function CompetitorsPage() {
  const { competitors, scrapeCompetitor, scrapingHandles } = useData();
  const [newHandle, setNewHandle]   = useState("");
  const [isScrapeAll, setIsScrapeAll] = useState(false);

  const handleCustomSpy = () => {
    if (!newHandle.trim()) return;
    dispatchAgentPrompt(
      `Spy on ${newHandle.trim()} — based on your knowledge of TikTok strategy in my niche (Egyptian market, podcasting, content creation), what are they likely doing well, what's their weakness, and what should I adapt from them? Compare to my current competitors if relevant.`
    );
    setNewHandle("");
  };

  const handleScrapeAll = async () => {
    setIsScrapeAll(true);
    try { await scrapeCompetitor("__all__"); } catch {} finally { setIsScrapeAll(false); }
  };

  const anyPending  = scrapingHandles.size > 0 || isScrapeAll;
  const hasAnyData  = competitors.some((c: any) => !c.needsScrape && c.followers > 0);
  const lastScraped = competitors.find((c: any) => c.scrapedAt)?.scrapedAt;

  return (
    <div className="dashboard-competitors" style={{ padding: '32px 28px', maxWidth: 1400, margin: '0 auto' }}>
      <style>{`
        .dashboard-competitors {
          --glass-bg: #ffffff;
          --glass-border: #f3f4f6;
          --glass-elevated: #f9fafb;
          --glass-elevated-border: #f3f4f6;
          --text-primary: #1f2937;
          --text-secondary: #4b5563;
          --text-muted: #6b7280;
          --text-faint: #9ca3af;
          --bg-base: #ffffff;
          --glass-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          --btn-primary-bg: #ef4444;
        }
      `}</style>

      {/* ── PAGE TITLE ─────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
          Real-time analysis · Apify + Sarie AI
          {lastScraped && <span style={{ marginLeft: 12, opacity: 0.6, fontSize: 11 }}>Last synced: {new Date(lastScraped).toLocaleString()}</span>}
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 style={{ fontSize: 46, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.045em', lineHeight: 1 }}>
            Competitors
          </h1>
          <button
            onClick={handleScrapeAll}
            disabled={anyPending}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 100, background: 'var(--btn-primary-bg)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: anyPending ? 'not-allowed' : 'pointer', opacity: anyPending ? 0.5 : 1, boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}
          >
            <RefreshCw size={14} style={{ animation: anyPending ? 'spin 1s linear infinite' : 'none' }} />
            {anyPending ? "Scraping…" : hasAnyData ? "Refresh All" : "Scrape All Live"}
          </button>
        </div>
      </div>

      {/* ── SARIE SPY INPUT ────────────────────── */}
      <div style={{ ...card, padding: '22px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 14 }}>Ask Sarie about any account</div>
        <div className="flex flex-col md:flex-row gap-3">
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--glass-elevated)', border: '1px solid var(--glass-elevated-border)', borderRadius: 14, padding: '10px 16px' }}>
            <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text" value={newHandle} onChange={e => setNewHandle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCustomSpy()}
              placeholder="@handle"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)' }}
            />
          </div>
          <button
            onClick={handleCustomSpy} disabled={!newHandle.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 14, background: 'var(--btn-primary-bg)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: newHandle.trim() ? 1 : 0.4 }}
          >
            <Zap size={14} /> Ask
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 10 }}>Sarie will analyze the account in the chat panel →</p>
      </div>

      {/* ── TRACKED ACCOUNTS ───────────────────── */}
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 16 }}>
        Tracked Accounts ({competitors.length})
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-[18px]">
        {competitors.map((c: any) => (
          <CompetitorCard key={c.handle} competitor={c} />
        ))}
      </div>
    </div>
  );
}
