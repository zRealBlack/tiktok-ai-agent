'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare, X, Send, Bot, User, Loader2,
  ChevronDown, Trash2, AlertCircle, Maximize2, Minimize2
} from "lucide-react";
import { useData } from "@/components/DataContext";
import MarkdownMessage from "@/components/MarkdownMessage";

export interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export function dispatchAgentPrompt(prompt: string) {
  window.dispatchEvent(new CustomEvent("agent-prompt", { detail: { prompt } }));
}

export default function AIChatBox() {
  const { account, videos, competitors, ideas, trends, generations } = useData();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 60;
    setIsUserScrolled(isScrolledUp);
  }, []);

  // Load chat from sessionStorage on mount (same tab/session only)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("chat_history");
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to sessionStorage whenever messages change
  const saveHistory = useCallback((msgs: Message[]) => {
    try {
      const toSave = msgs.filter((m) => !m.streaming);
      sessionStorage.setItem("chat_history", JSON.stringify(toSave));
    } catch {}
  }, []);

  // Set greeting when account loads and no history found yet
  useEffect(() => {
    if (messages.length === 0 && account?.username) {
      setMessages([{
        role: "assistant",
        content: `الأيجنت شغال! عندي كل البيانات بتاعة ${account.username} (${(account.followers || 0).toLocaleString()} متابع). إيه اللي تحتاجه؟`,
      }]);
    }
  }, [account?.username]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ prompt: string }>) => {
      if (!open) setOpen(true);
      setTimeout(() => sendMessage(e.detail.prompt), 150);
    };
    window.addEventListener("agent-prompt", handler as EventListener);
    return () => window.removeEventListener("agent-prompt", handler as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!isUserScrolled) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserScrolled, streaming]);

  const sendMessage = useCallback(async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || streaming) return;
    if (!text) setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: msgText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          contextData: { account, videos, competitors, ideas, trends, generations }
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated, streaming: true };
          return updated;
        });
      }
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: accumulated };
        saveHistory(updated);
        return updated;
      });
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setMessages((prev) => prev.filter((m) => !m.streaming));
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming, account, videos, competitors, ideas, trends, generations, saveHistory]);

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages((prev) => {
      const u = [...prev];
      if (u[u.length - 1]?.streaming) u[u.length - 1] = { ...u[u.length - 1], streaming: false };
      return u;
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 glass-panel"
        aria-label="Open AI Agent"
      >
        {open
          ? <X size={18} style={{ color: 'var(--text-secondary)' }} />
          : <MessageSquare size={18} style={{ color: 'var(--text-secondary)' }} />}
      </button>

      <div
        className={`fixed z-50 glass-chat rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        } ${
          expanded
            ? "bottom-4 right-4 left-4 md:left-auto md:right-6 md:w-[760px]"
            : "bottom-24 right-6 w-[390px]"
        }`}
        style={expanded
          ? { height: "calc(100vh - 32px)", maxHeight: "calc(100vh - 32px)" }
          : { maxHeight: "560px" }
        }
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--glass-border)' }}>
          <div className="w-8 h-8 rounded-full glass-elevated flex items-center justify-center overflow-hidden shrink-0">
            <img src="/sarie_cropped.png" alt="Sarie" className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Mas Sarie</div>
            <div className="text-[10px] text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block pulse-dot" />
              Mas AI Studio
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 1 && (
              <button
                onClick={() => {
                  const greeting = [{ role: "assistant" as const, content: `الأيجنت شغال! عندي كل البيانات بتاعة ${account?.username} (${(account?.followers || 0).toLocaleString()} متابع). إيه اللي تحتاجه؟` }];
                  setMessages(greeting);
                  saveHistory(greeting);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors glass-elevated hover:opacity-80"
                title="مسح المحادثة">
                <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center glass-elevated hover:opacity-80"
              title={expanded ? "تصغير" : "تكبير"}>
              {expanded
                ? <Minimize2 size={13} style={{ color: 'var(--text-muted)' }} />
                : <Maximize2 size={13} style={{ color: 'var(--text-muted)' }} />}
            </button>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center glass-elevated hover:opacity-80">
              <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" dir="rtl" ref={scrollRef} onScroll={handleScroll}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-6 h-6 rounded-full glass-elevated flex shrink-0 mt-0.5 overflow-hidden items-center justify-center">
                  <img src="/sarie_cropped.png" alt="Sarie" className="w-full h-full object-cover object-top" />
                </div>
              )}
              <div
                className={`max-w-[82%] px-3 py-2.5 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user" ? "rounded-br-none" : "rounded-bl-none"
                }`}
                style={m.role === "user"
                  ? { background: 'var(--glass-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-elevated-border)' }
                  : { background: 'var(--glass-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--glass-elevated-border)' }}
              >
                {m.role === "assistant" ? (
                  <MarkdownMessage content={m.content} />
                ) : (
                  m.content
                )}
                {m.streaming && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 animate-pulse rounded-sm align-middle"
                    style={{ background: 'var(--text-muted)' }} />
                )}
              </div>
              {m.role === "user" && (
                <div className="w-6 h-6 rounded-full glass-elevated flex items-center justify-center shrink-0 mt-0.5">
                  <User size={11} style={{ color: 'var(--text-secondary)' }} />
                </div>
              )}
            </div>
          ))}
          {streaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full glass-elevated flex items-center justify-center shrink-0">
                <Loader2 size={11} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="glass-elevated px-3 py-2.5 rounded-xl text-[12px]"
                style={{ color: 'var(--text-muted)' }}>Thinking...</div>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl glass-elevated">
              <AlertCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-[12px] text-red-500">{error}</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto pb-1" dir="rtl">
            {[
              "إيه أضعف نقطة عندي؟",
              "صلح أسوأ فيديو عندي",
              "إيه اللي بيعمله المنافسين صح؟",
            ].map((p) => (
              <button key={p} onClick={() => sendMessage(p)}
                className="shrink-0 text-[11px] glass-elevated px-3 py-1 rounded-full transition-colors hover:opacity-80 whitespace-nowrap"
                style={{ color: 'var(--text-secondary)' }}>
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="px-3 py-3 border-t shrink-0" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="flex items-end gap-2">
            <div
              className="flex-1 glass-input rounded-xl px-3 py-2.5 transition-all"
              style={{ minHeight: '40px' }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder="اسأل الأيجنت..."
                rows={1}
                className="w-full bg-transparent text-[13px] placeholder-[var(--text-faint)] outline-none resize-none leading-relaxed"
                style={{ color: 'var(--text-primary)', maxHeight: '96px', fieldSizing: 'content', direction: 'rtl' } as React.CSSProperties}
              />
            </div>
            {streaming ? (
              <button onClick={stop}
                className="w-9 h-9 rounded-xl glass-elevated flex items-center justify-center shrink-0 hover:opacity-80 transition-all">
                <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--text-secondary)' }} />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="btn-primary w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30 hover:opacity-90"
              >
                <Send size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
