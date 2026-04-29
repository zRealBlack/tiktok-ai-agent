'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Send, Loader2, Square, Search, Phone, Video, MoreVertical, Smile, Paperclip, Check, CheckCheck, X, FileText, Film, Copy, Trash2, Pencil, Forward, MoreHorizontal } from "lucide-react";
import { useData } from "@/components/DataContext";
import MarkdownMessage from "@/components/MarkdownMessage";
import SarieAvatar from "@/public/sarie_generated.png";

// ─── Types ──────────────────────────────────────────────────────────────────

const EMOJIS = ["😂","❤️","🔥","👏","😮","😢","🤔","💯","🚀","✅","👍","🎉","💪","😍","🙏","⚡","🎯","💡","🤣","😎"];

interface Attachment { name: string; url: string; type: "image" | "video" | "file"; }

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  ts?: string;
  attachment?: Attachment;
  reactions?: string[];
  isForwarded?: boolean;
  status?: "sent" | "delivered" | "seen";
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

const INITIAL_CONVERSATIONS: Conversation[] = [
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
    id: "dina",
    name: "Dina Amer",
    avatar: null,
    isAI: false,
    lastMessage: "Let's review the new strategy.",
    time: "10:35 AM",
    unread: 2,
    online: true,
    role: "CEO / Creator",
  },
  {
    id: "yassin",
    name: "Yassin Gaml",
    avatar: null,
    isAI: false,
    lastMessage: "API keys are updated.",
    time: "9:12 AM",
    unread: 0,
    online: true,
    role: "Developer / AI Specialist",
  },
  {
    id: "hesham",
    name: "Hesham Ahmed",
    avatar: null,
    isAI: false,
    lastMessage: "The new video edit is ready for review.",
    time: "Yesterday",
    unread: 1,
    online: false,
    role: "Editor",
  },
  {
    id: "shahd",
    name: "Shahd Sayed",
    avatar: null,
    isAI: false,
    lastMessage: "I handled the spam comments on the last post.",
    time: "Yesterday",
    unread: 0,
    online: true,
    role: "Moderation",
  },
];

const INITIAL_TEAM_MESSAGES: Record<string, ChatMessage[]> = {
  dina: [], yassin: [], hesham: [], shahd: []
};

// ─── Sarie AI hook ────────────────────────────────────────────────────────────

