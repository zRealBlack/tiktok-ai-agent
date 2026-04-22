'use client';

import { useState } from "react";
import { Eye, Users, Search, RefreshCw, ShieldAlert, TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Zap, ExternalLink } from "lucide-react";
import { dispatchAgentPrompt } from "./AIChatBox";
import { useData } from "./DataContext";

interface Competitor {
  handle: string;
  name?: string;
  followers: number;
  postsThisWeek: number;
  viewChange: string;
  status: "spiking" | "stable" | "dropping";
  avgViews: number;
  topFormat: string;
  bio?: string;
  pros?: string[];
  cons?: string[];
  contentStrategy?: string;
  postingFrequency?: string;
  avgEngagement?: string;
  topVideoTitle?: string;
  topVideoViews?: number;
  threatLevel?: "High" | "Medium" | "Low";
  opportunity?: string;
  needsScrape?: boolean;
  scrapedAt?: string | null;
}

const statusConfig = {
  spiking:  { label: "Spiking",  cls: "text-emerald-500 bg-emerald-500/10", icon: <TrendingUp size={11} /> },
  stable:   { label: "Stable",   cls: "text-amber-500  bg-amber-500/10",  icon: <Minus size={11} /> },
  dropping: { label: "Dropping", cls: "text-red-500    bg-red-500/10",    icon: <TrendingDown size={11} /> },
};

const threatConfig = {
  High:   { cls: "text-red-500 bg-red-500/10",       label: "High Threat" },
  Medium: { cls: "text-amber-500 bg-amber-500/10",   label: "Med Threat" },
  Low:    { cls: "text-emerald-500 bg-emerald-500/10", label: "Low Threat" },
};

