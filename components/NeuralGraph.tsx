'use client';

import Image from "next/image";
import BrainImage from "@/public/brain.png";
import { Users, Building2, TrendingUp, Cpu, Database } from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/auth";

export default function NeuralGraph() {
  return (
    <div className="relative w-full py-16 bg-[var(--glass-bg)] rounded-3xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)] overflow-hidden flex flex-col items-center mt-8">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)] flex items-center justify-center gap-2">
          <Cpu className="text-[#ef4444]" /> Neural Knowledge Graph
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">Live visualization of Sarie's cached context and network</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-24 w-full relative z-10 px-6">
        
        {/* SVG Connecting Lines (Desktop only for stability) */}
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-2 pointer-events-none z-0">
           <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-red-500/10 via-red-500/40 to-purple-500/10" />
        </div>

        {/* Left Branch: Team Awareness */}
        <div className="flex flex-col gap-5 z-10 w-full lg:w-auto items-center lg:items-end">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#ef4444] mb-2 bg-[#ef4444]/10 px-3 py-1 rounded-full border border-[#ef4444]/20">
            Team Synced
          </div>
          {TEAM_MEMBERS.slice(0, 4).map((user, i) => (
             <div key={user.id} className={`p-3 bg-[var(--glass-elevated)] backdrop-blur-md rounded-xl border border-[var(--glass-border)] flex items-center gap-3 w-[260px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:border-red-500/50 cursor-default ${i % 2 === 0 ? 'lg:-translate-x-4' : 'lg:translate-x-0'}`}>
               <div className="w-10 h-10 rounded-full bg-[var(--bg-base)] text-[var(--text-secondary)] flex items-center justify-center border border-[var(--glass-border)] shrink-0">
                 <Users size={16}/>
               </div>
               <div className="flex-1 min-w-0">
                 <div className="text-[13px] font-bold text-[var(--text-primary)] truncate">{user.name}</div>
                 <div className="text-[10px] text-[var(--text-muted)] truncate">{user.role}</div>
               </div>
             </div>
          ))}
        </div>

        {/* Center: The Core Brain */}
        <div className="relative z-10 py-8 lg:py-0">
          {/* Outer glow rings */}
          <div className="absolute inset-0 bg-[#ef4444]/20 blur-[80px] rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] border border-red-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-purple-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          
          <div className="relative group cursor-pointer">
            <Image 
              src={BrainImage} 
              alt="Sarie Neural Core" 
              width={200} 
              height={200} 
              className="relative z-10 drop-shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-transform duration-700 group-hover:scale-110" 
              priority
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
               <div className="text-[12px] font-black tracking-[0.2em] text-[#ef4444] uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">Sarie Core</div>
               <div className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">v2.1.0 • Online</div>
            </div>
          </div>
        </div>

        {/* Right Branch: Client & Data Context */}
        <div className="flex flex-col gap-5 z-10 w-full lg:w-auto items-center lg:items-start">
          <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Active Context
          </div>
          
           <div className="p-3 bg-[var(--glass-elevated)] backdrop-blur-md rounded-xl border border-[var(--glass-border)] flex items-center gap-3 w-[260px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:border-purple-500/50 lg:-translate-x-4 cursor-default">
             <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
               <Building2 size={16}/>
             </div>
             <div className="flex-1 min-w-0">
               <div className="text-[13px] font-bold text-[var(--text-primary)]">@rasayel_podcast</div>
               <div className="text-[10px] text-[var(--text-muted)]">Core Client Profile loaded</div>
             </div>
           </div>

           <div className="p-3 bg-[var(--glass-elevated)] backdrop-blur-md rounded-xl border border-[var(--glass-border)] flex items-center gap-3 w-[260px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:border-blue-500/50 cursor-default">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
               <TrendingUp size={16}/>
             </div>
             <div className="flex-1 min-w-0">
               <div className="text-[13px] font-bold text-[var(--text-primary)]">Competitor Matrix</div>
               <div className="text-[10px] text-[var(--text-muted)]">Tracking 6 key accounts</div>
             </div>
           </div>
           
           <div className="p-3 bg-[var(--glass-elevated)] backdrop-blur-md rounded-xl border border-[var(--glass-border)] flex items-center gap-3 w-[260px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 hover:border-emerald-500/50 lg:-translate-x-4 cursor-default">
             <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
               <Database size={16}/>
             </div>
             <div className="flex-1 min-w-0">
               <div className="text-[13px] font-bold text-[var(--text-primary)]">Upstash Memory</div>
               <div className="text-[10px] text-[var(--text-muted)]">Vector & KV Sync Active</div>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
}
