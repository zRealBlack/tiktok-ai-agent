'use client';

import { useState, useEffect } from "react";
import IdeaCard from "@/components/IdeaCard";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useData } from "@/components/DataContext";

const SESSION_KEY = "tiktok_ideas_cache";

export default function IdeasPage() {
  const { account, videos, syncedAt } = useData();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from sessionStorage only
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) setIdeas(JSON.parse(cached));
    } catch {}
  }, []);

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
      if (!res.ok) throw new Error(data.error || "فشل التوليد");
      setIdeas(data.ideas);
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.ideas)); } catch {}
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Video Ideas</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          أفكار مُولَّدة بالذكاء الاصطناعي بناءً على محتوى {account?.username || '@rasayel_podcast'}.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>
          Baseline Briefs
          {ideas.length > 0 && (
            <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--text-faint)' }}>
              {ideas.length} أفكار — محفوظة لهذه الجلسة
            </span>
          )}
        </h2>
        <button
          onClick={generateIdeas}
          disabled={loading || !syncedAt || !videos.length}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-50"
        >
          {loading
            ? <><Loader2 size={13} className="animate-spin" /> جاري التوليد...</>
            : <><RefreshCw size={13} /> توليد 3 أفكار جديدة</>}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 glass-panel rounded-xl p-4 mb-5 text-[13px] text-red-500">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse">
              <div className="h-4 rounded-lg mb-3 w-1/3" style={{ background: 'var(--glass-elevated)' }} />
              <div className="h-5 rounded-lg mb-4 w-3/4" style={{ background: 'var(--glass-elevated)' }} />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => <div key={j} className="h-3 rounded-lg" style={{ background: 'var(--glass-elevated)' }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-5">
          <div className="w-16 h-16 rounded-2xl glass-elevated flex items-center justify-center">
            <RefreshCw size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>مفيش أفكار لسه</p>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              {!syncedAt ? "جاري تحميل بيانات الأكاونت..." : "اضغط على زرار \"توليد 3 أفكار جديدة\" فوق"}
            </p>
          </div>
          {syncedAt && (
            <button onClick={generateIdeas} disabled={loading}
              className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold">
              <RefreshCw size={14} /> ابدأ التوليد
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
          {ideas.map((idea: any) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
