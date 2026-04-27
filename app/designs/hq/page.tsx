'use client';

import { useData } from "@/components/DataContext";
import { Eye, Users, TrendingUp, Zap, BarChart2, Video, Lightbulb, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
const scoreClr = (v: number) => v >= 80 ? '#22c55e' : v >= 60 ? '#f59e0b' : '#ef4444';

export default function HQDesign() {
  const { account, videos, trends, competitors } = useData();
  const sorted = [...videos].sort((a,b)=>(b.score||0)-(a.score||0));
  const avgScore = videos.length ? Math.round(videos.reduce((s,v)=>s+(v.score||0),0)/videos.length) : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0d0d0d', color: '#fff', fontFamily: 'var(--font-inter, Inter, sans-serif)', overflowY: 'auto' }}>

      {/* ── TOP NAV ──────────────────────────────────────────── */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', height: 56, gap: 32 }}>
          {/* Logo */}
          <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.02em', color: '#ef4444' }}>MAS AI</span>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {[
              { label: 'Overview', icon: BarChart2, active: false },
              { label: 'Content Audit', icon: Video, active: true },
              { label: 'Competitors', icon: Users, active: false },
              { label: 'Ideas', icon: Lightbulb, active: false },
            ].map(({ label, icon: Icon, active }) => (
              <button key={label} style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px',
                borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: active ? 'rgba(239,68,68,0.12)' : 'transparent',
                color: active ? '#ef4444' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.15s',
              }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{account?.username || '@rasayel_podcast'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{account?.followers ? fmt(account.followers)+' followers' : '—'}</div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', border: '1.5px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#ef4444' }}>R</div>
          </div>
        </div>
      </header>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[
            { label: 'Followers', value: fmt(account?.followers||0), sub: `+${fmt(account?.followersGrowth||0)} this week`, icon: Users, up: true },
            { label: 'Weekly Views', value: fmt(account?.weeklyViews||0), sub: `${account?.weeklyViewsChange||0}% change`, icon: Eye, up: (account?.weeklyViewsChange||0) >= 0 },
            { label: 'Avg Engagement', value: `${account?.avgEngagement||0}%`, sub: `${account?.engagementChange||0}% change`, icon: TrendingUp, up: (account?.engagementChange||0) >= 0 },
            { label: 'Videos Audited', value: String(videos.length), sub: 'by Claude AI', icon: Video, up: true },
            { label: 'Avg Score', value: String(avgScore)+'/100', sub: avgScore >= 70 ? 'Looking good' : 'Needs work', icon: Zap, up: avgScore >= 60 },
          ].map(({ label, value, sub, icon: Icon, up }, i) => (
            <div key={label} style={{
              padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 16,
              borderRight: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{label}</div>
                <div style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, color: up ? '#22c55e' : '#ef4444' }}>
                  {up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>} {sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

        {/* LEFT: Video table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Content Audit</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>{videos.length} videos analyzed by Sarie</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: '#ef4444', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              <Zap size={12}/> Ask Sarie
            </button>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 70px 70px 70px 70px 90px', gap: 8, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', marginBottom: 6 }}>
            {['Video', 'Views', 'Likes', 'Score', 'Hook', 'Tone'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {sorted.slice(0,10).map((v) => (
              <div key={v.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 70px 70px 70px 70px 90px', gap: 8, padding: '12px 16px',
                borderRadius: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{fmt(v.views||0)}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{fmt(v.likes||0)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: scoreClr(v.score||0) }}>{v.score}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: scoreClr(v.hook||0) }}>{v.hook ?? '—'}</span>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.tone?.split(' / ')[0] || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Sidebar panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Trends */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Trending Now</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {trends.slice(0,4).map((t: any) => (
                <div key={t.rank} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: '#ef4444', width: 14 }}>#{t.rank}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{t.views} views · {t.type}</div>
                  </div>
                  <ChevronRight size={12} color="rgba(255,255,255,0.2)" />
                </div>
              ))}
            </div>
          </div>

          {/* Competitors */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Competitors</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {competitors.slice(0,3).map((c: any) => (
                <div key={c.handle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: c.status === 'spiking' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: c.status === 'spiking' ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
                    {(c.handle||'?')[1]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e4e4e7' }}>{c.handle}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{fmt(c.followers||0)} followers</div>
                  </div>
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, fontWeight: 700,
                    background: c.status === 'spiking' ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                    color: c.status === 'spiking' ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                    {c.status === 'spiking' ? '↑ Spiking' : 'Stable'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
