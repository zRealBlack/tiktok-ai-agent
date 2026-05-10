'use client';
import Link from 'next/link';

import { useState, useRef, useEffect, useCallback, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Send, Plus, Loader2, Square, Search, Phone, Video, MoreVertical, Smile, Paperclip, Check, CheckCheck, X, FileText, Film, Copy, Trash2, Pencil, Forward, MoreHorizontal, ArrowLeft, Compass, LayoutGrid, History, MessageCircle, Settings, LogOut, Menu, Users } from "lucide-react";
import { useData } from "@/components/DataContext";
import MarkdownMessage from "@/components/MarkdownMessage";
import SarieAvatar from "@/public/sarie_generated.png";

// ─── Types ──────────────────────────────────────────────────────────────────

const EMOJIS = ["😂","❤️","🔥","👏","😮","😢","🤔","💯","🚀","✅","👍","🎉","💪","😍","🙏","⚡","🎯","💡","🤣","😎"];

interface Attachment { name: string; url: string; type: "image" | "video" | "file"; mimeType?: string; }

interface ActionCard { ok: boolean; summary: string; detail?: string; type: string; images?: string[]; specs?: string; colors?: string; cleanName?: string; }

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  ts?: string;
  attachment?: Attachment;
  reactions?: string[];
  isForwarded?: boolean;
  status?: "sent" | "delivered" | "seen";
  actionCard?: ActionCard;
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
    lastMessage: "",
    time: "",
    unread: 0,
    online: false,
    role: "CEO & Podcaster",
  },
  {
    id: "yassin",
    name: "Yassin Gaml",
    avatar: null,
    isAI: false,
    lastMessage: "",
    time: "",
    unread: 0,
    online: false,
    role: "Developer / AI Specialist",
  },
  {
    id: "haitham",
    name: "Haitham Abdel-aziz",
    avatar: null,
    isAI: false,
    lastMessage: "",
    time: "",
    unread: 0,
    online: false,
    role: "Director & Head of Production",
  },
  {
    id: "shahd",
    name: "Shahd Sayed",
    avatar: null,
    isAI: false,
    lastMessage: "",
    time: "",
    unread: 0,
    online: false,
    role: "Ugc Creator",
  },
  {
    id: "sara",
    name: "Sara Hatem",
    avatar: null,
    isAI: false,
    lastMessage: "",
    time: "",
    unread: 0,
    online: false,
    role: "Marketing & Operation Management",
  },
  {
    id: "shahdm",
    name: "Shahd Mahmoud",
    avatar: null,
    isAI: false,
    lastMessage: "",
    time: "",
    unread: 0,
    online: false,
    role: "Community Manager",
  },
  {
    id: "yousef",
    name: "Yousef Hatem",
    avatar: null,
    isAI: false,
    lastMessage: "",
    time: "",
    unread: 0,
    online: false,
    role: "Ai Artist",
  },
  {
    id: "ahmed",
    name: "Ahmed Gaml",
    avatar: null,
    isAI: false,
    lastMessage: "",
    time: "",
    unread: 0,
    online: false,
    role: "CEO",
  },
];

const INITIAL_TEAM_MESSAGES: Record<string, ChatMessage[]> = {
  dina: [], yassin: [], hesham: [], shahd: [], sara: [], haitham: [], shahdm: [], yousef: [], ahmed: []
};

// ─── Session types ────────────────────────────────────────────────────────────

interface SessionMeta {
  id: string;
  title: string;
  lastMessage: string;
  ts: string;
  messageCount: number;
}

// ─── Sarie AI hook ────────────────────────────────────────────────────────────

function makeSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}


