'use client';

import { useState } from "react";
import VideoScoreCard from "@/components/VideoScoreCard";
import { Video, TrendingUp, AlertTriangle, Star, Pin } from "lucide-react";
import { useData } from "@/components/DataContext";

export default function AuditPage() {
  const { videos } = useData();
  const [tab, setTab] = useState<"latest" | "pinned">("latest");

  const latestVideos = videos.filter((v: any) => !v.isPinned);
  const pinnedVideos = videos.filter((v: any) => v.isPinned);

  const activeVideos = tab === "latest" ? latestVideos : pinnedVideos;

  const summaryItems = [
    { icon: <Video size={18} style={{ color: 'var(--text-muted)' }} />, value: latestVideos.length, label: "Latest Videos" },
    { icon: <TrendingUp size={18} className="text-blue-500" />, value: latestVideos.length ? Math.round(latestVideos.reduce((a: number, v: any) => a + (v.score || 0), 0) / latestVideos.length) : 0, label: "Avg Score" },
    { icon: <Star size={18} className="text-emerald-500" />, value: latestVideos.filter((v: any) => v.score >= 75).length, label: "High Performers" },
    { icon: <AlertTriangle size={18} className="text-red-500" />, value: latestVideos.filter((v: any) => v.score < 60).length, label: "Need Fixing" },
  ];

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Content Audit</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          تحليل AI لآخر {latestVideos.length} فيديو. اضغط على أي فيديو لعرض التحليل الكامل.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {summaryItems.map(({ icon, value, label }) => (
          <div key={label} className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass-elevated flex items-center justify-center shrink-0">{icon}</div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
              <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 glass-elevated rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("latest")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${tab === "latest" ? "glass-panel" : "hover:opacity-70"}`}
          style={{ color: tab === "latest" ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          <Video size={13} /> Latest ({latestVideos.length})
        </button>
        <button
          onClick={() => setTab("pinned")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${tab === "pinned" ? "glass-panel" : "hover:opacity-70"}`}
          style={{ color: tab === "pinned" ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          <Pin size={13} /> Pinned ({pinnedVideos.length})
        </button>
      </div>

      {activeVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-muted)' }}>
          <p className="text-[13px]">{tab === "pinned" ? "مفيش فيديوهات مثبتة" : "لا توجد فيديوهات"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {[...activeVideos].sort((a: any, b: any) => b.score - a.score).map((video: any) => (
            <VideoScoreCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
