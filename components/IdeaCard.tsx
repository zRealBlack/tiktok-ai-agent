'use client';

import { Clock, Music, Zap } from "lucide-react";
import { dispatchAgentPrompt } from "./AIChatBox";

interface Idea {
  id: string;
  hook: string;
  format: string;
  act1: string;
  act2: string;
  act3: string;
  generation: string;
  sound: string;
  caption: string;
  bestTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  potential: "High" | "Medium" | "Low";
}

const diffStyle = {
  Easy:   "text-emerald-500 bg-emerald-500/10",
  Medium: "text-amber-500 bg-amber-500/10",
  Hard:   "text-red-500 bg-red-500/10",
};

export default function IdeaCard({ idea }: { idea: Idea }) {
  const handleUse = () => {
    dispatchAgentPrompt(
      `Expand this video idea for me: "${idea.hook}" (${idea.format} format, ${idea.generation} audience, post at ${idea.bestTime}). Rewrite the hook to be stronger, give me a full 3-act breakdown with specific shots/actions, write a caption under 100 chars with 3 niche hashtags, and add a CTA that drives saves. Make it production-ready.`
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${diffStyle[idea.difficulty]}`}>
          {idea.difficulty}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold glass-elevated" style={{ color: 'var(--text-secondary)' }}>
          {idea.potential} Potential
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold glass-elevated" style={{ color: 'var(--text-muted)' }}>
          {idea.generation}
        </span>
      </div>

      {/* Hook */}
      <div className="text-[13px] font-semibold leading-snug mb-4" style={{ color: 'var(--text-primary)' }}>
        &ldquo;{idea.hook}&rdquo;
      </div>

      {/* 3-Act */}
      <div className="space-y-2 mb-4">
        {[idea.act1, idea.act2, idea.act3].map((act, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5 glass-elevated"
              style={{ color: i === 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}
            >
              {i + 1}
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{act}</p>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div className="glass-elevated rounded-xl p-2.5 mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Caption</div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{idea.caption}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] mb-4" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><Clock size={10} /> {idea.bestTime}</span>
        <span className="flex items-center gap-1"><Music size={10} /> {idea.sound}</span>
      </div>

      <button
        onClick={handleUse}
        className="btn-secondary w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 hover:opacity-80"
      >
        <Zap size={13} />
        Expand with Agent
      </button>
    </div>
  );
}
