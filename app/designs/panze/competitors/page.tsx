'use client';

import { useData } from "@/components/DataContext";
import { ArrowUpRight, TrendingUp, Eye, Users } from "lucide-react";

const fmt = (n: number) => n >= 1_000_000 ? (n/1_000_000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : String(n);

const card: React.CSSProperties = { background: '#fff', borderRadius: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' };

export default function PanzeCompetitors() {
  const { account, competitors } = useData();
  const all = [{ handle: account?.username||'@rasayel', followers: account?.followers||0, yours: true, status:'yours', topFormat:'Your account', avgViews: Math.round((account?.weeklyViews||0)/7), postsThisWeek:3, viewChange:'—' }, ...competitors];
  const max = Math.max(...all.map((c:any)=>c.followers||0), 1);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Bar comparison */}
      <div style={{ ...card, padding:'24px 28px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
          <span style={{ fontSize:17, fontWeight:800, color:'#111' }}>Follower Comparison</span>
          <button style={{ width:32, height:32, borderRadius:'50%', border:'1.5px solid #e5e7eb', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ArrowUpRight size={14} color="#555"/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {all.map((c:any) => {
            const pct = Math.min(((c.followers||0)/max)*100,100);
            const color = c.yours ? '#111' : c.status==='spiking' ? '#f97316' : '#3b82f6';
            return (
              <div key={c.handle} style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:36, height:36, borderRadius:12, background: c.yours?'#111': c.status==='spiking'?'#fff7ed':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color: c.yours?'#fff':color, flexShrink:0 }}>
                  {(c.handle||'?')[1]?.toUpperCase()}
                </div>
                <div style={{ width:120, fontSize:12, fontWeight:600, color:'#333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.handle}</div>
                <div style={{ flex:1, height:8, background:'#f3f4f6', borderRadius:100, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background: c.yours?'linear-gradient(90deg,#111,#555)': c.status==='spiking'?'#f97316':'#93c5fd', borderRadius:100 }} />
                </div>
                <div style={{ width:60, textAlign:'right', fontSize:13, fontWeight:700, color }}>{fmt(c.followers||0)}</div>
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:100, background: c.yours?'#f3f4f6': c.status==='spiking'?'#fff7ed':'#f3f4f6', color: c.yours?'#555': c.status==='spiking'?'#f97316':'#555', flexShrink:0 }}>
                  {c.yours?'You': c.status==='spiking'?'↑ Spiking':'Stable'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitor cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {competitors.map((c:any) => {
          const spike = c.status==='spiking';
          return (
            <div key={c.handle} style={{ ...card, padding:'22px 22px 24px' }}>
              <div style={{ height:4, background: spike?'#f97316':'#e5e7eb', borderRadius:100, marginBottom:18 }} />
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
                <div style={{ width:44, height:44, borderRadius:14, background: spike?'#fff7ed':'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:900, color: spike?'#f97316':'#555' }}>
                  {(c.handle||'?')[1]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#111' }}>{c.handle}</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{fmt(c.followers||0)} followers</div>
                </div>
                <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:100, background: spike?'#fff7ed':'#f3f4f6', color: spike?'#f97316':'#888' }}>
                  {spike?'↑ Spiking':'→ Stable'}
                </span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { icon:Eye,        label:'Avg Views', value:fmt(c.avgViews||0) },
                  { icon:TrendingUp, label:'Posts/wk',  value:String(c.postsThisWeek||0) },
                  { icon:Users,      label:'Change',    value:c.viewChange||'—' },
                  { icon:ArrowUpRight,label:'Format',   value:c.topFormat||'—' },
                ].map(({ icon:Icon, label, value }) => (
                  <div key={label} style={{ background:'#f9fafb', borderRadius:12, padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                      <Icon size={11} color="#bbb"/><span style={{ fontSize:10, color:'#bbb', fontWeight:600 }}>{label}</span>
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
