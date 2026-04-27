'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Send, Loader2, Mic, Square, Search, Phone, Video, MoreVertical, Smile, Paperclip, Camera, Check } from "lucide-react";
import { useData } from "@/components/DataContext";
import MarkdownMessage from "@/components/MarkdownMessage";
import SarieAvatar from "@/public/sarie_generated.png";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  ts?: string;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string | null;
  isAI: boolean;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  role?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

// ─── Avatar ──────────────────────────────────────────────────────────────────

function AvatarCircle({
  name,
  src,
  size = 40,
  online,
}: {
  name: string;
  src?: string | null;
  size?: number;
  online?: boolean;
}) {
  const initial = (name || "?")[0].toUpperCase();
  const colors = ["#ef4444", "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b", "#ec4899"];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size, height: size, borderRadius: "50%",
          background: color, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: size * 0.36,
          fontWeight: 800, color: "#fff", overflow: "hidden",
        }}
      >
        {src ? (
          <Image src={src} alt={name} width={size} height={size} style={{ objectFit: "cover" }} />
        ) : initial}
      </div>
      {online && (
        <span style={{
          position: "absolute", bottom: 1, right: 1,
          width: 9, height: 9, borderRadius: "50%",
          background: "#22c55e", border: "1.5px solid var(--bg-base)",
        }} />
      )}
    </div>
  );
}

// ─── Static mock conversations ────────────────────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: "sarie",
    name: "Sarie",
    avatar: null, // will use imported image
    isAI: true,
    lastMessage: "الأيجنت شغال! إيه اللي تحتاجه؟",
    time: "Now",
    unread: 0,
    online: true,
    role: "AI Content Strategist",
  },
  {
    id: "team1",
    name: "Ahmed Hassan",
    avatar: null,
    isAI: false,
    lastMessage: "Checked the content calendar ✓",
    time: "10:35 AM",
    unread: 2,
    online: true,
    role: "Content Manager",
  },
  {
    id: "team2",
    name: "Sara Ali",
    avatar: null,
    isAI: false,
    lastMessage: "The new script looks great!",
    time: "9:12 AM",
    unread: 0,
    online: false,
    role: "Video Editor",
  },
  {
    id: "team3",
    name: "Kareem Adel",
    avatar: null,
    isAI: false,
    lastMessage: "Can you review the audit results?",
    time: "Yesterday",
    unread: 1,
    online: false,
    role: "Social Media Lead",
  },
];

const MOCK_TEAM_MESSAGES: Record<string, ChatMessage[]> = {
  team1: [
    { role: "assistant", content: "Hey! Checked the content calendar ✓", ts: "10:30 AM" },
    { role: "user", content: "Great, let me know if anything needs adjusting.", ts: "10:32 AM" },
    { role: "assistant", content: "Will do! The posting schedule for this week looks solid.", ts: "10:35 AM" },
  ],
  team2: [
    { role: "assistant", content: "The new script looks great!", ts: "9:10 AM" },
    { role: "user", content: "Thanks, let's film tomorrow at 3PM.", ts: "9:12 AM" },
  ],
  team3: [
    { role: "assistant", content: "Can you review the audit results?", ts: "Yesterday" },
  ],
};

// ─── Sarie AI hook ────────────────────────────────────────────────────────────

