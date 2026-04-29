'use client';

import { useState } from "react";
import VideoScoreCard from "@/components/VideoScoreCard";
import { Video, TrendingUp, AlertTriangle, Star, Pin, ArrowUpRight } from "lucide-react";
import { useData } from "@/components/DataContext";

const card: React.CSSProperties = {
  background: 'var(--glass-bg)',
  borderRadius: 24,
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--glass-shadow)',
};

export default function AuditPage() {
  const { videos } = useData();
  const [tab, setTab] = useState<"latest" | "pinned">("latest");

  const pinnedVideos = videos.filter((v: any) => v.isPinned === true);
  const latestVideos = videos.filter((v: any) => v.isPinned !== true);
  const activeVideos = tab === "latest" ? latestVideos : pinnedVideos;

  const avgScore    = latestVideos.length ? Math.round(latestVideos.reduce((a: number, v: any) => a + (v.score||0), 0) / latestVideos.length) : 0;
  const highPerf    = latestVideos.filter((v: any) => v.score >= 75).length;
  const needFix     = latestVideos.filter((v: any) => v.score < 60).length;

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">

      {/* ── PAGE TITLE ─────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
          تحليل AI لآخر {latestVideos.length} فيديو
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 style={{ fontSize: 46, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.045em', lineHeight: 1 }}>
            Content Audit
          </h1>
          {/* Tabs */}
          <div className="flex gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 self-start md:self-auto">
            {([
              { key: 'latest', icon: Video,  label: `Latest (${latestVideos.length})` },
              { key: 'pinned', icon: Pin,    label: `Pinned (${pinnedVideos.length})` },
            ] as const).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', borderRadius: 100, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: tab === key ? 'var(--btn-primary-bg)' : 'transparent',
                color: tab === key ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.18s',
              }}>
                <Icon size={12}/> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SUMMARY STATS ─────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Video,         label: 'Total Videos',    value: String(latestVideos.length), color: 'var(--text-muted)' },
          { icon: TrendingUp,    label: 'Avg Score',       value: `${avgScore}/100`,           color: '#3b82f6'           },
          { icon: Star,          label: 'High Performers', value: String(highPerf),            color: '#22c55e'           },
          { icon: AlertTriangle, label: 'Need Fixing',     value: String(needFix),             color: '#ef4444'           },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-3 p-3 md:p-4 rounded-2xl border border-white/10 bg-white/5 shadow-lg overflow-hidden min-w-0">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--glass-elevated)', border: '1px solid var(--glass-elevated-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── VIDEO GRID ────────────────────────── */}
      {activeVideos.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          {tab === "pinned" ? "مفيش فيديوهات مثبتة" : "لا توجد فيديوهات"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {[...activeVideos].sort((a: any, b: any) => b.score - a.score).map((video: any) => (
            <VideoScoreCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
