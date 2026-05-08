
'use client';
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { Send, Plus, Search, Phone, Video, MoreVertical, Smile, Check, CheckCheck, X, FileText, Film, Copy, Trash2, Pencil, Forward, MoreHorizontal, ArrowLeft, Mail, Phone as PhoneIcon, Clock } from "lucide-react";
import { useData } from "@/components/DataContext";
import MarkdownMessage from "@/components/MarkdownMessage";

// --- Types & Helpers ---
const EMOJIS = ["😂","❤️","🔥","👏","😮","😢","🤔","💯","🚀","✅","👍","🎉","💪","😍","🙏","⚡","🎯","💡","🤣","😎"];
const now = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const INITIAL_CONVERSATIONS = [
  { id: "sarie", name: "Sarie", isAI: true, lastMessage: "الأيجنت شغال! إيه اللي تحتاجه؟", time: "Now", unread: 0, online: true, role: "AI Content Strategist" },
  { id: "dina", name: "Dina Amer", isAI: false, lastMessage: "", time: "", unread: 0, online: true, role: "CEO & Podcaster" },
  { id: "yassin", name: "Yassin Gaml", isAI: false, lastMessage: "", time: "", unread: 0, online: true, role: "Developer / AI Specialist" },
  { id: "haitham", name: "Haitham Abdel-aziz", isAI: false, lastMessage: "", time: "", unread: 0, online: true, role: "Director & Head of Production" },
  { id: "shahd", name: "Shahd Sayed", isAI: false, lastMessage: "", time: "", unread: 0, online: true, role: "Ugc Creator" },
  { id: "sara", name: "Sara Hatem", isAI: false, lastMessage: "", time: "", unread: 0, online: true, role: "Marketing & Operation Management" },
  { id: "shahdm", name: "Shahd Mahmoud", isAI: false, lastMessage: "", time: "", unread: 0, online: true, role: "Community Manager" },
  { id: "yousef", name: "Yousef Hatem", isAI: false, lastMessage: "", time: "", unread: 0, online: true, role: "Ai Artist" },
];

