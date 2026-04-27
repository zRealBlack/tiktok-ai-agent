'use client';

import { useData } from "@/components/DataContext";
import { Eye, Heart, MessageCircle, Share2, ChevronRight } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
const scoreClr = (v: number) => v >= 80 ? '#2f9e44' : v >= 60 ? '#e67700' : '#c92a2a';
const scoreBg  = (v: number) => v >= 80 ? '#ebfbee' : v >= 60 ? '#fff9db' : '#fff5f5';
const BLUE = '#4263eb';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  if (value === null || value === undefined) return null;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#868e96' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: scoreClr(value) }}>{value}</span>
      </div>
      <div style={{ height: 4, background: '#f1f3f5', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: scoreClr(value), borderRadius: 100 }} />
      </div>
    </div>
  );
}

export default function ModernAudit() {
  const { videos } = useData();
  const sorted = [...videos].sort((a,b) => (b.score||0)-(a.score||0));

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', letterSpacing: '-0.03em' }}>Content Audit</h1>
        <p style={{ fontSize: 13, color: '#868e96', margin: 0 }}>{videos.length} videos analyzed by Sarie</p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Videos Analyzed', value: String(videos.length) },
          { label: 'Avg Score', value: String(Math.round(videos.reduce((s,v)=>s+(v.score||0),0)/Math.max(videos.length,1)))+'/100' },
          { label: 'High Performers', value: String(videos.filter(v=>(v.score||0)>=70).length) },
          { label: 'Needs Work', value: String(videos.filter(v=>(v.score||0)<50).length) },
        ].map(({ label, value }) => (
          <div key={label} style={{ ...card, padding: '18px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.03em' }}>{value}</div>
            <div style={{ fontSize: 12, color: '#868e96', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Video grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {sorted.map((v) => (
          <div key={v.id} style={{ ...card, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 32px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'; }}
          >
            {/* Cover area */}
            <div style={{ height: 100, background: `linear-gradient(135deg, ${scoreBg(v.score||0)}, #f8f9fa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: scoreClr(v.score||0), letterSpacing: '-0.04em' }}>{v.score}</div>
              <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, color: scoreClr(v.score||0), background: scoreBg(v.score||0), padding: '3px 10px', borderRadius: 100, border: `1px solid ${scoreClr(v.score||0)}33` }}>/100</span>
              {v.tone && <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 600, color: '#868e96', background: '#fff', padding: '3px 10px', borderRadius: 100, border: '1px solid #e9ecef' }}>{v.tone?.split(' / ')[0]}</span>}
            </div>

            <div style={{ padding: '16px 18px' }}>
              {/* Title */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, lineHeight: 1.4 }}>{v.title}</div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#868e96', marginBottom: 14 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11}/>{fmt(v.views||0)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={11}/>{fmt(v.likes||0)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={11}/>{v.comments||0}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Share2 size={11}/>{fmt(v.shares||0)}</span>
              </div>

              {/* Score bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <ScoreBar label="Hook"    value={v.hook}    />
                <ScoreBar label="Pacing"  value={v.pacing}  />
                <ScoreBar label="CTA"     value={v.cta}     />
              </div>

              {/* Issue */}
              <div style={{ background: '#fff5f5', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#c92a2a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>⚠ Issue</div>
                <div style={{ fontSize: 11, color: '#495057', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{v.issue}</div>
              </div>

              {/* View full */}
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '9px 14px', borderRadius: 10, background: '#f8f9fa', border: '1px solid #e9ecef', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#495057' }}>
                <span style={{ flex: 1, textAlign: 'left' }}>View full analysis</span>
                <ChevronRight size={13} color="#868e96" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
