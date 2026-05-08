'use client';
import Link from 'next/link';

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Send, Plus, Loader2, Square, Search, Phone, Video, MoreVertical, Smile, Paperclip, Check, CheckCheck, X, FileText, Film, Copy, Trash2, Pencil, Forward, MoreHorizontal, ArrowLeft, Compass, LayoutGrid, History, MessageCircle, Settings, LogOut } from "lucide-react";
import { useData } from "@/components/DataContext";
import MarkdownMessage from "@/components/MarkdownMessage";
import SarieAvatar from "@/public/sarie_generated.png";

// ─── Types ──────────────────────────────────────────────────────────────────

const EMOJIS = ["😂","❤️","🔥","👏","😮","😢","🤔","💯","🚀","✅","👍","🎉","💪","😍","🙏","⚡","🎯","💡","🤣","😎"];

interface Attachment { name: string; url: string; type: "image" | "video" | "file"; }

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
    online: true,
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
    online: true,
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
    online: true,
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
    online: true,
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
    online: true,
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
    online: true,
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
    online: true,
    role: "Ai Artist",
  },
];

const INITIAL_TEAM_MESSAGES: Record<string, ChatMessage[]> = {
  dina: [], yassin: [], hesham: [], shahd: [], sara: [], haitham: [], shahdm: [], yousef: []
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

function makeWelcome(username: string, followers: number): ChatMessage {
  return {
    role: "assistant",
    content: `الأيجنت شغال! عندي كل البيانات بتاعة ${username} (${followers.toLocaleString()} متابع). إيه اللي تحتاجه؟`,
    ts: now(),
  };
}

function useSarieChat() {
  const { account, videos, competitors, ideas, trends, generations, currentUser } = useData();
  const [messages, setMessages]           = useState<ChatMessage[]>([]);
  const [streaming, setStreaming]         = useState(false);
  const [sessions, setSessions]           = useState<SessionMeta[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const abortRef        = useRef<AbortController | null>(null);
  const sessionIdRef    = useRef<string>("");

  // Keep ref in sync so callbacks always see the latest session id
  useEffect(() => { sessionIdRef.current = currentSessionId; }, [currentSessionId]);

  // On mount: load session index, then load most recent session's messages
  useEffect(() => {
    if (!currentUser?.id) { setHistoryLoaded(true); return; }
    fetch(`/api/chat-history?userId=${currentUser.id}`)
      .then(r => r.json())
      .then(async data => {
        const list: SessionMeta[] = Array.isArray(data.sessions) ? data.sessions : [];
        setSessions(list);
        if (list.length > 0) {
          const latest = list[0];
          setCurrentSessionId(latest.id);
          sessionIdRef.current = latest.id;
          const d = await fetch(`/api/chat-history?userId=${currentUser.id}&sessionId=${latest.id}`)
            .then(r => r.json()).catch(() => ({ messages: [] }));
          if (Array.isArray(d.messages) && d.messages.length > 0) setMessages(d.messages);
        } else {
          const sid = makeSessionId();
          setCurrentSessionId(sid);
          sessionIdRef.current = sid;
        }
      })
      .catch(() => {
        const sid = makeSessionId();
        setCurrentSessionId(sid);
        sessionIdRef.current = sid;
      })
      .finally(() => setHistoryLoaded(true));
  }, [currentUser?.id]);

  // Welcome message — only after history load confirms empty session
  useEffect(() => {
    if (!historyLoaded) return;
    if (messages.length === 0 && account?.username) {
      setMessages([makeWelcome(account.username, account.followers || 0)]);
    }
  }, [account?.username, historyLoaded]);

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
    const welcome = account?.username
      ? [makeWelcome(account.username, account.followers || 0)]
      : [];
    setMessages(welcome);
  }, [streaming, account]);

  // Switch to an existing session
  const loadSession = useCallback(async (sessId: string) => {
    if (streaming || sessId === sessionIdRef.current) return;
    setCurrentSessionId(sessId);
    sessionIdRef.current = sessId;
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
    // If deleting current session, start a new one
    if (sessId === sessionIdRef.current) newChat();
  }, [currentUser?.id, newChat]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const sessId  = sessionIdRef.current;
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
      setMessages(p => {
        const u = [...p];
        u[u.length - 1] = { role: "assistant", content: acc, ts: now() };
        // Cloud save (no localStorage)
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

  return { messages, setMessages, streaming, send, stop, sessions, currentSessionId, historyLoaded, newChat, loadSession, deleteSession };
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sarie = useSarieChat();
  const { sessions, currentSessionId, historyLoaded, newChat, loadSession, deleteSession } = sarie;
  const { currentUser } = useData();
  const searchParams = useSearchParams();
  const promptHandled = useRef(false);
  const sarieSendRef = useRef(sarie.send);
  sarieSendRef.current = sarie.send;


  // 1-second polling for global team messages
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fetchMsgs = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          if (data.messages && currentUser) {
            const reconstructed: Record<string, ChatMessage[]> = {
              dina: [], yassin: [], hesham: [], shahd: [], sara: [], haitham: [], shahdm: [], yousef: []
            };
            
            data.messages.forEach((rawMsg: any) => {
              const msg = typeof rawMsg === 'string' ? JSON.parse(rawMsg) : rawMsg;
              
              if (msg.senderId === currentUser.id) {
                // Sent by me
                if (reconstructed[msg.receiverId]) {
                  reconstructed[msg.receiverId].push({
                    id: msg.id, role: "user", content: msg.content, ts: msg.ts, status: "delivered", attachment: msg.attachment, isForwarded: msg.isForwarded, reactions: msg.reactions
                  });
                }
              } else if (msg.receiverId === currentUser.id) {
                // Sent to me
                if (reconstructed[msg.senderId]) {
                  reconstructed[msg.senderId].push({
                    id: msg.id, role: "assistant", content: msg.content, ts: msg.ts, status: "seen", attachment: msg.attachment, isForwarded: msg.isForwarded, reactions: msg.reactions
                  });
                }
              }
            });
            setTeamMessages(reconstructed);
          }
        }
      } catch (err) {}
      timeout = setTimeout(fetchMsgs, 1000);
    };
    
    fetchMsgs();
    return () => clearTimeout(timeout);
  }, [currentUser]);
  // Auto-send prompt from URL (e.g. from "Fix with AI" button on audit page)
  useEffect(() => {
    setReadReceipts(prev => ({ ...prev, [activeId]: (teamMessages[activeId] || []).length }));
  }, [activeId, teamMessages]);

  useEffect(() => {
    if (contextMenu === null) return;
    const clickHandler = () => setContextMenu(null);
    window.addEventListener("click", clickHandler);
    return () => window.removeEventListener("click", clickHandler);
  }, [contextMenu]);

  // Compute conversations dynamically
  const computedConversations = conversations.map(c => {
    if (c.isAI) return c;
    const msgs = teamMessages[c.id] || [];
    if (msgs.length === 0) return c;
    const lastMsg = msgs[msgs.length - 1];
    const readLen = readReceipts[c.id] || 0;
    const unread = Math.max(0, msgs.length - readLen);
    return {
      ...c,
      lastMessage: lastMsg.content || (lastMsg.attachment ? `[${lastMsg.attachment.type}]` : ""),
      time: lastMsg.ts || c.time,
      unread: c.id === activeId ? 0 : unread
    };
  });

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
      sarie.send(text || (pendingAttachment ? `[Sent: ${pendingAttachment.name}]` : ""));
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

    const isImage = file.type.startsWith("image");

    if (file.size > 800 * 1024 && !isImage) {
      alert("⚠️ File is too large! Since you don't have a storage bucket set up yet, please upload files under 800KB.");
      e.target.value = "";
      return;
    }

    if (isImage) {
      // Compress image
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX = 1200;
          if (width > height && width > MAX) {
            height *= MAX / width;
            width = MAX;
          } else if (height > MAX) {
            width *= MAX / height;
            height = MAX;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setPendingAttachment({ name: file.name, url: compressedBase64, type: "image" });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        const type: Attachment["type"] = file.type.startsWith("video") ? "video" : "file";
        setPendingAttachment({ name: file.name, url: base64Url, type });
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
      <style dangerouslySetInnerHTML={{__html: `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
body {
    font-family: "Inter", sans-serif;
    background-image: url(https://lh3.googleusercontent.com/aida/ADBb0uhCilLHmLfDhPMwiCs2nL08qwA6V4xXkJYQ4KtwbpzOH62ThNmDWsEtxzYscnGYjlnkSs9KqANozl3XsH_1co8MEq1TXxitKN8M_ZLcIfMUc-DYny0LMDOLM5Tt0mMigyTZCfAzzVB91vXKYlO7L7hsdofrt6vkvAAaiwsKoPmx8H-JHJyiR5sM-gNy-r6UYF4_Z61SW9RSycIBI7sRuqVXMtbvBMHknTg4V6fzeOS9J6BZeTdDTHgVCjdnfkDJv5uefwuLfcCg);
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center
    }
/* Scrollbar styling for a cleaner look */
::-webkit-scrollbar {
    width: 6px
    }
::-webkit-scrollbar-track {
    background: transparent
    }
::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px
    }
.rotated-images {
    position: relative;
    height: 250px;
    width: 300px;
    margin: 0 auto
    }
.rotated-img {
    position: absolute;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
    }
.img-1 {
    top: 0;
    left: 20px;
    z-index: 10;
    width: 200px;
    height: 140px;
    object-fit: cover;
    transform: rotate(-5deg)
    }
.img-2 {
    top: 70px;
    left: -20px;
    z-index: 5;
    width: 160px;
    height: 120px;
    object-fit: cover;
    transform: rotate(-15deg)
    }
.img-3 {
    top: 90px;
    left: 60px;
    z-index: 15;
    width: 220px;
    height: 150px;
    object-fit: cover;
    transform: rotate(5deg)
    }
.app-icon {
    width: 16px;
    height: 16px
    }
.avatar-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
}
.status-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid white;
}
.status-online { background-color: #22c55e; }
.status-away { background-color: #eab308; }
.status-busy { background-color: #ef4444; }
`}} />
      <div className="flex items-center justify-center h-screen w-full bg-white p-8" style={{
         fontFamily: "'Inter', sans-serif"
      }}>
        
{/*  BEGIN: MainContainer  */}
<div className="bg-[#f2f2f2] w-full max-w-[1600px] h-full rounded-[32px] overflow-hidden shadow-2xl flex relative text-[#2b2b2b] text-[14px]">
{/*  BEGIN: LeftSidebar  */}
<aside className="w-[200px] flex flex-col justify-between p-6 pl-8">
<div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
<nav className="space-y-2.5 mt-2 shrink-0 flex flex-col items-start">
  <button
    onClick={newChat}
    className="bg-[#2b2b2b] text-white rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-black transition-colors shadow-sm w-full"
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
  {sessions.length === 0 && historyLoaded && (
    <p className="text-[11px] text-gray-400 px-1 mt-4">No previous chats yet.</p>
  )}
  {(() => {
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
              <button
                onClick={() => loadSession(s.id)}
                className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-xl transition-colors text-[12px] ${s.id === currentSessionId ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'}`}
              >
                <MessageCircle size={13} className="text-gray-400 mt-0.5 shrink-0" />
                <span className="truncate">{s.title || "محادثة جديدة"}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all"
                title="Delete"
              >
                <X size={11} />
              </button>
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
<main className="flex-1 bg-[#fbfbfb] my-4 rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">
{/*  Top Bar  */}
<div className="absolute top-0 w-full flex justify-center py-4 bg-gradient-to-b from-[#fbfbfb] to-transparent z-10">
<button className="text-xs text-gray-800 font-semibold flex items-center gap-1 hover:text-black">
<span className="font-bold text-sm tracking-wider mr-1">Sarie 2.1</span> <i className="fa-solid fa-chevron-down text-[10px] ml-1 text-gray-500"></i>
</button>
</div>
<div className="flex-1 overflow-y-auto px-10 pt-16 pb-32 flex flex-col gap-8">
{messages.map((m, i) => {
  const isUser = m.role === "user";
  return (
    <div key={i} className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      <div className={`px-6 py-3.5 max-w-xl ${isUser ? "bg-[#2b2b2b] text-white rounded-[28px] rounded-br-none shadow-sm" : "bg-white rounded-[28px] rounded-bl-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-gray-800"}`} dir={!isUser ? "rtl" : "ltr"}>
        {m.attachment && m.attachment.type === "image" && (
          <img src={m.attachment.url} alt={m.attachment.name} className="w-full max-w-[240px] rounded-xl block mb-2" />
        )}
        {m.content && <MarkdownMessage content={m.content} />}
        {m.streaming && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-gray-400 rounded-sm align-middle animate-pulse" />
        )}
      </div>
      
      {/* Actions & Timestamp */}
      <div className={`flex items-center gap-3 mt-1 ${isUser ? "flex-row-reverse mr-2" : "ml-2"}`}>
        <span className="text-[10px] text-gray-400">{m.ts}</span>
        
        {/* Simple actions */}
        <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
          <button onClick={() => handleCopy(m.content)} className="text-gray-400 hover:text-gray-600 p-1"><Copy size={12}/></button>
          {!isUser && (
            <>
              <button className="text-gray-400 hover:text-gray-600 p-1"><i className="fa-regular fa-thumbs-up text-[10px]"></i></button>
              <button className="text-gray-400 hover:text-gray-600 p-1"><i className="fa-regular fa-thumbs-down text-[10px]"></i></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
})}
{streaming && (
  <div className="flex flex-col items-start gap-1">
    <div className="bg-white px-5 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md shadow-sm border border-gray-100 flex items-center gap-2">
      <Loader2 size={14} className="animate-spin text-gray-400" />
      <span className="text-sm text-gray-500">Thinking...</span>
    </div>
  </div>
)}
<div ref={bottomRef} />
</div>
<div className="absolute bottom-6 left-0 right-0 px-10 flex flex-col items-center">
  <div className="w-full max-w-2xl">
    {pendingAttachment && (
      <div className="bg-white rounded-2xl p-2 mb-2 shadow-sm border border-gray-100 flex items-center gap-3">
        {pendingAttachment.type === "image" && <img src={pendingAttachment.url} className="w-10 h-10 object-cover rounded-lg" />}
        <span className="text-xs text-gray-500 flex-1 truncate">{pendingAttachment.name}</span>
        <button onClick={() => setPendingAttachment(null)} className="text-gray-400 hover:text-red-500 p-1"><X size={14}/></button>
      </div>
    )}
    <div className="bg-[#f5f5f5] rounded-[32px] flex items-end px-4 py-2 relative">
      <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-gray-800 p-2 mb-1">
        <Plus size={20} />
      </button>
      <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
      
      <textarea 
        className="flex-1 border-none focus:outline-none outline-none focus:ring-0 bg-transparent text-[15px] text-gray-700 placeholder-gray-500 mx-4 resize-none py-2.5 max-h-[120px]" 
        placeholder={isAI ? "اسأل ساري..." : "Type your prompt"} 
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
      <button onClick={handleSend} disabled={!input.trim() && !pendingAttachment} className="bg-[#2b2b2b] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 mb-1 shrink-0">
        <Send size={16} className="-ml-0.5" />
      </button>
    </div>
  </div>
</div>
</main>
{/*  END: MainChatArea  */}
{/*  BEGIN: RightSidebar  */}
<aside className="w-[280px] p-6 pr-8 flex flex-col gap-6 overflow-y-auto">
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
{/*  Logo Floating Widget  */}
<div className="absolute bottom-8 right-8 flex items-end z-20">
  <img alt="Masaa Logo" className="w-20 object-contain drop-shadow-xl" src="/masmas.png" />
</div>
</div>
{/*  END: MainContainer  */}

      </div>
    </>
  );
}