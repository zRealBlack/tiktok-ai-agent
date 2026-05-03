'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import BrainImage from "@/public/brain.png";
import { Users, Building2, TrendingUp, Cpu, Database, MessageSquare, Video, Settings, Plus, Minus, Briefcase } from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/auth";
import { useData } from "@/components/DataContext";

export default function NeuralGraph() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { competitors } = useData();

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Smooth zoom with animation
  const targetScale = useRef(1);
  const animRef = useRef<number>(0);

  const animateZoom = useCallback(() => {
    setScale(prev => {
      const diff = targetScale.current - prev;
      if (Math.abs(diff) < 0.002) return targetScale.current;
      animRef.current = requestAnimationFrame(animateZoom);
      const next = prev + diff * 0.15;
      // Adjust position so the viewport center stays fixed
      const ratio = next / prev;
      setPosition(p => ({ x: p.x * ratio, y: p.y * ratio }));
      return next;
    });
  }, []);

  const zoom = useCallback((delta: number) => {
    targetScale.current = Math.min(Math.max(0.15, targetScale.current + delta), 4);
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animateZoom);
  }, [animateZoom]);

  // Native wheel listener so we can preventDefault and stop the page from scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      zoom(-e.deltaY * 0.001);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom]);

  // Organic Node Component
  const Node = ({ x, y, children, label, glowColor = "#ef4444", subLabel }: any) => (
    <div 
      className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group hover:scale-110 transition-transform duration-300"
      style={{ left: x, top: y }}
    >
      <div 
        className="absolute inset-0 blur-[25px] rounded-full opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none animate-pulse" 
        style={{ backgroundColor: glowColor }} 
      />
      {children}
      {label && (
        <div className="absolute top-[110%] w-max text-center pointer-events-none z-50">
          <div className="text-[11px] font-bold tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" style={{ color: glowColor }}>{label}</div>
          {subLabel && <div className="text-[9px] text-black/50 tracking-wider mt-0.5 max-w-[120px] whitespace-pre-wrap">{subLabel}</div>}
        </div>
      )}
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[800px] bg-white rounded-3xl border border-black/5 shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden mt-8 cursor-grab active:cursor-grabbing touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundPosition: `${position.x}px ${position.y}px`,
          backgroundImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
          backgroundSize: `${100 * scale}px ${100 * scale}px`
        }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] pointer-events-none z-10" />

      {/* The Infinite Canvas Layer */}
      <div 
        className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none"
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: '0 0' }}
      >
        
        {/* SVG Root Lines */}
        <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
          <defs>
            <linearGradient id="glowRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glowPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glowOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Main Branches (3 Pillars) */}
          <path d="M 0 0 C 0 150, 0 250, 0 400" stroke="url(#glowPurple)" strokeWidth="4" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
          <path d="M 0 0 C 200 -100, 350 -150, 500 -300" stroke="url(#glowCyan)" strokeWidth="4" fill="none" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M 0 0 C -200 -100, -350 -150, -500 -300" stroke="url(#glowOrange)" strokeWidth="4" fill="none" className="animate-[pulse_3.5s_ease-in-out_infinite]" />

          {/* ----------------------------------------------------- */}
          {/* PILLAR 1: MEMORY (0, 400) */}
          {/* ----------------------------------------------------- */}
          
          {/* CENTER: To Team (0, 700) */}
          <path d="M 0 400 C 0 500, 0 600, 0 700" stroke="rgba(168,85,247,0.3)" strokeWidth="2" fill="none" />
          {TEAM_MEMBERS.map((user, i) => {
             const mid = (TEAM_MEMBERS.length - 1) / 2;
             const x = Math.round((i - mid) * 450);
             const y = 1000;
             return (
               <g key={`line-group-${user.id}`}>
                 <path d={`M 0 700 C ${x * 0.3} 800, ${x * 0.7} 900, ${x} ${y}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1.5" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 80} ${y + 80}, ${x - 120} ${y + 140}, ${x - 150} ${y + 200}`} stroke="rgba(168,85,247,0.15)" strokeWidth="1" fill="none" />
                 <path d={`M ${x} ${y} C ${x} ${y + 80}, ${x} ${y + 140}, ${x} ${y + 200}`} stroke="rgba(168,85,247,0.15)" strokeWidth="1" fill="none" />
                 <path d={`M ${x} ${y} C ${x + 80} ${y + 80}, ${x + 120} ${y + 140}, ${x + 150} ${y + 200}`} stroke="rgba(168,85,247,0.15)" strokeWidth="1" fill="none" />
               </g>
             );
          })}

          {/* RIGHT: To Clients (700, 550) — expands down-right, away from brain */}
          <path d="M 0 400 C 300 420, 500 480, 700 550" stroke="rgba(168,85,247,0.3)" strokeWidth="2" fill="none" />
          {/* Clients -> Rasayel (1050, 700) */}
          <path d="M 700 550 C 850 600, 950 650, 1050 700" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 1050 700 C 1150 650, 1250 600, 1350 600" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 1050 700 C 1200 700, 1250 700, 1350 700" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 1050 700 C 1150 750, 1250 800, 1350 800" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          {/* Client Tier 3 */}
          <path d="M 1350 700 C 1400 650, 1450 600, 1550 600" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M 1350 700 C 1450 700, 1500 700, 1600 700" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M 1350 700 C 1400 750, 1450 800, 1550 800" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />

          {/* LEFT: To Competitors (-700, 550) — expands down-left */}
          <path d="M 0 400 C -300 420, -500 480, -700 550" stroke="rgba(168,85,247,0.3)" strokeWidth="2" fill="none" />
          {competitors?.map((c: any, i: number) => {
             const yOff = 700 + (i * 200);
             return (
                 <path key={`path-comp-${c.handle}`} d={`M -700 550 C -800 600, -900 ${yOff - 50}, -1000 ${yOff}`} stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
             );
          })}

          {/* ----------------------------------------------------- */}
          {/* PILLAR 2: ANALYSIS (500, -300) */}
          {/* ----------------------------------------------------- */}
          
          {/* To Video Analytics (800, -400) */}
          <path d="M 500 -300 C 600 -350, 700 -400, 800 -400" stroke="rgba(6,182,212,0.3)" strokeWidth="2" fill="none" />
          <path d="M 800 -400 C 850 -450, 900 -550, 1000 -550" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 800 -400 C 850 -350, 900 -250, 1000 -250" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          {/* Video Analytics Tier 3 */}
          <path d="M 1000 -550 C 1050 -600, 1100 -600, 1200 -600" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 1000 -550 C 1050 -500, 1100 -500, 1200 -500" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 1000 -250 C 1050 -300, 1100 -300, 1200 -300" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 1000 -250 C 1050 -200, 1100 -200, 1200 -200" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* ----------------------------------------------------- */}
          {/* PILLAR 3: COGNITION (-500, -300) */}
          {/* ----------------------------------------------------- */}
          
          {/* To AI Engine (-800, -450) */}
          <path d="M -500 -300 C -600 -350, -700 -400, -800 -450" stroke="rgba(249,115,22,0.3)" strokeWidth="2" fill="none" />
          <path d="M -800 -450 C -850 -500, -900 -550, -1000 -550" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -800 -450 C -850 -400, -900 -350, -1000 -350" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          {/* AI Engine Tier 3 */}
          <path d="M -1000 -550 C -1050 -600, -1100 -600, -1200 -600" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M -1000 -550 C -1050 -500, -1100 -500, -1200 -500" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M -1000 -350 C -1050 -400, -1100 -400, -1200 -400" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M -1000 -350 C -1050 -300, -1100 -300, -1200 -300" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />

          {/* To Conversational Engine (-500, -600) */}
          <path d="M -500 -300 C -500 -400, -500 -500, -500 -600" stroke="rgba(249,115,22,0.3)" strokeWidth="2" fill="none" />
          <path d="M -500 -600 C -550 -650, -600 -700, -650 -750" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -500 -600 C -450 -650, -400 -700, -350 -750" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />

          {/* To Admin Ops (-300, -600) */}
          <path d="M -500 -300 C -400 -400, -350 -500, -300 -600" stroke="rgba(249,115,22,0.3)" strokeWidth="2" fill="none" />
          <path d="M -300 -600 C -350 -650, -400 -700, -450 -750" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -300 -600 C -250 -650, -200 -700, -150 -750" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />

          {/* To Upstash DB (-200, -500) */}
          <path d="M -500 -300 C -400 -350, -300 -400, -200 -500" stroke="rgba(249,115,22,0.3)" strokeWidth="2" fill="none" />

        </svg>

        {/* --- NODES --- */}
        
        {/* Core Brain Node */}
        <Node x={0} y={0} label="Sarie Central Intelligence" glowColor="#ef4444" subLabel="Core Memory Hub">
          <div className="w-[300px] h-[300px] flex items-center justify-center pointer-events-auto relative" style={{ mixBlendMode: 'multiply' }}>
            <Image 
              src={BrainImage} 
              alt="Brain" 
              fill
              className="object-contain"
              style={{ filter: 'invert(1) grayscale(1) contrast(5)' }} 
              priority
              draggable={false}
            />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                background: `
                  radial-gradient(circle at 50% 90%, #a855f7 0%, transparent 60%),
                  radial-gradient(circle at 90% 10%, #06b6d4 0%, transparent 60%),
                  radial-gradient(circle at 10% 10%, #f97316 0%, transparent 60%)
                `
              }}
            />
          </div>
        </Node>

        {/* ======================================= */}
        {/* PILLAR 1: MEMORY (BOTTOM) */}
        {/* ======================================= */}
        <Node x={0} y={400} label="Memory Vault" glowColor="#a855f7" subLabel="Persistent Data">
          <div className="w-24 h-24 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={36} className="text-purple-500" />
          </div>
        </Node>

        {/* ======================= */}
        {/* RIGHT: CLIENTS (700, 550) — expands down-right */}
        {/* ======================= */}
        <Node x={700} y={550} label="Clients" glowColor="#a855f7" subLabel="Managed Accounts">
          <div className="w-16 h-16 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Briefcase size={24} className="text-purple-500" />
          </div>
        </Node>

        {/* Client -> Rasayel (1050, 700) */}
        <Node x={1050} y={700} label="@rasayel_podcast" glowColor="#a855f7" subLabel="Active Target">
          <div className="w-16 h-16 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Building2 size={24} className="text-purple-500" />
          </div>
        </Node>
        <Node x={1350} y={600} label="Follower Base" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>
        <Node x={1350} y={700} label="Content Strategy" glowColor="#a855f7">
           <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>
        <Node x={1550} y={600} glowColor="#a855f7" label="Hook #1: Controversy"><div className="w-3 h-3 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={1600} y={700} glowColor="#a855f7" label="Hook #2: Value Drop"><div className="w-3 h-3 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={1550} y={800} glowColor="#a855f7" label="Hook #3: Storytime"><div className="w-3 h-3 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={1350} y={800} label="Recent Viral Data" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>

        {/* ======================= */}
        {/* CENTER: TEAM (0, 700) */}
        {/* ======================= */}
        <Node x={0} y={700} label="Team Context" glowColor="#a855f7" subLabel="7 Members">
          <div className="w-16 h-16 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Users size={24} className="text-purple-500" />
          </div>
        </Node>
        {TEAM_MEMBERS.map((user, i) => {
             const mid = (TEAM_MEMBERS.length - 1) / 2;
             const x = Math.round((i - mid) * 450);
             const y = 1000;
             return (
               <div key={`node-group-${user.id}`}>
                 <Node x={x} y={y} label={user.name} subLabel={user.role} glowColor="#a855f7">
                   <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-lg backdrop-blur-sm">{user.name.charAt(0)}</div>
                 </Node>
                 <Node x={x - 150} y={y + 200} glowColor="#a855f7" label="Session Context"><div className="w-3 h-3 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
                 <Node x={x} y={y + 200} glowColor="#a855f7" label={user.id === 'yassin' ? 'Admin Privileges' : 'Query History'}><div className="w-3 h-3 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
                 <Node x={x + 150} y={y + 200} glowColor="#a855f7" label="API Quota Logs"><div className="w-3 h-3 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
               </div>
             );
        })}

        {/* ======================= */}
        {/* LEFT: COMPETITORS (-700, 550) — expands down-left */}
        {/* ======================= */}
        <Node x={-700} y={550} label="Competitor Matrix" glowColor="#a855f7" subLabel="Active Rivals">
          <div className="w-16 h-16 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={24} className="text-purple-500" />
          </div>
        </Node>
        {competitors?.map((c: any, i: number) => {
           const yOff = 700 + (i * 200);
           return (
             <div key={`node-comp-${c.handle}`}>
               <Node x={-1000} y={yOff} label={c.handle} subLabel={`${(c.followers/1000).toFixed(1)}k Followers`} glowColor="#a855f7">
                 <div className="w-14 h-14 rounded-full overflow-hidden border border-purple-500/50 shadow-[0_0_15px_#a855f7]">
                   <Image src={c.avatar} alt={c.handle} width={56} height={56} className="object-cover" />
                 </div>
               </Node>
             </div>
           );
        })}

        {/* ======================================= */}
        {/* PILLAR 2: ANALYSIS (TOP RIGHT) */}
        {/* ======================================= */}
        <Node x={500} y={-300} label="Analysis Engine" glowColor="#06b6d4" subLabel="Content Audits">
          <div className="w-24 h-24 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={36} className="text-cyan-500" />
          </div>
        </Node>

        {/* Video Analytics (800, -400) */}
        <Node x={800} y={-400} label="Video Analytics" glowColor="#06b6d4">
          <div className="w-16 h-16 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Video size={24} className="text-cyan-500" />
          </div>
        </Node>
        <Node x={1000} y={-550} label="Visual Hooks" glowColor="#06b6d4"><div className="w-6 h-6 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={1000} y={-250} label="Audio Transcripts" glowColor="#06b6d4"><div className="w-6 h-6 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={1200} y={-600} glowColor="#06b6d4" label="Object Recognition"><div className="w-3 h-3 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={1200} y={-500} glowColor="#06b6d4" label="Facial Expressions"><div className="w-3 h-3 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={1200} y={-300} glowColor="#06b6d4" label="Speech-to-Text"><div className="w-3 h-3 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={1200} y={-200} glowColor="#06b6d4" label="Sentiment NLP"><div className="w-3 h-3 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>

        {/* ======================================= */}
        {/* PILLAR 3: COGNITION (TOP LEFT) */}
        {/* ======================================= */}
        <Node x={-500} y={-300} label="Cognition Core" glowColor="#f97316" subLabel="AI & Infrastructure">
          <div className="w-24 h-24 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={36} className="text-orange-500" />
          </div>
        </Node>

        {/* AI Engine (-800, -450) */}
        <Node x={-800} y={-450} label="AI Models Engine" glowColor="#f97316">
          <div className="w-16 h-16 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={24} className="text-orange-500" />
          </div>
        </Node>
        <Node x={-1000} y={-550} label="Anthropic / OpenAI" glowColor="#f97316"><div className="w-6 h-6 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={-1000} y={-350} label="Apify Actor" glowColor="#f97316"><div className="w-6 h-6 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={-1200} y={-600} glowColor="#f97316" label="Claude 3.5 Sonnet"><div className="w-3 h-3 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={-1200} y={-500} glowColor="#f97316" label="GPT-4o Mini"><div className="w-3 h-3 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={-1200} y={-400} glowColor="#f97316" label="Meta Graph API"><div className="w-3 h-3 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={-1200} y={-300} glowColor="#f97316" label="TikTok Scraper"><div className="w-3 h-3 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>

        {/* Conversational Engine (-500, -600) */}
        <Node x={-500} y={-600} label="Conversational Engine" glowColor="#f97316">
          <div className="w-16 h-16 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <MessageSquare size={24} className="text-orange-500" />
          </div>
        </Node>
        <Node x={-650} y={-750} label="WhatsApp Webview" glowColor="#f97316"><div className="w-6 h-6 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={-350} y={-750} label="Voice TTS" glowColor="#f97316"><div className="w-6 h-6 bg-orange-500 border border-orange-300 rounded-full" /></Node>

        {/* Admin Ops (-800, -150) */}
        <Node x={-300} y={-600} label="Admin Operations" glowColor="#f97316">
          <div className="w-16 h-16 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Settings size={24} className="text-orange-500" />
          </div>
        </Node>
        <Node x={-450} y={-750} label="API Spending" glowColor="#f97316"><div className="w-6 h-6 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={-150} y={-750} label="Auth Context" glowColor="#f97316"><div className="w-6 h-6 bg-orange-500 border border-orange-300 rounded-full" /></Node>

        {/* Upstash DB (-200, -500) */}
        <Node x={-200} y={-500} label="Upstash KV DB" glowColor="#f97316" subLabel="Live Vector Sync">
          <div className="w-16 h-16 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={24} className="text-orange-500" />
          </div>
        </Node>

      </div>
      
      {/* UI Overlay Controls (Non-draggable) */}
      <div className="absolute top-8 left-8 pointer-events-none z-20">
        <h2 className="text-3xl font-black text-black drop-shadow-[0_2px_10px_rgba(255,255,255,1)] tracking-tight">Sarie Memory Graph</h2>
        <p className="text-[14px] font-bold text-[#ef4444] mt-1 bg-white/50 px-4 py-1.5 rounded-full w-fit backdrop-blur-md border border-black/10 uppercase tracking-widest">Infinite Scale Canvas</p>
      </div>

      <div className="absolute top-8 right-8 z-30 flex flex-col gap-2" onPointerDown={e => e.stopPropagation()}>
        <button onClick={() => zoom(0.15)} className="pointer-events-auto w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-black hover:bg-gray-50 shadow-sm transition-all active:scale-95"><Plus size={20} /></button>
        <button onClick={() => zoom(-0.15)} className="pointer-events-auto w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-black hover:bg-gray-50 shadow-sm transition-all active:scale-95"><Minus size={20} /></button>
      </div>
      
      <div className="absolute bottom-8 right-8 z-30" onPointerDown={e => e.stopPropagation()}>
        <button 
          onClick={() => { setPosition({ x: 0, y: 0 }); targetScale.current = 1; zoom(0); }}
          className="pointer-events-auto px-8 py-4 bg-white border border-black/20 rounded-full text-[15px] font-bold text-black hover:bg-gray-50 transition-all shadow-md active:scale-95"
        >
          Recenter Matrix
        </button>
      </div>

    </div>
  );
}