function useSarieChat() {
  const { account, videos, competitors, ideas, trends, generations, currentUser } = useData();
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [streaming, setStreaming]         = useState(false);
  const [sessions, setSessions]           = useState<SessionMeta[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [sessionKey, setSessionKey]       = useState(0);
  const abortRef        = useRef<AbortController | null>(null);
  const sessionIdRef    = useRef<string>("");

  // Keep ref in sync so callbacks always see the latest session id
  useEffect(() => { sessionIdRef.current = currentSessionId; }, [currentSessionId]);

  // On mount: load session index only — always start a fresh chat
  useEffect(() => {
    if (!currentUser?.id) { setHistoryLoaded(true); return; }
    fetch(`/api/chat-history?userId=${currentUser.id}`)
      .then(r => r.json())
      .then(data => {
        const list: SessionMeta[] = Array.isArray(data.sessions) ? data.sessions : [];
        setSessions(list);
        const sid = makeSessionId();
        setCurrentSessionId(sid);
        sessionIdRef.current = sid;
      })
      .catch(() => {
        const sid = makeSessionId();
        setCurrentSessionId(sid);
        sessionIdRef.current = sid;
      })
      .finally(() => setHistoryLoaded(true));
  }, [currentUser?.id]);


  // Save messages + update session index in KV
  const saveSession = useCallback((msgs: ChatMessage[], sessId: string) => {
    if (!currentUser?.id || !sessId) return;
    const firstUserMsg = msgs.find(m => m.role === "user");
    const title = firstUserMsg ? firstUserMsg.content.slice(0, 45) : "محادثة جديدة";
    const lastMsg = msgs[msgs.length - 1];
    const meta: SessionMeta = {
      id: sessId,
      title,
      lastMessage: lastMsg?.content?.slice(0, 80) || "",
      ts: new Date().toISOString(),
      messageCount: msgs.length,
    };
    fetch("/api/chat-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser.id,
        sessionId: sessId,
        messages: msgs,
        title: meta.title,
        lastMessage: meta.lastMessage,
        ts: meta.ts,
      }),
    }).catch(() => {});
    setSessions(prev => [meta, ...prev.filter(s => s.id !== sessId)]);
  }, [currentUser?.id]);

  // Create a brand-new chat session
  const newChat = useCallback(() => {
    if (streaming) return;
    const sid = makeSessionId();
    setCurrentSessionId(sid);
    sessionIdRef.current = sid;
    setSessionKey(k => k + 1);
    setMessages([]);
  }, [streaming]);

  // Switch to an existing session
  const loadSession = useCallback(async (sessId: string) => {
    if (streaming || sessId === sessionIdRef.current) return;
    setCurrentSessionId(sessId);
    sessionIdRef.current = sessId;
    setSessionKey(k => k + 1);
    setMessages([]);
    if (!currentUser?.id) return;
    const data = await fetch(`/api/chat-history?userId=${currentUser.id}&sessionId=${sessId}`)
      .then(r => r.json()).catch(() => ({ messages: [] }));
    if (Array.isArray(data.messages) && data.messages.length > 0) {
      setMessages(data.messages);
    }
  }, [streaming, currentUser?.id]);

  // Delete a session
  const deleteSession = useCallback(async (sessId: string) => {
    if (!currentUser?.id) return;
    await fetch("/api/chat-history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, sessionId: sessId }),
    }).catch(() => {});
    setSessions(prev => prev.filter(s => s.id !== sessId));
    if (sessId === sessionIdRef.current) newChat();
  }, [currentUser?.id, newChat]);

  // Rename a session (optimistic — updates list immediately, then persists)
  const renameSession = useCallback((sessId: string, newTitle: string) => {
    if (!currentUser?.id || !newTitle.trim()) return;
    setSessions(prev => prev.map(s => s.id === sessId ? { ...s, title: newTitle.trim() } : s));
    fetch("/api/chat-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id, sessionId: sessId, title: newTitle.trim(), renameOnly: true }),
    }).catch(() => {});
  }, [currentUser?.id]);

  const send = useCallback(async (text: string, attachment?: Attachment | null) => {
    if (!text.trim() && !attachment) return;
    const sessId  = sessionIdRef.current;
    const userMsg: ChatMessage = { role: "user", content: text, ts: now(), ...(attachment ? { attachment } : {}) };
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
          messages: next.map(m => ({ role: m.role, content: m.content, attachment: m.attachment })),
          contextData: { account, videos, competitors, ideas, trends, generations, currentUser },
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("AI error");
      const reader = res.body!.getReader();
      const dec    = new TextDecoder();
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
      // ── Parse action block from response ──────────────────────────────────
      const ACTION_RE = /\[SARIE_ACTION:(\{[\s\S]*?\})\]\s*$/;
      const actionMatch = acc.match(ACTION_RE);
      const cleanAcc = actionMatch ? acc.replace(ACTION_RE, "").trimEnd() : acc;

      setMessages(p => {
        const u = [...p];
        u[u.length - 1] = { role: "assistant", content: cleanAcc, ts: now() };
        saveSession(u, sessId);
        // Reflection every 8 assistant messages
        if (currentUser?.id) {
          const assistantCount = u.filter(m => m.role === "assistant").length;
          if (assistantCount > 0 && assistantCount % 8 === 0) {
            fetch("/api/reflect", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: u.slice(-20).map(m => ({ role: m.role, content: m.content })),
                userId: currentUser.id,
                accountUsername: account?.username || "rasayel_podcast",
              }),
            }).catch(() => {});
          }
        }
        return u;
      });

      // ── Execute action if present ──────────────────────────────────────────
      if (actionMatch && currentUser?.id) {
        try {
          const parsed = JSON.parse(actionMatch[1]);
          const result = await fetch("/api/actions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, type: parsed.type, data: parsed.data ?? {} }),
          }).then(r => r.json());
          // Append action card message
          setMessages(p => [
            ...p,
            {
              role: "assistant",
              content: "",
              ts: now(),
              actionCard: {
                ok: result.ok,
                summary: result.summary || result.error || "Action executed",
                detail: result.detail,
                type: parsed.type,
              },
            },
          ]);
        } catch {
          setMessages(p => [
            ...p,
            { role: "assistant", content: "", ts: now(), actionCard: { ok: false, summary: "Action failed — parse error", type: "UNKNOWN" } },
          ]);
        }
      }
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setMessages(p => {
        const u = p.filter(m => !m.streaming);
        return [...u, { role: "assistant", content: "⚠️ مشكلة في الاتصال — حاول تاني بعد ثانية.", ts: now() }];
      });
    } finally {
      setStreaming(false);
    }
  }, [messages, streaming, account, videos, competitors, ideas, trends, generations, currentUser, saveSession]);

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages(p => {
      const u = [...p];
      if (u[u.length - 1]?.streaming) u[u.length - 1] = { ...u[u.length - 1], streaming: false };
      return u;
    });
  };

  return { messages, setMessages, streaming, send, stop, sessions, currentSessionId, sessionKey, historyLoaded, newChat, loadSession, deleteSession, renameSession };
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
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<string | null>(null);
  const [selectedForwards, setSelectedForwards] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ msgIdx: number } | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [showUserMenu, setShowUserMenu]         = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showTeamDrawer, setShowTeamDrawer]       = useState(false);
  const [seenTick, setSeenTick] = useState(0);
  const [longPressMsg, setLongPressMsg] = useState<number | null>(null);
  const [longPressSess, setLongPressSess] = useState<SessionMeta | null>(null);
  const [renamingSess, setRenamingSess] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [inlineRenameId, setInlineRenameId] = useState<string | null>(null);
  const [inlineRenameVal, setInlineRenameVal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lpSessTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef(activeId);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  const seenMsgIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mas_seen_msg_ids') || '[]');
      seenMsgIdsRef.current = new Set(stored);
      setSeenTick(t => t + 1);
    } catch {}
  }, []);
  const sarie = useSarieChat();
  const { sessions, currentSessionId, sessionKey, historyLoaded, newChat, loadSession, deleteSession, renameSession } = sarie;
  const { currentUser } = useData();
  const searchParams = useSearchParams();
  const promptHandled = useRef(false);
  const sarieSendRef = useRef(sarie.send);
  sarieSendRef.current = sarie.send;


  // 1-second polling for global team messages + notifications
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fetchMsgs = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          if (data.messages && currentUser) {
            const reconstructed: Record<string, ChatMessage[]> = {
              dina: [], yassin: [], hesham: [], shahd: [], sara: [], haitham: [], shahdm: [], yousef: [], ahmed: []
            };
            const notifications: { name: string; text: string }[] = [];

            data.messages.forEach((rawMsg: any) => {
              const msg = typeof rawMsg === 'string' ? JSON.parse(rawMsg) : rawMsg;
              const msgId = msg.id || `${msg.ts}-${msg.senderId}-${msg.receiverId}`;

              if (msg.senderId === currentUser.id) {
                if (reconstructed[msg.receiverId]) {
                  reconstructed[msg.receiverId].push({
                    id: msgId, role: "user", content: msg.content, ts: msg.ts, status: "delivered", attachment: msg.attachment, isForwarded: msg.isForwarded, reactions: msg.reactions
                  });
                }
              } else if (msg.receiverId === currentUser.id) {
                if (reconstructed[msg.senderId]) {
                  reconstructed[msg.senderId].push({
                    id: msgId, role: "assistant", content: msg.content, ts: msg.ts, status: "seen", attachment: msg.attachment, isForwarded: msg.isForwarded, reactions: msg.reactions
                  });
                }
                if (!seenMsgIdsRef.current.has(msgId)) {
                  // If this conversation is currently open, mark as seen silently
                  if (msg.senderId === activeIdRef.current) {
                    seenMsgIdsRef.current.add(msgId);
                  } else {
                    const sender = INITIAL_CONVERSATIONS.find(c => c.id === msg.senderId);
                    if (sender) notifications.push({ name: sender.name, text: msg.content || '📎 Attachment' });
                    seenMsgIdsRef.current.add(msgId);
                  }
                  setSeenTick(t => t + 1);
                }
              }
            });

            setTeamMessages(reconstructed);

            try { localStorage.setItem('mas_seen_msg_ids', JSON.stringify([...seenMsgIdsRef.current])); } catch {}

            if (notifications.length > 0 && document.hidden && Notification.permission === 'granted') {
              notifications.forEach(n => new Notification(n.name, { body: n.text, icon: '/masmas.png' }));
            }
          }
        }
      } catch (err) {}
      timeout = setTimeout(fetchMsgs, 1000);
    };
    
    fetchMsgs();
    return () => clearTimeout(timeout);
  }, [currentUser]);
  // Mark conversation as fully read when switching to it
  useEffect(() => {
    if (activeId === 'sarie') return;
    const msgs = teamMessages[activeId] || [];
    let changed = false;
    msgs.forEach(m => {
      if (m.role === 'assistant' && m.id && !seenMsgIdsRef.current.has(m.id)) {
        seenMsgIdsRef.current.add(m.id);
        changed = true;
      }
    });
    if (changed) {
      try { localStorage.setItem('mas_seen_msg_ids', JSON.stringify([...seenMsgIdsRef.current])); } catch {}
      setSeenTick(t => t + 1);
    }
  }, [activeId, teamMessages]);

  useEffect(() => {
    if (contextMenu === null) return;
    const clickHandler = () => setContextMenu(null);
    window.addEventListener("click", clickHandler);
    return () => window.removeEventListener("click", clickHandler);
  }, [contextMenu]);

  const computedConversations = useMemo(() => conversations.map(c => {
    if (c.isAI) return c;
    const msgs = teamMessages[c.id] || [];
    if (msgs.length === 0) return c;
    const lastMsg = msgs[msgs.length - 1];
    const unread = c.id === activeId
      ? 0
      : msgs.filter(m => m.role === 'assistant' && m.id && !seenMsgIdsRef.current.has(m.id)).length;
    return {
      ...c,
      lastMessage: lastMsg.content || (lastMsg.attachment ? `[${lastMsg.attachment.type}]` : ""),
      time: lastMsg.ts || c.time,
      unread,
    };
  // seenTick is the dependency that fires when seenMsgIdsRef changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [conversations, teamMessages, seenTick, activeId]);

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

  const messagesLength = messages.length;
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesLength, streaming]);

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
        if (currentUser?.id && currentSessionId) {
          fetch("/api/chat-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: currentUser.id,
              sessionId: currentSessionId,
              messages: u,
              title: u.find(m => m.role === "user")?.content?.slice(0, 45) || "محادثة جديدة",
              lastMessage: u[u.length - 1]?.content?.slice(0, 80) || "",
              ts: new Date().toISOString(),
            }),
          }).catch(() => {});
        }
        return u;
      });
    } else {
      const msgs = teamMessages[activeId] || [];
      const msgToDelete = msgs[index];
      
      setTeamMessages(prev => {
        const u = [...(prev[activeId] || [])];
        u.splice(index, 1);
        return { ...prev, [activeId]: u };
      });

      if (msgToDelete?.id || (msgToDelete?.content && msgToDelete?.ts)) {
        fetch("/api/messages", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id: msgToDelete.id,
            content: msgToDelete.content,
            ts: msgToDelete.ts 
          })
        }).catch(console.error);
      }
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

  const confirmForward = (targetIds: string[]) => {
    if (!forwardingMsg || !currentUser) return;
    
    targetIds.forEach(targetId => {
      const msgId = Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);
      const msg: ChatMessage = { id: msgId, role: "user", content: forwardingMsg, ts: now(), isForwarded: true, status: "sent" };
      setTeamMessages(prev => ({ ...prev, [targetId]: [...(prev[targetId] || []), msg] }));
      
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: msgId,
          senderId: currentUser.id,
          receiverId: targetId,
          content: forwardingMsg,
          ts: now(),
          isForwarded: true
        })
      }).catch(console.error);
    });

    setForwardingMsg(null);
    setSelectedForwards([]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text && !pendingAttachment) return;
    if (isAI) {
      sarie.send(text, pendingAttachment);
    } else {
      const msgId = Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);
      const msg: ChatMessage = { id: msgId, role: "user", content: text || "", ts: now(), status: "sent", ...(pendingAttachment ? { attachment: pendingAttachment } : {}) };
      setTeamMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), msg] }));
      
      if (currentUser) {
        fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: msgId,
            senderId: currentUser.id,
            receiverId: activeId,
            content: text || "",
            ts: now(),
            attachment: pendingAttachment
          })
        }).catch(console.error);
      }
      
      const targetId = activeId;
      setTimeout(() => {
        setTeamMessages(prev => {
          const arr = [...(prev[targetId] || [])];
          if (arr.length > 0) arr[arr.length - 1] = { ...arr[arr.length - 1], status: "delivered" };
          return { ...prev, [targetId]: arr };
        });
      }, 600);
      
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

    const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
    if (file.size > MAX_BYTES) {
      alert("⚠️ File is too large (max 20 MB).");
      e.target.value = "";
      return;
    }

    const isImage = file.type.startsWith("image/");

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          const MAX = 1568; // Claude's recommended max
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
            else { width = Math.round(width * MAX / height); height = MAX; }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
          const url = canvas.toDataURL("image/jpeg", 0.82);
          setPendingAttachment({ name: file.name, url, type: "image", mimeType: "image/jpeg" });
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const type: Attachment["type"] = file.type.startsWith("video/") ? "video" : "file";
        setPendingAttachment({ name: file.name, url, type, mimeType: file.type || "application/octet-stream" });
      };
      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };



  const addReaction = (msgIdx: number, emoji: string) => {
    if (isAI) return;
    
    let targetMsg: ChatMessage | undefined;
    setTeamMessages(prev => {
      const msgs = [...(prev[activeId] || [])];
      const m = { ...msgs[msgIdx] };
      targetMsg = m;
      const existing = m.reactions || [];
      m.reactions = existing.includes(emoji) ? existing.filter(r => r !== emoji) : [...existing, emoji];
      msgs[msgIdx] = m;
      return { ...prev, [activeId]: msgs };
    });

    if (targetMsg) {
      fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: targetMsg.id, 
          content: targetMsg.content,
          ts: targetMsg.ts,
          emoji 
        })
      }).catch(console.error);
    }
  };

  const glass: React.CSSProperties = {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Readex+Pro:wght@300;400;500;600;700&display=swap");

body {
  font-family: "Inter", sans-serif;
  background-image: url(https://lh3.googleusercontent.com/aida/ADBb0uhCilLHmLfDhPMwiCs2nL08qwA6V4xXkJYQ4KtwbpzOH62ThNmDWsEtxzYscnGYjlnkSs9KqANozl3XsH_1co8MEq1TXxitKN8M_ZLcIfMUc-DYny0LMDOLM5Tt0mMigyTZCfAzzVB91vXKYlO7L7hsdofrt6vkvAAaiwsKoPmx8H-JHJyiR5sM-gNy-r6UYF4_Z61SW9RSycIBI7sRuqVXMtbvBMHknTg4V6fzeOS9J6BZeTdDTHgVCjdnfkDJv5uefwuLfcCg);
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

[dir="rtl"], .arabic-text {
  font-family: "Readex Pro", sans-serif;
}

/* ── Scrollbar ─────────────────────────────── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #d1d5db; }

/* ── Message entrance ──────────────────────── */
@keyframes msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.msg-enter { animation: msg-in 0.22s cubic-bezier(0.16,1,0.3,1) both; }

/* ── Chat area fade (session switch) ──────── */
@keyframes chat-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.chat-fade { animation: chat-fade 0.2s ease both; }

/* ── Thinking dots ─────────────────────────── */
@keyframes dot-up {
  0%, 60%, 100% { transform: translateY(0);   opacity: 0.35; }
  30%            { transform: translateY(-5px); opacity: 1; }
}
.dot1 { animation: dot-up 1.1s ease infinite 0s;    width:6px; height:6px; border-radius:50%; background:#9ca3af; display:inline-block; }
.dot2 { animation: dot-up 1.1s ease infinite 0.18s; width:6px; height:6px; border-radius:50%; background:#9ca3af; display:inline-block; }
.dot3 { animation: dot-up 1.1s ease infinite 0.36s; width:6px; height:6px; border-radius:50%; background:#9ca3af; display:inline-block; }

/* ── Skeleton shimmer (sidebar loading) ────── */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
  border-radius: 6px;
}

/* ── Empty state fade-in ───────────────────── */
@keyframes empty-in {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
.empty-state { animation: empty-in 0.35s cubic-bezier(0.16,1,0.3,1) both; }

/* ── Input bar focus ring ──────────────────── */
.input-bar { transition: box-shadow 0.2s ease, background 0.2s ease; }
.input-bar:focus-within {
  background: #efefef !important;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.07), 0 6px 20px rgba(0,0,0,0.05);
}

/* ── Send button micro-press ───────────────── */
.send-btn:active { transform: scale(0.92); }
.send-btn { transition: transform 0.1s ease, background 0.15s ease; }

/* ── New Chat button pulse on click ──────── */
.new-chat-btn:active { transform: scale(0.97); }
.new-chat-btn { transition: transform 0.1s ease, background 0.15s ease; }

/* ── Sidebar session item ─────────────────── */
.session-item { transition: background 0.15s ease, color 0.15s ease; }

/* ── Right sidebar team link ──────────────── */
.team-link { transition: background 0.15s ease; }

.status-online { background-color: #22c55e; }
.status-away   { background-color: #eab308; }
.status-busy   { background-color: #ef4444; }

/* ── Mobile drawers ────────────────────────────────────────── */
@keyframes drawer-left {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
@keyframes drawer-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.drawer-left    { animation: drawer-left  0.28s cubic-bezier(0.16,1,0.3,1) both; }
.drawer-right   { animation: drawer-right 0.28s cubic-bezier(0.16,1,0.3,1) both; }
.drawer-backdrop { animation: backdrop-in 0.2s ease both; }

/* ── Mobile message actions — always show on touch ─────────── */
@media (hover: none) {
  .msg-actions { opacity: 1 !important; }
}
/* ── Prevent text selection & iOS callout on long-press ─────── */
.no-select {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
@keyframes drawer-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
`}} />
      <div className="fixed inset-0 flex items-center justify-center w-full bg-white md:p-8" style={{
         fontFamily: "'Inter', sans-serif"
      }}>

{/*  BEGIN: MainContainer  */}
<div className="bg-[#f2f2f2] w-full max-w-[1600px] h-full md:rounded-[32px] overflow-hidden shadow-2xl flex relative text-[#2b2b2b] text-[14px]">
{/*  BEGIN: LeftSidebar — hidden on mobile  */}
<aside className="hidden md:flex w-[200px] flex-col justify-between p-6 pl-8">
<div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
<nav className="space-y-2.5 mt-2 shrink-0 flex flex-col items-start">
  <button
    onClick={newChat}
    className="new-chat-btn bg-[#2b2b2b] text-white rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-black shadow-sm w-full"
  >
    <Plus size={14} className="text-gray-300" />
    New Chat
  </button>
  <Link href="/dashboard" className="bg-white/80 text-gray-700 rounded-[20px] py-2 px-5 flex items-center gap-2.5 text-[13px] font-medium hover:bg-white transition-colors shadow-sm w-full">
    <LayoutGrid size={14} className="text-gray-500" />
    Dashboard
  </Link>
</nav>

{/* Live Chat History */}
<div className="space-y-1 mt-6 flex-1 overflow-y-auto pr-1">
  {/* Skeleton while loading */}
  {!historyLoaded && (
    <div className="space-y-3 px-1 mt-2">
      {[55, 70, 45, 65, 50].map((w, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="skeleton w-3 h-3 rounded-full shrink-0" style={{ animationDelay: `${i * 0.1}s` }} />
          <div className="skeleton h-3 rounded" style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
        </div>
      ))}
    </div>
  )}
  {sessions.length === 0 && historyLoaded && (
    <p className="text-[11px] text-gray-400 px-1 mt-4">No previous chats yet.</p>
  )}
  {historyLoaded && (() => {
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
    const groups: { label: string; items: SessionMeta[] }[] = [];
    const seen = new Map<string, SessionMeta[]>();
    sessions.forEach(s => {
      const d = new Date(s.ts);
      const label = d.toDateString() === todayStr ? "Today"
        : d.toDateString() === yesterdayStr ? "Yesterday"
        : d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
      if (!seen.has(label)) { seen.set(label, []); groups.push({ label, items: seen.get(label)! }); }
      seen.get(label)!.push(s);
    });
    return groups.map(g => (
      <div key={g.label} className="mb-4">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1.5">{g.label}</h4>
        <ul className="space-y-0.5">
          {g.items.map(s => (
            <li key={s.id} className="group relative">
              {inlineRenameId === s.id ? (
                <div className="flex items-center gap-1.5 px-2 py-1">
                  <MessageCircle size={13} className="text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    value={inlineRenameVal}
                    onChange={e => setInlineRenameVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") { renameSession(s.id, inlineRenameVal); setInlineRenameId(null); }
                      if (e.key === "Escape") setInlineRenameId(null);
                    }}
                    onBlur={() => { if (inlineRenameVal.trim()) renameSession(s.id, inlineRenameVal); setInlineRenameId(null); }}
                    className="flex-1 min-w-0 text-[12px] text-gray-800 bg-white border border-gray-200 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                </div>
              ) : (
                <>
                  <button
                    onClick={() => loadSession(s.id)}
                    className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-xl transition-colors text-[12px] ${s.id === currentSessionId ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'}`}
                  >
                    <MessageCircle size={13} className="text-gray-400 mt-0.5 shrink-0" />
                    <span
                      className="truncate flex-1"
                      onDoubleClick={e => { e.stopPropagation(); setInlineRenameId(s.id); setInlineRenameVal(s.title || ""); }}
                      title="Double-click to rename"
                    >{s.title || "محادثة جديدة"}</span>
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all"
                    title="Delete"
                  ><X size={11} /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    ));
  })()}
</div>
</div>
<div className="pb-4 shrink-0 mt-4 border-t border-gray-100 pt-4 relative">
  <div 
    onClick={() => setShowUserMenu(!showUserMenu)}
    className="flex items-center gap-2 w-full p-2 hover:bg-white rounded-xl cursor-pointer transition-colors"
  >
    <AvatarCircle name={currentUser?.name || "User"} size={28} online={true} />
    <div className="flex-1 min-w-0">
      <h4 className="text-[11px] font-bold text-gray-800 truncate leading-tight">{currentUser?.name || "User"}</h4>
      <p className="text-[9px] text-gray-500 truncate">{currentUser?.role || "Team Member"}</p>
    </div>
    <button className="text-gray-400 hover:text-gray-600 transition-colors">
      <Settings size={12} />
    </button>
  </div>
  
  {showUserMenu && (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
      <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
        <button onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700 font-medium">
          <Settings size={12} className="text-gray-500" />
          Settings
        </button>
        <button onClick={() => { localStorage.removeItem('mas_ai_authenticated_user'); window.location.href = '/'; }} className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors text-red-500 font-medium">
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </>
  )}
</div>
</aside>
{/*  END: LeftSidebar  */}
{/*  BEGIN: MainChatArea  */}
<main className="flex-1 bg-[#fbfbfb] md:my-4 md:rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">

{/*  Top Bar — desktop centers title; mobile shows drawer toggles  */}
<div className="absolute top-0 w-full flex items-center justify-between md:justify-center px-4 md:px-0 py-3 md:py-4 bg-gradient-to-b from-[#fbfbfb] via-[#fbfbfb]/90 to-transparent z-10">
  {/* Mobile: history drawer button */}
  <button
    onClick={() => setShowHistoryDrawer(true)}
    className="md:hidden w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
    aria-label="Chat history"
  >
    <Menu size={17} className="text-gray-600" />
  </button>

  {/* Title */}
  <button className="text-xs text-gray-800 font-semibold flex items-center gap-1">
    <span className="font-bold text-sm tracking-wider mr-1">Sarie 2.1</span>
    <i className="fa-solid fa-chevron-down text-[10px] ml-1 text-gray-500"></i>
  </button>

  {/* Mobile: team drawer button */}
  <button
    onClick={() => setShowTeamDrawer(true)}
    className="md:hidden w-9 h-9 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform relative"
    aria-label="Team chat"
  >
    <Users size={17} className="text-gray-600" />
    {computedConversations.filter(c => !c.isAI && c.unread > 0).length > 0 && (
      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
    )}
  </button>
  {/* Desktop: invisible balance spacer */}
  <div className="hidden md:block w-9" />
</div>

<div key={sessionKey} className="flex-1 overflow-y-auto px-4 md:px-10 pt-16 pb-36 md:pb-32 flex flex-col gap-5 md:gap-8 chat-fade" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>

{/* Empty state */}
{messages.length === 0 && historyLoaded && (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-8 empty-state relative" style={{ minHeight: 320 }}>
    <img src="/Sarielogo.png" alt="" aria-hidden className="absolute w-52 h-52 object-contain pointer-events-none select-none" style={{ opacity: 0.07 }} />
    <h2 className="text-xl font-bold text-gray-800 mb-1 relative z-10">{currentUser?.name?.split(" ")[0] || "there"}</h2>
    <p className="text-[13px] text-gray-400 font-medium relative z-10">Sarie is ready to support you</p>
  </div>
)}

{messages.map((m, i) => {
  const isUser = m.role === "user";
  // Only animate user messages — they appear instantly and benefit from the slide-in.
  // Sarie's messages grow during streaming and are already visible, so no entrance animation.
  const isNew = m.role === "user" && i >= messages.length - 2;

  // ── Action Card ────────────────────────────────────────────────────────────
  if (m.actionCard) {
    const { ok, summary, detail, type, images, specs, colors, cleanName } = m.actionCard;

    // ── Product Search Gallery Card ─────────────────────────────────────────
    if (type === "SEARCH_PRODUCT" && ok && images && images.length > 0) {
      return (
        <div key={i} className={`flex flex-col gap-3 max-w-md ${i >= messages.length - 1 ? "msg-enter" : ""}`} dir="ltr">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-violet-50 to-white">
              <span className="text-lg">🔍</span>
              <div>
                <div className="font-bold text-[13px] text-gray-800" dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                {colors && colors !== "N/A" && <div className="text-[11px] text-gray-400 mt-0.5">🎨 {colors}</div>}
              </div>
            </div>
            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-0.5 bg-gray-100">
              {images.slice(0, 6).map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden">
                  <img
                    src={url}
                    alt={`${cleanName} ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </a>
              ))}
            </div>
            {/* Specs */}
            {specs && (
              <div className="px-4 py-3 text-[11px] text-gray-500 leading-relaxed max-h-28 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">{specs}</pre>
              </div>
            )}
            <div className="px-4 py-2 text-[10px] text-gray-300 font-mono border-t border-gray-50">SEARCH_PRODUCT</div>
          </div>
        </div>
      );
    }

    // ── Default Action Card ─────────────────────────────────────────────────
    return (
      <div key={i} className={`flex items-start gap-2 ${i >= messages.length - 1 ? "msg-enter" : ""}`} dir="ltr">
        <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl border text-[12px] max-w-md ${ok ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-red-50 border-red-100 text-red-700"}`}>
          <span className="mt-0.5 text-base shrink-0">{ok ? "⚡" : "⚠️"}</span>
          <div>
            <div className="font-bold mb-0.5" dangerouslySetInnerHTML={{ __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            {detail && <div className="text-[11px] opacity-70">{detail}</div>}
            <div className="text-[10px] opacity-50 mt-1 font-mono">{type}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div key={i} className={`no-select group flex flex-col gap-1 ${isUser ? "items-end" : "items-start"} ${isNew ? "msg-enter" : ""}`}>
      <div
        className={`px-5 py-3 md:px-6 md:py-3.5 max-w-[82vw] md:max-w-xl ${isUser ? "bg-[#2b2b2b] text-white rounded-[22px] md:rounded-[28px] rounded-br-none shadow-sm" : "bg-white rounded-[22px] md:rounded-[28px] rounded-bl-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-gray-800"}`}
        dir={!isUser ? "rtl" : "ltr"}
        onContextMenu={e => e.preventDefault()}
        onTouchStart={() => { lpTimer.current = setTimeout(() => setLongPressMsg(i), 480); }}
        onTouchEnd={() => { if (lpTimer.current) clearTimeout(lpTimer.current); }}
        onTouchMove={() => { if (lpTimer.current) clearTimeout(lpTimer.current); }}
      >
        {m.attachment && m.attachment.type === "image" && (
          <img src={m.attachment.url} alt={m.attachment.name} className="w-full max-w-[240px] rounded-xl block mb-2" />
        )}
        {m.content && <MarkdownMessage content={m.content} />}
        {m.streaming && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-gray-300 rounded-sm align-middle animate-pulse" />
        )}
      </div>

      {/* Timestamp + actions — always visible on touch, hover-only on desktop */}
      <div className={`flex items-center gap-2 mt-0.5 ${isUser ? "flex-row-reverse mr-2" : "ml-2"}`}>
        <span className="text-[10px] text-gray-300">{m.ts}</span>
        <div className="msg-actions flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={() => handleCopy(m.content)}
            title="Copy"
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          ><Copy size={11}/></button>
          <button
            onClick={() => handleForward(m.content)}
            title="Forward"
            className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          ><Forward size={11}/></button>
          {!isUser && (
            <>
              <button className="text-gray-400 hover:text-green-500 p-1 rounded-lg hover:bg-gray-100 transition-colors"><i className="fa-regular fa-thumbs-up" style={{ fontSize: 10 }}></i></button>
              <button className="text-gray-400 hover:text-red-400 p-1 rounded-lg hover:bg-gray-100 transition-colors"><i className="fa-regular fa-thumbs-down" style={{ fontSize: 10 }}></i></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
})}

{/* Thinking indicator — three bouncing dots */}
{streaming && messages[messages.length - 1]?.streaming !== true && (
  <div className="flex items-start msg-enter">
    <div className="bg-white px-5 py-4 rounded-[28px] rounded-bl-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-1.5">
      <span className="dot1" />
      <span className="dot2" />
      <span className="dot3" />
    </div>
  </div>
)}

<div ref={bottomRef} />
</div>
<div className="absolute bottom-10 md:bottom-6 left-0 right-0 px-3 md:px-10 flex flex-col items-center">
  <div className="w-full md:max-w-2xl">
    {pendingAttachment && (
      <div className="bg-white rounded-2xl p-2 mb-2 shadow-sm border border-gray-100 flex items-center gap-3">
        {pendingAttachment.type === "image" && <img src={pendingAttachment.url} className="w-10 h-10 object-cover rounded-lg" />}
        <span className="text-xs text-gray-500 flex-1 truncate">{pendingAttachment.name}</span>
        <button onClick={() => setPendingAttachment(null)} className="text-gray-400 hover:text-red-500 p-1"><X size={14}/></button>
      </div>
    )}
    <div className="input-bar bg-[#f5f5f5] rounded-[32px] flex items-end px-4 py-2 relative">
      <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-gray-700 p-2 mb-1 rounded-xl hover:bg-white/60 transition-colors">
        <Plus size={18} />
      </button>
      <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.json,.xml,.html,.js,.ts,.py" className="hidden" onChange={handleFile} />

      <textarea
        className="flex-1 border-none focus:outline-none outline-none focus:ring-0 bg-transparent text-[14px] text-gray-700 placeholder-gray-400 mx-3 resize-none py-2.5 max-h-[120px]"
        placeholder={isAI ? "اسأل ساري..." : "Type your prompt"}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        autoCapitalize="none"
        value={input}
        onChange={e => {
          setInput(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
        dir={isAI ? "rtl" : "ltr"}
        style={{ minHeight: '40px', textAlign: input ? (isAI ? 'right' : 'left') : 'center' }}
      />
      <button
        onClick={isAI && streaming ? sarie.stop : handleSend}
        disabled={!isAI && !streaming && !input.trim() && !pendingAttachment}
        className="send-btn bg-[#2b2b2b] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black disabled:opacity-30 mb-1 shrink-0"
      >
        {isAI && streaming ? <Square size={12} fill="white" /> : <Send size={14} className="-ml-0.5" />}
      </button>
    </div>
  </div>
</div>
</main>
{/*  END: MainChatArea  */}
{/*  BEGIN: RightSidebar — hidden on mobile  */}
<aside className="hidden md:flex w-[280px] p-6 pr-8 flex-col gap-6 overflow-y-auto">
{/*  Team Chat Header  */}
<div className="flex justify-between items-center pt-2">
<h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
<i className="fa-solid fa-users text-gray-400"></i> Team Chat
</h3>
<button className="text-gray-400 hover:text-gray-600 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-gray-100">
<i className="fa-solid fa-plus text-[10px]"></i>
</button>
</div>
{/*  Search Box  */}
<div className="relative">
<i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"></i>
<input className="w-full bg-white border border-gray-100 rounded-full py-2 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-gray-200 shadow-sm" placeholder="Search team..." type="text"/>
</div>
<div className="space-y-4 mt-2">
  {computedConversations.filter(c => !c.isAI).map(c => (
    <Link href={`/team-chat/${c.id}`} key={c.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
      <AvatarCircle name={c.name} src={c.avatar} size={36} online={c.online} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className="text-xs font-semibold text-gray-800 truncate">{c.name}</h4>
          <span className="text-[9px] text-gray-400">{c.time}</span>
        </div>
        <p className="text-[11px] text-gray-500 truncate">{c.lastMessage || c.role}</p>
      </div>
      {c.unread > 0 && (
        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{c.unread}</span>
      )}
    </Link>
  ))}
</div>
</aside>
{/*  END: RightSidebar  */}
{/*  Logo Floating Widget — desktop only  */}
<div className="hidden md:flex absolute bottom-8 right-8 items-end z-20">
  <img alt="Masaa Logo" className="w-20 object-contain drop-shadow-xl" src="/masmas.png" />
</div>

{/* ── Long-press message action sheet (mobile only) ── */}
{longPressMsg !== null && (() => {
  const m = messages[longPressMsg];
  if (!m) return null;
  const isUser = m.role === "user";
  return (
    <div className="md:hidden fixed inset-0 z-[70] flex flex-col justify-end" onPointerDown={() => setLongPressMsg(null)}>
      <div className="absolute inset-0 bg-black/25" style={{ animation: 'backdrop-in 0.15s ease both' }} />
      <div
        className="relative bg-white rounded-t-[28px] pb-8 pt-2 shadow-2xl"
        style={{ animation: 'drawer-up 0.22s cubic-bezier(0.16,1,0.3,1) both' }}
        onPointerDown={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 mt-2" />
        <div className="px-4 space-y-0.5">
          <button
            onClick={() => { handleCopy(m.content); setLongPressMsg(null); }}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-[14px] font-medium text-gray-700 active:bg-gray-50 rounded-2xl transition-colors"
          ><Copy size={17} className="text-gray-400" /> Copy</button>
          <button
            onClick={() => { handleForward(m.content); setLongPressMsg(null); }}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-[14px] font-medium text-gray-700 active:bg-gray-50 rounded-2xl transition-colors"
          ><Forward size={17} className="text-gray-400" /> Forward</button>
          {isUser && (
            <>
              <button
                onClick={() => { handleEdit(longPressMsg, m.content); setLongPressMsg(null); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-[14px] font-medium text-gray-700 active:bg-gray-50 rounded-2xl transition-colors"
              ><Pencil size={17} className="text-gray-400" /> Edit</button>
              <button
                onClick={() => { handleDelete(longPressMsg); setLongPressMsg(null); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-[14px] font-medium text-red-500 active:bg-red-50 rounded-2xl transition-colors"
              ><Trash2 size={17} className="text-red-400" /> Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
})()}

{/* ── Session long-press action sheet ── */}
{longPressSess && (
  <div className="fixed inset-0 z-[80] flex flex-col justify-end" onPointerDown={() => { setLongPressSess(null); setRenamingSess(false); }}>
    <div className="absolute inset-0 bg-black/25" style={{ animation: 'backdrop-in 0.15s ease both' }} />
    <div
      className="relative bg-white rounded-t-[28px] pb-10 pt-2 shadow-2xl"
      style={{ animation: 'drawer-up 0.22s cubic-bezier(0.16,1,0.3,1) both' }}
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3 mt-2" />
      {/* Session title preview */}
      <p className="text-[11px] text-gray-400 font-medium text-center px-6 mb-3 truncate">{longPressSess.title || "محادثة جديدة"}</p>
      {renamingSess ? (
        <div className="px-5 mb-2">
          <input
            autoFocus
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                renameSession(longPressSess.id, renameValue);
                setLongPressSess(null);
                setRenamingSess(false);
              }
            }}
            className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 bg-gray-50"
            placeholder="Chat name..."
          />
          <button
            onClick={() => { renameSession(longPressSess.id, renameValue); setLongPressSess(null); setRenamingSess(false); }}
            className="mt-2 w-full bg-[#2b2b2b] text-white rounded-2xl py-2.5 text-[13px] font-semibold"
          >Save</button>
        </div>
      ) : (
        <div className="px-4 space-y-0.5">
          <button
            onClick={() => setRenamingSess(true)}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-[14px] font-medium text-gray-700 active:bg-gray-50 rounded-2xl"
          ><Pencil size={17} className="text-gray-400" /> Rename</button>
          <button
            onClick={() => { deleteSession(longPressSess.id); setLongPressSess(null); }}
            className="w-full flex items-center gap-4 px-4 py-3.5 text-[14px] font-medium text-red-500 active:bg-red-50 rounded-2xl"
          ><Trash2 size={17} className="text-red-400" /> Delete</button>
        </div>
      )}
    </div>
  </div>
)}

{/* ═══════════════════════════════════════════════════════════
    MOBILE DRAWERS — rendered inside the container so they
    respect the rounded corners on md+
    ═══════════════════════════════════════════════════════════ */}

{/* ── History Drawer (left) ── */}
{showHistoryDrawer && (
  <div className="md:hidden fixed inset-0 z-[60] flex" onPointerDown={() => setShowHistoryDrawer(false)}>
    <div className="drawer-backdrop absolute inset-0 bg-black/30" />
    <div
      className="drawer-left relative w-[78vw] max-w-[300px] h-full bg-[#f2f2f2] flex flex-col shadow-2xl"
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
        <span className="font-black text-[17px] text-gray-800">Chats</span>
        <button
          onClick={() => setShowHistoryDrawer(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-100 active:scale-90 transition-transform"
        ><X size={14} className="text-gray-500" /></button>
      </div>

      {/* Nav buttons */}
      <div className="px-4 pt-4 pb-2 space-y-2">
        <button
          onClick={() => { newChat(); setShowHistoryDrawer(false); }}
          className="new-chat-btn bg-[#2b2b2b] text-white rounded-[18px] py-3 px-5 flex items-center gap-2 text-[13px] font-medium w-full"
        >
          <Plus size={14} className="text-gray-300" /> New Chat
        </button>
        <Link
          href="/dashboard"
          onClick={() => setShowHistoryDrawer(false)}
          className="bg-white/80 text-gray-700 rounded-[18px] py-3 px-5 flex items-center gap-2.5 text-[13px] font-medium hover:bg-white transition-colors w-full"
        >
          <LayoutGrid size={14} className="text-gray-500" /> Dashboard
        </Link>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {!historyLoaded && (
          <div className="space-y-3 mt-4">
            {[55, 70, 45, 65, 50].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="skeleton w-3 h-3 rounded-full shrink-0" />
                <div className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}
        {sessions.length === 0 && historyLoaded && (
          <p className="text-[11px] text-gray-400 px-1 mt-4">No previous chats yet.</p>
        )}
        {historyLoaded && (() => {
          const todayStr = new Date().toDateString();
          const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
          const groups: { label: string; items: SessionMeta[] }[] = [];
          const seen = new Map<string, SessionMeta[]>();
          sessions.forEach(s => {
            const d = new Date(s.ts);
            const label = d.toDateString() === todayStr ? "Today"
              : d.toDateString() === yesterdayStr ? "Yesterday"
              : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            if (!seen.has(label)) { seen.set(label, []); groups.push({ label, items: seen.get(label)! }); }
            seen.get(label)!.push(s);
          });
          return groups.map(g => (
            <div key={g.label} className="mt-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">{g.label}</h4>
              {g.items.map(s => (
                <button
                  key={s.id}
                  onClick={() => { loadSession(s.id); setShowHistoryDrawer(false); }}
                  className={`no-select w-full text-left flex items-start gap-2 px-2 py-2 rounded-xl text-[12px] transition-colors ${s.id === currentSessionId ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-600 hover:bg-white/60'}`}
                  onTouchStart={() => { lpSessTimer.current = setTimeout(() => { setLongPressSess(s); setRenamingSess(false); setRenameValue(s.title || ""); }, 500); }}
                  onTouchEnd={() => { if (lpSessTimer.current) clearTimeout(lpSessTimer.current); }}
                  onTouchMove={() => { if (lpSessTimer.current) clearTimeout(lpSessTimer.current); }}
                >
                  <MessageCircle size={12} className="text-gray-400 mt-0.5 shrink-0" />
                  <span className="truncate">{s.title || "محادثة جديدة"}</span>
                </button>
              ))}
            </div>
          ));
        })()}
      </div>

      {/* User profile */}
      <div className="px-4 pb-6 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60">
          <AvatarCircle name={currentUser?.name || "U"} size={32} online />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-gray-800 truncate">{currentUser?.name}</div>
            <div className="text-[10px] text-gray-500 truncate">{currentUser?.role}</div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('mas_ai_authenticated_user'); window.location.href = '/'; }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
          ><LogOut size={13} /></button>
        </div>
      </div>
    </div>
  </div>
)}

{/* ── Team Drawer (right) ── */}
{showTeamDrawer && (
  <div className="md:hidden fixed inset-0 z-[60] flex justify-end" onPointerDown={() => setShowTeamDrawer(false)}>
    <div className="drawer-backdrop absolute inset-0 bg-black/30" />
    <div
      className="drawer-right relative w-[78vw] max-w-[300px] h-full bg-[#f2f2f2] flex flex-col shadow-2xl"
      onPointerDown={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
        <span className="font-black text-[17px] text-gray-800">Team</span>
        <button
          onClick={() => setShowTeamDrawer(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-100 active:scale-90 transition-transform"
        ><X size={14} className="text-gray-500" /></button>
      </div>

      {/* Team list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {computedConversations.filter(c => !c.isAI).map(c => (
          <Link
            href={`/team-chat/${c.id}`}
            key={c.id}
            onClick={() => setShowTeamDrawer(false)}
            className="flex items-center gap-3 p-3 hover:bg-white rounded-2xl transition-colors"
          >
            <AvatarCircle name={c.name} src={c.avatar} size={40} online={c.online} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-[13px] font-bold text-gray-800 truncate">{c.name}</h4>
                {c.time && <span className="text-[10px] text-gray-400 shrink-0 ml-2">{c.time}</span>}
              </div>
              <p className="text-[11px] text-gray-500 truncate">{c.lastMessage || c.role}</p>
            </div>
            {c.unread > 0 && (
              <span className="bg-[#2b2b2b] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">{c.unread}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-5 pb-8 pt-2">
        <p className="text-[10px] text-gray-400 text-center">Tap a member to open direct chat</p>
      </div>
    </div>
  </div>
)}

</div>
{/*  END: MainContainer  */}

      </div>
    </>
  );
}