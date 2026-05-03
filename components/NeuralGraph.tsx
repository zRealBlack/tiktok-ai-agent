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

          {/* Main Branches (3 Pillars) */}
          <path d="M 0 0 C -50 0, -100 0, -150 0" stroke="url(#glowPurple)" strokeWidth="3" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
          <path d="M 0 0 C 50 -50, 100 -100, 150 -150" stroke="url(#glowCyan)" strokeWidth="3" fill="none" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M 0 0 C 50 50, 100 100, 150 150" stroke="url(#glowOrange)" strokeWidth="3" fill="none" className="animate-[pulse_3.5s_ease-in-out_infinite]" />

          {/* ----------------------------------------------------- */}
          {/* MEMORY SUB-ROOTS (-150, 0) */}
          {/* ----------------------------------------------------- */}

          {/* To Team (-350, 0) */}
          <path d="M -150 0 C -200 0, -250 0, -350 0" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          {TEAM_MEMBERS.map((user, i) => {
             const yOffset = (i - (TEAM_MEMBERS.length - 1) / 2) * 250;
             const x = -550;
             const y = yOffset;
             return (
               <g key={`line-group-${user.id}`}>
                 <path d={`M -350 0 C -450 0, -450 ${y}, ${x} ${y}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1.5" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 40} ${y - 10}, ${x - 70} ${y - 30}, ${x - 100} ${y - 40}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 50} ${y + 5}, ${x - 90} ${y + 5}, ${x - 130} ${y + 10}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 30} ${y + 20}, ${x - 50} ${y + 40}, ${x - 70} ${y + 60}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
               </g>
             );
          })}

          {/* To Upstash DB (-250, 200) */}
          <path d="M -150 0 C -200 100, -220 150, -250 200" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />

          {/* To Client (-200, 300) */}
          <path d="M -150 0 C -180 100, -190 200, -200 300" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -200 300 C -150 300, -100 200, -50 200" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -200 300 C -150 300, -50 300, 0 300" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -200 300 C -150 300, -100 400, -50 400" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          {/* Client Tier 3 */}
          <path d="M 0 300 C 20 270, 30 260, 50 250" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M 0 300 C 30 300, 50 300, 80 300" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M 0 300 C 20 330, 30 340, 50 350" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />

          {/* ----------------------------------------------------- */}
          {/* ANALYSIS SUB-ROOTS (150, -150) */}
          {/* ----------------------------------------------------- */}
          {/* To Video Analytics (300, -300) */}
          <path d="M 150 -150 C 200 -200, 250 -250, 300 -300" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 -300 C 320 -330, 340 -350, 350 -370" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 -300 C 350 -300, 390 -300, 430 -300" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          {/* Video Analytics Tier 3 */}
          <path d="M 350 -370 C 360 -400, 365 -410, 370 -430" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 350 -370 C 380 -380, 395 -390, 410 -400" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 430 -300 C 450 -290, 465 -285, 480 -280" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 430 -300 C 460 -310, 480 -320, 500 -330" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* To Competitors (400, -150) */}
          <path d="M 150 -150 C 250 -150, 300 -150, 400 -150" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -150 L 500 -200" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -150 L 550 -120" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -150 L 480 -50" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />

          {/* ----------------------------------------------------- */}
          {/* COGNITION SUB-ROOTS (150, 150) */}
          {/* ----------------------------------------------------- */}
          {/* To AI Engine (300, 150) */}
          <path d="M 150 150 C 200 150, 250 150, 300 150" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 150 C 330 120, 350 100, 370 80" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 150 C 330 180, 350 200, 370 220" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          {/* AI Engine Tier 3 */}
          <path d="M 370 80 C 380 50, 390 40, 400 20" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 370 80 C 390 80, 410 80, 430 80" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 370 220 C 390 220, 410 220, 430 220" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M 370 220 C 390 240, 410 260, 430 280" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />

          {/* To Conversational (250, 300) */}
          <path d="M 150 150 C 180 200, 210 250, 250 300" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 250 300 C 230 340, 210 360, 200 380" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 250 300 C 270 340, 290 360, 300 380" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />

          {/* To Admin Ops (100, 350) */}
          <path d="M 150 150 C 130 200, 110 250, 100 350" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 100 350 C 70 370, 50 390, 30 400" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 100 350 C 120 390, 140 410, 150 430" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
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
            {/* Color Overlay that matches 3 pillars */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                background: `
                  radial-gradient(circle at 10% 50%, #a855f7 0%, transparent 60%),
                  radial-gradient(circle at 80% 10%, #06b6d4 0%, transparent 60%),
                  radial-gradient(circle at 80% 90%, #f97316 0%, transparent 60%)
                `
              }}
            />
          </div>
        </Node>

        {/* ======================================= */}
        {/* PILLAR 1: MEMORY (LEFT) */}
        <Node x={-150} y={0} label="Memory Vault" glowColor="#a855f7" subLabel="Entity Storage">
          <div className="w-20 h-20 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={28} className="text-purple-500" />
          </div>
        </Node>

        {/* Upstash DB */}
        <Node x={-250} y={200} label="Upstash KV DB" glowColor="#a855f7" subLabel="Live Vector Sync">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={20} className="text-purple-500" />
          </div>
        </Node>

        {/* Client (-200, 300) */}
        <Node x={-200} y={300} label="@rasayel_podcast" glowColor="#a855f7" subLabel="Active Target">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Building2 size={20} className="text-purple-500" />
          </div>
        </Node>
        <Node x={-50} y={200} label="Follower Base" glowColor="#a855f7">
           <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>
        <Node x={0} y={300} label="Content Strategy" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>
        <Node x={50} y={250} glowColor="#a855f7" label="Hook #1: Controversy"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={80} y={300} glowColor="#a855f7" label="Hook #2: Value Drop"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={50} y={350} glowColor="#a855f7" label="Hook #3: Storytime"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={-50} y={400} label="Recent Viral Data" glowColor="#a855f7">
           <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>

        {/* Team (-350, 0) */}
        <Node x={-350} y={0} label="Team Context" glowColor="#a855f7" subLabel="Identities">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Users size={20} className="text-purple-500" />
          </div>
        </Node>
        {TEAM_MEMBERS.map((user, i) => {
             const yOffset = (i - (TEAM_MEMBERS.length - 1) / 2) * 250;
             const x = -550;
             const y = yOffset;
             return (
               <div key={`node-group-${user.id}`}>
                 <Node x={x} y={y} label={user.name} subLabel={user.role} glowColor="#a855f7">
                   <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center text-purple-400 font-bold text-xs backdrop-blur-sm">{user.name.charAt(0)}</div>
                 </Node>
                 <Node x={x - 100} y={y - 40} glowColor="#a855f7" label="Session Context"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
                 <Node x={x - 130} y={y + 10} glowColor="#a855f7" label={user.id === 'yassin' ? 'Admin Privileges' : 'Query History'}><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
                 <Node x={x - 70} y={y + 60} glowColor="#a855f7" label="API Quota Logs"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
               </div>
             );
        })}

        {/* ======================================= */}
        {/* PILLAR 2: ANALYSIS (TOP RIGHT) */}
        <Node x={150} y={-150} label="Analysis Engine" glowColor="#06b6d4" subLabel="Audits & Competitors">
          <div className="w-20 h-20 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={28} className="text-cyan-500" />
          </div>
        </Node>

        {/* Competitor Matrix (400, -150) */}
        <Node x={400} y={-150} label="Competitor Matrix" glowColor="#06b6d4">
          <div className="w-12 h-12 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={20} className="text-cyan-500" />
          </div>
        </Node>
        <Node x={500} y={-200} label="Mahmoud Ismail" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={550} y={-120} label="Nadya Alnoor" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={480} y={-50} label="Other Competitors" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>

        {/* Video Analytics (300, -300) */}
        <Node x={300} y={-300} label="Video Analytics" glowColor="#06b6d4">
          <div className="w-12 h-12 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Video size={20} className="text-cyan-500" />
          </div>
        </Node>
        <Node x={350} y={-370} label="Visual Hooks" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={430} y={-300} label="Audio Transcripts" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={370} y={-430} glowColor="#06b6d4" label="Object Recognition"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={410} y={-400} glowColor="#06b6d4" label="Facial Expressions"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={480} y={-280} glowColor="#06b6d4" label="Speech-to-Text"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={500} y={-330} glowColor="#06b6d4" label="Sentiment NLP"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>

        {/* ======================================= */}
        {/* PILLAR 3: COGNITION (BOTTOM RIGHT) */}
        <Node x={150} y={150} label="Cognition Core" glowColor="#f97316" subLabel="Execution & Output">
          <div className="w-20 h-20 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={28} className="text-orange-500" />
          </div>
        </Node>

        {/* AI Engine (300, 150) */}
        <Node x={300} y={150} label="AI Models Engine" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={370} y={80} label="Anthropic / OpenAI" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={370} y={220} label="Apify Actor" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={400} y={20} glowColor="#f97316" label="Claude 3.5 Sonnet"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={430} y={80} glowColor="#f97316" label="GPT-4o Mini"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={430} y={220} glowColor="#f97316" label="Meta Graph API"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={430} y={280} glowColor="#f97316" label="TikTok Scraper"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>

        {/* Conversational Engine (250, 300) */}
        <Node x={250} y={300} label="Conversational Engine" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <MessageSquare size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={200} y={380} label="WhatsApp Webview" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={300} y={380} label="Voice TTS" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>

        {/* Admin Ops (100, 350) */}
        <Node x={100} y={350} label="Admin Operations" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Settings size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={30} y={400} label="API Spending" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={150} y={430} label="Auth Context" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>

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
