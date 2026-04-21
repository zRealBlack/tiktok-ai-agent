'use client';

import { useState } from "react";
import { mockIdeas } from "@/lib/mockData";
import IdeaCard from "@/components/IdeaCard";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { dispatchAgentPrompt } from "@/components/AIChatBox";

const NICHE_OPTIONS = ["Digital Agency", "Content Creator", "E-Commerce", "Fitness", "Food & Beverage", "Tech Startup"];
const GEN_OPTIONS = ["Gen Z", "Millennials", "Gen X", "All Generations"];
const GOAL_OPTIONS = ["Grow Followers", "Get Clients", "Build Authority", "Monetize Content", "Go Viral"];

export default function IdeasPage() {
  const [niche, setNiche] = useState("Digital Agency");
  const [generation, setGeneration] = useState("Gen Z");
  const [goal, setGoal] = useState("Grow Followers");
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    dispatchAgentPrompt(
      `Generate 3 original TikTok video briefs for my account (${niche} niche, targeting ${generation}, goal: ${goal}). For each, include: hook line, 3-act video structure with specific shot directions, recommended sound type, best post time, and a punchy caption under 100 chars with 3 niche hashtags. Make each idea distinct.`
    );
    setTimeout(() => setLoading(false), 500);
  };

  const selectClass = "w-full glass-input rounded-xl px-3 py-2 text-[13px] outline-none transition-all";

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Video Ideas</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          AI-generated video briefs. Use the agent to generate custom ideas for your niche and goals.
        </p>
      </div>

      {/* Generator */}
      <div className="glass-panel rounded-2xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} style={{ color: 'var(--text-secondary)' }} />
          <h2 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Generate with Agent</h2>
          <span className="ml-auto text-[11px] glass-elevated px-2 py-0.5 rounded-full" style={{ color: 'var(--text-muted)' }}>
            Powered by Claude
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Your Niche
            </label>
            <select value={niche} onChange={(e) => setNiche(e.target.value)}
              className={selectClass} style={{ color: 'var(--text-primary)' }}>
              {NICHE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Target Generation
            </label>
            <select value={generation} onChange={(e) => setGeneration(e.target.value)}
              className={selectClass} style={{ color: 'var(--text-primary)' }}>
              {GEN_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Content Goal
            </label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)}
              className={selectClass} style={{ color: 'var(--text-primary)' }}>
              {GOAL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-60">
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Opening...</>
                : <><RefreshCw size={14} /> Generate Ideas</>}
            </button>
          </div>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
          The agent will generate ideas in the chat panel based on your account data and the parameters above.
        </p>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>
          {mockIdeas.length} Baseline Briefs
          <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--text-faint)' }}>
            Click any idea to expand it with the agent
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
        {mockIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}
      </div>
    </div>
  );
}
