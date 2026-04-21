'use client';

import MetricCard from "@/components/MetricCard";
import VideoScoreCard from "@/components/VideoScoreCard";
import TrendRow from "@/components/TrendRow";
import CompetitorCard from "@/components/CompetitorCard";
import IdeaCard from "@/components/IdeaCard";
import GenerationBars from "@/components/GenerationBar";
import { useData } from "@/components/DataContext";
import { AlertTriangle, Eye, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OverviewPage() {
  const { account, videos, generations, trends, competitors, ideas } = useData();
  const topVideos = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Overview</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Welcome back, {account.username} — here&apos;s your performance snapshot.
          </p>
        </div>
        {account.actionItems > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel text-amber-500 text-[12px] font-semibold">
            <AlertTriangle size={14} /> {account.actionItems} action items
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard label="Followers" value={account.followers} change={account.followersGrowth} changeSuffix=" new" icon={<Users size={16} />} />
        <MetricCard label="Avg Engagement" value={account.avgEngagement} change={account.engagementChange} changeSuffix="%" format="decimal" suffix="%" icon={<TrendingUp size={16} />} highlight />
        <MetricCard label="Weekly Views" value={account.weeklyViews} change={account.weeklyViewsChange} changeSuffix="%" icon={<Eye size={16} />} />
        <MetricCard label="Videos Audited" value={videos.length} format="raw" icon={<AlertTriangle size={16} />} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Content Audit</h2>
            <Link href="/audit" className="flex items-center gap-1 text-[12px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {topVideos.map((v) => <VideoScoreCard key={v.id} video={v} compact />)}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-5">
            <h2 className="text-[14px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Audience Generation</h2>
            <GenerationBars generations={generations} />
          </div>
          <div className="glass-panel rounded-2xl p-5 flex-1">
            <h2 className="text-[14px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Trending Now</h2>
            {trends.map((t: any) => <TrendRow key={t.rank} trend={t} />)}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Competitors</h2>
            <Link href="/competitors" className="flex items-center gap-1 text-[12px] font-semibold hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              Manage <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid gap-3">
            {competitors.slice(0, 2).map((c: any) => <CompetitorCard key={c.handle} competitor={c} />)}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>AI Video Ideas</h2>
            <Link href="/ideas" className="flex items-center gap-1 text-[12px] font-semibold hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              See all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {ideas.slice(0, 2).map((idea: any) => <IdeaCard key={idea.id} idea={idea} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
