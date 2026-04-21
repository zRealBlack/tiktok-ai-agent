'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare, X, Send, Bot, User, Loader2, Key,
  Eye, EyeOff, ChevronDown, Settings, AlertCircle, Trash2, RefreshCw
} from "lucide-react";
import { useData } from "@/components/DataContext";

export interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const STORAGE_KEY = "tiktok-agent-api-key";

export function dispatchAgentPrompt(prompt: string) {
  window.dispatchEvent(new CustomEvent("agent-prompt", { detail: { prompt } }));
}

export default function AIChatBox() {
  const { account, videos, competitors, ideas, trends, generations, refreshData, isLoading: dataLoading } = useData();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "setup">("chat");
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  
  const [showKey, setShowKey] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const key = localStorage.getItem(STORAGE_KEY) || "";
    setSavedKey(key);
    
    // Load apify credentials if exist
    const handle = localStorage.getItem("tiktok-handle") || "";
    if (handle) setTiktokHandle(handle);

    if (!key) {
      setView("setup");
    } else {
      setMessages([{
        role: "assistant",
        content: `Agent online. I have full access to your account — ${account.username} (${account.followers} followers). What do you need?`,
      }]);
    }
  }, [account.username, account.followers]);

  useEffect(() => {
    const handler = (e: CustomEvent<{ prompt: string }>) => {
      if (!open) setOpen(true);
      setView("chat");
      setTimeout(() => sendMessage(e.detail.prompt), 150);
    };
    window.addEventListener("agent-prompt", handler as EventListener);
    return () => window.removeEventListener("agent-prompt", handler as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, savedKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSyncData = async () => {
    if (!tiktokHandle) return;
    localStorage.setItem("tiktok-handle", tiktokHandle);
    try {
      await refreshData(tiktokHandle);
      setMessages([{
        role: "assistant",
        content: `Data synced! I've loaded the latest info for ${tiktokHandle}. You can now ask me to fix these videos or generate ideas.`,
      }]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const saveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setError("Key must start with sk-ant-");
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmed);
    setSavedKey(trimmed);
    setView("chat");
    setError(null);
    setMessages([{
      role: "assistant",
      content: `Agent online. I have full access to your account — ${account.username} (${account.followers} followers). What do you need?`,
    }]);
  };

  const clearKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedKey(""); setApiKey(""); setMessages([]); setView("setup");
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || streaming || !savedKey) return;
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
          apiKey: savedKey,
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
        return updated;
      });
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setMessages((prev) => prev.filter((m) => !m.streaming));
    } finally {
      setStreaming(false);
    }
  }, [input, messages, savedKey, streaming, account, videos, competitors, ideas, trends, generations]);

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
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-110 glass-panel"
        aria-label="Open AI Agent"
      >
        {open
          ? <X size={18} style={{ color: 'var(--text-secondary)' }} />
          : <MessageSquare size={18} style={{ color: 'var(--text-secondary)' }} />}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[390px] glass-chat rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ maxHeight: "560px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--glass-border)' }}>
          <div className="w-8 h-8 rounded-full glass-elevated flex items-center justify-center">
            <Bot size={15} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>TikTok AI Agent</div>
            {savedKey
              ? <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block pulse-dot" />
                  Claude · sk-ant-...{savedKey.slice(-6)}
                </div>
              : <div className="text-[10px] text-amber-500">No API key — configure below</div>}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setView(view === "setup" ? "chat" : "setup")}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors glass-elevated hover:opacity-80"
              title="Settings">
              <Settings size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
            {messages.length > 1 && (
              <button
                onClick={() => setMessages([{ role: "assistant", content: "Chat cleared. What do you need?" }])}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors glass-elevated hover:opacity-80"
                title="Clear chat">
                <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center glass-elevated hover:opacity-80">
              <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Setup */}
        {view === "setup" && (
          <div className="flex-1 p-5 overflow-y-auto">
            {/* Claude API Setup */}
            <div className="flex items-center gap-2 mb-4">
              <Bot size={15} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>1. Anthropic API Key (Claude)</span>
            </div>
            <div className="relative mb-3">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setError(null); }}
                placeholder={savedKey ? "••••••••••••" : "sk-ant-api03-..."}
                className="glass-input w-full text-[13px] rounded-xl px-3 py-2.5 pr-10 outline-none transition-all"
                style={{ color: 'var(--text-primary)' }}
              />
              <button onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}>
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <button onClick={saveKey} disabled={!apiKey.trim()}
              className="btn-primary w-full py-2.5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-40 mb-6">
              Save Claude Key
            </button>

            {/* Apify Data Sync Setup */}
            <div className="flex items-center gap-2 mb-4 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
              <Key size={15} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>2. TikTok Data Sync (Apify)</span>
            </div>
            <div className="mb-3 space-y-3">
              <input
                type="text"
                value={tiktokHandle}
                onChange={(e) => setTiktokHandle(e.target.value)}
                placeholder="TikTok Username (e.g. mas.studio)"
                className="glass-input w-full text-[13px] rounded-xl px-3 py-2.5 outline-none transition-all"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-[12px] text-red-500 mb-3">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            
            <button onClick={handleSyncData} disabled={!tiktokHandle || dataLoading}
              className="btn-secondary w-full flex justify-center items-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-colors disabled:opacity-40 mb-2">
              {dataLoading ? <><Loader2 size={14} className="animate-spin" /> Scraping TikTok Data...</> : <><RefreshCw size={14} /> Fetch Live Data</>}
            </button>
            
            {savedKey && (
              <button onClick={clearKey}
                className="w-full py-2 mt-4 text-[12px] transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                Clear Context & Reset
              </button>
            )}
          </div>
        )}

        {/* Chat */}
        {view === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ maxHeight: "380px" }}>
              {!savedKey ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 py-8 text-center">
                  <Key size={28} style={{ color: 'var(--text-faint)' }} />
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>No API key configured.</p>
                  <button onClick={() => setView("setup")}
                    className="btn-secondary px-4 py-2 rounded-xl text-[12px] font-semibold">
                    Setup Agent →
                  </button>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full glass-elevated flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={11} style={{ color: 'var(--text-secondary)' }} />
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
                        {m.content}
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
                </>
              )}
            </div>

            {/* Suggested prompts */}
            {messages.length <= 1 && savedKey && (
              <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto pb-1">
                {[
                  "What's my biggest weakness?",
                  "Fix my worst video",
                  "What is @visualcraft.eg doing right?",
                ].map((p) => (
                  <button key={p} onClick={() => sendMessage(p)}
                    className="shrink-0 text-[11px] glass-elevated px-3 py-1 rounded-full transition-colors hover:opacity-80 whitespace-nowrap"
                    style={{ color: 'var(--text-secondary)' }}>
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
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
                    placeholder={savedKey ? "Ask the agent..." : "Configure API key first"}
                    disabled={!savedKey}
                    rows={1}
                    className="w-full bg-transparent text-[13px] placeholder-[var(--text-faint)] outline-none resize-none leading-relaxed"
                    style={{ color: 'var(--text-primary)', maxHeight: '96px',
                      fieldSizing: 'content' } as React.CSSProperties}
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
                    disabled={!input.trim() || !savedKey}
                    className="btn-primary w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30 hover:opacity-90"
                  >
                    <Send size={14} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
