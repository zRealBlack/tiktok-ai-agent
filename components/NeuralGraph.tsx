'use client';

import { useState, useRef } from "react";
import Image from "next/image";
import BrainImage from "@/public/brain.png";
import { Users, Building2, TrendingUp, Cpu, Database, MessageSquare, Video, Settings } from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/auth";

export default function NeuralGraph() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

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
        <div className="absolute top-[110%] w-max text-center pointer-events-none">
          <div className="text-[11px] font-bold tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" style={{ color: glowColor }}>{label}</div>
          {subLabel && <div className="text-[9px] text-black/50 tracking-wider mt-0.5 max-w-[120px] whitespace-pre-wrap">{subLabel}</div>}
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="relative w-full h-[800px] bg-white rounded-3xl border border-black/5 shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden mt-8 cursor-grab active:cursor-grabbing touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background Grid that moves with panning */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundPosition: `${position.x}px ${position.y}px`,
          backgroundImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] pointer-events-none z-10" />

      {/* The Infinite Canvas Layer */}
      <div 
        className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        
        {/* SVG Root Lines connecting everything */}
        <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
          <defs>
            <linearGradient id="glowRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glowPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glowOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glowPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Main Branches */}
          <path d="M 0 0 C -150 0, -250 0, -350 0" stroke="url(#glowPurple)" strokeWidth="3" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
          <path d="M 0 0 C 150 -50, 200 -150, 300 -250" stroke="url(#glowCyan)" strokeWidth="3" fill="none" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M 0 0 C 150 50, 200 150, 300 250" stroke="url(#glowOrange)" strokeWidth="3" fill="none" className="animate-[pulse_3.5s_ease-in-out_infinite]" />
          
          {/* --- 1. MEMORY SUB-ROOTS (-350, 0) --- */}
          {/* To Persona (-500, -150) */}
          <path d="M -350 0 C -400 -50, -450 -100, -500 -150" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -500 -150 C -550 -160, -600 -180, -650 -200" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -500 -150 C -550 -150, -600 -150, -650 -150" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -500 -150 C -550 -140, -600 -120, -650 -100" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          
          {/* To Entities (-550, 0) */}
          <path d="M -350 0 C -400 0, -500 0, -550 0" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -550 0 C -600 -10, -650 -20, -700 -20" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -550 0 C -600 10, -650 20, -700 20" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -550 0 C -600 30, -650 50, -700 60" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          
          {/* To Storage (-500, 150) */}
          <path d="M -350 0 C -400 50, -450 100, -500 150" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -500 150 C -550 140, -600 120, -650 100" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -500 150 C -550 150, -600 150, -650 150" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M -500 150 C -550 160, -600 180, -650 200" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />

          {/* --- 2. ANALYSIS SUB-ROOTS (300, -250) --- */}
          {/* To Video Analytics (400, -350) */}
          <path d="M 300 -250 C 330 -280, 360 -310, 400 -350" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -350 C 430 -370, 460 -390, 500 -400" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 -350 C 450 -350, 500 -350, 550 -350" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 -350 C 430 -330, 460 -310, 500 -300" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* To Audio Processing (450, -200) */}
          <path d="M 300 -250 C 350 -230, 400 -210, 450 -200" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 450 -200 C 500 -220, 550 -240, 600 -250" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 -200 C 500 -200, 550 -200, 600 -200" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 -200 C 500 -180, 550 -160, 600 -150" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* To Content Metrics (400, -100) */}
          <path d="M 300 -250 C 330 -200, 360 -150, 400 -100" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -100 C 430 -110, 460 -120, 500 -130" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 -100 C 450 -90, 500 -80, 550 -70" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* --- 3. COGNITION SUB-ROOTS (300, 250) --- */}
          {/* To AI Orchestration (400, 100) */}
          <path d="M 300 250 C 330 200, 360 150, 400 100" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 100 C 430 80, 460 60, 500 50" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 100 C 450 100, 500 100, 550 100" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 100 C 430 120, 460 140, 500 150" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />

          {/* To I/O Engines (450, 250) */}
          <path d="M 300 250 C 350 250, 400 250, 450 250" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 450 250 C 500 230, 550 210, 600 200" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 250 C 500 250, 550 250, 600 250" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 250 C 500 270, 550 290, 600 300" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />

          {/* To System Constraints (400, 400) */}
          <path d="M 300 250 C 330 300, 360 350, 400 400" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 400 C 430 380, 460 360, 500 350" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 400 C 450 400, 500 400, 550 400" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 400 400 C 430 420, 460 440, 500 450" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
        </svg>

        {/* --- NODES --- */}
        
        {/* Core Brain Node (mix-blend-mode: screen is critical here!) */}
        <Node x={0} y={0} label="Sarie Central Intelligence" glowColor="#ef4444" subLabel="Core Hub">
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
            {/* 3-Point Color Overlay */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                background: `
                  radial-gradient(circle at 10% 50%, #a855f7 0%, transparent 70%),
                  radial-gradient(circle at 80% 10%, #06b6d4 0%, transparent 70%),
                  radial-gradient(circle at 80% 90%, #f97316 0%, transparent 70%)
                `
              }}
            />
          </div>
        </Node>

        {/* ======================================================= */}
        {/* 1. MEMORY VAULT (PURPLE) */}
        {/* ======================================================= */}
        <Node x={-350} y={0} label="Memory" glowColor="#a855f7" subLabel="Persona & History">
          <div className="w-16 h-16 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={24} className="text-purple-500" />
          </div>
        </Node>

        {/* Persona */}
        <Node x={-500} y={-150} label="Persona Identity" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full shadow-[0_0_10px_#a855f7]" />
        </Node>
        <Node x={-650} y={-200} glowColor="#a855f7" label="Appearance: Male">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-650} y={-150} glowColor="#a855f7" label="Character: Friendly & Direct">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-650} y={-100} glowColor="#a855f7" label="Hopes: Scale Content">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>

        {/* Entities */}
        <Node x={-550} y={0} label="Entities & Targets" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full shadow-[0_0_10px_#a855f7]" />
        </Node>
        <Node x={-700} y={-20} glowColor="#a855f7" label="Client: @rasayel_podcast">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        {TEAM_MEMBERS.map((user, i) => (
           <Node key={`team-${user.id}`} x={-700} y={20 + (i * 40)} glowColor="#a855f7" label={`Team: ${user.name} (${user.role})`}>
             <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
           </Node>
        ))}

        {/* Data Storage */}
        <Node x={-500} y={150} label="Storage Systems" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full shadow-[0_0_10px_#a855f7]" />
        </Node>
        <Node x={-650} y={100} glowColor="#a855f7" label="Upstash KV Vector Sync">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-650} y={150} glowColor="#a855f7" label="Session IndexedDB">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>
        <Node x={-650} y={200} glowColor="#a855f7" label="Cached Transcript Hooks">
           <div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" />
        </Node>

        {/* ======================================================= */}
        {/* 2. ANALYSIS ENGINE (CYAN) */}
        {/* ======================================================= */}
        <Node x={300} y={-250} label="Analysis" glowColor="#06b6d4" subLabel="Audits & Metrics">
          <div className="w-16 h-16 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={24} className="text-cyan-500" />
          </div>
        </Node>

        {/* Video Analytics */}
        <Node x={400} y={-350} label="Video Audits" glowColor="#06b6d4">
           <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/40 rounded-full shadow-[0_0_10px_#06b6d4]" />
        </Node>
        <Node x={500} y={-400} glowColor="#06b6d4" label="Object Recognition">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={550} y={-350} glowColor="#06b6d4" label="Facial Expressions">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={500} y={-300} glowColor="#06b6d4" label="Scene Pacing Changes">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>

        {/* Audio Processing */}
        <Node x={450} y={-200} label="Audio & NLP" glowColor="#06b6d4">
           <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/40 rounded-full shadow-[0_0_10px_#06b6d4]" />
        </Node>
        <Node x={600} y={-250} glowColor="#06b6d4" label="Whisper Transcripts">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={600} y={-200} glowColor="#06b6d4" label="Sentiment Polarity">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={600} y={-150} glowColor="#06b6d4" label="Tone Audits">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>

        {/* Content Metrics */}
        <Node x={400} y={-100} label="Content Metrics" glowColor="#06b6d4">
           <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/40 rounded-full shadow-[0_0_10px_#06b6d4]" />
        </Node>
        <Node x={500} y={-130} glowColor="#06b6d4" label="1.2M Views Analyzed">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>
        <Node x={550} y={-70} glowColor="#06b6d4" label="Engagement Velocity">
           <div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" />
        </Node>

        {/* ======================================================= */}
        {/* 3. COGNITION CORE (ORANGE) */}
        {/* ======================================================= */}
        <Node x={300} y={250} label="Cognition" glowColor="#f97316" subLabel="AI & Execution">
          <div className="w-16 h-16 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={24} className="text-orange-500" />
          </div>
        </Node>

        {/* AI Orchestration */}
        <Node x={400} y={100} label="AI Orchestration" glowColor="#f97316">
           <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 rounded-full shadow-[0_0_10px_#f97316]" />
        </Node>
        <Node x={500} y={50} glowColor="#f97316" label="Claude 3.5 Sonnet">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={550} y={100} glowColor="#f97316" label="GPT-4o Mini">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={500} y={150} glowColor="#f97316" label="Fallback Inference">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>

        {/* I/O Engines */}
        <Node x={450} y={250} label="I/O Pipelines" glowColor="#f97316">
           <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 rounded-full shadow-[0_0_10px_#f97316]" />
        </Node>
        <Node x={600} y={200} glowColor="#f97316" label="Apify Meta Scraper">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={600} y={250} glowColor="#f97316" label="Voice TTS Engine">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={600} y={300} glowColor="#f97316" label="WhatsApp Webview">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>

        {/* System Constraints */}
        <Node x={400} y={400} label="System Op-Params" glowColor="#f97316">
           <div className="w-6 h-6 bg-orange-500/20 border border-orange-500/40 rounded-full shadow-[0_0_10px_#f97316]" />
        </Node>
        <Node x={500} y={350} glowColor="#f97316" label="Global Auth Context">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={550} y={400} glowColor="#f97316" label="API Rate Limits">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>
        <Node x={500} y={450} glowColor="#f97316" label="Security Context">
           <div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" />
        </Node>

      </div>

      {/* UI Overlay Controls (Non-draggable) */}
      <div className="absolute top-8 left-8 pointer-events-none z-20">
        <h2 className="text-2xl font-black text-black drop-shadow-[0_2px_10px_rgba(255,255,255,1)] tracking-tight">Sarie Memory Graph</h2>
        <p className="text-[13px] font-bold text-[#ef4444] mt-1 bg-white/50 px-3 py-1 rounded-full w-fit backdrop-blur-md border border-black/10 uppercase tracking-widest">Interactive Canvas</p>
      </div>
      
      <div className="absolute bottom-8 right-8 pointer-events-auto z-20">
        <button 
          onClick={() => setPosition({ x: 0, y: 0 })}
          className="px-6 py-3 bg-black/5 border border-black/20 rounded-full text-[13px] font-bold text-black hover:bg-black/10 hover:border-black/40 transition-all backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] active:scale-95"
        >
          Recenter Matrix
        </button>
      </div>

    </div>
  );
}
