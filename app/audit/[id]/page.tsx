'use client';

import { useParams, useRouter } from "next/navigation";
import { useData } from "@/components/DataContext";
import { useEffect, useState } from "react";
import {
  Eye, Heart, MessageCircle, Share2, ArrowLeft,
  ExternalLink, Zap, TrendingUp, TrendingDown
} from "lucide-react";
import { dispatchAgentPrompt } from "@/components/AIChatBox";

const scoreColor = (v: number) =>
  v >= 80 ? "#22c55e" : v >= 60 ? "#f59e0b" : "#ef4444";

const scoreBg = (v: number) =>
  v >= 80 ? "bg-emerald-500/15 text-emerald-500"
  : v >= 60 ? "bg-amber-500/15 text-amber-500"
  : "bg-red-500/15 text-red-500";

function ScoreBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-[12px] font-medium shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="flex-1 h-2 rounded-full glass-elevated overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: mounted ? `${value}%` : "0%", backgroundColor: scoreColor(value), transitionDelay: `${delay}ms` }} />
      </div>
      <div className="w-8 text-[12px] font-bold shrink-0" style={{ color: scoreColor(value) }}>{value}</div>
    </div>
  );
}

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { videos } = useData();
  const router = useRouter();

  const video = videos.find((v) => v.id === id);

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p style={{ color: 'var(--text-muted)' }}>Video not found</p>
        <button onClick={() => router.back()} className="btn-secondary px-4 py-2 rounded-xl text-[13px]">
          Go back
        </button>
      </div>
    );
  }

  const fmtNum = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + "M" : n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
  const engagementRate = video.views > 0 ? ((video.likes + video.comments) / video.views * 100).toFixed(2) : "0";

  const handleFix = () => {
    dispatchAgentPrompt(`صلح الفيديو ده: "${video.title}" — اللي عنده سكور ${video.score}/100. المشكلة الأساسية: ${video.issue}. اقتراح: ${video.suggestion}. اعيد كتابة الهوك، اديني كابشن أحسن من 100 حرف، و3 هاشتاقات مناسبة.`);
    router.back();
  };

  return (
    <div className="px-8 py-8 max-w-[1200px] mx-auto">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] font-semibold mb-6 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={15} /> Back to Audit
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Cover + stats */}
        <div>
          {/* Cover */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-black mb-5"
            style={{ aspectRatio: '9/16', maxHeight: '520px' }}>
            {video.coverUrl ? (
              <>
                <img src={video.coverUrl} alt={video.title}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* Score badge */}
                <div className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-black ${scoreBg(video.score)}`}>
                  {video.score}
                </div>
                {/* Title over cover */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white text-[14px] font-semibold leading-snug line-clamp-3">{video.title}</p>
                  <p className="text-white/60 text-[11px] mt-1">{video.posted}</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--glass-elevated)' }}>
                <p style={{ color: 'var(--text-faint)' }} className="text-[13px]">No cover available</p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { icon: <Eye size={14} />, value: fmtNum(video.views), label: "Views" },
              { icon: <Heart size={14} />, value: fmtNum(video.likes), label: "Likes" },
              { icon: <MessageCircle size={14} />, value: fmtNum(video.comments), label: "Comments" },
              { icon: <Share2 size={14} />, value: fmtNum(video.shares), label: "Shares" },
            ].map(({ icon, value, label }) => (
              <div key={label} className="glass-panel rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1" style={{ color: 'var(--text-muted)' }}>{icon}</div>
                <div className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Engagement rate */}
          <div className="glass-panel rounded-xl p-4 flex items-center justify-between mb-5">
            <div>
              <div className="text-[11px] uppercase tracking-wide font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Engagement Rate</div>
              <div className="text-[22px] font-black" style={{ color: parseFloat(engagementRate) >= 3 ? '#22c55e' : '#f59e0b' }}>
                {engagementRate}%
              </div>
            </div>
            {parseFloat(engagementRate) >= 3
              ? <TrendingUp size={28} className="text-emerald-500" />
              : <TrendingDown size={28} className="text-amber-500" />}
          </div>

          {video.videoUrl && (
            <a href={video.videoUrl} target="_blank" rel="noreferrer"
              className="btn-secondary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold">
              <ExternalLink size={14} /> افتح على TikTok
            </a>
          )}
        </div>

        {/* RIGHT — AI Analysis */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-xl font-bold mb-1 leading-snug" style={{ color: 'var(--text-primary)' }}>{video.title}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${scoreBg(video.score)}`}>
                Score: {video.score}/100
              </span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="text-[13px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>AI Score Breakdown</h2>
            <div className="space-y-3">
              {([
                ["Hook", video.hook],
                ["Pacing", video.pacing],
                ["Caption", video.caption],
                ["Hashtags", video.hashtags],
                ["CTA", video.cta],
              ] as [string, number][]).map(([label, val], i) => (
                <ScoreBar key={label} label={label} value={val} delay={i * 80} />
              ))}
            </div>
          </div>

          {/* Issue */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3">⚠ المشكلة الرئيسية</div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{video.issue}</p>
          </div>

          {/* Suggestion */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">✦ الحل المقترح</div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{video.suggestion}</p>
          </div>

          {/* Hashtags */}
          {video.hashtags_list && video.hashtags_list.length > 0 && (
            <div className="glass-panel rounded-2xl p-5">
              <div className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Hashtags Used</div>
              <div className="flex flex-wrap gap-2">
                {video.hashtags_list.map((tag: string) => (
                  <span key={tag} className="glass-elevated px-2.5 py-1 rounded-full text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fix button */}
          <button onClick={handleFix}
            className="btn-primary flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold mt-auto">
            <Zap size={16} /> صلح الفيديو ده مع الأيجنت
          </button>
        </div>
      </div>
    </div>
  );
}
