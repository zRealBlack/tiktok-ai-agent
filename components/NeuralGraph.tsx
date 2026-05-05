'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import BrainImage from "@/public/brain.png";
import { Plus, Minus, X } from "lucide-react";
import { SARIE_MEMORY, MemoryBranch, MemoryNode } from "@/lib/sarieMemory";
import { useData } from "@/components/DataContext";

// ── Layout: compute absolute positions for each branch ──
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
}

// Branch angles (degrees, 0=right, 90=down, 180=left, 270=up)
const BRANCH_CONFIGS: Record<string, { angle: number; radius: number }> = {
  'identity':       { angle: 250, radius: 500 },
  'team':           { angle: 270, radius: 850 },
  'client':         { angle: 310, radius: 600 },
  'competitors':    { angle: 210, radius: 600 },
  'video-analysis': { angle: 30,  radius: 550 },
  'audio-analysis': { angle: 60,  radius: 650 },
  'visual-rules':   { angle: 10,  radius: 850 },
  'branding':       { angle: 150, radius: 550 },
  'strategy':       { angle: 170, radius: 750 },
  'infra':          { angle: 120, radius: 600 },
};

function degToRad(deg: number) { return (deg * Math.PI) / 180; }

function layoutChildren(
  children: MemoryNode[],
  parentX: number,
  parentY: number,
  baseAngle: number,
  spreadDeg: number,
  radius: number,
  color: string,
  depth: number
): PositionedNode[] {
  const n = children.length;
  if (n === 0) return [];
  const startAngle = baseAngle - (spreadDeg * (n - 1)) / 2;
  return children.map((child, i) => {
    const angle = startAngle + i * spreadDeg;
    const x = parentX + Math.cos(degToRad(angle)) * radius;
    const y = parentY + Math.sin(degToRad(angle)) * radius;
    const childSpread = Math.max(8, spreadDeg * 0.7);
    const childRadius = Math.max(120, radius * 0.65);
    return {
      id: child.id,
      label: child.label,
      detail: child.detail,
      x, y,
      parentX: parentX,
      parentY: parentY,
      color,
      size: depth === 0 ? 'md' : depth === 1 ? 'sm' : 'xs',
      children: child.children
        ? layoutChildren(child.children, x, y, angle, childSpread, childRadius, color, depth + 1)
        : [],
    };
  });
}

function layoutBranch(branch: MemoryBranch): PositionedNode {
  const cfg = BRANCH_CONFIGS[branch.id] || { angle: 0, radius: 500 };
  const bx = Math.cos(degToRad(cfg.angle)) * cfg.radius;
  const by = Math.sin(degToRad(cfg.angle)) * cfg.radius;
  const childSpread = branch.children.length > 5 ? 12 : 18;
  const childRadius = 250;
  return {
    id: branch.id,
    label: branch.label,
    detail: branch.detail,
    x: bx, y: by,
    parentX: 0, parentY: 0,
    color: branch.color,
    size: 'lg',
    children: layoutChildren(branch.children, bx, by, cfg.angle, childSpread, childRadius, branch.color, 0),
  };
}

// ── Flatten tree to array for rendering ──
function flattenTree(node: PositionedNode): PositionedNode[] {
  return [node, ...node.children.flatMap(flattenTree)];
}

