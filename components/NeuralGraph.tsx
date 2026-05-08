'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import BrainImage from "@/public/brain.png";
import { Plus, Minus, X, RefreshCw } from "lucide-react";
import { SARIE_MEMORY, MemoryBranch, MemoryNode } from "@/lib/sarieMemory";
import { useData } from "@/components/DataContext";

// ── Layout types ──────────────────────────────────────────────────────────────

interface PositionedNode {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  parentX: number;
  parentY: number;
  color: string;
  size: 'lg' | 'md' | 'sm' | 'xs';
  children: PositionedNode[];
  isNew?: boolean;      // pulsing glow for recently added
  isEpisodic?: boolean; // different label style
}

interface EpisodicMemory {
  insights:  string[];
  decisions: string[];
  sessions:  { userId: string; date: string; accountUsername: string; summary: { insights: string[]; decisions: string[]; patterns: string[] } }[];
  lastUpdated: string | null;
}

// ── Static layout config ──────────────────────────────────────────────────────

const BRANCH_CONFIGS: Record<string, { angle: number; radius: number; spread: number; childR: number }> = {
  'identity':       { angle: 260, radius: 500,  spread: 25, childR: 280 },
  'team':           { angle: 280, radius: 900,  spread: 18, childR: 350 },
  'client':         { angle: 320, radius: 650,  spread: 22, childR: 300 },
  'competitors':    { angle: 215, radius: 650,  spread: 22, childR: 300 },
  'video-analysis': { angle: 25,  radius: 550,  spread: 20, childR: 300 },
  'audio-analysis': { angle: 55,  radius: 700,  spread: 18, childR: 280 },
  'visual-rules':   { angle: 5,   radius: 900,  spread: 18, childR: 300 },
  'branding':       { angle: 145, radius: 550,  spread: 22, childR: 280 },
  'strategy':       { angle: 165, radius: 800,  spread: 18, childR: 280 },
  'infra':          { angle: 115, radius: 600,  spread: 20, childR: 300 },
};