function useSarieChat() {
  const { account, videos, competitors, ideas, trends, generations } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("chat_history");
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length === 0 && account?.username) {
      setMessages([{
        role: "assistant",
        content: `الأيجنت شغال! عندي كل البيانات بتاعة ${account.username} (${(account.followers || 0).toLocaleString()} متابع). إيه اللي تحتاجه؟`,
        ts: now(),
      }]);
    }
  }, [account?.username]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = { role: "user", content: text, ts: now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setStreaming(true);
    setMessages(p => [...p, { role: "assistant", content: "", streaming: true, ts: now() }]);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          contextData: { account, videos, competitors, ideas, trends, generations },
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("AI error");
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages(p => {
          const u = [...p];
          u[u.length - 1] = { role: "assistant", content: acc, streaming: true };
          return u;
        });
      }
      setMessages(p => {
        const u = [...p];
        u[u.length - 1] = { role: "assistant", content: acc, ts: now() };
        try { sessionStorage.setItem("chat_history", JSON.stringify(u)); } catch {}
        return u;
      });
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setMessages(p => p.filter(m => !m.streaming));
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, account, videos, competitors, ideas, trends, generations]);

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages(p => {
      const u = [...p];
      if (u[u.length - 1]?.streaming) u[u.length - 1] = { ...u[u.length - 1], streaming: false };
      return u;
    });
  };

  return { messages, streaming, send, stop };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [activeId, setActiveId] = useState("sarie");
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const sarie = useSarieChat();

  const activeConvo = CONVERSATIONS.find(c => c.id === activeId)!;
  const isAI = activeConvo.isAI;

  // Derive messages for current convo
  const messages: ChatMessage[] = isAI
    ? sarie.messages
    : (MOCK_TEAM_MESSAGES[activeId] || []);
  const streaming = isAI ? sarie.streaming : false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (isAI) sarie.send(input);
    setInput("");
  };

  const glass: React.CSSProperties = {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
  };

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      padding: "20px 20px 20px 0", gap: 16,
    }}>

      {/* ── LEFT: Conversation List ──────────────────────────────────────── */}
      <div style={{
        width: 280, flexShrink: 0, display: "flex", flexDirection: "column",
        gap: 0, ...glass, borderRadius: 24, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 14 }}>
            Messages
          </div>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--glass-elevated)", borderRadius: 12,
            padding: "8px 12px", marginBottom: 16,
            border: "1px solid var(--glass-elevated-border)"
          }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              placeholder="Search conversations..."
              style={{
                background: "transparent", border: "none", outline: "none",
                fontSize: 12, color: "var(--text-primary)", flex: 1,
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px" }}>
          {CONVERSATIONS.map(c => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 16, border: "none",
                  background: active ? "var(--glass-elevated)" : "transparent",
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  marginBottom: 2,
                }}
              >
                {c.isAI ? (
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", position: "relative" }}>
                      <Image src={SarieAvatar} alt="Sarie" width={42} height={42} style={{ objectFit: "cover" }} />
                    </div>
                    <span style={{
                      position: "absolute", bottom: 1, right: 1,
                      width: 10, height: 10, borderRadius: "50%",
                      background: "#22c55e", border: "2px solid var(--bg-base)",
                    }} />
                  </div>
                ) : (
                  <AvatarCircle name={c.name} size={42} online={c.online} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{c.name}</span>
                    <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.lastMessage}
                  </div>
                </div>
                {c.unread > 0 && (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--btn-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {c.unread}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CENTER: Chat Window ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, ...glass, borderRadius: 24, overflow: "hidden" }}>
        {/* Chat Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", borderBottom: "1px solid var(--glass-border)",
          flexShrink: 0
        }}>
          {activeConvo.isAI ? (
            <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", position: "relative", flexShrink: 0 }}>
              <Image src={SarieAvatar} alt="Sarie" width={40} height={40} style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <AvatarCircle name={activeConvo.name} size={40} online={activeConvo.online} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>{activeConvo.name}</div>
            <div style={{ fontSize: 11, color: activeConvo.online ? "#22c55e" : "var(--text-muted)" }}>
              {activeConvo.online ? "● Online" : "● Offline"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--glass-elevated-border)", background: "var(--glass-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Phone size={14} color="var(--text-muted)" />
            </button>
            <button style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--glass-elevated-border)", background: "var(--glass-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Video size={14} color="var(--text-muted)" />
            </button>
            <button style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--glass-elevated-border)", background: "var(--glass-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <MoreVertical size={14} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14 }} dir={isAI ? "rtl" : "ltr"}>
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 10 }}>
                {!isUser && (
                  activeConvo.isAI ? (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <Image src={SarieAvatar} alt="Sarie" width={30} height={30} style={{ objectFit: "cover" }} />
                    </div>
                  ) : (
                    <AvatarCircle name={activeConvo.name} size={30} />
                  )
                )}
                <div style={{ maxWidth: "68%" }}>
                  <div style={{
                    padding: "10px 14px", borderRadius: 18,
                    borderBottomLeftRadius: !isUser ? 4 : 18,
                    borderBottomRightRadius: isUser ? 4 : 18,
                    fontSize: 13, lineHeight: 1.55,
                    background: isUser ? "var(--btn-primary-bg)" : "var(--glass-elevated)",
                    color: isUser ? "#fff" : "var(--text-primary)",
                    border: isUser ? "none" : "1px solid var(--glass-elevated-border)",
                  }}>
                    {m.role === "assistant" && isAI ? (
                      <MarkdownMessage content={m.content} />
                    ) : m.content}
                    {m.streaming && (
                      <span style={{ display: "inline-block", width: 6, height: 14, marginLeft: 4, background: "rgba(255,255,255,0.6)", borderRadius: 2, verticalAlign: "middle", animation: "pulse 1s ease-in-out infinite" }} />
                    )}
                  </div>
                  {m.ts && (
                    <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4, textAlign: isUser ? "right" : "left" }}>
                      {m.ts} {isUser && <Check size={10} style={{ display: "inline", marginLeft: 2 }} />}
                    </div>
                  )}
                </div>
                {isUser && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--btn-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    A
                  </div>
                )}
              </div>
            );
          })}
          {streaming && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden" }}>
                <Image src={SarieAvatar} alt="Sarie" width={30} height={30} style={{ objectFit: "cover" }} />
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 18, borderBottomLeftRadius: 4, background: "var(--glass-elevated)", border: "1px solid var(--glass-elevated-border)", display: "flex", alignItems: "center", gap: 5 }}>
                <Loader2 size={13} color="var(--text-muted)" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--glass-border)", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--glass-elevated)", border: "1px solid var(--glass-elevated-border)",
            borderRadius: 100, padding: "8px 8px 8px 16px"
          }}>
            <Mic size={16} color="var(--text-muted)" style={{ cursor: "pointer", flexShrink: 0 }} />
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isAI ? "اسأل ساري..." : "Write a message..."}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: 13, color: "var(--text-primary)",
                direction: isAI ? "rtl" : "ltr"
              }}
            />
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <Paperclip size={15} color="var(--text-muted)" style={{ cursor: "pointer" }} />
              <Camera size={15} color="var(--text-muted)" style={{ cursor: "pointer" }} />
              <Smile size={15} color="var(--text-muted)" style={{ cursor: "pointer" }} />
            </div>
            {streaming ? (
              <button
                onClick={sarie.stop}
                style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--btn-primary-bg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <Square size={13} color="#fff" fill="#fff" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{ width: 36, height: 36, borderRadius: "50%", background: input.trim() ? "var(--btn-primary-bg)" : "var(--glass-elevated)", border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s", opacity: input.trim() ? 1 : 0.5 }}
              >
                <Send size={14} color={input.trim() ? "#fff" : "var(--text-muted)"} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Contact Info ──────────────────────────────────────────── */}
      <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
        {/* Profile Card */}
        <div style={{ ...glass, borderRadius: 24, padding: "28px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {activeConvo.isAI ? (
            <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", marginBottom: 14, boxShadow: "0 0 0 3px var(--btn-primary-bg), 0 0 0 6px rgba(239,68,68,0.15)" }}>
              <Image src={SarieAvatar} alt="Sarie" width={80} height={80} style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              <AvatarCircle name={activeConvo.name} size={80} online={activeConvo.online} />
            </div>
          )}
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{activeConvo.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 18 }}>{activeConvo.role}</div>
          
          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <button style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--glass-elevated)", border: "1px solid var(--glass-elevated-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Phone size={18} color="var(--btn-primary-bg)" />
              </button>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Call</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <button style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--glass-elevated)", border: "1px solid var(--glass-elevated-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Video size={18} color="var(--btn-primary-bg)" />
              </button>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Video</span>
            </div>
          </div>
        </div>

        {/* Shared / Info */}
        <div style={{ ...glass, borderRadius: 24, padding: "20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14 }}>Info</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeConvo.isAI ? (
              <>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Model:</span> GPT-4o Streaming
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Lang:</span> Arabic + English
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Memory:</span> Session-scoped
                </div>
                <div style={{ marginTop: 8, padding: "10px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--btn-primary-bg)", marginBottom: 4 }}>Quick Prompts</div>
                  {["إيه أضعف نقطة عندي؟", "صلح أسوأ فيديو", "تحليل المنافسين"].map(p => (
                    <button
                      key={p}
                      onClick={() => { setActiveId("sarie"); setTimeout(() => sarie.send(p), 50); }}
                      style={{
                        display: "block", width: "100%", textAlign: "right",
                        padding: "5px 8px", borderRadius: 8, border: "none",
                        background: "transparent", cursor: "pointer",
                        fontSize: 11, color: "var(--text-secondary)",
                        marginBottom: 2, transition: "background 0.15s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--glass-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Role:</span> {activeConvo.role}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Status:</span>{" "}
                  <span style={{ color: activeConvo.online ? "#22c55e" : "var(--text-faint)" }}>
                    {activeConvo.online ? "Online" : "Offline"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
