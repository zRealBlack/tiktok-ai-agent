'use client';

import { useData } from "@/components/DataContext";
import { TrendingUp, Users, Eye, AlertTriangle, CheckCircle } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);
const BLUE = '#4263eb';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

export default function ModernCompetitors() {
  const { account, competitors } = useData();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', letterSpacing: '-0.03em' }}>Competitors</h1>
        <p style={{ fontSize: 13, color: '#868e96', margin: 0 }}>Live landscape tracking for {account?.username}</p>
      </div>

      {/* Your account vs competition */}
      <div style={{ ...card, padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#adb5bd', marginBottom: 16 }}>Follower Comparison</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[{ handle: account?.username || '@rasayel_podcast', followers: account?.followers||0, yours: true }, ...competitors].map((c: any) => {
            const max = Math.max(account?.followers||0, ...competitors.map((x:any)=>x.followers||0), 1);
            const pct = Math.min(((c.followers||0)/max)*100, 100);
            return (
              <div key={c.handle} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 130, fontSize: 12, fontWeight: c.yours ? 700 : 500, color: c.yours ? '#1a1a2e' : '#495057', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.handle}</div>
                <div style={{ flex: 1, height: 8, background: '#f1f3f5', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: c.yours ? `linear-gradient(90deg,${BLUE},#748ffc)` : c.status==='spiking' ? '#2f9e44' : '#ced4da', borderRadius: 100, transition: 'width 0.7s ease' }} />
                </div>
                <div style={{ width: 70, textAlign: 'right', fontSize: 12, fontWeight: 700, color: c.yours ? BLUE : '#495057' }}>{fmt(c.followers||0)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {competitors.map((c: any) => {
          const isSpiking = c.status === 'spiking';
          return (
            <div key={c.handle} style={card}>
              {/* Status banner */}
              <div style={{ height: 6, background: isSpiking ? '#2f9e44' : '#e9ecef', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '22px 22px 24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: isSpiking ? '#ebfbee' : '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800, color: isSpiking ? '#2f9e44' : '#868e96' }}>
                      {(c.handle||'?')[1]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{c.handle}</div>
                      <div style={{ fontSize: 11, color: '#adb5bd' }}>{fmt(c.followers||0)} followers</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: isSpiking ? '#ebfbee' : '#f1f3f5', color: isSpiking ? '#2f9e44' : '#868e96' }}>
                    {isSpiking ? '↑ Spiking' : '→ Stable'}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    { icon: Eye,       label: 'Avg Views',    value: fmt(c.avgViews||0) },
                    { icon: TrendingUp,label: 'Posts/week',   value: String(c.postsThisWeek||0) },
                    { icon: Users,     label: 'View change',  value: c.viewChange||'—' },
                    { icon: AlertTriangle, label: 'Top format', value: c.topFormat||'—' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ background: '#f8f9fa', borderRadius: 12, padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Icon size={12} color="#adb5bd" />
                        <span style={{ fontSize: 10, color: '#adb5bd', fontWeight: 600 }}>{label}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Pros / Cons */}
                {(c.pros?.length > 0 || c.cons?.length > 0) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(c.pros||[]).slice(0,2).map((p: string) => (
                      <div key={p} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#2f9e44' }}>
                        <CheckCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />{p}
                      </div>
                    ))}
                    {(c.cons||[]).slice(0,1).map((con: string) => (
                      <div key={con} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#c92a2a' }}>
                        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />{con}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