// Colors for episodic memory types
const COLORS = {
  insight:  '#10b981', // emerald — "Sarie learned"
  decision: '#f59e0b', // amber   — "agreed on"
  session:  '#6366f1', // indigo  — "session summary"
  hub:      '#10b981',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function degToRad(deg: number) { return (deg * Math.PI) / 180; }

function layoutChildren(
  children: MemoryNode[], parentX: number, parentY: number,
  baseAngle: number, spreadDeg: number, radius: number,
  color: string, depth: number
): PositionedNode[] {
  const n = children.length;
  if (n === 0) return [];
  const startAngle = baseAngle - (spreadDeg * (n - 1)) / 2;
  return children.map((child, i) => {
    const angle = startAngle + i * spreadDeg;
    const x = parentX + Math.cos(degToRad(angle)) * radius;
    const y = parentY + Math.sin(degToRad(angle)) * radius;
    const nextSpread = Math.max(12, spreadDeg * 0.8);
    const nextRadius = Math.max(150, radius * 0.7);
    return {
      id: child.id, label: child.label, detail: child.detail,
      x, y, parentX, parentY, color, size: (depth === 0 ? 'md' : depth === 1 ? 'sm' : 'xs') as any,
      children: child.children
        ? layoutChildren(child.children, x, y, angle, nextSpread, nextRadius, color, depth + 1)
        : [],
    };
  });
}

function layoutBranch(branch: MemoryBranch): PositionedNode {
  const cfg = BRANCH_CONFIGS[branch.id] || { angle: 0, radius: 500, spread: 20, childR: 280 };
  const bx = Math.cos(degToRad(cfg.angle)) * cfg.radius;
  const by = Math.sin(degToRad(cfg.angle)) * cfg.radius;
  return {
    id: branch.id, label: branch.label, detail: branch.detail,
    x: bx, y: by, parentX: 0, parentY: 0, color: branch.color, size: 'lg',
    children: layoutChildren(branch.children, bx, by, cfg.angle, cfg.spread, cfg.childR, branch.color, 0),
  };
}

function flattenTree(node: PositionedNode): PositionedNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

// Build dynamic episodic memory nodes from KV data
function buildEpisodicNodes(mem: EpisodicMemory, prevCount: { insights: number; decisions: number }): PositionedNode[] {
  const HUB_ANGLE  = 88;
  const HUB_RADIUS = 600;
  const hubX = Math.cos(degToRad(HUB_ANGLE)) * HUB_RADIUS;
  const hubY = Math.sin(degToRad(HUB_ANGLE)) * HUB_RADIUS;

  const totalInsights  = mem.insights.length;
  const totalDecisions = mem.decisions.length;

  const hub: PositionedNode = {
    id: 'episodic-hub',
    label: "Sarie's Learning",
    detail: `ذاكرة ساري التراكمية المكتسبة من المحادثات الحقيقية.\n\n• ${totalInsights} Insight${totalInsights !== 1 ? 's' : ''}\n• ${totalDecisions} Decision${totalDecisions !== 1 ? 's' : ''}\n• ${mem.sessions.length} Sessions analyzed\n\n${mem.lastUpdated ? `آخر تحديث: ${new Date(mem.lastUpdated).toLocaleDateString('en-GB')}` : 'No sessions yet'}`,
    x: hubX, y: hubY, parentX: 0, parentY: 0,
    color: COLORS.hub, size: 'lg', children: [], isEpisodic: true,
  };

  // Insight nodes — fan to the right-ish of hub
  const insightNodes: PositionedNode[] = mem.insights.slice(-12).map((text, i) => {
    const n = Math.min(mem.insights.length, 12);
    const fanStart = 30;
    const fanEnd   = 80;
    const angle    = n === 1 ? 55 : fanStart + (i / (n - 1)) * (fanEnd - fanStart);
    const r        = 260 + (i % 2) * 60;
    const isNew    = i >= prevCount.insights;
    return {
      id: `episodic-insight-${i}`,
      label: `Insight ${mem.insights.length - Math.min(mem.insights.length, 12) + i + 1}`,
      detail: text,
      x: hubX + Math.cos(degToRad(angle)) * r,
      y: hubY + Math.sin(degToRad(angle)) * r,
      parentX: hubX, parentY: hubY,
      color: COLORS.insight, size: 'sm', children: [], isNew, isEpisodic: true,
    };
  });

  // Decision nodes — fan to the left-ish of hub
  const decisionNodes: PositionedNode[] = mem.decisions.slice(-8).map((text, i) => {
    const n = Math.min(mem.decisions.length, 8);
    const fanStart = 100;
    const fanEnd   = 145;
    const angle    = n === 1 ? 120 : fanStart + (i / (n - 1)) * (fanEnd - fanStart);
    const r        = 250 + (i % 2) * 60;
    const isNew    = i >= prevCount.decisions;
    return {
      id: `episodic-decision-${i}`,
      label: `قرار ${mem.decisions.length - Math.min(mem.decisions.length, 8) + i + 1}`,
      detail: text,
      x: hubX + Math.cos(degToRad(angle)) * r,
      y: hubY + Math.sin(degToRad(angle)) * r,
      parentX: hubX, parentY: hubY,
      color: COLORS.decision, size: 'sm', children: [], isNew, isEpisodic: true,
    };
  });

  // Recent session nodes — below the hub
  const sessionNodes: PositionedNode[] = mem.sessions.slice(-4).map((s, i) => {
    const angle = 75 + i * 12;
    const r     = 180;
    const date  = new Date(s.date);
    const isNew = Date.now() - date.getTime() < 24 * 60 * 60 * 1000;
    return {
      id: `episodic-session-${i}`,
      label: `Session — ${s.userId}`,
      detail: `User: ${s.userId} | Account: ${s.accountUsername}\nDate: ${date.toLocaleDateString('en-GB')}\n\nInsights:\n${(s.summary?.insights || []).map(x => `• ${x}`).join('\n') || '—'}\n\nDecisions:\n${(s.summary?.decisions || []).map(x => `• ${x}`).join('\n') || '—'}\n\nPatterns:\n${(s.summary?.patterns || []).map(x => `• ${x}`).join('\n') || '—'}`,
      x: hubX + Math.cos(degToRad(angle)) * r,
      y: hubY + Math.sin(degToRad(angle)) * r,
      parentX: hubX, parentY: hubY,
      color: COLORS.session, size: 'xs', children: [], isNew, isEpisodic: true,
    };
  });

  return [hub, ...insightNodes, ...decisionNodes, ...sessionNodes];
}

// Precompute static layout ONCE outside the component
const BRANCHES     = SARIE_MEMORY.map(layoutBranch);
const ALL_NODES    = BRANCHES.flatMap(flattenTree);

// ── Component ─────────────────────────────────────────────────────────────────

export default function NeuralGraph() {
  const [isDragging, setIsDragging]     = useState(false);
  const posRef      = useRef({ x: 0, y: 0 });
  const scaleRef    = useRef(1);
  const [, forceRender]                 = useState(0);
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);
  const { competitors } = useData();

  // ── Episodic memory state ──────────────────────────────────────────────────
  const [episodic,    setEpisodic]    = useState<EpisodicMemory>({ insights: [], decisions: [], sessions: [], lastUpdated: null });
  const [memLoading,  setMemLoading]  = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const prevCountRef = useRef({ insights: 0, decisions: 0 });

  const fetchMemory = useCallback(async (showLoader = false) => {
    if (showLoader) setMemLoading(true);
    try {
      const data = await fetch('/api/memory').then(r => r.json());
      setEpisodic(data);
      setLastRefresh(new Date());
      // Update prev counts AFTER we've set state so "new" flags work for this render
      setTimeout(() => {
        prevCountRef.current = { insights: data.insights.length, decisions: data.decisions.length };
      }, 3000); // keep "new" glow for 3s after fetch
    } catch {}
    if (showLoader) setMemLoading(false);
  }, []);

  useEffect(() => {
    fetchMemory(true);
    // Auto-refresh every 30 seconds
    const id = setInterval(() => fetchMemory(false), 30_000);
    return () => clearInterval(id);
  }, [fetchMemory]);

  // ── Episodic nodes (computed from fetched data) ───────────────────────────
  const episodicNodes = useMemo(
    () => buildEpisodicNodes(episodic, prevCountRef.current),
    [episodic]
  );

  // ── Dynamic competitor nodes ───────────────────────────────────────────────
  const compBranch = BRANCHES.find(b => b.id === 'competitors');
  const dynamicCompNodes = useMemo(() => {
    return (competitors || []).map((c: any, i: number) => {
      const baseAngle = 215;
      const angle = baseAngle - 15 + i * -12;
      const px = compBranch?.x || 0;
      const py = compBranch?.y || 0;
      const x  = px + Math.cos(degToRad(angle)) * 300;
      const y  = py + Math.sin(degToRad(angle)) * 300;
      return {
        id: `comp-live-${c.handle}`, label: c.handle,
        detail: `${c.handle}${c.name ? ` (${c.name})` : ''}\nFollowers: ${(c.followers || 0).toLocaleString()} | Status: ${c.status}\nPosts/week: ${c.postsThisWeek} | Avg Views: ${(c.avgViews || 0).toLocaleString()}\nThreat Level: ${c.threatLevel || '—'}\nStrengths: ${(c.pros || []).join('; ') || '—'}\nWeaknesses: ${(c.cons || []).join('; ') || '—'}`,
        x, y, parentX: px, parentY: py, color: '#a855f7', size: 'sm' as const, children: [] as PositionedNode[],
      };
    });
  }, [competitors, compBranch]);

  // ── DOM transform (pan/zoom via refs for buttery smoothness) ─────────────
  function applyTransform() {
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) scale(${scaleRef.current})`;
    }
    if (gridRef.current) {
      gridRef.current.style.backgroundPosition = `${posRef.current.x}px ${posRef.current.y}px`;
      gridRef.current.style.backgroundSize = `${100 * scaleRef.current}px ${100 * scaleRef.current}px`;
    }
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    posRef.current = { x: posRef.current.x + dx, y: posRef.current.y + dy };
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    applyTransform();
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const targetScale = useRef(1);
  const animRef     = useRef(0);

  const animateZoom = useCallback(() => {
    const diff = targetScale.current - scaleRef.current;
    if (Math.abs(diff) < 0.002) {
      scaleRef.current = targetScale.current;
      applyTransform();
      return;
    }
    const next  = scaleRef.current + diff * 0.15;
    const ratio = next / scaleRef.current;
    posRef.current = { x: posRef.current.x * ratio, y: posRef.current.y * ratio };
    scaleRef.current = next;
    applyTransform();
    animRef.current = requestAnimationFrame(animateZoom);
  }, []);

  const zoom = useCallback((delta: number) => {
    targetScale.current = Math.min(Math.max(0.08, targetScale.current + delta), 4);
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animateZoom);
  }, [animateZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); e.stopPropagation(); zoom(-e.deltaY * 0.001); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const dotSizeMap = { lg: 28, md: 20, sm: 14, xs: 8 };

  function renderPath(fromX: number, fromY: number, toX: number, toY: number, color: string, width: number, isMain?: boolean) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    return (
      <path
        key={`p-${fromX|0}-${fromY|0}-${toX|0}-${toY|0}`}
        d={`M ${fromX} ${fromY} C ${fromX + dx * 0.3} ${fromY + dy * 0.6}, ${fromX + dx * 0.7} ${fromY + dy * 0.4}, ${toX} ${toY}`}
        stroke={color} strokeWidth={width} fill="none"
        strokeOpacity={isMain ? 0.6 : 0.2}
      />
    );
  }

  function renderAllPaths(node: PositionedNode): React.ReactNode[] {
    const paths: React.ReactNode[] = [];
    for (const child of node.children) {
      const w = child.size === 'md' ? 2 : child.size === 'sm' ? 1.5 : 1;
      paths.push(renderPath(node.x, node.y, child.x, child.y, child.color, w));
      paths.push(...renderAllPaths(child));
    }
    return paths;
  }

  function renderNode(node: PositionedNode) {
    const dotSize = dotSizeMap[node.size];
    const isNew   = !!node.isNew;
    return (
      <div
        key={node.id}
        className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer ${isNew ? 'node-new' : ''}`}
        style={{ left: node.x, top: node.y }}
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); e.preventDefault(); setSelectedNode(node); }}
      >
        <div
          className={`rounded-full border ${isNew ? 'node-pulse-ring' : ''}`}
          style={{
            width: dotSize, height: dotSize,
            backgroundColor: `${node.color}${isNew ? '40' : '20'}`,
            borderColor: `${node.color}${isNew ? '99' : '55'}`,
            boxShadow: isNew
              ? `0 0 16px ${node.color}88, 0 0 4px ${node.color}66`
              : `0 0 8px ${node.color}33`,
          }}
        />
        <div className="absolute top-[110%] w-max text-center pointer-events-none max-w-[140px]">
          <div className={`text-[10px] font-bold tracking-wider uppercase ${node.isEpisodic ? '' : ''}`} style={{ color: node.color }}>
            {node.label}
          </div>
          {isNew && <div className="text-[8px] font-bold mt-0.5" style={{ color: node.color }}>● NEW</div>}
        </div>
      </div>
    );
  }

  // Hub node needs a dashed line from center
  const episodicHub = episodicNodes[0];

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
        ref={gridRef}
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundPosition: '0px 0px',
          backgroundImage: `linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] pointer-events-none z-10" />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none"
        style={{ transform: 'translate(0px, 0px) scale(1)', transformOrigin: '0 0', willChange: 'transform' }}
      >
        {/* SVG Paths */}
        <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
          {/* Static branches → center */}
          {BRANCHES.map(b => renderPath(0, 0, b.x, b.y, b.color, 3, true))}
          {BRANCHES.flatMap(b => renderAllPaths(b))}
          {/* Competitor live nodes */}
          {dynamicCompNodes.map(n => renderPath(n.parentX, n.parentY, n.x, n.y, n.color, 1.5))}
          {/* Episodic memory hub → center (dashed) */}
          {episodicHub && (
            <path
              d={`M 0 0 C ${episodicHub.x * 0.3} ${episodicHub.y * 0.6}, ${episodicHub.x * 0.7} ${episodicHub.y * 0.4}, ${episodicHub.x} ${episodicHub.y}`}
              stroke={COLORS.hub} strokeWidth={2.5} fill="none" strokeOpacity={0.5}
              strokeDasharray="8 5"
            />
          )}
          {/* Episodic child nodes → hub */}
          {episodicNodes.slice(1).map(n => renderPath(n.parentX, n.parentY, n.x, n.y, n.color, n.id.includes('session') ? 1 : 1.5))}
        </svg>

        {/* Core Brain Node */}
        <div className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto" style={{ left: 0, top: 0 }}>
          <div className="w-[300px] h-[300px] flex items-center justify-center relative" style={{ mixBlendMode: 'multiply' }}>
            <Image src={BrainImage} alt="Brain" fill className="object-contain" style={{ filter: 'invert(1) grayscale(1) contrast(5)' }} priority draggable={false} />
            <div className="absolute inset-0 pointer-events-none" style={{
              mixBlendMode: 'screen',
              background: `radial-gradient(circle at 50% 90%, #a855f7 0%, transparent 60%),
                            radial-gradient(circle at 90% 10%, #06b6d4 0%, transparent 60%),
                            radial-gradient(circle at 10% 10%, #f97316 0%, transparent 60%)`
            }} />
          </div>
          <div className="absolute top-[110%] w-max text-center pointer-events-none z-50">
            <div className="text-[11px] font-bold tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" style={{ color: '#ef4444' }}>Sarie Central Intelligence</div>
            <div className="text-[9px] text-black/50 tracking-wider mt-0.5">Core Memory Hub</div>
          </div>
        </div>

        {/* Static memory nodes */}
        {ALL_NODES.map(node => renderNode(node))}

        {/* Dynamic competitor nodes */}
        {dynamicCompNodes.map(node => renderNode(node))}

        {/* Episodic memory nodes */}
        {episodicNodes.map(node => renderNode(node))}
      </div>

      {/* UI Controls — top left */}
      <div className="absolute top-8 left-8 pointer-events-none z-20">
        <h2 className="text-3xl font-black text-black drop-shadow-[0_2px_10px_rgba(255,255,255,1)] tracking-tight">Sarie Memory Graph</h2>
        <p className="text-[14px] font-bold text-[#ef4444] mt-1 bg-white/50 px-4 py-1.5 rounded-full w-fit backdrop-blur-md border border-black/10 uppercase tracking-widest">Infinite Scale Canvas</p>
        {/* Memory stats */}
        <div className="mt-3 flex gap-2 pointer-events-none">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ background: `${COLORS.insight}15`, borderColor: `${COLORS.insight}40`, color: COLORS.insight }}>
            {episodic.insights.length} Insights
          </span>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ background: `${COLORS.decision}15`, borderColor: `${COLORS.decision}40`, color: COLORS.decision }}>
            {episodic.decisions.length} Decisions
          </span>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border" style={{ background: `${COLORS.session}15`, borderColor: `${COLORS.session}40`, color: COLORS.session }}>
            {episodic.sessions.length} Sessions
          </span>
        </div>
      </div>

      {/* Zoom controls + refresh — top right */}
      <div className="absolute top-8 right-8 z-30 flex flex-col gap-2" onPointerDown={e => e.stopPropagation()}>
        <button onClick={() => zoom(0.15)} className="pointer-events-auto w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-black hover:bg-gray-50 shadow-sm transition-all active:scale-95"><Plus size={20} /></button>
        <button onClick={() => zoom(-0.15)} className="pointer-events-auto w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-black hover:bg-gray-50 shadow-sm transition-all active:scale-95"><Minus size={20} /></button>
        <button
          onClick={() => fetchMemory(true)}
          title="Refresh memory"
          className="pointer-events-auto w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-black hover:bg-gray-50 shadow-sm transition-all active:scale-95"
        >
          <RefreshCw size={15} className={memLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Recenter + last refresh — bottom right */}
      <div className="absolute bottom-8 right-8 z-30 flex flex-col items-end gap-2" onPointerDown={e => e.stopPropagation()}>
        <button
          onClick={() => { posRef.current = { x: 0, y: 0 }; targetScale.current = 1; zoom(0); }}
          className="pointer-events-auto px-8 py-4 bg-white border border-black/20 rounded-full text-[15px] font-bold text-black hover:bg-gray-50 transition-all shadow-md active:scale-95"
        >Recenter Matrix</button>
        {lastRefresh && (
          <span className="text-[10px] text-black/30 font-medium">
            Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {/* Legend — bottom left */}
      <div className="absolute bottom-8 left-8 z-20 pointer-events-none flex flex-col gap-1.5">
        {[
          { color: '#a855f7', label: 'Static Memory' },
          { color: '#06b6d4', label: 'Analysis Rules' },
          { color: '#f97316', label: 'Strategy Rules' },
          { color: COLORS.insight,  label: 'Learned Insights' },
          { color: COLORS.decision, label: 'Team Decisions' },
          { color: COLORS.session,  label: 'Session Summaries' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Empty episodic state hint */}
      {episodic.insights.length === 0 && episodic.decisions.length === 0 && !memLoading && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-[11px] font-bold text-emerald-600">No episodic memory yet</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Chat with Sarie — she builds memory every 8 messages</p>
          </div>
        </div>
      )}

      {/* ── Detail Panel ── */}
      {selectedNode && (
        <div className="absolute inset-0 z-50" style={{ pointerEvents: 'auto' }}
          onPointerDown={e => e.stopPropagation()} onClick={() => setSelectedNode(null)}>
          <div className="absolute inset-0 bg-black/5" />
          <div
            className="absolute top-0 right-0 h-full w-[420px] max-w-[90vw] bg-white border-l border-black/10 shadow-[-10px_0_40px_rgba(0,0,0,0.15)] flex flex-col"
            style={{ animation: 'slideInRight 0.25s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: selectedNode.color }} />
                <h3 className="text-lg font-black text-black tracking-tight truncate">{selectedNode.label}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors flex-shrink-0">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-3 bg-black/[0.02] border-b border-black/5 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: selectedNode.color }}>
                {selectedNode.isEpisodic ? 'Episodic Memory' : 'Static Memory Node'}
              </span>
              {selectedNode.isNew && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${selectedNode.color}20`, color: selectedNode.color }}>NEW</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-[14px] text-black/80 leading-relaxed whitespace-pre-wrap" dir="auto">
                {selectedNode.detail}
              </div>
              {selectedNode.children.length > 0 && (
                <div className="mt-6 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-black/40 mb-3">Sub-Memories ({selectedNode.children.length})</div>
                  {selectedNode.children.map(child => (
                    <button key={child.id} className="w-full text-left p-4 rounded-xl bg-black/[0.02] hover:bg-black/[0.06] border border-black/5 transition-colors" onClick={() => setSelectedNode(child)}>
                      <div className="text-[13px] font-bold" style={{ color: child.color }}>{child.label}</div>
                      <div className="text-[12px] text-black/50 mt-1 line-clamp-2" dir="auto">{child.detail}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes node-pulse {
          0%, 100% { box-shadow: 0 0 6px var(--nc, #10b981); opacity: 1; }
          50%       { box-shadow: 0 0 20px var(--nc, #10b981), 0 0 40px var(--nc, #10b981)55; opacity: 0.85; }
        }
        .node-pulse-ring {
          animation: node-pulse 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
