'use client';
import Link from 'next/link';

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Send, Loader2, Square, Search, Phone, Video, MoreVertical, Smile, Paperclip, Check, CheckCheck, X, FileText, Film, Copy, Trash2, Pencil, Forward, MoreHorizontal, ArrowLeft } from "lucide-react";
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

// ─── Sarie AI hook ────────────────────────────────────────────────────────────

function useSarieChat() {
  const { account, videos, competitors, ideas, trends, generations, currentUser } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load chat history from KV on mount (cloud-backed, no localStorage)
  useEffect(() => {
    if (!currentUser?.id) { setHistoryLoaded(true); return; }
    fetch(`/api/chat-history?userId=${currentUser.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.messages) && data.messages.length > 0) setMessages(data.messages); })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, [currentUser?.id]);

  // Show welcome message only after history load confirms no existing chat
  useEffect(() => {
    if (!historyLoaded) return;
    if (messages.length === 0 && account?.username) {
      setMessages([{
        role: "assistant",
        content: `الأيجنت شغال! عندي كل البيانات بتاعة ${account.username} (${(account.followers || 0).toLocaleString()} متابع). إيه اللي تحتاجه؟`,
        ts: now(),
      }]);
    }
  }, [account?.username, historyLoaded]);

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
        // Save to KV (cloud — no localStorage)
        if (currentUser?.id) {
          fetch("/api/chat-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, messages: u }),
          }).catch(() => {});
          // Trigger memory reflection every 8 assistant messages
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
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<string | null>(null);
  const [selectedForwards, setSelectedForwards] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ msgIdx: number } | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [readReceipts, setReadReceipts] = useState<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sarie = useSarieChat();
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
        if (currentUser?.id) {
          fetch("/api/chat-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUser.id, messages: u }),
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
      <div className="flex items-center justify-center min-h-screen w-full" style={{
         backgroundImage: "url(https://lh3.googleusercontent.com/aida/ADBb0uhCilLHmLfDhPMwiCs2nL08qwA6V4xXkJYQ4KtwbpzOH62ThNmDWsEtxzYscnGYjlnkSs9KqANozl3XsH_1co8MEq1TXxitKN8M_ZLcIfMUc-DYny0LMDOLM5Tt0mMigyTZCfAzzVB91vXKYlO7L7hsdofrt6vkvAAaiwsKoPmx8H-JHJyiR5sM-gNy-r6UYF4_Z61SW9RSycIBI7sRuqVXMtbvBMHknTg4V6fzeOS9J6BZeTdDTHgVCjdnfkDJv5uefwuLfcCg)",
         backgroundSize: "cover",
         backgroundPosition: "center",
         fontFamily: "'Inter', sans-serif"
      }}>
        
{/*  BEGIN: MainContainer  */}
<div className="bg-[#f2f2f2] w-full max-w-[1400px] h-[85vh] rounded-[32px] shadow-2xl flex overflow-hidden relative backdrop-blur-sm bg-opacity-95 text-[#2b2b2b] text-[14px]">
{/*  BEGIN: LeftSidebar  */}
<aside className="w-[200px] flex flex-col justify-between p-6 pl-8">
<div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
<button className="w-full bg-[#2b2b2b] text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium hover:bg-black transition-colors shrink-0">
<i className="fa-solid fa-plus text-xs"></i>
          New Chat
        </button>
<nav className="space-y-1 mt-6 shrink-0">
<Link className="flex items-center gap-3 px-4 py-2.5 text-gray-600 bg-white rounded-full transition-all shadow-sm" href="/dashboard">
<i className="fa-solid fa-chart-pie text-[#a3a3a3]"></i>
            Dashboard
          </Link>
</nav>
{/*  History Log Moved to Left Sidebar  */}
<div className="space-y-6 mt-8 flex-1 overflow-y-auto pr-2">
{/*  Today  */}
<div>
<h4 className="text-xs font-semibold text-gray-800 mb-3 flex items-center gap-1">
            Today <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
</h4>
<ul className="space-y-3 text-xs text-gray-500">
<li className="flex items-center gap-2 truncate hover:text-gray-800 cursor-pointer">
<i className="fa-regular fa-comment text-[10px]"></i> Generate an image of a lo..
            </li>
<li className="flex items-center gap-2 truncate hover:text-gray-800 cursor-pointer">
<i className="fa-regular fa-comment text-[10px]"></i> What is the capital of Unit..
            </li>
</ul>
</div>
{/*  Friday, March 26, 2026  */}
<div>
<h4 className="text-xs font-semibold text-gray-800 mb-3 flex items-center gap-1">
            Friday, March 26, 2026 <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
</h4>
<ul className="space-y-3 text-xs text-gray-500">
<li className="flex items-center gap-2 truncate hover:text-gray-800 cursor-pointer">
<i className="fa-regular fa-comment text-[10px]"></i> Generate a pencil sketch...
            </li>
<li className="flex items-center gap-2 truncate hover:text-gray-800 cursor-pointer">
<i className="fa-regular fa-comment text-[10px]"></i> What's the best way to s..
            </li>
</ul>
</div>
{/*  Friday, March 20, 2026  */}
<div>
<h4 className="text-xs font-semibold text-gray-800 mb-3 flex items-center gap-1">
            Friday, March 20, 2026 <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
</h4>
<ul className="space-y-3 text-xs text-gray-500">
<li className="flex items-center gap-2 truncate hover:text-gray-800 cursor-pointer">
<i className="fa-regular fa-comment text-[10px]"></i> Compose an email to HR...
            </li>
</ul>
</div>
</div>
</div>
<div className="pb-4 shrink-0 mt-4">
<button className="w-full bg-[#ef4444] text-white rounded-full py-2 px-4 flex items-center justify-center gap-2 text-xs font-medium hover:bg-[#dc2626] transition-colors shadow-sm">
<i className="fa-solid fa-user-shield"></i>
          Team Login
        </button>
</div>
</aside>
{/*  END: LeftSidebar  */}
{/*  BEGIN: MainChatArea  */}
<main className="flex-1 bg-[#fbfbfb] my-4 rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">
{/*  Top Bar  */}
<div className="absolute top-0 w-full flex justify-center py-4 bg-gradient-to-b from-[#fbfbfb] to-transparent z-10">
<button className="text-xs text-gray-500 font-medium flex items-center gap-1 hover:text-gray-700">
<span className="text-[#ef4444] font-bold text-sm tracking-wider mr-1">MAS</span> AI Studio Workspace <i className="fa-solid fa-chevron-down text-[10px] ml-1"></i>
</button>
</div>
{/*  Chat History  */}
<div className="flex-1 overflow-y-auto px-10 pt-16 pb-32 flex flex-col gap-8">
{/*  User Message 1  */}
<div className="flex flex-col items-end gap-1">
<div className="bg-[#333333] text-white px-5 py-3 rounded-t-2xl rounded-bl-2xl rounded-br-md max-w-xl shadow-sm">
            Generate a realistic image of an elephant drinking water
          </div>
<span className="text-[10px] text-gray-400 mr-2">11:22</span>
</div>
{/*  Assistant Message 1  */}
<div className="flex flex-col items-start gap-1">
<div className="bg-white px-5 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md max-w-xl shadow-sm border border-gray-100">
            Sure! now generating images of an elephant drinking water
          </div>
<span className="text-[10px] text-gray-400 ml-2">11:22</span>
</div>
{/*  User Message 2  */}
<div className="flex flex-col items-end gap-1">
<div className="bg-[#333333] text-white px-5 py-3 rounded-t-2xl rounded-bl-2xl rounded-br-md max-w-xs shadow-sm">
            Make it hyper realistic
          </div>
<span className="text-[10px] text-gray-400 mr-2">11:22</span>
</div>
{/*  Assistant Message 2 with Images  */}
<div className="flex flex-col items-start gap-3 w-full">
<div className="flex flex-col items-start gap-1">
<div className="bg-white px-5 py-3 rounded-t-2xl rounded-br-2xl rounded-bl-md max-w-xl shadow-sm border border-gray-100">
              Of course! Here's what I created
            </div>
<span className="text-[10px] text-gray-400 ml-2">11:22</span>
</div>
{/*  Image Collage  */}
<div className="rotated-images mt-4 mb-8 self-center">
<img alt="Elephant drinking" className="rotated-img img-1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBc4rkap7cPv3E7V5Ax4Stsn3UXd3kOwFtVO0GPtErqMPPjQDw6lkUNAGfsMq6eYkULS4LY-2WFlfXT6L0mWeQjKgy-CmxmVCq6b6FDNk200t8QVS3aY91XaquEjHi9lJr79ynzgnu7_X05OpdsQcKpr5j1oe-d_Jcc4dOdKUgYerbwSkhEflu_Y7QHBCYxxmFpEOIrXjuzpb39LYvrLzlTeCvfQh1k0-_w6nTvfNITAEMy_TADU7S3lj5gXkKJm8vZTwsAlb6IDA"/>
<img alt="Elephant in dirt" className="rotated-img img-2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA44NrGRaPR9GN0QjjEkBr-FfQjJVrbjBy0eHjL1GKZC92ArjeyAn1uCDtakfFuDCJRG9KdEX1yGJ1zmY5t0kWCUC87w7sgE2EEXniP7w4NDhUKuXqltnz_OIvYWC_6CpgBz-i9YQL86wSsYZJSSQRLVRYbSEg4XaT_p6QJVbJot1qqmVEr6KkqqniPZ2t2ytJiiVCEqiTUc9fqdD7HrL0rIdsLYCTYZvHfP7psxOBM1sxfO_dcPjYri0wPsiY4eIxzg9aXZPnwDg"/>
<img alt="Elephant in water" className="rotated-img img-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbZlIGT35-4k2Jni28zHs9qZMYqwUOQFtaIn6zOYHx4r1JmFSKJGMRlxyLslj3SwiRFBfQSisuNqWpcpO-V46Nlqc-iXmEwcNJ9jNsX8-BtZgEgeeZofb580OaxGHLzuTipV1TBgRg3kIgbMdIX46XHMKXt_wPfUBDX-qgNe3ftaLd2YL5XCt2wcSDGtQdiWcgO5CapckIRjBJ9ArvRRF3bqnK5--QxWRAaqqKQRN9lpDG8lrM3TD8NphMWCUJBKHJ1DbheVixUA"/>
</div>
<div className="flex justify-between w-full px-4 text-gray-400">
<button className="flex items-center gap-2 hover:text-gray-600 text-sm">
<i className="fa-regular fa-rotate-right"></i> Retry
             </button>
<div className="flex gap-4">
<button className="hover:text-gray-600"><i className="fa-regular fa-thumbs-up"></i></button>
<button className="hover:text-gray-600"><i className="fa-regular fa-thumbs-down"></i></button>
</div>
</div>
</div>
</div>
{/*  Input Area  */}
<div className="absolute bottom-6 left-0 right-0 px-10">
<div className="bg-white rounded-full flex items-center px-4 py-2 shadow-md border border-gray-100">
<button className="text-gray-400 hover:text-gray-600 p-2">
<i className="fa-solid fa-plus"></i>
</button>
<input className="flex-1 border-none focus:ring-0 bg-transparent text-center text-sm text-gray-600 placeholder-gray-400 mx-4" placeholder="Type your prompt" type="text"/>
<button className="bg-[#333333] text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition-colors">
<i className="fa-regular fa-paper-plane text-xs"></i>
</button>
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
{/*  Team Members List  */}
<div className="space-y-4 mt-2">
{/*  Member 1  */}
<div className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
<div className="relative">
<img alt="Sarah K." className="avatar-img shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA18Oh_ZVYFNp5PaAvsqoe5WMEjDliUEZCc-rHCVp7u4MqU_tRNyBLQBH6scGpRXk8qEqurmOyES_gXZ_WDuU_IDUzELQUhJ2d_Q2PA4MW2iB-wuKYb1O3wjmMyB4ddiiU2RrBHCeZFvpVhP29Hc0GAZ1JaHg4UFcPDOvuQZW1xSuHbz7Ikf8sSX5aHJBkkdUksKnzp4Wm1ZyZMHi0acM-0bA01YDcrPzpjLEx5yUsl1fKZ34MNhKe967w2O7wAkGGdQto2wn29hA"/>
<div className="status-indicator status-online"></div>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="text-xs font-semibold text-gray-800 truncate">Sarah K.</h4>
<span className="text-[9px] text-gray-400">1m</span>
</div>
<p className="text-[11px] text-gray-500 truncate">I'll check the design files now.</p>
</div>
</div>
{/*  Member 2  */}
<div className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
<div className="relative">
<img alt="Alex M." className="avatar-img shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN70FYFZyEyUJw8Epzfa_tdHqi30fLeRnWBNvrE5yQUQLhPOrQvdQ1s-i9jg586ko0Qs06lse0Pt-WPx0ytq_23TYVQv3C18gvqwCWTSfGW01vTdFT4QTS617FLnePNCJDd2OKOKo6rfHZeHt5gGdlyGeaIINXQetPlo-1G0wmj3HQ_PnyY5yuINIm2qz6FV6ApJWiuuVrBpg4UeMMaxBZ78UawW1APraznTRFQDKoInxtj8wVCoI82wyXHo3rwMEuN7i-qr5xeA"/>
<div className="status-indicator status-away"></div>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="text-xs font-semibold text-gray-800 truncate">Alex M.</h4>
<span className="text-[9px] text-gray-400">12m</span>
</div>
<p className="text-[11px] text-gray-500 truncate">Can we review the PR?</p>
</div>
</div>
{/*  Member 3  */}
<div className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
<div className="relative">
<img alt="David L." className="avatar-img shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8wP-119dq8BAZqeBT1FRNpl1SoLMnfy09Fz9NyK3Ih2wcInQdt6LcF-KxESnochMS5bMJtVcgZQWn3Is27DS8bfhl0ufRkHEnQlDvaKIO_fMBlxe6JuIgB84R-3O4IUKTfmDNV5d8WYUdTgFSsC6bOzikj7njqtPnklwZN5B7WI7OkOwhATnJ5JdJ-J7L3wPxhJDu4TOoX-VQq9wWGC3dFsGgvKo8ZBvtJaq55v_9TIfynA7CUuJatblorGKBwTMiVtou55WlFA"/>
<div className="status-indicator status-busy"></div>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="text-xs font-semibold text-gray-800 truncate">David L.</h4>
<span className="text-[9px] text-gray-400">1h</span>
</div>
<p className="text-[11px] text-gray-500 truncate">In a meeting, back later.</p>
</div>
</div>
{/*  Member 4  */}
<div className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
<div className="relative">
<img alt="Emily R." className="avatar-img shadow-sm opacity-60" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCspKC7yE_vCgt7rgJ2QQyq9H0taa8I4sEyRUSdPejqPogCAiv0-QH_eDGfsba8Fr1-ROWF0xPFE-8yC_Mxf3SU7eGqAolsGqJ-Dq6B84R_FI5ai6_GLTAg1p-lYBdrN7MD6G_Rb5Wt6e8EZgvdHr7ohZB623zXDze9PSbb9xg1H-R0Vt5iE5PJutekNFytpTIPOce0J8Z0FsU8tgLqsWgxqOcotDZ-kcMOs4KNbRmaK3jSKvRr3N870nu0OoevvSSaQ1whgAto7w"/>
<div className="status-indicator bg-gray-300"></div>
</div>
<div className="flex-1 min-w-0">
<div className="flex justify-between items-baseline">
<h4 className="text-xs font-semibold text-gray-800 truncate">Emily R.</h4>
<span className="text-[9px] text-gray-400">Yesterday</span>
</div>
<p className="text-[11px] text-gray-500 truncate">Thanks for the update!</p>
</div>
</div>
</div>
</aside>
{/*  END: RightSidebar  */}
{/*  Assistant Avatar Floating Widget  */}
<div className="absolute bottom-8 right-8 flex items-end gap-3 z-20">
<div className="bg-black text-white text-xs px-4 py-2 rounded-2xl rounded-br-sm shadow-lg mb-4">
        Hi, How can i help<br />you today?
      </div>
<img alt="Robot Assistant" className="w-16 h-16 object-cover rounded-full drop-shadow-xl border-2 border-white bg-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC8o0Dh-48odiXykGf9dXZ3HQkqIfgf9DTRu5eek1doIbEYtT3mV9F81Cy0qYDCLwiee969EF8rp7BbSKDfanY00VuM7fdfaI5ep1w21ALHKbPuxkPnI6gSjMFcyH-A_4CAA37vlxHFk2pGPo5LeOezJJbSGhBXzZ8pz6cZQkiCn-j75BUoOxkfoudEM5roWGn3ZNugRg5ryjuqujKC1VbF1_LKy_SrkhUusodJAw_WiJctH9uPZBHfrOrf070sDEU62d6PK_FUA"/>
</div>
</div>
{/*  END: MainContainer  */}

      </div>
    </>
  );
}