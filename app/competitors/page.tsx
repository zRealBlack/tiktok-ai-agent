'use client';

import { useState } from "react";
import { mockCompetitors } from "@/lib/mockData";
import CompetitorCard from "@/components/CompetitorCard";
import { Plus, Search } from "lucide-react";
import { dispatchAgentPrompt } from "@/components/AIChatBox";

export default function CompetitorsPage() {
  const [newHandle, setNewHandle] = useState("");

  const handleCustomSpy = () => {
    if (!newHandle.trim()) return;
    dispatchAgentPrompt(
      `Spy on ${newHandle.trim()} — based on your knowledge of TikTok strategy in my niche (digital agency, Egyptian market), what are they likely doing well, what's their weakness, and what should I adapt from them? Compare to my current competitors if relevant.`
    );
    setNewHandle("");
  };

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Competitor Intelligence</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Track what competitors are doing — spy on any account for AI analysis.
        </p>
      </div>

      {/* Spy input */}
      <div className="glass-panel rounded-2xl p-5 mb-6">
        <h2 className="text-[13px] font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>Spy on any account</h2>
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 glass-input rounded-xl px-4 py-2.5">
            <Search size={15} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
            <input
              type="text"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSpy()}
              placeholder="@handle"
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-40"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <button
            onClick={handleCustomSpy}
            disabled={!newHandle.trim()}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-40"
          >
            <Plus size={15} /> Spy
          </button>
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-faint)' }}>
          The agent will analyze the account in the chat panel →
        </p>
      </div>

      <h2 className="text-[12px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
        Tracked Accounts
      </h2>
      <div className="grid grid-cols-3 gap-5">
        {mockCompetitors.map((c) => <CompetitorCard key={c.handle} competitor={c} />)}
      </div>
    </div>
  );
}