// ── Component ──
export default function NeuralGraph() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { competitors } = useData();

  // Compute layout
  const branches = SARIE_MEMORY.map(layoutBranch);
  const allNodes = branches.flatMap(flattenTree);

  // Build dynamic competitor nodes
  const compBranch = branches.find(b => b.id === 'competitors');
  const dynamicCompNodes: PositionedNode[] = (competitors || []).map((c: any, i: number) => {
    const baseAngle = 210;
    const angle = baseAngle - 15 + i * -10;
    const px = compBranch?.x || 0;
    const py = compBranch?.y || 0;
    const x = px + Math.cos(degToRad(angle)) * 300;
    const y = py + Math.sin(degToRad(angle)) * 300;
    return {
      id: `comp-live-${c.handle}`,
      label: c.handle,
      detail: `${c.handle}${c.name ? ` (${c.name})` : ''}\nFollowers: ${(c.followers || 0).toLocaleString()} | Status: ${c.status}\nPosts/week: ${c.postsThisWeek} | Avg Views: ${(c.avgViews || 0).toLocaleString()}\nThreat Level: ${c.threatLevel || '—'}\nTop Video: "${c.topVideoTitle || '—'}" (${(c.topVideoViews || 0).toLocaleString()} views)\nStrengths: ${(c.pros || []).join('; ') || '—'}\nWeaknesses: ${(c.cons || []).join('; ') || '—'}\nOpportunity: ${c.opportunity || '—'}`,
      x, y,
      parentX: px,
      parentY: py,
      color: '#a855f7',
      size: 'sm' as const,
      children: [],
    };
  });

  // Pan & Zoom handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (selectedNode) return;
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

  const targetScale = useRef(1);
  const animRef = useRef<number>(0);
  const animateZoom = useCallback(() => {
    setScale(prev => {
      const diff = targetScale.current - prev;
      if (Math.abs(diff) < 0.002) return targetScale.current;
      animRef.current = requestAnimationFrame(animateZoom);
      const next = prev + diff * 0.15;
      const ratio = next / prev;
      setPosition(p => ({ x: p.x * ratio, y: p.y * ratio }));
      return next;
    });
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

  // ── Render helpers ──
  const sizeMap = { lg: 'w-20 h-20', md: 'w-14 h-14', sm: 'w-10 h-10', xs: 'w-6 h-6' };
  const dotSizeMap = { lg: 28, md: 20, sm: 14, xs: 8 };

  function renderPath(from: {x:number,y:number}, to: {x:number,y:number}, color: string, width: number, isMain?: boolean) {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const cx1 = from.x + (mx - from.x) * 0.5;
    const cy1 = from.y + (my - from.y) * 1.2;
    const cx2 = to.x - (to.x - mx) * 0.5;
    const cy2 = to.y - (to.y - my) * 1.2;
    return (
      <path
        key={`path-${from.x}-${from.y}-${to.x}-${to.y}`}
        d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
        stroke={color}
        strokeWidth={width}
        fill="none"
        strokeOpacity={isMain ? 0.6 : 0.25}
        className={isMain ? "animate-[pulse_4s_ease-in-out_infinite]" : ""}
      />
    );
  }

  function renderNode(node: PositionedNode) {
    const dotSize = dotSizeMap[node.size];
    return (
      <div
        key={node.id}
        className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer hover:scale-110 transition-transform duration-300"
        style={{ left: node.x, top: node.y }}
        onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
      >
        <div
          className="absolute inset-0 blur-[20px] rounded-full opacity-20 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none animate-pulse"
          style={{ backgroundColor: node.color }}
        />
        <div
          className="rounded-full border flex items-center justify-center backdrop-blur-md transition-all duration-300 group-hover:shadow-[0_0_20px_var(--glow)]"
          style={{
            width: dotSize, height: dotSize,
            backgroundColor: `${node.color}10`,
            borderColor: `${node.color}66`,
            '--glow': node.color,
          } as any}
        />
        <div className="absolute top-[110%] w-max text-center pointer-events-none z-50 max-w-[140px]">
          <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: node.color }}>{node.label}</div>
        </div>
      </div>
    );
  }

  function renderTreePaths(node: PositionedNode): React.ReactElement[] {
    const paths: React.ReactElement[] = [];
    for (const child of node.children) {
      const w = child.size === 'md' ? 2 : child.size === 'sm' ? 1.5 : 1;
      paths.push(renderPath({ x: node.x, y: node.y }, { x: child.x, y: child.y }, child.color, w));
      paths.push(...renderTreePaths(child));
    }
    return paths;
  }

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

      {/* The Infinite Canvas */}
      <div
        className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none"
        style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transformOrigin: '0 0' }}
      >
        {/* SVG Paths */}
        <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
          {/* Main branch paths from brain to each root */}
          {branches.map(b => renderPath({ x: 0, y: 0 }, { x: b.x, y: b.y }, b.color, 3, true))}
          {/* Sub-paths */}
          {branches.flatMap(b => renderTreePaths(b))}
          {/* Dynamic competitor paths */}
          {dynamicCompNodes.map(n => renderPath({ x: n.parentX, y: n.parentY }, { x: n.x, y: n.y }, n.color, 1.5))}
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

        {/* All memory nodes */}
        {allNodes.map(renderNode)}
        {/* Dynamic competitor nodes */}
        {dynamicCompNodes.map(renderNode)}
      </div>

      {/* UI Overlay Controls */}
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
        >Recenter Matrix</button>
      </div>

      {/* ── Detail Panel ── */}
      {selectedNode && (
        <div className="absolute inset-0 z-40 pointer-events-auto" onClick={() => setSelectedNode(null)}>
          <div
            className="absolute top-0 right-0 h-full w-[420px] max-w-[90vw] bg-white/95 backdrop-blur-xl border-l border-black/10 shadow-[-10px_0_40px_rgba(0,0,0,0.1)] flex flex-col animate-[slideIn_0.3s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                <h3 className="text-lg font-black text-black tracking-tight">{selectedNode.label}</h3>
              </div>
              <button onClick={() => setSelectedNode(null)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <X size={16} />
              </button>
            </div>
            {/* Category */}
            <div className="px-6 py-3 bg-black/[0.02]">
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: selectedNode.color }}>Memory Node</span>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-[15px] text-black/80 leading-relaxed whitespace-pre-wrap" dir="auto">
                {selectedNode.detail}
              </div>
              {/* Show children summaries */}
              {selectedNode.children.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-black/40">Sub-Memories ({selectedNode.children.length})</div>
                  {selectedNode.children.map(child => (
                    <button
                      key={child.id}
                      className="w-full text-left p-3 rounded-xl bg-black/[0.02] hover:bg-black/[0.05] border border-black/5 transition-colors"
                      onClick={() => setSelectedNode(child)}
                    >
                      <div className="text-[12px] font-bold" style={{ color: child.color }}>{child.label}</div>
                      <div className="text-[11px] text-black/50 mt-1 line-clamp-2" dir="auto">{child.detail}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
