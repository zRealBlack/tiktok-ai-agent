'use client';

import { Eye, Users, Search } from "lucide-react";
import { dispatchAgentPrompt } from "./AIChatBox";

interface Competitor {
  handle: string;
  followers: number;
  postsThisWeek: number;
  viewChange: string;
  status: "spiking" | "stable" | "dropping";
  avgViews: number;
  topFormat: string;
}

const statusStyle = {
  spiking: { label: "Spiking", cls: "text-emerald-500 bg-emerald-500/10" },
  stable:  { label: "Stable",  cls: "text-amber-500  bg-amber-500/10" },
  dropping:{ label: "Dropping",cls: "text-red-500    bg-red-500/10" },
};

export default function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const cfg = statusStyle[competitor.status] || statusStyle.stable;
  const fmtNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString();

  const handleSpy = () => {
    dispatchAgentPrompt(
      `Deep spy on ${competitor.handle}: ${competitor.followers.toLocaleString()} followers, posts ${competitor.postsThisWeek}x/week, status: ${competitor.status}, view change: ${competitor.viewChange}, avg views: ${competitor.avgViews.toLocaleString()}, top format: "${competitor.topFormat}". What are they doing right, what's their weakness, and what should I steal to beat them?`
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{competitor.handle}</div>
          <div className="flex items-center gap-1 text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            <Users size={11} /> {fmtNum(competitor.followers)} followers
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${cfg.cls}`}>{cfg.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { v: competitor.postsThisWeek, l: "posts/week" },
          { v: competitor.viewChange, l: "view change", spike: competitor.status === "spiking" },
          { v: fmtNum(competitor.avgViews), l: "avg views" },
        ].map(({ v, l, spike }) => (
          <div key={l} className="glass-elevated rounded-xl p-2.5 text-center">
            <div className={`text-[14px] font-bold ${spike ? "text-emerald-500" : ""}`}
              style={!spike ? { color: 'var(--text-primary)' } : undefined}>
              {v}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="text-[11px] mb-3 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
        <Eye size={11} />
        Top format: <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{competitor.topFormat}</span>
      </div>

      <button
        onClick={handleSpy}
        className="btn-secondary w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 hover:opacity-80"
      >
        <Search size={13} />
        Spy on this account
      </button>
    </div>
  );
}