function useSarieChat() {
  const { account, videos, competitors, ideas, trends, generations, currentUser } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chat_history");
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
          contextData: { account, videos, competitors, ideas, trends, generations, currentUser },
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
        try { localStorage.setItem("chat_history", JSON.stringify(u)); } catch {}
        return u;
      });
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setMessages(p => {
        const u = p.filter(m => !m.streaming);
        return [...u, { role: "assistant", content: "⚠️ Sorry, the AI model is experiencing extremely high demand right now. Please try again in a few seconds.", ts: now() }];
      });
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, account, videos, competitors, ideas, trends, generations, currentUser]);

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages(p => {
      const u = [...p];
      if (u[u.length - 1]?.streaming) u[u.length - 1] = { ...u[u.length - 1], streaming: false };
      return u;
    });
  };

  return { messages, setMessages, streaming, send, stop };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState("sarie");
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const [teamMessages, setTeamMessages] = useState<Record<string, ChatMessage[]>>({});
  const [hoverMsg, setHoverMsg] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("team_chat_history");
      if (saved) {
        setTeamMessages(JSON.parse(saved));
      } else {
        setTeamMessages(INITIAL_TEAM_MESSAGES);
      }
    } catch {
      setTeamMessages(INITIAL_TEAM_MESSAGES);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(teamMessages).length > 0) {
      localStorage.setItem("team_chat_history", JSON.stringify(teamMessages));
    }
  }, [teamMessages]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sarie = useSarieChat();
  const { currentUser } = useData();
  const searchParams = useSearchParams();
  const promptHandled = useRef(false);
  const sarieSendRef = useRef(sarie.send);
  sarieSendRef.current = sarie.send;

  // Auto-send prompt from URL (e.g. from "Fix with AI" button on audit page)
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt && !promptHandled.current && sarie.messages.length > 0) {
      promptHandled.current = true;
      setActiveId("sarie");
      // Small delay to ensure Sarie chat is ready
      setTimeout(() => sarieSendRef.current(prompt), 300);
      // Clean the URL without triggering a re-render
      window.history.replaceState({}, "", "/chat");
    }
  }, [searchParams, sarie.messages.length]);

  const activeConvo = conversations.find(c => c.id === activeId)!;
  const isAI = activeConvo.isAI;

  const messages: ChatMessage[] = isAI
    ? sarie.messages
    : (teamMessages[activeId] || []);
  const streaming = isAI ? sarie.streaming : false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Close menu on click outside
  useEffect(() => {
    if (activeMenu === null) return;
    const clickHandler = () => setActiveMenu(null);
    window.addEventListener("click", clickHandler);
    return () => window.removeEventListener("click", clickHandler);
  }, [activeMenu]);

  const handleDelete = (index: number) => {
    if (isAI) {
      sarie.setMessages(prev => {
        const u = prev.filter((_, i) => i !== index);
        try { localStorage.setItem("chat_history", JSON.stringify(u)); } catch {}
        return u;
      });
    } else {
      setTeamMessages(prev => {
        const u = [...(prev[activeId] || [])];
        u.splice(index, 1);
        return { ...prev, [activeId]: u };
      });
    }
    setActiveMenu(null);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setActiveMenu(null);
  };

  const handleEdit = (index: number, content: string) => {
    setInput(content);
    handleDelete(index); // simple edit flow: puts content in input and deletes old message
    setActiveMenu(null);
  };

  const handleForward = (content: string) => {
    setForwardingMsg(content);
    setActiveMenu(null);
  };

  const confirmForward = (targetId: string) => {
    if (!forwardingMsg) return;
    
    // Add the forwarded message to the target user's chat history
    setTeamMessages(prev => {
      const u = [...(prev[targetId] || [])];
      u.push({ role: "user", content: forwardingMsg, ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isForwarded: true, status: "sent" });
      return { ...prev, [targetId]: u };
    });
    
    setTimeout(() => {
      setTeamMessages(prev => {
        const arr = [...(prev[targetId] || [])];
        if (arr.length > 0) arr[arr.length - 1] = { ...arr[arr.length - 1], status: "delivered" };
        return { ...prev, [targetId]: arr };
      });
      setTimeout(() => {
        setTeamMessages(prev => {
          const arr = [...(prev[targetId] || [])];
          if (arr.length > 0) arr[arr.length - 1] = { ...arr[arr.length - 1], status: "seen" };
          return { ...prev, [targetId]: arr };
        });
      }, 1200);
    }, 600);
    
    // Reorder conversations to move the target chat to the top (under Sarie)
    setConversations(prev => {
      const idx = prev.findIndex(c => c.id === targetId);
      if (idx <= 1) return prev; // Already at the top or is Sarie
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(1, 0, item);
      return next;
    });

    setForwardingMsg(null);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text && !pendingAttachment) return;
    if (isAI) {
      sarie.send(text || (pendingAttachment ? `[Sent: ${pendingAttachment.name}]` : ""));
    } else {
      const msg: ChatMessage = { role: "user", content: text || "", ts: now(), status: "sent", ...(pendingAttachment ? { attachment: pendingAttachment } : {}) };
      setTeamMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), msg] }));
      
      const targetId = activeId;
      setTimeout(() => {
        setTeamMessages(prev => {
          const arr = [...(prev[targetId] || [])];
          if (arr.length > 0) arr[arr.length - 1] = { ...arr[arr.length - 1], status: "delivered" };
          return { ...prev, [targetId]: arr };
        });
        setTimeout(() => {
          setTeamMessages(prev => {
            const arr = [...(prev[targetId] || [])];
            if (arr.length > 0) arr[arr.length - 1] = { ...arr[arr.length - 1], status: "seen" };
            return { ...prev, [targetId]: arr };
          });
        }, 1200);
      }, 600);
      
      // Reorder conversations to move activeId to the top (under Sarie)
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === activeId);
        if (idx <= 1) return prev;
        const next = [...prev];
        const [item] = next.splice(idx, 1);
        next.splice(1, 0, item);
        return next;
      });
    }
    setInput("");
    setPendingAttachment(null);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type: Attachment["type"] = file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "file";
    setPendingAttachment({ name: file.name, url, type });
    e.target.value = "";
  };



  const addReaction = (msgIdx: number, emoji: string) => {
    if (isAI) return;
    setTeamMessages(prev => {
      const msgs = [...(prev[activeId] || [])];
      const m = { ...msgs[msgIdx] };
      const existing = m.reactions || [];
      m.reactions = existing.includes(emoji) ? existing.filter(r => r !== emoji) : [...existing, emoji];
      msgs[msgIdx] = m;
      return { ...prev, [activeId]: msgs };
    });
  };

  const glass: React.CSSProperties = {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
  };

  return (
    <>
    <div style={{
      display: "flex",
      height: "calc(100vh - 56px)", // exactly the viewport minus the TopBar
      overflow: "hidden",
      paddingBottom: 12,
      paddingRight: 20,
      paddingLeft: 0,
      gap: 16,
      boxSizing: "border-box",
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
          {conversations.map(c => {
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
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentUser?.name && c.name.includes(currentUser.name.split(" ")[0]) ? `${c.name} (You)` : c.name}
                  </span>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.lastMessage}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--text-faint)", whiteSpace: "nowrap" }}>{c.time}</span>
                  {c.unread > 0 ? (
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--btn-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                      {c.unread}
                    </div>
                  ) : <div style={{ height: 18 }} />}
                </div>
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
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 10 }}
                onMouseEnter={() => setHoverMsg(i)}
                onMouseLeave={() => setHoverMsg(null)}
              >
                {!isUser && (
                  activeConvo.isAI ? (
                    <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                      <Image src={SarieAvatar} alt="Sarie" width={30} height={30} style={{ objectFit: "cover" }} />
                    </div>
                  ) : <AvatarCircle name={activeConvo.name} size={30} />
                )}
                <div style={{ maxWidth: "68%", position: "relative", display: "flex", alignItems: "flex-end", gap: 8, flexDirection: isUser ? "row-reverse" : "row" }}>
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", width: "100%" }}>

                    <div dir="auto" style={{
                      padding: m.attachment && m.attachment.type === "image" ? "6px" : "10px 14px",
                      borderRadius: 18,
                      borderBottomLeftRadius: !isUser ? 4 : 18,
                      borderBottomRightRadius: isUser ? 4 : 18,
                      fontSize: 13, lineHeight: 1.55,
                      background: isUser ? "var(--btn-primary-bg)" : "var(--glass-elevated)",
                      color: isUser ? "#fff" : "var(--text-primary)",
                      border: isUser ? "none" : "1px solid var(--glass-elevated-border)",
                      overflow: "hidden",
                    }}>
                      {/* Attachment */}
                      {m.attachment && m.attachment.type === "image" && (
                        <img src={m.attachment.url} alt={m.attachment.name}
                          style={{ width: "100%", maxWidth: 240, borderRadius: 12, display: "block", marginBottom: m.content ? 8 : 0 }} />
                      )}
                      {m.attachment && m.attachment.type === "video" && (
                        <video src={m.attachment.url} controls
                          style={{ width: "100%", maxWidth: 240, borderRadius: 12, display: "block", marginBottom: m.content ? 8 : 0 }} />
                      )}
                      {m.attachment && m.attachment.type === "file" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: m.content ? 8 : 0 }}>
                          <FileText size={18} color={isUser ? "#fff" : "var(--text-muted)"} />
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{m.attachment.name}</span>
                        </div>
                      )}
                      {m.isForwarded && (
                        <div style={{ fontSize: 10, color: isUser ? "rgba(255,255,255,0.7)" : "var(--text-muted)", marginBottom: 4, fontStyle: "italic", display: "flex", alignItems: "center", gap: 4 }}>
                          <Forward size={10} /> Forwarded
                        </div>
                      )}
                      {m.content && <MarkdownMessage content={m.content} />}
                      {m.streaming && (
                        <span style={{ display: "inline-block", width: 6, height: 14, marginLeft: 4, background: "rgba(255,255,255,0.6)", borderRadius: 2, verticalAlign: "middle" }} />
                      )}
                      
                      {/* Nested Timestamp & Status inside bubble */}
                      {m.ts && (
                        <div style={{
                          fontSize: 10, 
                          color: isUser ? "rgba(255,255,255,0.7)" : "var(--text-faint)", 
                          display: "flex", alignItems: "center", justifyContent: "flex-end", 
                          gap: 4, marginTop: 2, float: "right", clear: "both", marginLeft: 16
                        }}>
                          {m.ts}
                          {isUser && (
                            (!m.status || m.status === "seen") ? (
                              <CheckCheck size={14} color="#60a5fa" style={{ strokeWidth: 2.5 }} />
                            ) : m.status === "delivered" ? (
                              <CheckCheck size={14} color="rgba(255,255,255,0.7)" />
                            ) : (
                              <Check size={14} color="rgba(255,255,255,0.7)" />
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Actions (Always visible, simple icons) */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4,
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      marginTop: 4, zIndex: 5
                    }}>
                      <button onClick={() => handleForward(m.content)} title="Forward" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 4 }} onMouseEnter={e => e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color="var(--text-faint)"}><Forward size={14} /></button>
                      <button onClick={() => handleCopy(m.content)} title="Copy" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 4 }} onMouseEnter={e => e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color="var(--text-faint)"}><Copy size={14} /></button>
                      <div style={{ position: "relative" }}>
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === i ? null : i); }} title="More" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 4 }} onMouseEnter={e => e.currentTarget.style.color="var(--text-primary)"} onMouseLeave={e => e.currentTarget.style.color="var(--text-faint)"}><MoreHorizontal size={14} /></button>
                        {activeMenu === i && (
                          <div style={{ position: "absolute", top: "100%", [isUser ? "right" : "left"]: 0, marginTop: 4, background: "var(--glass-panel-bg)", border: "1px solid var(--glass-border)", borderRadius: 12, padding: 4, boxShadow: "var(--glass-shadow)", zIndex: 20, minWidth: 120 }}>
                            {isUser && <button onClick={() => handleEdit(i, m.content)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "var(--text-primary)", fontSize: 13, padding: "8px 12px", cursor: "pointer", borderRadius: 8, textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background="none"}><Pencil size={14}/> Edit</button>}
                            <button onClick={() => handleDelete(i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#ef4444", fontSize: 13, padding: "8px 12px", cursor: "pointer", borderRadius: 8, textAlign: "left" }} onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.1)"} onMouseLeave={e => e.currentTarget.style.background="none"}><Trash2 size={14}/> Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reactions display */}
                  {m.reactions && m.reactions.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {m.reactions.map((r, ri) => (
                        <span key={ri} onClick={() => addReaction(i, r)}
                          style={{ fontSize: 14, cursor: "pointer", background: "var(--glass-elevated)", borderRadius: 100, padding: "2px 6px", border: "1px solid var(--glass-elevated-border)" }}
                        >{r}</span>
                      ))}
                    </div>
                  )}

                </div>
                {isUser && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--btn-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{currentUser ? currentUser.name[0].toUpperCase() : "U"}</div>
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
          {/* Pending attachment preview */}
          {pendingAttachment && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 12px", background: "var(--glass-elevated)", borderRadius: 14, border: "1px solid var(--glass-elevated-border)" }}>
              {pendingAttachment.type === "image" && <img src={pendingAttachment.url} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />}
              {pendingAttachment.type === "video" && <Film size={20} color="var(--text-muted)" />}
              {pendingAttachment.type === "file" && <FileText size={20} color="var(--text-muted)" />}
              <span style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingAttachment.name}</span>
              <button onClick={() => setPendingAttachment(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={14} /></button>
            </div>
          )}

          {/* Emoji picker */}
          {showEmoji && (
            <div style={{ marginBottom: 10, padding: "12px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 18, backdropFilter: "blur(16px)", display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { setInput(v => v + e); setShowEmoji(false); }}
                  style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: 8, transition: "background 0.1s" }}
                  onMouseEnter={el => el.currentTarget.style.background = "var(--glass-elevated)"}
                  onMouseLeave={el => el.currentTarget.style.background = "none"}
                >{e}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--glass-elevated)", border: "1px solid var(--glass-elevated-border)", borderRadius: 100, padding: "8px 12px" }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isAI ? "اسأل ساري..." : "Write a message..."}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--text-primary)", direction: isAI ? "rtl" : "ltr" }}
            />
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <button onClick={() => fileInputRef.current?.click()} title="Attach file"
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 2 }}>
                <Paperclip size={15} color="var(--text-muted)" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt" style={{ display: "none" }} onChange={e => handleFile(e)} />
              <button onClick={() => setShowEmoji(v => !v)} title="Emoji"
                style={{ background: showEmoji ? "var(--glass-elevated)" : "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 2, borderRadius: 6 }}>
                <Smile size={15} color={showEmoji ? "var(--btn-primary-bg)" : "var(--text-muted)"} />
              </button>
            </div>
            {streaming ? (
              <button onClick={sarie.stop} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--btn-primary-bg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Square size={13} color="#fff" fill="#fff" />
              </button>
            ) : (
              <button onClick={handleSend} disabled={!input.trim() && !pendingAttachment}
                style={{ width: 36, height: 36, borderRadius: "50%", background: (input.trim() || pendingAttachment) ? "var(--btn-primary-bg)" : "var(--glass-elevated)", border: "none", cursor: (input.trim() || pendingAttachment) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s", opacity: (input.trim() || pendingAttachment) ? 1 : 0.5 }}>
                <Send size={14} color={(input.trim() || pendingAttachment) ? "#fff" : "var(--text-muted)"} />
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

    {/* Forward GUI Modal */}
    {forwardingMsg && (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
      }}>
        <div style={{
          background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
          borderRadius: 24, padding: 24, width: "100%", maxWidth: 360,
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "var(--text-primary)" }}>Forward to...</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
            {conversations.filter(c => c.id !== activeId && !c.isAI).map(c => (
              <button key={c.id} onClick={() => confirmForward(c.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px",
                background: "var(--glass-elevated)", border: "1px solid var(--glass-elevated-border)",
                borderRadius: 16, cursor: "pointer", textAlign: "left", color: "var(--text-primary)"
              }} onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background="var(--glass-elevated)"}>
                <AvatarCircle name={c.name} size={36} online={c.online} />
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                <Forward size={16} color="var(--text-muted)" />
              </button>
            ))}
          </div>
          <button onClick={() => setForwardingMsg(null)} style={{
            width: "100%", marginTop: 16, padding: "12px", background: "none",
            border: "1px solid var(--glass-border)", borderRadius: 12, color: "var(--text-muted)",
            cursor: "pointer", fontWeight: 600
          }}>Cancel</button>
        </div>
      </div>
    )}

    </>
  );
}