function AvatarCircle({ name, src, size = 40, online }: { name: string; src?: string | null; size?: number; online?: boolean }) {
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

import { use } from "react";

export default function TeamChatPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { currentUser } = useData();
  const activeId = unwrappedParams.id;
  const activeConvo = INITIAL_CONVERSATIONS.find(c => c.id === activeId) || INITIAL_CONVERSATIONS[1];

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<any>(null);
  const [teamMessages, setTeamMessages] = useState<Record<string, any[]>>({});
  const [hoverMsg, setHoverMsg] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<string | null>(null);
  const [selectedForwards, setSelectedForwards] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<any>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1-second polling for global team messages
  useEffect(() => {
    let timeout: any;
    const fetchMsgs = async () => {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          if (data.messages && currentUser) {
            const reconstructed: Record<string, any[]> = {
              dina: [], yassin: [], hesham: [], shahd: [], sara: [], haitham: [], shahdm: [], yousef: []
            };
            
            data.messages.forEach((rawMsg: any) => {
              const msg = typeof rawMsg === 'string' ? JSON.parse(rawMsg) : rawMsg;
              
              if (msg.senderId === currentUser.id) {
                if (reconstructed[msg.receiverId]) {
                  reconstructed[msg.receiverId].push({
                    id: msg.id, role: "user", content: msg.content, ts: msg.ts, status: "delivered", attachment: msg.attachment, isForwarded: msg.isForwarded, reactions: msg.reactions
                  });
                }
              } else if (msg.receiverId === currentUser.id) {
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

  const messages = teamMessages[activeId] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleDelete = (index: number) => {
    const msgs = teamMessages[activeId as keyof typeof teamMessages] || [];
    const msgToDelete = msgs[index];
    
    setTeamMessages(prev => {
      const u = [...(prev[activeId as keyof typeof teamMessages] || [])];
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
    setActiveMenu(null);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setActiveMenu(null);
  };

  const handleEdit = (index: number, content: string) => {
    setInput(content);
    handleDelete(index);
    setActiveMenu(null);
  };

  const handleForward = (content: string) => {
    setForwardingMsg(content as any);
    setActiveMenu(null);
  };

  const confirmForward = (targetIds: string[]) => {
    if (!forwardingMsg || !currentUser) return;
    
    targetIds.forEach(targetId => {
      const msgId = Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);
      const msg = { id: msgId, role: "user", content: forwardingMsg, ts: now(), isForwarded: true, status: "sent" };
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
    
    const msgId = Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);
    const msg = { id: msgId, role: "user", content: text || "", ts: now(), status: "sent", ...(pendingAttachment ? { attachment: pendingAttachment } : {}) };
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
    
    setTimeout(() => {
      setTeamMessages(prev => {
        const arr = [...(prev[activeId] || [])];
        if (arr.length > 0) arr[arr.length - 1] = { ...arr[arr.length - 1], status: "delivered" };
        return { ...prev, [activeId]: arr };
      });
    }, 600);
    
    setInput("");
    setPendingAttachment(null);
  };

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image");

    if (file.size > 800 * 1024 && !isImage) {
      alert("⚠️ File is too large!");
      e.target.value = "";
      return;
    }

    if (isImage) {
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
        setPendingAttachment({ name: file.name, url: reader.result, type: file.type.startsWith("video") ? "video" : "file" });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const addReaction = (msgIdx: number, emoji: string) => {
    let targetMsg: any;
    setTeamMessages(prev => {
      const msgs = [...(prev[activeId as keyof typeof teamMessages] || [])];
      const m = { ...msgs[msgIdx] };
      targetMsg = m;
      const existing = m.reactions || [];
      m.reactions = existing.includes(emoji) ? existing.filter((r: string) => r !== emoji) : [...existing, emoji];
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

  return (
    <div className="h-screen w-full bg-white flex items-center justify-center p-8" style={{
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="w-full max-w-[1600px] h-full bg-[#f2f2f2] rounded-[32px] overflow-hidden shadow-2xl flex relative text-[#2b2b2b] text-[14px]">
        {/* LeftSidebar (User Info) */}
        <aside className="w-[200px] flex flex-col justify-between p-6 pl-8">
          <div className="space-y-4 pt-4 flex-1 flex flex-col h-full overflow-hidden">
            <nav className="space-y-2.5 mt-2 shrink-0 flex flex-col items-start">
              <Link href="/" className="bg-[#2b2b2b] text-white rounded-[20px] py-2 px-5 flex items-center gap-2 text-[13px] font-medium hover:bg-black transition-colors shadow-sm w-full">
                <ArrowLeft size={14} className="text-gray-300" />
                Back
              </Link>
            </nav>
            <div className="flex flex-col items-center mt-10">
              <div className="relative mb-4">
                <AvatarCircle name={activeConvo.name} size={96} online={activeConvo.online} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{activeConvo.name}</h2>
              <p className="text-xs text-gray-500 mt-1 text-center">{activeConvo.role}</p>
              <div className="mt-3 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 flex items-center gap-2">
                <Clock size={11} /> 09:42 AM (Local)
              </div>
            </div>
            <div className="mt-6 space-y-5">
              <div>
                <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">About</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed">Focusing on product messaging and user flows for the upcoming Q3 launch campaign.</p>
              </div>
              <div>
                <h3 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">Contact Info</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2.5 text-[11px] text-gray-600"><Mail size={11} className="text-gray-400 shrink-0" /> {activeConvo.id}@mas.ai</li>
                  <li className="flex items-center gap-2.5 text-[11px] text-gray-600"><PhoneIcon size={11} className="text-gray-400 shrink-0" /> +1 (555) 019-2834</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>

        {/* MainChatArea */}
        <main className="flex-1 bg-[#fbfbfb] my-4 rounded-[24px] shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 w-full flex justify-between items-center px-8 py-4 bg-gradient-to-b from-[#fbfbfb] to-transparent z-10 border-none">
            <div className="flex items-center gap-3">
              <AvatarCircle name={activeConvo.name} size={32} online={activeConvo.online} />
              <div>
                <h2 className="font-bold text-gray-800 text-base">{activeConvo.name}</h2>
                <p className="text-xs text-gray-500 font-medium">{activeConvo.online ? "Active now" : "Offline"}</p>
              </div>
            </div>
            <div className="flex gap-4 text-gray-400">
              <button className="hover:text-gray-600 transition-colors"><Phone size={18} /></button>
              <button className="hover:text-gray-600 transition-colors"><Video size={18} /></button>
              <button className="hover:text-gray-600 transition-colors"><MoreVertical size={18} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-10 pt-24 pb-32 flex flex-col gap-6">
            <div className="text-center text-xs text-gray-400 my-2 font-medium">Today, 10:45 AM</div>
            {messages.length === 0 && <div className="text-center text-gray-400 text-sm mt-10">No messages yet. Send a message to start the conversation!</div>}
            
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
                  onMouseEnter={() => setHoverMsg(i)}
                  onMouseLeave={() => setHoverMsg(null)}
                >
                  <div 
                    onContextMenu={(e) => { e.preventDefault(); setContextMenu({ msgIdx: i }); }}
                    className="relative group flex items-end gap-2"
                    style={{ flexDirection: isUser ? "row-reverse" : "row", maxWidth: "100%" }}
                  >
                    {!isUser && <AvatarCircle name={activeConvo.name} size={24} />}
                    <div className={`${isUser ? 'bg-[#2b2b2b] text-white rounded-[28px] rounded-br-none shadow-sm' : 'bg-white rounded-[28px] rounded-bl-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-gray-800'} px-6 py-3.5 max-w-xl relative`}>
                      {m.attachment && m.attachment.type === "image" && <img src={m.attachment.url} alt="" className="w-full max-w-[240px] rounded-xl block mb-2" />}
                      {m.attachment && m.attachment.type === "video" && <video src={m.attachment.url} controls className="w-full max-w-[240px] rounded-xl block mb-2" />}
                      {m.attachment && m.attachment.type === "file" && (
                        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                          <FileText size={18} color={isUser ? "#fff" : "var(--text-muted)"} />
                          <span className="text-xs font-semibold">{m.attachment.name}</span>
                        </div>
                      )}
                      {m.isForwarded && <div className={`text-[10px] ${isUser ? "text-white/70" : "text-gray-400"} mb-1 italic flex items-center gap-1`}><Forward size={10} /> Forwarded</div>}
                      
                      {m.content && <MarkdownMessage content={m.content} />}

                      {/* Action Menu */}
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isUser ? 'right-full mr-2' : 'left-full ml-2'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                         <button onClick={() => handleForward(m.content)} title="Forward" className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-100"><Forward size={12} /></button>
                         <button onClick={() => handleCopy(m.content)} title="Copy" className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-100"><Copy size={12} /></button>
                         {isUser && (
                           <div className="relative">
                             <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === i ? null : i); }} className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm border border-gray-100"><MoreHorizontal size={12} /></button>
                             {activeMenu === i && (
                               <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl p-1 shadow-md z-20 min-w-[100px]">
                                 <button onClick={() => handleEdit(i, m.content)} className="w-full flex items-center gap-2 text-gray-700 text-xs py-2 px-3 hover:bg-gray-50 rounded-lg"><Pencil size={12}/> Edit</button>
                                 <button onClick={() => handleDelete(i)} className="w-full flex items-center gap-2 text-red-500 text-xs py-2 px-3 hover:bg-red-50 rounded-lg"><Trash2 size={12}/> Delete</button>
                               </div>
                             )}
                           </div>
                         )}
                      </div>
                    </div>
                  </div>

                  {m.reactions && m.reactions.length > 0 && (
                    <div className={`flex gap-1 mt-1 ${isUser ? 'mr-4' : 'ml-8'} flex-wrap`}>
                      {m.reactions.map((r: string, ri: number) => <span key={ri} onClick={() => addReaction(i, r)} className="text-xs cursor-pointer bg-white rounded-full px-2 py-0.5 border border-gray-100 shadow-sm">{r}</span>)}
                    </div>
                  )}

                  <div className={`flex items-center gap-1 text-[10px] text-gray-400 ${isUser ? 'mr-2' : 'ml-8'}`}>
                    {m.ts || now()}
                    {isUser && ((!m.status || m.status === "seen") ? <CheckCheck size={12} className="text-blue-500" /> : m.status === "delivered" ? <CheckCheck size={12} className="text-gray-400" /> : <Check size={12} className="text-gray-400" />)}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="absolute bottom-6 left-0 right-0 px-10 flex flex-col items-center">
            <div className="w-full max-w-2xl flex flex-col gap-2 relative">
              {pendingAttachment && (
                <div className="bg-white rounded-2xl flex items-center gap-3 p-3 shadow-md border border-gray-100 max-w-sm self-end">
                  {pendingAttachment.type === "image" && <img src={pendingAttachment.url} alt="" className="w-10 h-10 object-cover rounded-lg" />}
                  {pendingAttachment.type === "video" && <Film size={18} className="text-gray-400" />}
                  {pendingAttachment.type === "file" && <FileText size={18} className="text-gray-400" />}
                  <span className="flex-1 text-xs text-gray-600 truncate">{pendingAttachment.name}</span>
                  <button onClick={() => setPendingAttachment(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                </div>
              )}
              {showEmoji && (
                <div className="absolute bottom-full right-16 mb-2 bg-white border border-gray-100 rounded-2xl p-3 shadow-md flex flex-wrap gap-1 max-w-[200px] z-50">
                  {EMOJIS.map(e => <button key={e} onClick={() => { setInput(v => v + e); setShowEmoji(false); }} className="text-xl p-1 hover:bg-gray-100 rounded-lg">{e}</button>)}
                </div>
              )}
              {forwardingMsg && (
                <div className="absolute bottom-full left-0 right-0 mb-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 z-50 max-w-md mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm">Forward to...</h4>
                    <button onClick={() => setForwardingMsg(null)} className="text-gray-400"><X size={16} /></button>
                  </div>
                  <div className="max-h-48 overflow-y-auto flex flex-col gap-2 mb-4">
                    {INITIAL_CONVERSATIONS.filter(c => !c.isAI).map(c => (
                      <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer">
                        <input type="checkbox" className="rounded text-red-500 focus:ring-red-500" checked={selectedForwards.includes(c.id)} onChange={(e) => { if (e.target.checked) setSelectedForwards(p => [...p, c.id]); else setSelectedForwards(p => p.filter(id => id !== c.id)); }} />
                        <span className="text-sm font-medium text-gray-700">{c.name}</span>
                      </label>
                    ))}
                  </div>
                  <button className="w-full bg-red-500 text-white rounded-xl py-2 text-sm font-bold disabled:opacity-50" disabled={selectedForwards.length === 0} onClick={() => confirmForward(selectedForwards)}>Send</button>
                </div>
              )}
              <div className="bg-[#f5f5f5] rounded-[32px] flex items-end px-4 py-2 relative">
                <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-gray-700 p-2 mb-1 rounded-xl hover:bg-white/60 transition-colors">
                  <Plus size={18} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
                <button onClick={() => setShowEmoji(!showEmoji)} className={`p-2 mb-1 rounded-xl hover:bg-white/60 transition-colors ${showEmoji ? 'text-red-500' : 'text-gray-400 hover:text-gray-700'}`}><Smile size={18} /></button>
                <textarea
                  className="flex-1 border-none focus:outline-none outline-none focus:ring-0 bg-transparent text-[14px] text-gray-700 placeholder-gray-400 mx-3 resize-none py-2.5 max-h-[120px]"
                  placeholder="Type a message..."
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
                  style={{ minHeight: '40px' }}
                />
                <button onClick={handleSend} disabled={!input.trim() && !pendingAttachment} className="send-btn bg-[#2b2b2b] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black disabled:opacity-30 mb-1 shrink-0">
                  <Send size={14} className="-ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* RightSidebar (Team Chat List) */}
        <aside className="w-[280px] p-6 pr-8 flex flex-col gap-6 overflow-y-auto">
          <div className="flex justify-between items-center pt-2">
            <h3 className="text-[13px] font-bold text-gray-800 flex items-center gap-2">Team Chat</h3>
            <button className="text-gray-400 hover:text-gray-600 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-gray-100">
              <Plus size={10} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input className="w-full bg-[#fbfbfb] border border-gray-100 rounded-full py-2 pl-8 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-gray-200 shadow-sm placeholder-gray-400 text-gray-700" placeholder="Search team..." type="text"/>
          </div>
          <div className="space-y-2 mt-2">
            {INITIAL_CONVERSATIONS.filter(c => !c.isAI).map(c => (
              <Link key={c.id} href={`/team-chat/${c.id}`} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${activeId === c.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                <AvatarCircle name={c.name} size={36} online={c.online} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{c.name}</h4>
                    <span className="text-[9px] text-gray-400">{c.time || '1h'}</span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-500 truncate">{c.lastMessage || '...'}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
