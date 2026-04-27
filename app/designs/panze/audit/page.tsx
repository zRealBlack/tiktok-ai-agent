'use client';

import { useData } from "@/components/DataContext";
import { Eye, Heart, MessageCircle, Share2, ArrowUpRight } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
const scoreClr = (v: number) => v >= 80 ? '#16a34a' : v >= 60 ? '#d97706' : '#dc2626';
const scoreBg  = (v: number) => v >= 80 ? '#f0fdf4' : v >= 60 ? '#fffbeb' : '#fef2f2';

const card: React.CSSProperties = { background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' };

export default function PanzeAudit() {
  const { videos } = useData();
  const sorted = [...videos].sort((a,b)=>(b.score||0)-(a.score||0));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
      {sorted.map((v) => (
        <div key={v.id} style={{ ...card, cursor: 'pointer' }}
          onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.boxShadow='0 12px 40px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.boxShadow='0 4px 24px rgba(0,0,0,0.06)'; }}>
          {/* Score band */}
          <div style={{ height: 6, background: scoreClr(v.score||0) }} />
          <div style={{ padding: '18px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: scoreBg(v.score||0), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: scoreClr(v.score||0) }}>{v.score}</div>
              <button style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowUpRight size={13} color="#555" />
              </button>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, lineHeight: 1.4 }}>{v.title}</div>
            {v.tone && <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>{v.tone}</div>}
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#999', marginBottom: 14 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10}/>{fmt(v.views||0)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={10}/>{fmt(v.likes||0)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={10}/>{v.comments||0}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Share2 size={10}/>{fmt(v.shares||0)}</span>
            </div>
            {/* Mini score bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {(['hook','pacing','cta'] as const).map(k => (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 10 }}>
                    <span style={{ color: '#bbb', textTransform: 'capitalize' }}>{k}</span>
                    <span style={{ color: scoreClr(v[k]||0), fontWeight: 700 }}>{v[k]??'—'}</span>
                  </div>
                  <div style={{ height: 4, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${v[k]||0}%`, background: scoreClr(v[k]||0), borderRadius: 100 }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: '#fef2f2', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>⚠ Issue</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{v.issue}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
