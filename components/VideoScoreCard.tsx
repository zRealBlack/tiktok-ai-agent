'use client';

import { useEffect, useState } from "react";
import { Eye, Heart, MessageCircle, Share2, Zap } from "lucide-react";
import { dispatchAgentPrompt } from "./AIChatBox";

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
}

const scoreColor = (v: number) =>
  v >= 80 ? "#22c55e" : v >= 60 ? "#f59e0b" : "#ef4444";

const scoreBadge = (v: number) =>
  v >= 80
    ? "bg-emerald-500/15 text-emerald-500"
    : v >= 60
    ? "bg-amber-500/15 text-amber-500"
    : "bg-red-500/15 text-red-500";

const ScoreBar = ({ label, value, delay }: { label: string; value: number; delay: number }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-[11px] font-bold" style={{ color: scoreColor(value) }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full glass-elevated overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: mounted ? `${value}%` : "0%",
            backgroundColor: scoreColor(value),
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
};

export default function VideoScoreCard({ video, compact = false }: { video: VideoData; compact?: boolean }) {
  const fmtNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString();

  const handleFix = () => {
    dispatchAgentPrompt(
      `Fix my video "${video.title}" — it scored ${video.score}/100. The main issue is: ${video.issue}. Suggested fix: ${video.suggestion}. Can you rewrite the hook, give me a better caption under 100 chars, and suggest 3 niche hashtags? Be specific.`
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="text-[14px] font-semibold leading-snug mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
            {video.title}
          </h3>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><Eye size={11}/> {fmtNum(video.views)}</span>
            <span className="flex items-center gap-1"><Heart size={11}/> {fmtNum(video.likes)}</span>
            <span className="flex items-center gap-1"><MessageCircle size={11}/> {fmtNum(video.comments)}</span>
            <span className="flex items-center gap-1"><Share2 size={11}/> {fmtNum(video.shares)}</span>
          </div>
        </div>
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black ${scoreBadge(video.score)}`}>
          {video.score}
        </div>
      </div>

      {!compact && (
        <div className="space-y-2.5 mb-4">
          {(['hook', 'pacing', 'caption', 'hashtags', 'cta'] as const).map((key, i) => (
            <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={video[key]} delay={i * 80} />
          ))}
        </div>
      )}

      <div className="glass-elevated rounded-xl p-3 mb-3">
        <div className="text-[10px] font-bold text-red-500 mb-1 uppercase tracking-wide">⚠ Issue</div>
        <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{video.issue}</div>
      </div>

      <div className="glass-elevated rounded-xl p-3 mb-4">
        <div className="text-[10px] font-bold text-emerald-500 mb-1 uppercase tracking-wide">✦ Suggested Fix</div>
        <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{video.suggestion}</div>
      </div>

      <button
        onClick={handleFix}
        className="btn-secondary w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 hover:opacity-80"
      >
        <Zap size={13} />
        Fix this with Agent
      </button>
    </div>
  );
}
