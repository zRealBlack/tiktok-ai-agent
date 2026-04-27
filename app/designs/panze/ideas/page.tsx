'use client';

import { useData } from "@/components/DataContext";
import { ArrowUpRight, Clock, Zap } from "lucide-react";

const diffColor = (d: string) => d==='Easy'?'#16a34a':d==='Medium'?'#d97706':'#dc2626';
const diffBg    = (d: string) => d==='Easy'?'#f0fdf4':d==='Medium'?'#fffbeb':'#fef2f2';
const potColor  = (p: string) => p==='High'?'#f97316':p==='Medium'?'#3b82f6':'#aaa';
const potBg     = (p: string) => p==='High'?'#fff7ed':p==='Medium'?'#eff6ff':'#f9fafb';

const card: React.CSSProperties = { background:'#fff', borderRadius:24, boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.04)' };

export default function PanzeIdeas() {
  const { ideas } = useData();

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {(ideas||[]).map((idea:any) => (
          <div key={idea.id} style={{ ...card, display:'flex', flexDirection:'column' }}>
            {/* Top color bar */}
            <div style={{ height:5, background: potColor(idea.potential), borderRadius:'24px 24px 0 0' }} />
            <div style={{ padding:'20px 22px 22px', flex:1, display:'flex', flexDirection:'column' }}>
              {/* Badges */}
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:100, background:diffBg(idea.difficulty), color:diffColor(idea.difficulty) }}>{idea.difficulty}</span>
                <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:100, background:potBg(idea.potential), color:potColor(idea.potential) }}>{idea.potential} Potential</span>
              </div>

              {/* Hook */}
              <div style={{ fontSize:15, fontWeight:800, color:'#111', lineHeight:1.4, marginBottom:18, letterSpacing:'-0.02em' }}>"{idea.hook}"</div>

              {/* 3 acts */}
              {[{ n:'1', label:'Hook', text:idea.act1, color:'#f97316' }, { n:'2', label:'Build', text:idea.act2, color:'#3b82f6' }, { n:'3', label:'Payoff', text:idea.act3, color:'#8b5cf6' }].map(({ n, label, text, color }) => (
                <div key={n} style={{ display:'flex', gap:12, marginBottom:12, alignItems:'flex-start' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <span style={{ fontSize:10, fontWeight:900, color }}>{n}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:12, color:'#555', lineHeight:1.5 }}>{text}</div>
                  </div>
                </div>
              ))}

              <div style={{ flex:1 }} />

              {/* Meta pills */}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const, marginBottom:14, marginTop:10 }}>
                <span style={{ fontSize:11, padding:'4px 12px', borderRadius:100, background:'#f3f4f6', color:'#555', fontWeight:500 }}>{idea.format}</span>
                <span style={{ fontSize:11, padding:'4px 12px', borderRadius:100, background:'#f3f4f6', color:'#555', fontWeight:500 }}>{idea.generation}</span>
                <span style={{ fontSize:11, padding:'4px 12px', borderRadius:100, background:'#f3f4f6', color:'#555', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}><Clock size={10}/>{idea.bestTime}</span>
              </div>

              {/* Caption */}
              <div style={{ background:'#f9fafb', borderRadius:14, padding:'12px 14px', marginBottom:16 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Caption</div>
                <div style={{ fontSize:11, color:'#555', lineHeight:1.5 }}>{idea.caption}</div>
              </div>

              <button style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'11px 16px', borderRadius:14, background:'#111', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                <Zap size={13}/><span style={{ flex:1, textAlign:'left' }}>Use this idea</span><ArrowUpRight size={13}/>
              </button>
            </div>
          </div>
        ))}
        {(!ideas||ideas.length===0) && (
          <div style={{ gridColumn:'span 3', textAlign:'center', padding:'60px 0', color:'#aaa', fontSize:14 }}>No ideas yet — ask Sarie to generate some.</div>
        )}
      </div>
    </div>
  );
}
