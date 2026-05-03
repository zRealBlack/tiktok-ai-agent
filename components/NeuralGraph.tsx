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
          <path d="M 0 0 C -150 -50, -250 -100, -350 -100" stroke="url(#glowRed)" strokeWidth="3" fill="none" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M 0 0 C 150 -50, 250 -150, 400 -150" stroke="url(#glowPurple)" strokeWidth="3" fill="none" className="animate-[pulse_4s_ease-in-out_infinite]" />
          <path d="M 0 0 C 100 150, 200 200, 300 250" stroke="rgba(59,130,246,0.5)" strokeWidth="2" fill="none" />
          <path d="M 0 0 C -100 150, -200 250, -250 350" stroke="rgba(16,185,129,0.5)" strokeWidth="2" fill="none" />
          
          {/* New Main Branches */}
          <path d="M 0 0 C 0 -150, 0 -250, 0 -350" stroke="url(#glowOrange)" strokeWidth="3" fill="none" className="animate-[pulse_3.5s_ease-in-out_infinite]" />
          <path d="M 0 0 C 0 150, 0 250, 0 350" stroke="url(#glowCyan)" strokeWidth="3" fill="none" className="animate-[pulse_4.5s_ease-in-out_infinite]" />
          <path d="M 0 0 C 100 -150, 150 -250, 250 -350" stroke="url(#glowPink)" strokeWidth="3" fill="none" className="animate-[pulse_2.5s_ease-in-out_infinite]" />
          <path d="M 0 0 C -100 -150, -150 -250, -250 -350" stroke="rgba(234,179,8,0.5)" strokeWidth="2" fill="none" />

          {/* Sub Roots for Team (-350, -100) */}
          {TEAM_MEMBERS.map((user, i) => {
             const angle = -Math.PI / 2 + (Math.PI / Math.max(1, TEAM_MEMBERS.length - 1)) * i;
             const dist = 180;
             const x = -350 + Math.cos(angle) * dist;
             const y = -100 + Math.sin(angle) * dist;
             return (
               <path key={`line-${user.id}`} d={`M -350 -100 C ${-350 + (x+350)/2} -100, ${x} ${y - (y+100)/2}, ${x} ${y}`} stroke="rgba(239,68,68,0.2)" strokeWidth="1.5" fill="none" />
             );
          })}
          
          {/* Sub Roots for Client (400, -150) */}
          <path d="M 400 -150 C 450 -150, 500 -250, 550 -250" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -150 C 450 -150, 550 -150, 600 -150" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 400 -150 C 450 -150, 500 -50, 550 -50" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />

          {/* Sub Roots for Competitors (300, 250) */}
          <path d="M 300 250 L 400 200" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 250 L 450 280" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 300 250 L 380 350" stroke="rgba(59,130,246,0.3)" strokeWidth="1.5" fill="none" />
          
          {/* Sub Roots for AI Engine (0, -350) */}
          <path d="M 0 -350 C -30 -380, -50 -400, -70 -420" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 0 -350 C 30 -380, 50 -400, 70 -420" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5" fill="none" />
          
          {/* Sub Roots for Conversational (0, 350) */}
          <path d="M 0 350 C -20 390, -40 410, -50 430" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 0 350 C 20 390, 40 410, 50 430" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" fill="none" />
          
          {/* Sub Roots for Video Analytics (250, -350) */}
          <path d="M 250 -350 C 270 -380, 290 -400, 300 -420" stroke="rgba(236,72,153,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M 250 -350 C 300 -350, 340 -350, 380 -350" stroke="rgba(236,72,153,0.3)" strokeWidth="1.5" fill="none" />
          
          {/* Sub Roots for Admin Ops (-250, -350) */}
          <path d="M -250 -350 C -280 -370, -300 -390, -320 -400" stroke="rgba(234,179,8,0.3)" strokeWidth="1.5" fill="none" />
          <path d="M -250 -350 C -230 -390, -210 -410, -200 -430" stroke="rgba(234,179,8,0.3)" strokeWidth="1.5" fill="none" />
        </svg>

        {/* --- NODES --- */}
        
        {/* Core Brain Node (mix-blend-mode: screen is critical here!) */}
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
            {/* Color Overlay that matches root directions */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                mixBlendMode: 'screen',
                background: `
                  radial-gradient(circle at 10% 10%, #ef4444 0%, transparent 60%),
                  radial-gradient(circle at 90% 10%, #a855f7 0%, transparent 60%),
                  radial-gradient(circle at 90% 90%, #3b82f6 0%, transparent 60%),
                  radial-gradient(circle at 10% 90%, #10b981 0%, transparent 60%),
                  radial-gradient(circle at 50% 10%, #f97316 0%, transparent 60%),
                  radial-gradient(circle at 50% 90%, #06b6d4 0%, transparent 60%),
                  radial-gradient(circle at 80% 20%, #ec4899 0%, transparent 60%),
                  radial-gradient(circle at 20% 20%, #eab308 0%, transparent 60%)
                `
              }}
            />
          </div>
        </Node>

        {/* --- LEFT BRANCH: TEAM --- */}
        <Node x={-350} y={-100} label="Team Context" glowColor="#ef4444" subLabel="Authorized Identities">
          <div className="w-16 h-16 bg-red-500/5 border border-red-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Users size={24} className="text-red-500" />
          </div>
        </Node>
        
        {/* Team Sub Nodes mapped organically */}
        {TEAM_MEMBERS.map((user, i) => {
             const angle = -Math.PI / 2 + (Math.PI / Math.max(1, TEAM_MEMBERS.length - 1)) * i;
             const dist = 180;
             const x = -350 + Math.cos(angle) * dist;
             const y = -100 + Math.sin(angle) * dist;
             return (
               <Node key={user.id} x={x} y={y} label={user.name} subLabel={user.role} glowColor="#ef4444">
                 <div className="w-10 h-10 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400 font-bold text-xs backdrop-blur-sm">
                   {user.name.charAt(0)}
                 </div>
               </Node>
             );
        })}

        {/* --- RIGHT BRANCH: CLIENT --- */}
        <Node x={400} y={-150} label="@rasayel_podcast" glowColor="#a855f7" subLabel="Active Memory Target">
          <div className="w-16 h-16 bg-purple-500/5 border border-purple-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Building2 size={24} className="text-purple-500" />
          </div>
        </Node>

        {/* Client Sub Nodes */}
        <Node x={550} y={-250} label="Follower Base" subLabel="Deep demographics parsed" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full flex items-center justify-center shadow-[0_0_10px_#a855f7]" />
        </Node>
        <Node x={600} y={-150} label="Content Strategy" subLabel="15 Active hooks aligned" glowColor="#a855f7">
           <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/40 rounded-full flex items-center justify-center shadow-[0_0_15px_#a855f7]" />
        </Node>
        <Node x={550} y={-50} label="Recent Viral Data" subLabel="1.2M views analyzed" glowColor="#a855f7">
           <div className="w-6 h-6 bg-purple-500/20 border border-purple-500/40 rounded-full flex items-center justify-center shadow-[0_0_10px_#a855f7]" />
        </Node>

        {/* --- BOTTOM BRANCHES: COMPETITORS & DB --- */}
        <Node x={300} y={250} label="Competitor Matrix" glowColor="#3b82f6" subLabel="Tracking 6 Rivals">
          <div className="w-16 h-16 bg-blue-500/5 border border-blue-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={24} className="text-blue-500" />
          </div>
        </Node>

        <Node x={400} y={200} label="Mahmoud Ismail" glowColor="#3b82f6">
           <div className="w-4 h-4 bg-blue-500 border border-blue-300 rounded-full shadow-[0_0_10px_#3b82f6]" />
        </Node>
        <Node x={450} y={280} label="Nadya Alnoor" glowColor="#3b82f6">
           <div className="w-4 h-4 bg-blue-500 border border-blue-300 rounded-full shadow-[0_0_10px_#3b82f6]" />
        </Node>
        <Node x={380} y={350} label="Other Competitors" glowColor="#3b82f6">
           <div className="w-4 h-4 bg-blue-500 border border-blue-300 rounded-full shadow-[0_0_10px_#3b82f6]" />
        </Node>

        <Node x={-250} y={350} label="Upstash KV DB" glowColor="#10b981" subLabel="Live Vector Sync">
          <div className="w-16 h-16 bg-emerald-500/5 border border-emerald-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Database size={24} className="text-emerald-500" />
          </div>
        </Node>

        {/* --- TOP BRANCH: AI ENGINE --- */}
        <Node x={0} y={-350} label="AI Models Engine" glowColor="#f97316" subLabel="LLMs & Web Scraping">
          <div className="w-16 h-16 bg-orange-500/5 border border-orange-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Cpu size={24} className="text-orange-500" />
          </div>
        </Node>
        <Node x={-70} y={-420} label="Anthropic / OpenAI" glowColor="#f97316">
           <div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full shadow-[0_0_10px_#f97316]" />
        </Node>
        <Node x={70} y={-420} label="Apify Actor" glowColor="#f97316">
           <div className="w-4 h-4 bg-orange-500 border border-orange-300 rounded-full shadow-[0_0_10px_#f97316]" />
        </Node>

        {/* --- BOTTOM BRANCH: CONVERSATIONAL --- */}
        <Node x={0} y={350} label="Conversational Engine" glowColor="#06b6d4" subLabel="Voice & Messaging">
          <div className="w-16 h-16 bg-cyan-500/5 border border-cyan-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <MessageSquare size={24} className="text-cyan-500" />
          </div>
        </Node>
        <Node x={-50} y={430} label="WhatsApp Webview" glowColor="#06b6d4">
           <div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full shadow-[0_0_10px_#06b6d4]" />
        </Node>
        <Node x={50} y={430} label="Voice TTS" glowColor="#06b6d4">
           <div className="w-4 h-4 bg-cyan-500 border border-cyan-300 rounded-full shadow-[0_0_10px_#06b6d4]" />
        </Node>

        {/* --- TOP RIGHT BRANCH: VIDEO ANALYTICS --- */}
        <Node x={250} y={-350} label="Video Analytics" glowColor="#ec4899" subLabel="Content Audits">
          <div className="w-16 h-16 bg-pink-500/5 border border-pink-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Video size={24} className="text-pink-500" />
          </div>
        </Node>
        <Node x={300} y={-420} label="Visual Hooks" glowColor="#ec4899">
           <div className="w-4 h-4 bg-pink-500 border border-pink-300 rounded-full shadow-[0_0_10px_#ec4899]" />
        </Node>
        <Node x={380} y={-350} label="Audio Transcripts" glowColor="#ec4899">
           <div className="w-4 h-4 bg-pink-500 border border-pink-300 rounded-full shadow-[0_0_10px_#ec4899]" />
        </Node>

        {/* --- TOP LEFT BRANCH: ADMIN OPS --- */}
        <Node x={-250} y={-350} label="Admin Operations" glowColor="#eab308" subLabel="Global Settings">
          <div className="w-16 h-16 bg-yellow-500/5 border border-yellow-500/40 rounded-full flex items-center justify-center backdrop-blur-md">
            <Settings size={24} className="text-yellow-500" />
          </div>
        </Node>
        <Node x={-320} y={-400} label="API Spending" glowColor="#eab308">
           <div className="w-4 h-4 bg-yellow-500 border border-yellow-300 rounded-full shadow-[0_0_10px_#eab308]" />
        </Node>
        <Node x={-200} y={-430} label="Auth Context" glowColor="#eab308">
           <div className="w-4 h-4 bg-yellow-500 border border-yellow-300 rounded-full shadow-[0_0_10px_#eab308]" />
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
