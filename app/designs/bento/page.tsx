'use client';

import { useData } from "@/components/DataContext";
import { LayoutDashboard, Video, Users, Lightbulb, MessageSquare, TrendingUp, Eye, Zap, ArrowUp, ArrowDown } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
const scoreClr = (v: number) => v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#f43f5e';
const scoreBg  = (v: number) => v >= 80 ? 'rgba(16,185,129,0.12)' : v >= 60 ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)';

export default function BentoDesign() {
  const { account, videos, trends, competitors } = useData();
  const top = [...videos].sort((a,b)=>(b.score||0)-(a.score||0)).slice(0,6);
  const avgScore = videos.length ? Math.round(videos.reduce((s,v)=>s+(v.score||0),0)/videos.length) : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', background: '#09090b', color: '#fafafa', fontFamily: 'var(--font-inter, Inter, sans-serif)', overflowY: 'auto' }}>

      {/* ── ICON SIDEBAR ────────────────────────────── */}
      <aside style={{ width: 64, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 6, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 900, fontSize: 13, color: '#fff' }}>M</span>
        </div>
        {[
          { icon: LayoutDashboard, active: true },
          { icon: Video, active: false },
          { icon: Users, active: false },
          { icon: Lightbulb, active: false },
        ].map(({ icon: Icon, active }, i) => (
          <button key={i} style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
            background: active ? 'rgba(239,68,68,0.15)' : 'transparent', transition: 'background 0.15s' }}>
            <Icon size={16} color={active ? '#ef4444' : 'rgba(255,255,255,0.3)'} />
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Avatar */}
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>R</div>
      </aside>

      {/* ── BENTO GRID ──────────────────────────────── */}
      <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        {/* Page title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>{account?.username || '@rasayel_podcast'}</p>
        </div>

        {/* Bento grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto', gap: 14 }}>

          {/* BIG: Followers — 4 cols × 2 rows */}
          <div style={{ gridColumn: 'span 3', gridRow: 'span 1', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 20, padding: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(239,68,68,0.6)', marginBottom: 8 }}>Followers</div>
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>{fmt(account?.followers||0)}</div>
            <div style={{ fontSize: 11, color: '#22c55e', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUp size={11}/> +{fmt(account?.followersGrowth||0)} this week
            </div>
          </div>

          {/* Weekly views — 3 cols */}
          <div style={{ gridColumn: 'span 3', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Weekly Views</div>
              <Eye size={14} color="rgba(255,255,255,0.2)" />
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{fmt(account?.weeklyViews||0)}</div>
            <div style={{ fontSize: 11, color: (account?.weeklyViewsChange||0) >= 0 ? '#22c55e' : '#f43f5e', marginTop: 6 }}>
              {(account?.weeklyViewsChange||0) >= 0 ? '↑' : '↓'} {account?.weeklyViewsChange||0}%
            </div>
          </div>

          {/* Engagement — 3 cols */}
          <div style={{ gridColumn: 'span 3', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Engagement</div>
              <TrendingUp size={14} color="rgba(255,255,255,0.2)" />
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em' }}>{account?.avgEngagement||0}%</div>
            <div style={{ fontSize: 11, color: (account?.engagementChange||0) >= 0 ? '#22c55e' : '#f43f5e', marginTop: 6 }}>
              {(account?.engagementChange||0) >= 0 ? '↑' : '↓'} {account?.engagementChange||0}% change
            </div>
          </div>

          {/* Avg score — 3 cols */}
          <div style={{ gridColumn: 'span 3', background: scoreBg(avgScore), border: `1px solid ${scoreClr(avgScore)}22`, borderRadius: 20, padding: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${scoreClr(avgScore)}99`, marginBottom: 8 }}>Avg Score</div>
            <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-0.04em', color: scoreClr(avgScore) }}>{avgScore}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{videos.length} videos audited</div>
          </div>

          {/* VIDEO CARDS — spans 8 cols */}
          <div style={{ gridColumn: 'span 8', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Top Videos</h2>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>by score</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {top.map((v) => (
                <div key={v.id} style={{ borderRadius: 14, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                  {/* Cover placeholder */}
                  <div style={{ height: 80, background: `linear-gradient(135deg, ${scoreBg(v.score||0)}, rgba(255,255,255,0.02))`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Video size={22} color="rgba(255,255,255,0.15)" />
                    <div style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 100, background: scoreBg(v.score||0), fontSize: 11, fontWeight: 800, color: scoreClr(v.score||0) }}>
                      {v.score}
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#e4e4e7', marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{v.title}</div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                      <span>👁 {fmt(v.views||0)}</span>
                      <span>❤ {fmt(v.likes||0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TRENDS — 4 cols */}
          <div style={{ gridColumn: 'span 4', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 22 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Trending</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trends.slice(0,4).map((t: any) => (
                <div key={t.rank} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#ef4444', width: 14, flexShrink: 0, paddingTop: 1 }}>#{t.rank}</span>
                  <div>
                    <div style={{ fontSize: 12, color: '#d4d4d8', fontWeight: 500, lineHeight: 1.4 }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{t.type} · {t.views}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COMPETITORS — 6 cols */}
          <div style={{ gridColumn: 'span 6', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 22 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Competitors</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {competitors.slice(0,3).map((c: any) => (
                <div key={c.handle} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: c.status === 'spiking' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: c.status === 'spiking' ? '#22c55e' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                    {(c.handle||'?')[1]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.handle}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{fmt(c.followers||0)} · {c.topFormat}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.status === 'spiking' ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>{c.status === 'spiking' ? '↑ Spiking' : 'Stable'}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{c.viewChange}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SARIE CTA — 6 cols */}
          <div style={{ gridColumn: 'span 6', background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🤖</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Ask Sarie</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 18, lineHeight: 1.5 }}>Your AI content strategist is ready — ask about any video, competitor, or content idea.</div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: '#ef4444', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start' }}>
              <MessageSquare size={14}/> Open Chat
            </button>
          </div>

        </div>
      </main>

      {/* Floating AI button */}
      <button style={{ position: 'fixed', bottom: 28, right: 28, width: 52, height: 52, borderRadius: '50%', background: '#ef4444', border: 'none', boxShadow: '0 8px 32px rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 100 }}>
        <Zap size={20} color="#fff" />
      </button>
    </div>
  );
}
