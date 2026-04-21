'use client';

import VideoScoreCard from "@/components/VideoScoreCard";
import { Video, TrendingUp, AlertTriangle, Star } from "lucide-react";
import { useData } from "@/components/DataContext";

const summaryItems = (videos: any[]) => [
  { icon: <Video size={18} style={{ color: 'var(--text-muted)' }} />, value: videos.length, label: "Videos Audited" },
  { icon: <TrendingUp size={18} className="text-blue-500" />, value: Math.round(videos.reduce((a, v) => a + v.score, 0) / videos.length), label: "Avg Score" },
  { icon: <Star size={18} className="text-emerald-500" />, value: videos.filter(v => v.score >= 75).length, label: "High Performers" },
  { icon: <AlertTriangle size={18} className="text-red-500" />, value: videos.filter(v => v.score < 60).length, label: "Need Fixing" },
];

export default function AuditPage() {
  const { videos } = useData();
  const items = summaryItems(videos);
  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Content Audit</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          AI-scored breakdown of your last {videos.length} videos. Click &quot;Fix this with Agent&quot; for real Claude analysis.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {items.map(({ icon, value, label }) => (
          <div key={label} className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass-elevated flex items-center justify-center shrink-0">{icon}</div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
              <div className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Sorted by</span>
        <span className="text-[11px] font-bold glass-elevated px-2 py-0.5 rounded-md" style={{ color: 'var(--text-secondary)' }}>
          Score (highest first)
        </span>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
        {[...videos].sort((a: any, b: any) => b.score - a.score).map((video: any) => (
          <VideoScoreCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