export default function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const { scrapeCompetitor, scrapingHandles } = useData();
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const cleanHandle = competitor.handle.replace("@", "");
  const isScrapingThis = scrapingHandles.has(cleanHandle);
  const hasData = !competitor.needsScrape && competitor.followers > 0;

  const cfg = statusConfig[competitor.status] || statusConfig.stable;
  const fmtNum = (n: number) => n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString();

  const handleScrape = async () => {
    setScrapeError(null);
    try {
      await scrapeCompetitor(competitor.handle);
    } catch (err: any) {
      setScrapeError(err.message || "Scrape failed");
    }
  };

  const handleSpy = () => {
    if (!hasData) {
      dispatchAgentPrompt(
        `Spy on ${competitor.handle} (${competitor.name || ""}): Based on your knowledge of TikTok in Egypt/MENA, what are they likely doing well, what's their weakness, and what should I adapt? We haven't scraped their live data yet.`
      );
      return;
    }
    dispatchAgentPrompt(
      `عمل تحليل عميق لمنافس ${competitor.handle}:\n` +
      `- المتابعين: ${fmtNum(competitor.followers)}\n` +
      `- متوسط المشاهدات: ${fmtNum(competitor.avgViews)}\n` +
      `- نشاط البوست: ${competitor.postsThisWeek} في الأسبوع\n` +
      `- تغير المشاهدات: ${competitor.viewChange}\n` +
      `- أعلى فيديو: "${competitor.topVideoTitle}" (${fmtNum(competitor.topVideoViews || 0)} مشاهدة)\n` +
      `- الاستراتيجية: ${competitor.contentStrategy}\n` +
      `- التهديد: ${competitor.threatLevel}\n` +
      `- الإيجابيات: ${(competitor.pros || []).join(", ")}\n` +
      `- السلبيات: ${(competitor.cons || []).join(", ")}\n\n` +
      `قارني بيناتهم ببيانات أكاونتنا وقولي بالضبط إيه الخطوات اللي نعملها عشان نتقدم عليهم.`
    );
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[14px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {competitor.name || competitor.handle}
              </div>
              {hasData && competitor.threatLevel && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 ${threatConfig[competitor.threatLevel].cls}`}>
                  {threatConfig[competitor.threatLevel].label}
                </span>
              )}
            </div>
            <a
              href={`https://www.tiktok.com/${competitor.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] mt-0.5 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              {competitor.handle} <ExternalLink size={9} />
            </a>
          </div>
          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${cfg.cls}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {competitor.bio && (
          <p className="text-[11px] mt-2 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
            {competitor.bio}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 px-5 mb-4">
        {[
          { v: hasData ? fmtNum(competitor.followers) : "—", l: "followers", icon: <Users size={10} /> },
          { v: hasData ? fmtNum(competitor.avgViews) : "—", l: "avg views", icon: <Eye size={10} />, spike: competitor.status === "spiking" },
          { v: hasData ? competitor.viewChange : "—", l: "view Δ", icon: <TrendingUp size={10} />, spike: competitor.status === "spiking" },
        ].map(({ v, l, icon, spike }) => (
          <div key={l} className="glass-elevated rounded-xl p-2.5 text-center">
            <div className={`text-[14px] font-bold ${spike ? "text-emerald-500" : ""}`}
              style={!spike ? { color: 'var(--text-primary)' } : undefined}>
              {v}
            </div>
            <div className="flex items-center justify-center gap-0.5 text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {icon} {l}
            </div>
          </div>
        ))}
      </div>

      {/* Content Strategy */}
      {hasData && (
        <div className="px-5 mb-4 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: 'var(--text-muted)' }}>Top format</span>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{competitor.topFormat}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: 'var(--text-muted)' }}>Posts/week</span>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{competitor.postingFrequency || `${competitor.postsThisWeek}x`}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span style={{ color: 'var(--text-muted)' }}>Engagement</span>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{competitor.avgEngagement || "—"}</span>
          </div>
        </div>
      )}

      {/* Top Video */}
      {hasData && competitor.topVideoTitle && competitor.topVideoTitle !== "—" && (
        <div className="glass-elevated mx-5 mb-4 rounded-xl p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>🏆 Top Video</div>
          <div className="text-[11px] leading-snug line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {competitor.topVideoTitle}
          </div>
          <div className="text-[10px] font-bold text-emerald-500 mt-1">{fmtNum(competitor.topVideoViews || 0)} views</div>
        </div>
      )}

      {/* Pros & Cons */}
      {hasData && ((competitor.pros?.length || 0) > 0 || (competitor.cons?.length || 0) > 0) && (
        <div className="px-5 mb-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wide mb-1.5 text-emerald-500">✦ Strengths</div>
            <div className="space-y-1">
              {(competitor.pros || []).slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-start gap-1">
                  <CheckCircle2 size={9} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wide mb-1.5 text-red-500">⚠ Weaknesses</div>
            <div className="space-y-1">
              {(competitor.cons || []).slice(0, 3).map((c, i) => (
                <div key={i} className="flex items-start gap-1">
                  <XCircle size={9} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="text-[10px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Opportunity */}
      {hasData && competitor.opportunity && (
        <div className="glass-elevated mx-5 mb-4 rounded-xl p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-wide mb-1 text-blue-400">💡 Your Opportunity</div>
          <div className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{competitor.opportunity}</div>
        </div>
      )}

      {/* Not scraped yet state */}
      {!hasData && !isScrapingThis && (
        <div className="glass-elevated mx-5 mb-4 rounded-xl p-3 text-center">
          <ShieldAlert size={20} className="mx-auto mb-1.5" style={{ color: 'var(--text-muted)' }} />
          <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>No data yet</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click "Analyze Live" to scrape real data from TikTok via Apify</div>
        </div>
      )}

      {isScrapingThis && (
        <div className="glass-elevated mx-5 mb-4 rounded-xl p-3 text-center">
          <RefreshCw size={16} className="mx-auto mb-1.5 animate-spin" style={{ color: 'var(--text-muted)' }} />
          <div className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Scraping TikTok via Apify...</div>
          <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>This takes ~30s</div>
        </div>
      )}

      {scrapeError && (
        <div className="mx-5 mb-3 text-[10px] text-red-500 text-center">{scrapeError}</div>
      )}

      {/* Last scraped */}
      {hasData && competitor.scrapedAt && (
        <div className="text-center text-[9px] mb-2" style={{ color: 'var(--text-faint)' }}>
          Scraped {new Date(competitor.scrapedAt).toLocaleString()}
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
        <button
          onClick={handleScrape}
          disabled={isScrapingThis}
          className="btn-secondary flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-40"
        >
          <RefreshCw size={12} className={isScrapingThis ? "animate-spin" : ""} />
          {hasData ? "Re-analyze" : "Analyze Live"}
        </button>
        <button
          onClick={handleSpy}
          disabled={isScrapingThis}
          className="btn-primary flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all hover:opacity-90 disabled:opacity-40"
        >
          <Zap size={12} />
          Ask Sarie
        </button>
      </div>
    </div>
  );
}
