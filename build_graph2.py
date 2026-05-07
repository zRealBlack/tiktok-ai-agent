import os

# New Layout Coordinates to prevent overlap
# Brain: (0, 0)
# Memory: (0, 200) -> Team (-350, 300), Client (350, 300), Competitors (0, 450)
# Analysis: (250, -150) -> Video Analytics (400, -300)
# Cognition: (-250, -150) -> AI Engine (-450, -300), Conv Engine (-200, -350), Admin Ops (-500, -150), Upstash DB (-100, -250)

header = """'use client';

import { useState, useRef } from "react";
import Image from "next/image";
import BrainImage from "@/public/brain.png";
import { Users, Building2, TrendingUp, Cpu, Database, MessageSquare, Video, Settings } from "lucide-react";
import { TEAM_MEMBERS } from "@/lib/auth";
import { useData } from "@/components/DataContext";

export default function NeuralGraph() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });
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
          <path d="M 0 0 C 0 50, 0 100, 0 200" stroke="url(#glowPurple)" strokeWidth="3" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
          <path d="M 0 0 C 100 -50, 150 -100, 250 -150" stroke="url(#glowCyan)" strokeWidth="3" fill="none" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M 0 0 C -100 -50, -150 -100, -250 -150" stroke="url(#glowOrange)" strokeWidth="3" fill="none" className="animate-[pulse_3.5s_ease-in-out_infinite]" />

          {/* ----------------------------------------------------- */}
          {/* PILLAR 1: MEMORY (0, 200) */}
          {/* ----------------------------------------------------- */}
          
          {/* To Team (-350, 300) */}
          <path d="M 0 200 C -150 200, -250 250, -350 300" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          {TEAM_MEMBERS.map((user, i) => {
             const yOffset = 300 + (i - (TEAM_MEMBERS.length - 1) / 2) * 150;
             const x = -550;
             const y = yOffset;
             return (
               <g key={`line-group-${user.id}`}>
                 <path d={`M -350 300 C -450 300, -450 ${y}, ${x} ${y}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1.5" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 40} ${y - 10}, ${x - 70} ${y - 30}, ${x - 100} ${y - 40}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 50} ${y + 5}, ${x - 90} ${y + 5}, ${x - 130} ${y + 10}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
                 <path d={`M ${x} ${y} C ${x - 30} ${y + 20}, ${x - 50} ${y + 40}, ${x - 70} ${y + 60}`} stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
               </g>
             );
          })}

          {/* To Client (350, 300) */}
          <path d="M 0 200 C 150 200, 250 250, 350 300" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 350 300 C 400 300, 450 250, 500 250" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 350 300 C 400 300, 450 350, 500 350" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 350 300 C 400 300, 450 450, 500 450" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          {/* Client Tier 3 */}
          <path d="M 500 350 C 520 320, 530 310, 550 300" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M 500 350 C 530 350, 550 350, 580 350" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
          <path d="M 500 350 C 520 380, 530 390, 550 400" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />

          {/* To Competitors (0, 450) */}
          <path d="M 0 200 C 0 300, 0 350, 0 450" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          {competitors?.map((c: any, i: number) => {
             const yOffset = 550 + (i * 80);
             return (
                 <path key={`path-comp-${c.handle}`} d={`M 0 450 C 0 500, 0 ${yOffset - 20}, 0 ${yOffset}`} stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
             );
          })}

          {/* ----------------------------------------------------- */}
          {/* PILLAR 2: ANALYSIS (250, -150) */}
          {/* ----------------------------------------------------- */}
          
          {/* To Video Analytics (400, -300) */}
          <path d="M 250 -150 C 300 -200, 350 -250, 400 -300" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -300 C 420 -330, 440 -350, 450 -370" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -300 C 450 -300, 490 -300, 530 -300" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          {/* Video Analytics Tier 3 */}
          <path d="M 450 -370 C 460 -400, 465 -410, 470 -430" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 450 -370 C 480 -380, 495 -390, 510 -400" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 530 -300 C 550 -290, 565 -285, 580 -280" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />
          <path d="M 530 -300 C 560 -310, 580 -320, 600 -330" stroke="rgba(6,182,212,0.2)" strokeWidth="1" fill="none" />

          {/* ----------------------------------------------------- */}
          {/* PILLAR 3: COGNITION (-250, -150) */}
          {/* ----------------------------------------------------- */}
          
          {/* To AI Engine (-450, -300) */}
          <path d="M -250 -150 C -300 -200, -350 -250, -450 -300" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -450 -300 C -480 -330, -500 -350, -520 -370" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -450 -300 C -480 -270, -500 -250, -520 -230" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          {/* AI Engine Tier 3 */}
          <path d="M -520 -370 C -530 -400, -540 -410, -550 -430" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M -520 -370 C -540 -370, -560 -370, -580 -370" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M -520 -230 C -540 -230, -560 -230, -580 -230" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />
          <path d="M -520 -230 C -540 -210, -560 -190, -580 -170" stroke="rgba(249,115,22,0.2)" strokeWidth="1" fill="none" />

          {/* To Conversational Engine (-200, -350) */}
          <path d="M -250 -150 C -220 -200, -210 -250, -200 -350" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -200 -350 C -220 -390, -240 -410, -250 -430" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -200 -350 C -180 -390, -160 -410, -150 -430" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />

          {/* To Admin Ops (-500, -150) */}
          <path d="M -250 -150 C -350 -150, -450 -150, -500 -150" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -500 -150 C -530 -130, -550 -110, -570 -100" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -500 -150 C -520 -190, -540 -210, -550 -230" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />

          {/* To Upstash DB (-100, -250) */}
          <path d="M -250 -150 C -180 -180, -140 -220, -100 -250" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />

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
        <Node x={0} y={200} label="Memory Vault" glowColor="#a855f7" subLabel="Persistent Data">
          <div className="w-20 h-20 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={28} className="text-purple-500" />
          </div>
        </Node>

        {/* Client (350, 300) */}
        <Node x={350} y={300} label="@rasayel_podcast" glowColor="#a855f7" subLabel="Active Target">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Building2 size={20} className="text-purple-500" />
          </div>
        </Node>
        <Node x={500} y={250} label="Follower Base" glowColor="#a855f7">
           <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>
        <Node x={500} y={350} label="Content Strategy" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>
        <Node x={550} y={300} glowColor="#a855f7" label="Hook #1: Controversy"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={580} y={350} glowColor="#a855f7" label="Hook #2: Value Drop"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={550} y={400} glowColor="#a855f7" label="Hook #3: Storytime"><div className="w-2 h-2 bg-purple-500/50 border border-purple-300/50 rounded-full" /></Node>
        <Node x={500} y={450} label="Recent Viral Data" glowColor="#a855f7">
           <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/40 rounded-full" />
        </Node>

        {/* Team (-350, 300) */}
        <Node x={-350} y={300} label="Team Context" glowColor="#a855f7" subLabel="Identities">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Users size={20} className="text-purple-500" />
          </div>
        </Node>
        {TEAM_MEMBERS.map((user, i) => {
             const yOffset = 300 + (i - (TEAM_MEMBERS.length - 1) / 2) * 150;
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

        {/* Competitor Matrix (0, 450) -> Real Data */}
        <Node x={0} y={450} label="Competitor Matrix" glowColor="#a855f7" subLabel="Active Rivals">
          <div className="w-12 h-12 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={20} className="text-purple-500" />
          </div>
        </Node>
        {competitors?.map((c: any, i: number) => {
           const yOffset = 550 + (i * 80);
           return (
             <div key={`node-comp-${c.handle}`}>
               <Node x={0} y={yOffset} label={c.handle} subLabel={`${(c.followers/1000).toFixed(1)}k Followers`} glowColor="#a855f7">
                 <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500/50 shadow-[0_0_10px_#a855f7]">
                   <Image src={c.avatar} alt={c.handle} width={32} height={32} className="object-cover" />
                 </div>
               </Node>
             </div>
           );
        })}

        {/* ======================================= */}
        {/* PILLAR 2: ANALYSIS (TOP RIGHT) */}
        {/* ======================================= */}
        <Node x={250} y={-150} label="Analysis Engine" glowColor="#06b6d4" subLabel="Content Audits">
          <div className="w-20 h-20 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={28} className="text-cyan-500" />
          </div>
        </Node>

        {/* Video Analytics (400, -300) */}
        <Node x={400} y={-300} label="Video Analytics" glowColor="#06b6d4">
          <div className="w-12 h-12 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Video size={20} className="text-cyan-500" />
          </div>
        </Node>
        <Node x={450} y={-370} label="Visual Hooks" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={530} y={-300} label="Audio Transcripts" glowColor="#06b6d4"><div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full" /></Node>
        <Node x={470} y={-430} glowColor="#06b6d4" label="Object Recognition"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={510} y={-400} glowColor="#06b6d4" label="Facial Expressions"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={580} y={-280} glowColor="#06b6d4" label="Speech-to-Text"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>
        <Node x={600} y={-330} glowColor="#06b6d4" label="Sentiment NLP"><div className="w-2 h-2 bg-cyan-500/50 border border-cyan-300/50 rounded-full" /></Node>

        {/* ======================================= */}
        {/* PILLAR 3: COGNITION (TOP LEFT) */}
        {/* ======================================= */}
        <Node x={-250} y={-150} label="Cognition Core" glowColor="#f97316" subLabel="AI & Infrastructure">
          <div className="w-20 h-20 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={28} className="text-orange-500" />
          </div>
        </Node>

        {/* AI Engine (-450, -300) */}
        <Node x={-450} y={-300} label="AI Models Engine" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={-520} y={-370} label="Anthropic / OpenAI" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={-520} y={-230} label="Apify Actor" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={-550} y={-430} glowColor="#f97316" label="Claude 3.5 Sonnet"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={-580} y={-370} glowColor="#f97316" label="GPT-4o Mini"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={-580} y={-230} glowColor="#f97316" label="Meta Graph API"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>
        <Node x={-580} y={-170} glowColor="#f97316" label="TikTok Scraper"><div className="w-2 h-2 bg-orange-500/50 border border-orange-300/50 rounded-full" /></Node>

        {/* Conversational Engine (-200, -350) */}
        <Node x={-200} y={-350} label="Conversational Engine" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <MessageSquare size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={-250} y={-430} label="WhatsApp Webview" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={-150} y={-430} label="Voice TTS" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>

        {/* Admin Ops (-500, -150) */}
        <Node x={-500} y={-150} label="Admin Operations" glowColor="#f97316">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Settings size={20} className="text-orange-500" />
          </div>
        </Node>
        <Node x={-570} y={-100} label="API Spending" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>
        <Node x={-550} y={-230} label="Auth Context" glowColor="#f97316"><div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full" /></Node>

        {/* Upstash DB (-100, -250) */}
        <Node x={-100} y={-250} label="Upstash KV DB" glowColor="#f97316" subLabel="Live Vector Sync">
          <div className="w-12 h-12 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={20} className="text-orange-500" />
          </div>
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
"""

with open(r"c:\Users\yasso\.gemini\antigravity\scratch\tiktok-agent\components\NeuralGraph.tsx", "w", encoding="utf-8") as f:
    f.write(header)
