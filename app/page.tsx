'use client';

import VideoScoreCard from "@/components/VideoScoreCard";
import TrendRow from "@/components/TrendRow";
import CompetitorCard from "@/components/CompetitorCard";
import GenerationBars from "@/components/GenerationBar";
import { useData } from "@/components/DataContext";
import { Eye, Users, TrendingUp, AlertTriangle, ArrowUpRight, Zap, Heart, MessageCircle, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);

const card: React.CSSProperties = {
  background: 'var(--glass-bg)',
  borderRadius: 24,
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--glass-shadow)',
  overflow: 'hidden',
};

// Donut chart SVG
function DonutChart({ high, med, low }: { high: number; med: number; low: number }) {
  const total = high + med + low || 1;
  const cx = 64, cy = 64, r = 48, sw = 16;
  const circ = 2 * Math.PI * r;
  const gap = 3;
  const segs = [
    { v: high, color: '#22c55e' },
    { v: med,  color: '#f59e0b' },
    { v: low,  color: '#ef4444' },
  ];
  let off = 0;
  return (
    <div style={{ position: 'relative', width: 128, height: 128 }}>
      <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--glass-elevated)" strokeWidth={sw} />
        {segs.map(({ v, color }, i) => {
          const len = (v / total) * (circ - segs.length * gap);
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
              strokeDasharray={`${len} ${circ}`} strokeDashoffset={-off} strokeLinecap="round" />
          );
          off += len + gap;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{total}</div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>videos</div>
      </div>
    </div>
  );
}

// Line chart SVG
function LineChart({ videos }: { videos: any[] }) {
  const pts = videos.slice(-8);
  const W = 260, H = 100, P = 12;
  const maxV = Math.max(...pts.map(v => v.views||0), 1);
  const maxL = Math.max(...pts.map(v => v.likes||0), 1);
  const step = (W - P*2) / Math.max(pts.length-1, 1);

  const vPts = pts.map((v,i) => `${P+i*step},${H-P-((v.views||0)/maxV)*(H-P*2)}`).join(' ');
  const lPts = pts.map((v,i) => `${P+i*step},${H-P-((v.likes||0)/maxL)*(H-P*2)}`).join(' ');
  const vArea = `${P},${H-P} ${vPts} ${P+(pts.length-1)*step},${H-P}`;
  const lArea = `${P},${H-P} ${lPts} ${P+(pts.length-1)*step},${H-P}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="gv2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="gl2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={vArea} fill="url(#gv2)" />
      <polygon points={lArea} fill="url(#gl2)" />
      <polyline points={vPts} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={lPts} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OverviewPage() {
  const { account, videos, generations, trends, competitors } = useData();
  const [sortBy, setSortBy] = useState<'score' | 'views'>('score');

  const displayVideos = [...videos].sort((a,b) => {
    if (sortBy === 'score') return (b.score||0)-(a.score||0);
    return (b.views||0)-(a.views||0);
  });
  const chartVids  = [...videos].sort((a,b) => (a.posted||'').localeCompare(b.posted||''));
  const high       = videos.filter(v => (v.score||0) >= 70).length;
  const med        = videos.filter(v => (v.score||0) >= 50 && (v.score||0) < 70).length;
  const low        = videos.filter(v => (v.score||0) < 50).length;
  const totalViews = videos.reduce((s,v) => s+(v.views||0), 0);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">

      {/* ── PAGE TITLE ─────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
          مراقبة أداء القناة
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 46, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.045em', lineHeight: 1 }}>
            Content Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {(account?.actionItems||0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 12, fontWeight: 700, color: '#ef4444' }}>
                <AlertTriangle size={13}/> {account.actionItems} action items
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 100, background: 'var(--glass-elevated)', border: '1px solid var(--glass-elevated-border)', fontSize: 13, color: 'var(--text-muted)' }}>
              {account?.username || '@rasayel_podcast'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 STAT PILLS ───────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users,       label: 'Followers',       value: fmt(account?.followers||0),       sub: `+${fmt(account?.followersGrowth||0)} this week`, up: true },
          { icon: Eye,         label: 'Weekly Views',    value: fmt(account?.weeklyViews||0),      sub: `${account?.weeklyViewsChange||0}% change`,       up: (account?.weeklyViewsChange||0)>=0 },
          { icon: TrendingUp,  label: 'Avg Engagement',  value: `${account?.avgEngagement||0}%`,  sub: 'engagement rate',                                 up: true },
          { icon: AlertTriangle,label:'Videos Audited', value: String(videos.length),             sub: 'analyzed by Sarie',                               up: true },
        ].map(({ icon: Icon, label, value, sub, up }) => (
          <div key={label} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border border-white/10 bg-white/5 shadow-lg overflow-hidden min-w-0">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--glass-elevated)', border: '1px solid var(--glass-elevated-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} color="var(--text-muted)" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{label}</div>
              <div style={{ fontSize: 10, color: up ? '#22c55e' : '#ef4444', marginTop: 2, fontWeight: 600 }}>
                {up ? '↑' : '↓'} {sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN 3-COL GRID ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_1fr] gap-4 md:gap-5 items-start">

        {/* COL 1 — Top Videos list */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', maxHeight: 620 }}>
          <div style={{ padding: '24px 20px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Top Videos</span>
              <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--glass-elevated-border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Plus size={16} color="var(--text-muted)"/>
              </button>
            </div>
            
            {/* Sort Toggles */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button onClick={() => setSortBy('score')} style={{ background: sortBy === 'score' ? 'var(--text-primary)' : 'transparent', color: sortBy === 'score' ? 'var(--bg-base)' : 'var(--text-primary)', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 700, border: sortBy === 'score' ? 'none' : '1px solid var(--glass-elevated-border)', cursor: 'pointer', transition: 'all 0.2s' }}>By Score</button>
              <button onClick={() => setSortBy('views')} style={{ background: sortBy === 'views' ? 'var(--text-primary)' : 'transparent', color: sortBy === 'views' ? 'var(--bg-base)' : 'var(--text-primary)', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 700, border: sortBy === 'views' ? 'none' : '1px solid var(--glass-elevated-border)', cursor: 'pointer', transition: 'all 0.2s' }}>By Views</button>
            </div>

            {/* Count pill */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--glass-elevated)', border: '1px solid var(--glass-elevated-border)', borderRadius: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: 'var(--bg-base)' }}>{videos.length}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Videos Analyzed</span>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </div>
          </div>

          <div style={{ overflowY: 'auto', padding: '0 14px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, paddingRight: 8 }}>
            {displayVideos.map(v => {
              const sc = v.score||0;
              const scClr = sc>=70?'#22c55e':sc>=50?'#f59e0b':'#ef4444';
              const scBg  = sc>=70?'rgba(34,197,94,0.1)':sc>=50?'rgba(245,158,11,0.1)':'rgba(239,68,68,0.1)';
              return (
                <Link key={v.id} href={`/audit/${v.id}`} style={{ padding: '16px', background: 'transparent', borderRadius: 16, border: '1px solid var(--glass-border)', cursor: 'pointer', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ padding: '4px 10px', borderRadius: 10, background: scBg, color: scClr, fontSize: 12, fontWeight: 800 }}>{sc}</div>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--glass-elevated-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: scClr }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4, direction: 'rtl' }}>
                    {v.title}
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12}/>{fmt(v.views||0)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={12}/>{fmt(v.likes||0)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={12}/>{v.comments||0}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* COL 2 — Score distribution + Sarie CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Donut + Views chart */}
          <div style={{ ...card, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Score Distribution</span>
              <button style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--glass-elevated-border)', background: 'var(--glass-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowUpRight size={13} color="var(--text-muted)"/>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <DonutChart high={high} med={med} low={low} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[{ label: 'High (≥70)', val: high, c: '#22c55e' }, { label: 'Mid (50–69)', val: med, c: '#f59e0b' }, { label: 'Low (<50)', val: low, c: '#ef4444' }].map(({ label, val, c }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audience */}
          <div style={{ ...card, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Audience</span>
            </div>
            <GenerationBars generations={generations} />
          </div>

          {/* Dark Sarie CTA */}
          <div style={{ borderRadius: 24, padding: '26px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            {[160,120,80,50].map((s,i) => (
              <div key={i} style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: s, height: s, borderRadius: '50%', border: '1px solid var(--glass-elevated-border)' }} />
            ))}
            <div style={{ position: 'relative', zIndex: 2, width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 18 }}>
              <Zap size={20} color="#ef4444" />
            </div>
            <div style={{ position: 'relative', zIndex: 2, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.35, marginBottom: 18 }}>
              Get AI content<br/>strategy now.
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("agent-prompt", { detail: { prompt: "اعطيني استراتيجية محتوى كاملة بناءً على بيانات الأكاونت" } }))}
              style={{ position: 'relative', zIndex: 2, width: '100%', padding: '11px', borderRadius: 14, background: 'var(--btn-primary-bg)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Talk to Sarie
            </button>
          </div>
        </div>

        {/* COL 3 — Views chart + Trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Views vs Likes chart */}
          <div style={{ ...card, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Views vs Likes</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', marginBottom: 4 }}>{fmt(totalViews)}</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444', display: 'inline-block' }}/>Views</span>
              <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#8b5cf6', display: 'inline-block' }}/>Likes</span>
            </div>
            <LineChart videos={chartVids} />
          </div>

          {/* Trends */}
          <div style={{ ...card, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Trending Now</span>
              <button style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--glass-elevated-border)', background: 'var(--glass-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowUpRight size={13} color="var(--text-muted)"/>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {trends.slice(0,4).map((t: any, i: number) => (
                <div key={t.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i<3 ? '1px solid var(--glass-elevated-border)' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--glass-elevated)', border: '1px solid var(--glass-elevated-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0 }}>#{t.rank}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>{t.type} · {t.views}</div>
                  </div>
                  <ArrowUpRight size={13} color="var(--text-faint)"/>
                </div>
              ))}
            </div>
          </div>

          {/* Competitors preview */}
          <div style={{ ...card, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Competitors</span>
              <Link href="/competitors" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--glass-elevated-border)', background: 'var(--glass-elevated)', justifyContent: 'center', textDecoration: 'none' }}>
                <ArrowUpRight size={13} color="var(--text-muted)"/>
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {competitors.slice(0,2).map((c: any) => {
                const spike = c.status === 'spiking';
                return (
                  <div key={c.handle} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--glass-elevated)', borderRadius: 12, border: '1px solid var(--glass-elevated-border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: spike ? 'rgba(34,197,94,0.1)' : 'var(--glass-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: spike ? '#22c55e' : 'var(--text-muted)', flexShrink: 0 }}>
                      {(c.handle||'?')[1]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.handle}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>{c.topFormat || '—'}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: spike ? 'rgba(34,197,94,0.1)' : 'var(--glass-elevated)', color: spike ? '#22c55e' : 'var(--text-muted)' }}>
                      {spike ? '↑ Spiking' : 'Stable'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
