'use client';

import { useState, useEffect } from "react";
import IdeaCard from "@/components/IdeaCard";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useData } from "@/components/DataContext";

export default function IdeasPage() {
  const { account, videos, syncedAt } = useData();
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: load cached ideas from KV
  useEffect(() => {
    async function loadCachedIdeas() {
      try {
        const res = await fetch("/api/ideas");
        const data = await res.json();
        if (data.ideas && data.ideas.length > 0) {
          setGeneratedIdeas(data.ideas);
          setInitialLoading(false);
        } else {
          // No cache yet — will wait for real data then generate
          setInitialLoading(false);
        }
      } catch {
        setInitialLoading(false);
      }
    }
    loadCachedIdeas();
  }, []);

  // Only auto-generate if cache was empty AND we now have real data
  useEffect(() => {
    if (!initialLoading && syncedAt && videos.length > 0 && generatedIdeas.length === 0) {
      generateIdeas();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoading, syncedAt]);

  const generateIdeas = async () => {
    if (!videos.length || !account) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos, account }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setGeneratedIdeas(data.ideas);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const showSkeleton = (loading && generatedIdeas.length === 0) || initialLoading;

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Video Ideas</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          أفكار فيديو مُولَّدة بالذكاء الاصطناعي بناءً على محتوى أكاونتك الفعلي — محفوظة حتى تضغط تجديد.
        </p>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>
          3 Baseline Briefs
          <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--text-faint)' }}>
            مبنية على أحدث فيديوهات {account?.username || '@rasayel_podcast'}
          </span>
        </h2>
        <button
          onClick={generateIdeas}
          disabled={loading || !syncedAt}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-50"
          title={!syncedAt ? "Waiting for live data..." : undefined}
        >
          {loading
            ? <><Loader2 size={13} className="animate-spin" /> جاري التوليد...</>
            : <><RefreshCw size={13} /> توليد 3 أفكار جديدة</>}
        </button>
      </div>

      {error && (
        <div className="glass-panel rounded-xl p-4 mb-5 text-[13px] text-red-500">{error}</div>
      )}

      {showSkeleton ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse">
              <div className="h-4 rounded-lg mb-3 w-1/3" style={{ background: 'var(--glass-elevated)' }} />
              <div className="h-5 rounded-lg mb-4 w-3/4" style={{ background: 'var(--glass-elevated)' }} />
              <div className="space-y-2 mb-4">
                {[1, 2, 3].map((j) => <div key={j} className="h-3 rounded-lg" style={{ background: 'var(--glass-elevated)' }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {generatedIdeas.map((idea: any) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
