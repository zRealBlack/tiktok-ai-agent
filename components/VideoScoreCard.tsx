'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";

interface VideoData {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  posted: string;
  score: number;
  hook: number;
  pacing: number;
  caption: number;
  hashtags: number;
  cta: number;
  issue: string;
  suggestion: string;
  coverUrl?: string;
  videoUrl?: string;
  isPinned?: boolean;
  hashtags_list?: string[];
  tone?: string;
  emotionalPull?: number;
  energy?: number;
  retentionRisk?: string;
  growthPotential?: number;
  weaknessFlags?: string[];
  duration?: number;
  sound?: number;
  soundType?: string;
  soundName?: string;
  soundIssue?: string;
  appearance?: number | null;
  appearanceIssue?: string | null;
  filming?: number | null;
  mood?: string;
}

const scoreColor = (v: number) =>
  v >= 80 ? "#22c55e" : v >= 60 ? "#f59e0b" : "#ef4444";

const scoreBadge = (v: number) =>
  v >= 80 ? "bg-emerald-500/15 text-emerald-500"
  : v >= 60 ? "bg-amber-500/15 text-amber-500"
  : "bg-red-500/15 text-red-500";

const toneBadgeStyle = (tone?: string) => {
  if (!tone) return "bg-zinc-500/15 text-zinc-400";
  if (tone.includes("Emotional") || tone.includes("Shareable")) return "bg-pink-500/15 text-pink-400";
  if (tone.includes("Controversial") || tone.includes("Discussion")) return "bg-orange-500/15 text-orange-400";
  if (tone.includes("Entertaining") || tone.includes("Likeable")) return "bg-blue-500/15 text-blue-400";
  if (tone.includes("Flat") || tone.includes("Boring")) return "bg-red-500/15 text-red-400";
  if (tone.includes("Informative") || tone.includes("Valuable")) return "bg-emerald-500/15 text-emerald-400";
  return "bg-zinc-500/15 text-zinc-400";
};

const ScoreBar = ({ label, value, delay }: { label: string; value: number; delay: number }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-[11px] font-bold" style={{ color: scoreColor(value) }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full glass-elevated overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: mounted ? `${value}%` : "0%", backgroundColor: scoreColor(value), transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
};

export default function VideoScoreCard({ video, compact = false }: { video: VideoData; compact?: boolean }) {
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);
  const fmtNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString();

  const showCover = video.coverUrl && !imgFailed;

  return (
    <div
      className="glass-panel rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => router.push(`/audit/${video.id}`)}
    >
      {/* Cover thumbnail */}
      {showCover ? (
        <div className="relative w-full h-40 bg-black overflow-hidden">
          <img
            src={`/api/proxy-image?url=${encodeURIComponent(video.coverUrl)}`}
            alt={video.title}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black ${scoreBadge(video.score)}`}>
            {video.score}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="glass-panel rounded-xl px-3 py-1.5 text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
              ??? ??????? ?????? ?
            </div>
          </div>
        </div>
      ) : video.coverUrl && imgFailed ? (
        /* Fallback when image fails to load */
        <div className="relative w-full h-40 overflow-hidden flex items-center justify-center" style={{ background: 'var(--glass-elevated)' }}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[20px] font-black ${scoreBadge(video.score)}`}>
            {video.score}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="glass-panel rounded-xl px-3 py-1.5 text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
              ??? ??????? ?????? ?
            </div>
          </div>
        </div>
      ) : null}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-[14px] font-semibold leading-snug mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
              {video.title}
            </h3>
            <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><Eye size={11}/> {fmtNum(video.views)}</span>
              <span className="flex items-center gap-1"><Heart size={11}/> {fmtNum(video.likes)}</span>
              <span className="flex items-center gap-1"><MessageCircle size={11}/> {fmtNum(video.comments)}</span>
              <span className="flex items-center gap-1"><Share2 size={11}/> {fmtNum(video.shares)}</span>
            </div>
          </div>
          {!video.coverUrl && (
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black ${scoreBadge(video.score)}`}>
              {video.score}
            </div>
          )}
        </div>

        {!compact && (
          <div className="space-y-2.5 mb-3">
            {(['hook', 'pacing', 'caption', 'hashtags', 'cta', 'sound', 'appearance', 'filming'] as const).map((key, i) => (
              <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={video[key] || 0} delay={i * 80} />
            ))}
          </div>
        )}

        {/* Tone, Mood + Growth Potential row */}
        {(video.tone || video.mood || video.growthPotential !== undefined) && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {video.tone && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${toneBadgeStyle(video.tone)}`}>
                {video.tone}
              </span>
            )}
            {video.mood && (
              <span className="bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                {video.mood}
              </span>
            )}
            {video.retentionRisk && video.retentionRisk !== "Low" && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${video.retentionRisk === "High" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                {video.retentionRisk} Retention Risk
              </span>
            )}
          </div>
        )}

        <div className="glass-elevated rounded-xl p-2.5">
          <div className="text-[10px] font-bold text-red-500 mb-1 uppercase tracking-wide">? Issue</div>
          <div className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{video.issue}</div>
        </div>
      </div>
    </div>
  );
}
