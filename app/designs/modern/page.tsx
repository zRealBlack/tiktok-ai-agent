'use client';

import { useData } from "@/components/DataContext";
import { PieChart, TrendingUp, Eye, Heart, MessageCircle, Zap, MoreHorizontal } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
const scoreClr = (v: number) => v >= 80 ? '#2f9e44' : v >= 60 ? '#e67700' : '#c92a2a';
const scoreBg  = (v: number) => v >= 80 ? '#ebfbee' : v >= 60 ? '#fff9db' : '#fff5f5';
const BLUE = '#4263eb';
const BLUE_L = '#748ffc';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20, padding: '22px 24px',
  border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

export default function ModernOverview() {
  const { account, videos, trends, competitors } = useData();

  const sorted    = [...videos].sort((a,b) => (b.views||0)-(a.views||0));
  const topVideos = sorted.slice(0, 5);
  const maxViews  = sorted[0]?.views || 1;
  const avgScore  = videos.length ? Math.round(videos.reduce((s,v)=>s+(v.score||0),0)/videos.length) : 0;
  const avgHook   = videos.length ? Math.round(videos.reduce((s,v)=>s+(v.hook||0),0)/videos.length) : 0;
  const avgPacing = videos.length ? Math.round(videos.reduce((s,v)=>s+(v.pacing||0),0)/videos.length) : 0;
  const avgCta    = videos.length ? Math.round(videos.reduce((s,v)=>s+(v.cta||0),0)/videos.length) : 0;
  const totalViews= videos.reduce((s,v)=>s+(v.views||0),0);
  const chartVids = [...videos].sort((a,b)=>(a.posted||'').localeCompare(b.posted||'')).slice(-7);
  const chartMax  = Math.max(...chartVids.map(v=>v.views||0), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>

      {/* ── LEFT COLUMN ─────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Channel Score */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={14} color="#868e96" />
            <span style={{ fontSize: 13, color: '#868e96', fontWeight: 600 }}>Channel Score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 38, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.04em' }}>{avgScore}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: scoreClr(avgScore), background: scoreBg(avgScore), padding: '2px 8px', borderRadius: 100 }}>/100</span>
          </div>
          <div style={{ fontSize: 12, color: '#868e96', marginBottom: 14 }}>
            {avgScore >= 70 ? 'Content performance is strong.' : avgScore >= 50 ? 'Room for improvement across hooks & CTAs.' : 'Content needs significant work.'}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
            {videos.slice(0,8).map((v,i) => (
              <div key={i} style={{ flex: 1, background: i===7 ? BLUE : '#e9ecef', borderRadius: '3px 3px 0 0', height: `${Math.max(((v.score||0)/100)*100,5)}%`, minHeight: 4 }} />
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <PieChart size={14} color="#868e96" />
            <span style={{ fontSize: 13, color: '#868e96', fontWeight: 600 }}>Performance Summary</span>
          </div>
          <div style={{ fontSize: 13, color: '#495057', lineHeight: 1.7, marginBottom: 16 }}>
            Your <strong style={{ color: '#1a1a2e' }}>hook score avg is {avgHook}</strong> — opening moments need work to stop the scroll.
          </div>
          {[{ label: 'Hook', value: avgHook }, { label: 'Pacing', value: avgPacing }, { label: 'CTA', value: avgCta }].map(({ label, value }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#868e96', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: scoreClr(value) }}>{value}</span>
              </div>
              <div style={{ height: 5, background: '#f1f3f5', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${value}%`, background: scoreClr(value), borderRadius: 100 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Dark Sarie card */}
        <div style={{ background: '#1a1a2e', borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {[160,120,84,52].map((s,i) => (
            <div key={i} style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: s, height: s, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
          ))}
          <div style={{ position: 'relative', zIndex: 2, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, marginTop: 20 }}>
            <Zap size={20} color="#fff" />
          </div>
          <div style={{ position: 'relative', zIndex: 2, fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.3, marginBottom: 20 }}>
            Get AI content<br/>strategy now.
          </div>
          <button style={{ position: 'relative', zIndex: 2, width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Talk to Sarie
          </button>
        </div>
      </div>

      {/* ── RIGHT COLUMN ────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Chart card */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={14} color="#868e96" />
              <span style={{ fontSize: 13, color: '#868e96', fontWeight: 600 }}>Video Performance (Views)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#868e96' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: BLUE, display: 'inline-block' }}/>Views</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: BLUE_L, display: 'inline-block' }}/>Likes</span>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.04em' }}>{fmt(totalViews)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12 }}>
              <span style={{ color: '#2f9e44', fontWeight: 700, background: '#ebfbee', padding: '2px 8px', borderRadius: 100 }}>+{account?.weeklyViewsChange||0}%</span>
              <span style={{ color: '#adb5bd' }}>total across {videos.length} videos</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
            {chartVids.map((v, i) => {
              const h   = Math.max(((v.views||0)/chartMax)*100, 4);
              const lh  = v.views > 0 ? Math.min(((v.likes||0)/v.views)*200, 35) : 8;
              const pct = v.views > 0 ? `+${(((v.likes||0)/v.views)*100).toFixed(1)}%` : '';
              const last = i === chartVids.length - 1;
              return (
                <div key={v.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 9, color: '#868e96', marginBottom: 6, fontWeight: 600 }}>{pct}</div>
                  <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, height: `${h * 1.4}px`, background: last ? BLUE : '#dee2e6', borderRadius: '6px 6px 0 0', minHeight: 4 }} />
                    <div style={{ flex: 1, height: `${lh * 1.4}px`, background: last ? BLUE_L : '#e9ecef', borderRadius: '6px 6px 0 0', minHeight: 3 }} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: '#adb5bd', textAlign: 'center' }}>
                    {(v.posted||'').slice(5)||`V${i+1}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Top Videos */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={14} color="#868e96" />
                <span style={{ fontSize: 13, color: '#868e96', fontWeight: 600 }}>Top Videos</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={15} color="#ced4da"/></button>
            </div>
            {topVideos.map((v, i) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < topVideos.length-1 ? '1px solid #f1f3f5' : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: scoreBg(v.score||0), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800, color: scoreClr(v.score||0) }}>{v.score}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 2, display: 'flex', gap: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10}/>{fmt(v.views||0)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={10}/>{fmt(v.likes||0)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={10}/>{v.comments||0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Competitors */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PieChart size={14} color="#868e96" />
                <span style={{ fontSize: 13, color: '#868e96', fontWeight: 600 }}>Competitor Snapshot</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}><MoreHorizontal size={15} color="#ced4da"/></button>
            </div>
            <div style={{ height: 8, background: '#f1f3f5', borderRadius: 100, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ height: '100%', width: `${Math.min(((account?.followers||0)/1000000)*100,100)}%`, background: `linear-gradient(90deg,${BLUE},${BLUE_L})`, borderRadius: 100 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {competitors.slice(0,3).map((c: any) => {
                const pct   = Math.round(((c.followers||0)/Math.max(account?.followers||1,c.followers||1))*100);
                const color = c.status==='spiking' ? '#2f9e44' : BLUE;
                const bg    = c.status==='spiking' ? '#ebfbee' : '#eef2ff';
                return (
                  <div key={c.handle} style={{ background: bg, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: 44, height: 44, margin: '0 auto 10px' }}>
                      <svg viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="22" cy="22" r="18" fill="none" stroke="#e9ecef" strokeWidth="4"/>
                        <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${(pct/100)*113} 113`} strokeLinecap="round"/>
                      </svg>
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color }}>{pct}%</span>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(c.handle||'').replace('@','')}</div>
                    <div style={{ fontSize: 9, color: '#adb5bd', marginTop: 2 }}>{c.status==='spiking'?'↑ Spiking':'Stable'}</div>
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
