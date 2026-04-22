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
    const toneInfo   = video.tone              ? ` | Tone: ${video.tone}`                          : "";
    const riskInfo   = video.retentionRisk     ? ` | Retention Risk: ${video.retentionRisk}`        : "";
    const energyInfo = video.energy !== undefined ? ` | Energy: ${video.energy}/100`                : "";
    const pullInfo   = video.emotionalPull !== undefined ? ` | Emotional Pull: ${video.emotionalPull}/100` : "";
    const soundInfo  = video.sound !== undefined ? ` | Sound: ${video.sound}/100 (${video.soundType || "?"})` : "";
    const appInfo    = video.appearance !== null && video.appearance !== undefined ? ` | Appearance: ${video.appearance}/100` : "";
    const filmInfo   = video.filming !== null && video.filming !== undefined ? ` | Filming: ${video.filming}/100` : "";
    const contentInfo= video.content !== undefined ? ` | Content: ${video.content}/100` : "";
    const moodInfo   = video.mood ? ` | Mood: ${video.mood}` : "";
    const flagsInfo  = video.weaknessFlags?.length ? ` | Weakness Flags: ${video.weaknessFlags.join(", ")}` : "";
    dispatchAgentPrompt(
      `شوف الصورة دي وحلل الفيديو ده بالكامل واصلحه: "${video.title}" — سكور ${video.score}/100${toneInfo}${moodInfo}${riskInfo}${energyInfo}${pullInfo}${soundInfo}${appInfo}${filmInfo}${contentInfo}${flagsInfo}. المشكلة: ${video.issue}. حلل الفيديو من الأول للآخر (هوك + منتصف + نهاية + صوت + مظهر + إضاءة + كاميرات)، واديني: 1) اعادة كتابة الهوك 2) كابشن أحسن من 100 حرف 3) 3 هاشتاقات مناسبة 4) تقييم الصوت والموسيقى 5) تقييم المظهر والإضاءة من الصورة (outfit + makeup + درجة حرارة الإضاءة + خلفية) 6) تقييم زوايا التصوير وحركة الكاميرا 7) ٣ تعديلات تحريرية تزيد المشاهدات.`,
      video.coverUrl
    );
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
          {/* Cover — 9:16 TikTok vertical */}
          <div className="flex justify-center mb-5">
            <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl"
              style={{ width: '260px', height: '462px' }}>
              {video.coverUrl ? (
                <>
                  <img src={video.coverUrl} alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                  {/* Score badge */}
                  <div className={`absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-black ${scoreBg(video.score)}`}>
                    {video.score}
                  </div>
                  {/* Title + date at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-[13px] font-semibold leading-snug line-clamp-3">{video.title}</p>
                    <p className="text-white/50 text-[10px] mt-1">{video.posted}</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[13px]" style={{ color: 'var(--text-faint)' }}>
                  No cover
                </div>
              )}
            </div>
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
                ["Hook",       video.hook || 0],
                ["Pacing",     video.pacing || 0],
                ["Caption",    video.caption || 0],
                ["Hashtags",   video.hashtags || 0],
                ["CTA",        video.cta || 0],
                ["Sound",      video.sound || 0],
                ["Appearance", video.appearance || 0],
                ["Filming",    video.filming || 0],
                ["Content",    video.content || 0],
              ] as [string, number][]).map(([label, val], i) => (
                <ScoreBar key={label} label={label} value={val} delay={i * 80} />
              ))}
            </div>
          </div>

          {/* Content DNA */}
          {(video.tone || video.energy !== undefined) && (
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="text-[13px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Content DNA</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tone", value: video.tone || "—" },
                  { label: "Mood", value: video.mood || "—" },
                  { label: "Retention Risk", value: video.retentionRisk || "—" },
                  { label: "Duration", value: video.duration ? `${video.duration}s` : "—" },
                  { label: "Growth Potential", value: video.growthPotential !== undefined ? `${video.growthPotential}/100` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-elevated rounded-xl p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
                    <div className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>
              {/* Emotional Pull + Energy bars */}
              <div className="mt-4 space-y-3">
                {video.emotionalPull !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Emotional Pull</span>
                      <span className="text-[11px] font-bold" style={{ color: scoreColor(video.emotionalPull) }}>{video.emotionalPull}</span>
                    </div>
                    <div className="h-1.5 rounded-full glass-elevated overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${video.emotionalPull}%`, backgroundColor: scoreColor(video.emotionalPull) }} />
                    </div>
                  </div>
                )}
                {video.energy !== undefined && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Content Energy</span>
                      <span className="text-[11px] font-bold" style={{ color: scoreColor(video.energy) }}>{video.energy}</span>
                    </div>
                    <div className="h-1.5 rounded-full glass-elevated overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${video.energy}%`, backgroundColor: scoreColor(video.energy) }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sound Analysis */}
          {(video.sound !== undefined || video.soundType) && (
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Sound & Music</h2>
                {video.sound !== undefined && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${scoreBg(video.sound)}`}>
                    {video.sound}/100
                  </span>
                )}
              </div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {video.soundType && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    video.soundType === "Trending Audio" ? "bg-blue-500/15 text-blue-400"
                    : video.soundType === "Original Sound" ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                  }`}>
                    {video.soundType}
                  </span>
                )}
                {video.soundName && video.soundName !== "Unknown" && (
                  <span className="glass-elevated px-2 py-0.5 rounded-full text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    ♪ {video.soundName}
                  </span>
                )}
              </div>
              {video.soundIssue && (
                <p className="text-[12px] leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{video.soundIssue}</p>
              )}
              {video.soundSuggestion && (
                <div className="glass-elevated rounded-xl p-2.5 mt-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">✦ Fix  </span>
                  <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{video.soundSuggestion}</span>
                </div>
              )}
            </div>
          )}

          {/* Appearance Analysis */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Appearance & Visual Presentation</h2>
              {video.appearance !== null && video.appearance !== undefined ? (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${scoreBg(video.appearance)}`}>
                  {video.appearance}/100
                </span>
              ) : (
                <span className="bg-zinc-500/15 text-zinc-400 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  Not scored
                </span>
              )}
            </div>
            {video.appearance !== null && video.appearance !== undefined ? (
              <>
                <div className="h-1.5 rounded-full glass-elevated overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${video.appearance}%`, backgroundColor: scoreColor(video.appearance) }} />
                </div>
                {video.appearanceIssue ? (
                  <div className="glass-elevated rounded-xl p-2.5">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">⚠ Issue  </span>
                    <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{video.appearanceIssue}</span>
                  </div>
                ) : (
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Outfit, makeup, lighting, and background all look good.</p>
                )}
              </>
            ) : (
              <div className="text-center py-3">
                <p className="text-[12px] mb-3" style={{ color: 'var(--text-muted)' }}>
                  Visual assessment needed — the agent will evaluate outfit, makeup, lighting, background, and camera angles.
                </p>
                <button
                  onClick={() => dispatchAgentPrompt(
                    `شوف الصورة دي من فيديو "${video.title}" وحلل التكوين البصري بالكامل. قيّم: 1) الـ Outfit والألوان وملائمة الميكب للمشهد. 2) الـ Filming: الإضاءة (درجة حرارتها دافية/باردة وهل في ظلال حادة) وزوايا الكاميرا (Eye-level ولا زاوية مختلفة؟). 3) الخلفية. اديني Appearance Score من 100 و Filming Score من 100 بناءً على الصورة دي، مع حلول عملية للفيديو الجاي.`,
                    video.coverUrl
                  )}
                  className="btn-secondary px-4 py-2 rounded-xl text-[12px] font-semibold"
                >
                  Analyze with Vision
                </button>
              </div>
            )}
          </div>

          {/* Filming & Camera Analysis */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Filming & Camera Setup</h2>
              {video.filming !== null && video.filming !== undefined ? (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${scoreBg(video.filming)}`}>
                  {video.filming}/100
                </span>
              ) : (
                <span className="bg-zinc-500/15 text-zinc-400 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  Not scored
                </span>
              )}
            </div>
            {video.filming !== null && video.filming !== undefined ? (
              <>
                <div className="h-1.5 rounded-full glass-elevated overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${video.filming}%`, backgroundColor: scoreColor(video.filming) }} />
                </div>
                {video.filmingIssue && (
                  <div className="glass-elevated rounded-xl p-2.5 mb-3">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">⚠ Issue  </span>
                    <span className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{video.filmingIssue}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[12px] mb-3" style={{ color: 'var(--text-muted)' }}>No filming data — run vision analysis to score lighting and camera setup.</p>
            )}
            <button
              onClick={() => dispatchAgentPrompt(
                `شوف الصورة دي من فيديو "${video.title}" وحلل التصوير والإضاءة. الاستوديو عنده 3 كاميرات: A أمامية، B جانبية 45 درجة، C عريضة. حلل: 1) درجة حرارة الإضاءة (دافية/باردة/محايدة بالـ Kelvin). 2) مكان الـ Key Light و Fill Light و Rim Light. 3) الظلال الحادة أو المشاكل في الإضاءة. 4) زاوية الكاميرا الحالية وهل تناسب المحتوى. 5) توصيتك للفيديو الجاي: توزيع الكاميرات الـ 3 وحركتهم (Static / Push-in / Cut rhythm). اديني حلول عملية محددة.`,
                video.coverUrl
              )}
              className="btn-secondary px-4 py-2 rounded-xl text-[12px] font-semibold w-full"
            >
              Analyze Camera & Lighting with Agent
            </button>
          </div>

          {/* Weakness Flags */}
          {video.weaknessFlags && video.weaknessFlags.length > 0 && (
            <div className="glass-panel rounded-2xl p-5">
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3">Weakness Flags</div>
              <div className="flex flex-wrap gap-2">
                {video.weaknessFlags.map((flag: string) => (
                  <span key={flag} className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

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
