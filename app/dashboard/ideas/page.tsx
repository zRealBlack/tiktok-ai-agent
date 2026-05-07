'use client';

import { useState, useEffect } from "react";
import IdeaCard from "@/components/IdeaCard";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useData } from "@/components/DataContext";

const SESSION_KEY = "tiktok_ideas_cache";

const card: React.CSSProperties = {
  background: 'var(--glass-bg)',
  borderRadius: 24,
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--glass-shadow)',
};

export default function IdeasPage() {
  const { account, videos, syncedAt } = useData();
  const [ideas, setIdeas]   = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached) setIdeas(JSON.parse(cached));
    } catch {}
  }, []);

  const generateIdeas = async () => {
    if (!videos.length || !account) return;
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videos, account }) });
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
    <div style={{ padding: '32px 28px', maxWidth: 1400, margin: '0 auto' }}>

      {/* ── PAGE TITLE ─────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 6 }}>
          أفكار مُولَّدة بالذكاء الاصطناعي · {account?.username || '@rasayel_podcast'}
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 style={{ fontSize: 46, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.045em', lineHeight: 1 }}>
            Video Ideas
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {ideas.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{ideas.length} أفكار — محفوظة</span>
            )}
            <button
              onClick={generateIdeas}
              disabled={loading || !syncedAt || !videos.length}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 100, background: 'var(--glass-elevated)', border: '1px solid var(--glass-elevated-border)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (loading||!syncedAt||!videos.length) ? 0.5 : 1 }}
            >
              {loading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> جاري التوليد...</> : <><RefreshCw size={13} /> توليد 3 أفكار جديدة</>}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ ...card, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#ef4444' }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-[18px]">
          {[1,2,3].map(i => (
            <div key={i} style={{ ...card, padding: '22px', height: 300 }}>
              {[80,120,60,100,40].map((w,j) => (
                <div key={j} style={{ height: 12, borderRadius: 6, background: 'var(--glass-elevated)', width: `${w}%`, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--glass-elevated)', border: '1px solid var(--glass-elevated-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={24} color="var(--text-muted)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>مفيش أفكار لسه</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {!syncedAt ? "جاري تحميل بيانات الأكاونت..." : "اضغط توليد 3 أفكار جديدة فوق"}
            </p>
          </div>
          {syncedAt && (
            <button onClick={generateIdeas} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 100, background: 'var(--btn-primary-bg)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
              <RefreshCw size={14} /> ابدأ التوليد
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-[18px]">
          {ideas.map((idea: any) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
