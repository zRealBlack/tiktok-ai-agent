'use client';

import { useData } from "@/components/DataContext";
import { Play, TrendingUp, Eye, MessageCircle, Heart, Share2, Zap, ChevronRight, Star } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
const scoreClr = (v: number) => v >= 80 ? '#00f5a0' : v >= 60 ? '#fbbf24' : '#ff4d6d';

export default function StudioDesign() {
  const { account, videos, trends, competitors } = useData();
  const sorted = [...videos].sort((a,b)=>(b.views||0)-(a.views||0));

  const ACCENT = '#fe2c55'; // TikTok red

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', fontFamily: 'var(--font-inter, Inter, sans-serif)', background: '#000', overflowY: 'auto' }}>

      {/* ── LEFT PANEL: Nav + Stats ───────────────── */}
      <aside style={{ width: 280, flexShrink: 0, background: '#111', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Brand */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff' }}>M</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Mas AI Studio</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Content Intelligence</div>
            </div>
          </div>
        </div>

        {/* Account card */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: `2px solid ${ACCENT}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#fff', flexShrink: 0 }}>R</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{account?.username || '@rasayel_podcast'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Content Creator</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Followers', value: fmt(account?.followers||0) },
              { label: 'Engagement', value: `${account?.avgEngagement||0}%` },
              { label: 'Weekly Views', value: fmt(account?.weeklyViews||0) },
              { label: 'Videos', value: String(videos.length) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div style={{ padding: '20px 24px', flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>Trending Formats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {trends.map((t: any) => (
              <div key={t.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: ACCENT, width: 16, flexShrink: 0 }}>#{t.rank}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: '#e4e4e7', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{t.views}</div>
                </div>
                <ChevronRight size={12} color="rgba(255,255,255,0.2)" />
              </div>
            ))}
          </div>
        </div>

        {/* Sarie */}
        <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #ff6b9d)`, border: 'none', cursor: 'pointer' }}>
            <Zap size={15} color="#fff"/>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Ask Sarie</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>AI Strategy Agent</div>
            </div>
          </button>
        </div>
      </aside>

      {/* ── CENTER: Video feed ────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>Content Audit</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>{videos.length} videos · sorted by views</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'High Score', 'Needs Work'].map((f, i) => (
              <button key={f} style={{ padding: '6px 14px', borderRadius: 100, border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)', background: i === 0 ? ACCENT : 'transparent', color: i === 0 ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((v) => (
            <div key={v.id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 20, alignItems: 'center', cursor: 'pointer' }}>
              {/* Thumbnail */}
              <div style={{ width: 100, height: 70, borderRadius: 12, background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <Play size={20} color="rgba(255,255,255,0.3)" />
                <div style={{ position: 'absolute', bottom: 5, left: 5, right: 5, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${v.score||0}%`, background: scoreClr(v.score||0) }} />
                </div>
              </div>

              {/* Info */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11}/> {fmt(v.views||0)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={11}/> {fmt(v.likes||0)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={11}/> {v.comments||0}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Share2 size={11}/> {fmt(v.shares||0)}</span>
                </div>
                {/* Issue pill */}
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>
                  ⚠ {v.issue || '—'}
                </div>
              </div>

              {/* Score + mini bars */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: scoreClr(v.score||0), letterSpacing: '-0.04em', lineHeight: 1 }}>{v.score}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>/100</div>
                <div style={{ display: 'flex', flex: 'column', gap: 4, width: 80 }}>
                  {(['hook','pacing','cta'] as const).map(k => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</span>
                      <div style={{ width: 40, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', width: `${v[k]||0}%`, borderRadius: 2, background: scoreClr(v[k]||0) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── RIGHT: Competitors panel ──────────────── */}
      <aside style={{ width: 260, flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', padding: 24, position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Competition</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {competitors.map((c: any) => (
            <div key={c.handle} style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: c.status === 'spiking' ? 'rgba(0,245,160,0.1)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: c.status === 'spiking' ? '#00f5a0' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                  {(c.handle||'?')[1]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.handle}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{fmt(c.followers||0)} followers</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>{c.topFormat}</span>
                <span style={{ color: c.status === 'spiking' ? '#00f5a0' : 'rgba(255,255,255,0.35)', fontWeight: 700 }}>{c.status === 'spiking' ? '↑ Spiking' : '→ Stable'}</span>
              </div>
              {c.status === 'spiking' && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#fbbf24' }}>
                  <Star size={10} fill="#fbbf24"/> Watch this account
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>Performance</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Hook score', value: Math.round(videos.reduce((s,v)=>s+(v.hook||0),0)/Math.max(videos.length,1)) },
              { label: 'CTA score', value: Math.round(videos.reduce((s,v)=>s+(v.cta||0),0)/Math.max(videos.length,1)) },
              { label: 'Pacing score', value: Math.round(videos.reduce((s,v)=>s+(v.pacing||0),0)/Math.max(videos.length,1)) },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                  <span style={{ color: scoreClr(value), fontWeight: 700 }}>{value}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${value}%`, borderRadius: 2, background: scoreClr(value), transition: 'width 0.7s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
