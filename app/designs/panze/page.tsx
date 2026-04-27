'use client';

import { useData } from "@/components/DataContext";
import { ArrowUpRight, SlidersHorizontal, Plus, Eye, Heart, MessageCircle, TrendingUp } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
const scoreClr = (v: number) => v >= 80 ? '#16a34a' : v >= 60 ? '#d97706' : '#dc2626';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 28,
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

// SVG donut arc
function DonutChart({ high, med, low }: { high: number; med: number; low: number }) {
  const total = high + med + low || 1;
  const cx = 90, cy = 90, r = 65, strokeW = 22;
  const circumference = 2 * Math.PI * r;
  const gap = 4;
  const segments = [
    { value: high, color: '#f97316', label: 'High (≥70)' },
    { value: med,  color: '#3b82f6', label: 'Mid (50-69)' },
    { value: low,  color: '#e5e7eb', label: 'Low (<50)'  },
  ];
  let offset = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
          {segments.map(({ value, color }) => {
            const dashLen = (value / total) * (circumference - segments.length * gap);
            const el = (
              <circle key={color} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={strokeW}
                strokeDasharray={`${dashLen} ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
              />
            );
            offset += dashLen + gap;
            return el;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#111', letterSpacing: '-0.04em' }}>{total}</div>
          <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>Videos</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {segments.map(({ value, color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#555', flex: 1 }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// SVG line chart
function LineChart({ videos }: { videos: any[] }) {
  const W = 340, H = 140, PAD = 16;
  const pts = videos.slice(-8);
  const maxV = Math.max(...pts.map(v => v.views || 0), 1);
  const maxL = Math.max(...pts.map(v => v.likes || 0), 1);

  const xStep = (W - PAD * 2) / Math.max(pts.length - 1, 1);

  const viewPoints  = pts.map((v, i) => `${PAD + i * xStep},${H - PAD - ((v.views || 0) / maxV) * (H - PAD * 2)}`).join(' ');
  const likePoints  = pts.map((v, i) => `${PAD + i * xStep},${H - PAD - ((v.likes || 0) / maxL) * (H - PAD * 2)}`).join(' ');

  // area fill
  const viewArea  = `${PAD},${H - PAD} ` + viewPoints + ` ${PAD + (pts.length - 1) * xStep},${H - PAD}`;
  const likeArea  = `${PAD},${H - PAD} ` + likePoints + ` ${PAD + (pts.length - 1) * xStep},${H - PAD}`;

  return (
    <div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={viewArea} fill="url(#gv)" />
        <polygon points={likeArea} fill="url(#gl)" />
        <polyline points={viewPoints} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={likePoints} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots on last point */}
        {pts.length > 0 && (() => {
          const last = pts.length - 1;
          const vx = PAD + last * xStep;
          const vy = H - PAD - ((pts[last].views || 0) / maxV) * (H - PAD * 2);
          const lx = PAD + last * xStep;
          const ly = H - PAD - ((pts[last].likes || 0) / maxL) * (H - PAD * 2);
          return (
            <>
              <circle cx={vx} cy={vy} r={5} fill="#fff" stroke="#3b82f6" strokeWidth="2.5" />
              <circle cx={lx} cy={ly} r={5} fill="#fff" stroke="#f97316" strokeWidth="2.5" />
            </>
          );
        })()}
        {/* X labels */}
        {pts.map((v, i) => (
          <text key={i} x={PAD + i * xStep} y={H - 2} textAnchor="middle" fontSize="9" fill="#bbb">
            {(v.posted || '').slice(5) || `V${i+1}`}
          </text>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 18, marginTop: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
          Views: {fmt(videos.reduce((s,v)=>s+(v.views||0),0))}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#555' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
          Likes: {fmt(videos.reduce((s,v)=>s+(v.likes||0),0))}
        </span>
      </div>
    </div>
  );
}

export default function PanzeOverview() {
  const { account, videos, trends } = useData();

  const sorted    = [...videos].sort((a,b) => (b.views||0)-(a.views||0));
  const high      = videos.filter(v => (v.score||0) >= 70).length;
  const med       = videos.filter(v => (v.score||0) >= 50 && (v.score||0) < 70).length;
  const low       = videos.filter(v => (v.score||0) < 50).length;
  const chartVids = [...videos].sort((a,b)=>(a.posted||'').localeCompare(b.posted||''));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: 16, alignItems: 'start' }}>

      {/* ── COL 1: Top Videos (My Tasks style) ── */}
      <div style={{ ...card, display: 'flex', flexDirection: 'column', maxHeight: 580 }}>
        <div style={{ padding: '22px 22px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>Top Videos</span>
            <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Plus size={14} color="#555" />
            </button>
          </div>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['By Score', 'By Views'].map((t, i) => (
              <button key={t} style={{ padding: '6px 14px', borderRadius: 100, border: i === 0 ? 'none' : '1px solid #e5e7eb', background: i === 0 ? '#111' : '#fff', color: i === 0 ? '#fff' : '#555', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
          {/* Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 12, marginBottom: 14 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>{videos.length}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Videos Analyzed</span>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: '#aaa' }}>▾</div>
          </div>
        </div>

        {/* Video list */}
        <div style={{ overflowY: 'auto', padding: '0 14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.slice(0, 6).map((v) => (
            <div key={v.id} style={{ padding: '14px 14px', background: '#fafafa', borderRadius: 16, border: '1px solid #f0f0f0', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: v.score >= 70 ? '#fff7ed' : v.score >= 50 ? '#eff6ff' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: scoreClr(v.score||0) }}>
                  {v.score}
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: scoreClr(v.score||0) }} />
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
              <div style={{ fontSize: 11, color: '#aaa', display: 'flex', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10}/>{fmt(v.views||0)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={10}/>{fmt(v.likes||0)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={10}/>{v.comments||0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COL 2: Score Distribution (donut) ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...card, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>Score Distribution</span>
            <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowUpRight size={14} color="#555" />
            </button>
          </div>
          <DonutChart high={high} med={med} low={low} />
        </div>

        {/* Engagement card */}
        <div style={{ ...card, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>Engagement</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Avg Engagement', value: `${account?.avgEngagement||0}%`, icon: TrendingUp, color: '#f97316' },
              { label: 'Total Likes',    value: fmt(videos.reduce((s,v)=>s+(v.likes||0),0)), icon: Heart, color: '#ec4899' },
              { label: 'Total Views',   value: fmt(videos.reduce((s,v)=>s+(v.views||0),0)), icon: Eye, color: '#3b82f6' },
              { label: 'Followers',     value: fmt(account?.followers||0), icon: MessageCircle, color: '#8b5cf6' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ background: '#f9fafb', borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Icon size={14} color={color} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#111', letterSpacing: '-0.03em' }}>{value}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COL 3: Views vs Likes line chart + Trends ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...card, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>Views vs Likes</span>
            <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <SlidersHorizontal size={14} color="#555" />
            </button>
          </div>
          <LineChart videos={chartVids} />
        </div>

        {/* Trending */}
        <div style={{ ...card, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>Trending Now</span>
            <button style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowUpRight size={14} color="#555" />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {trends.slice(0,4).map((t: any, i: number) => (
              <div key={t.rank} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#555', flexShrink: 0 }}>#{t.rank}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{t.type} · {t.views} views</div>
                </div>
                <ArrowUpRight size={14} color="#ccc" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
