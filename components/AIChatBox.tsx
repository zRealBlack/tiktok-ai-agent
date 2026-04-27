'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare, X, Send, Bot, User, Loader2,
  ChevronDown, Trash2, AlertCircle, Maximize2, Minimize2,
  Copy, Check, MoreVertical, Pencil, Share, Mic, Square, Volume2
} from "lucide-react";
import { useData } from "@/components/DataContext";
import MarkdownMessage from "@/components/MarkdownMessage";
import Image from "next/image";
import SarieAvatar from "@/public/sarie_generated.png";
import { usePathname } from "next/navigation";

export interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  streaming?: boolean;
}

export function dispatchAgentPrompt(prompt: string, imageUrl?: string) {
  window.dispatchEvent(new CustomEvent("agent-prompt", { detail: { prompt, imageUrl } }));
}

export default function AIChatBox() {
  const pathname = usePathname();
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
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Voice Integration State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [sarieVoice, setSarieVoice] = useState("nova");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const persistentAudioRef = useRef<HTMLAudioElement | null>(null);
  // Ref mirrors — always current, readable from any closure
  const isRecordingRef = useRef(false);
  const isProcessingVoiceRef = useRef(false);
  const isVoiceModeRef = useRef(false);
  const sarieVoiceRef = useRef("nova");
  const sendMessageRef = useRef<typeof sendMessage>(async () => {});
  const recognitionRef = useRef<any>(null);
  // TTS streaming queue — holds pre-fetched audio URL promises (no gap between sentences)
  const ttsQueueRef = useRef<Promise<string | null>[]>([]);
  const ttsPlayingRef = useRef(false);
  const ttsSpokenCountRef = useRef(0); // Caps spoken output to 2 sentences per response

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 60;
    setIsUserScrolled(isScrolledUp);
  }, []);

  // Push main content left when sidebar opens
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    if (open) {
      main.style.transition = 'margin-right 0.3s ease';
      main.style.marginRight = '380px';
    } else {
      main.style.marginRight = '0px';
    }
    return () => { main.style.marginRight = '0px'; };
  }, [open]);

  // Keep refs in sync with React state
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { isProcessingVoiceRef.current = isProcessingVoice; }, [isProcessingVoice]);
  useEffect(() => { isVoiceModeRef.current = isVoiceMode; }, [isVoiceMode]);
  useEffect(() => { sarieVoiceRef.current = sarieVoice; }, [sarieVoice]);

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
    const handler = (e: CustomEvent<{ prompt: string; imageUrl?: string }>) => {
      if (!open) setOpen(true);
      setTimeout(() => sendMessage(e.detail.prompt, e.detail.imageUrl), 150);
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

  const sendMessage = useCallback(async (text?: string, imageUrl?: string, baseMessages?: Message[], autoPlayTTS?: boolean) => {
    const msgText = (text ?? input).trim();
    if (!msgText || streaming) return;
    if (!text) setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: msgText, imageUrl };
    const newMessages = [...(baseMessages ?? messages), userMsg];
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
          messages: newMessages.map((m) => ({ role: m.role, content: m.content, imageUrl: m.imageUrl })),
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
      let sentenceBuffer = ""; // Holds partial sentence being built

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Flush remaining partial sentence (only if under 2-sentence cap)
          if (autoPlayTTS && sentenceBuffer.trim().length > 4 && ttsSpokenCountRef.current < 2) {
            ttsSpokenCountRef.current++;
            queueTTS(sentenceBuffer.trim());
          }
          ttsSpokenCountRef.current = 0; // Reset for next message
          break;
        }
        const newChunk = decoder.decode(value, { stream: true });
        accumulated += newChunk;
        sentenceBuffer += newChunk;

        // Detect completed sentences: ends with . ! ? ؟ followed by space or newline
        const sentenceRegex = /(.+?[.!?؟\n])(?:\s|$)/g;
        let match;
        let lastIndex = 0;
        while ((match = sentenceRegex.exec(sentenceBuffer)) !== null) {
          const sentence = match[1].trim();
          // Only speak the first 2 sentences — rest shown in text only (summary mode)
          if (autoPlayTTS && sentence.length > 4 && ttsSpokenCountRef.current < 2) {
            ttsSpokenCountRef.current++;
            queueTTS(sentence);
          }
          lastIndex = sentenceRegex.lastIndex;
        }
        if (lastIndex > 0) sentenceBuffer = sentenceBuffer.slice(lastIndex);

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
  }, [input, messages, streaming, account, videos, competitors, ideas, trends, generations, saveHistory, sarieVoice]);

  // Keep sendMessageRef always pointing to the latest version (no stale closure)
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages((prev) => {
      const u = [...prev];
      if (u[u.length - 1]?.streaming) u[u.length - 1] = { ...u[u.length - 1], streaming: false };
      return u;
    });
  };

  const deleteMessage = (index: number) => {
    setMessages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      saveHistory(updated);
      return updated;
    });
    setActiveMenu(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(index);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleEdit = (index: number, content: string) => {
    setEditingIndex(index);
    setEditValue(content);
  };

  const submitEdit = async (index: number) => {
    if (!editValue.trim() || streaming) return;
    
    // Discard all messages after the one being edited
    const truncated = messages.slice(0, index);
    const updatedUserMsg: Message = { ...messages[index], content: editValue.trim() };
    
    setEditingIndex(null);
    setMessages(truncated); // This will then be updated by sendMessage to include the new user msg
    sendMessage(editValue.trim(), updatedUserMsg.imageUrl, truncated);
  };

  const handleShare = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "محطة ساري للذكاء الاصطناعي",
          text: content,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") copyToClipboard(content, -1);
      }
    } else {
      copyToClipboard(content, -1);
    }
  };

  // Close menu on click outside
  useEffect(() => {
    if (activeMenu === null) return;
    const clickHandler = () => setActiveMenu(null);
    window.addEventListener("click", clickHandler);
    return () => window.removeEventListener("click", clickHandler);
  }, [activeMenu]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (persistentAudioRef.current) {
        persistentAudioRef.current.pause();
        persistentAudioRef.current.src = "";
      }
    };
  }, []);

  // Start a single speech recognition session
  const startRecognition = () => {
    if (!isVoiceModeRef.current || isProcessingVoiceRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice mode requires Chrome or Edge browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "ar-EG"; // Egyptian Arabic — Google's dialect-specific model
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      isRecordingRef.current = true;
      // Animate wave bars with CSS while listening
      document.querySelectorAll(".audio-wave-bar").forEach((b) => {
        (b as HTMLElement).style.animationPlayState = "running";
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript && transcript.length > 1) {
        setIsRecording(false);
        isRecordingRef.current = false;
        setIsProcessingVoice(true);
        isProcessingVoiceRef.current = true;
        sendMessageRef.current(transcript, undefined, undefined, true);
      }
    };

    recognition.onerror = (event: any) => {
      // "no-speech" is normal — just restart
      setIsRecording(false);
      isRecordingRef.current = false;
      if (isVoiceModeRef.current && event.error !== "aborted") {
        setTimeout(() => startRecognition(), 300);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      isRecordingRef.current = false;
      document.querySelectorAll(".audio-wave-bar").forEach((b) => {
        (b as HTMLElement).style.animationPlayState = "paused";
      });
      // Auto-restart if still in voice mode and not processing a reply
      if (isVoiceModeRef.current && !isProcessingVoiceRef.current) {
        setTimeout(() => startRecognition(), 300);
      }
    };

    recognition.start();
  };

  // Voice Interaction Logic
  const startVoiceMode = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice mode requires Chrome or Edge browser.");
      return;
    }
    // Unlock audio element on user click gesture (required by browsers)
    if (persistentAudioRef.current) {
      persistentAudioRef.current.src = "data:audio/mp3;base64,//OwgAAAAAAAAAAAAAAAAAAAAA";
      persistentAudioRef.current.play().catch(() => {});
    }
    setIsVoiceMode(true);
    isVoiceModeRef.current = true;
    startRecognition();
  };

  const stopVoiceMode = () => {
    isVoiceModeRef.current = false;
    setIsVoiceMode(false);
    setIsRecording(false);
    isRecordingRef.current = false;
    setIsProcessingVoice(false);
    isProcessingVoiceRef.current = false;
    ttsQueueRef.current = [];
    ttsPlayingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (persistentAudioRef.current) persistentAudioRef.current.pause();
  };

  // Pre-fetch TTS audio and return a URL promise immediately
  const fetchTTSAudio = async (text: string): Promise<string | null> => {
    const clean = text.replace(/[*_`#>]/g, "").trim();
    if (!clean || clean.length < 2) return null;
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean.slice(0, 500), voice: sarieVoiceRef.current }),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  };

  // Plays one pre-fetched audio URL, returns when done
  const playTTSRaw = async (audioUrl: string): Promise<void> => {
    if (!persistentAudioRef.current) return;
    await new Promise<void>((resolve) => {
      persistentAudioRef.current!.src = audioUrl;
      persistentAudioRef.current!.onended = () => resolve();
      persistentAudioRef.current!.onerror = () => resolve();
      persistentAudioRef.current!.play().catch(() => resolve());
    });
  };

  // Drain the TTS queue — audio was pre-fetched so no gap between sentences
  const processTTSQueue = async () => {
    if (ttsPlayingRef.current) return;
    ttsPlayingRef.current = true;
    while (ttsQueueRef.current.length > 0) {
      const audioPromise = ttsQueueRef.current.shift()!;
      const url = await audioPromise; // Already fetching in parallel — resolves quickly
      if (url) await playTTSRaw(url);
    }
    ttsPlayingRef.current = false;
    setIsProcessingVoice(false);
    isProcessingVoiceRef.current = false;
    // Resume listening after Sarie finishes speaking
    if (isVoiceModeRef.current) {
      setTimeout(() => startRecognition(), 300);
    }
  };

  // Queue a sentence: start fetching its audio immediately, process queue
  const queueTTS = (sentence: string) => {
    ttsQueueRef.current.push(fetchTTSAudio(sentence)); // Non-blocking fetch starts now
    processTTSQueue();
  };

  // Don't render on the dedicated /chat page — Sarie lives there natively
  // (placed after all hooks to respect Rules of Hooks)
  if (pathname === "/chat") return null;

  return (
    <>
      {/* Slim tab on right edge — click to open sidebar */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-2 py-5 px-2 rounded-l-2xl shadow-2xl transition-all duration-200 hover:px-3 group"
          style={{ background: 'var(--glass-panel-bg)', border: '1px solid var(--glass-border)', borderRight: 'none' }}
          aria-label="Open Sarie AI"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden relative shrink-0">
            <Image src={SarieAvatar} alt="Sarie" fill className="object-cover" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ writingMode: 'vertical-rl', color: 'var(--text-secondary)', transform: 'rotate(180deg)' }}>
            Sarie
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
        </button>
      )}

      {/* Sidebar overlay backdrop (subtle, not a full modal) */}
      {open && (
        <div
          className="fixed inset-0 z-30 pointer-events-none"
          style={{ background: 'transparent' }}
        />
      )}

      {/* The sidebar itself */}
      <div
        className={`fixed top-0 right-0 h-full z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          width: '380px',
          background: 'var(--glass-panel-bg)',
          borderLeft: '1px solid var(--glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 shrink-0 border-b" style={{ borderColor: 'var(--glass-border)' }}>
          <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 ring-2 ring-purple-500/30">
            <Image src={SarieAvatar} alt="Sarie" fill className="object-cover object-center" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>Mas Sarie</div>
            <div className="text-[11px] text-emerald-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block pulse-dot" />
              AI Content Strategist
            </div>
          </div>
          <div className="flex items-center gap-1">
            <select
              value={sarieVoice}
              onChange={(e) => setSarieVoice(e.target.value)}
              className="text-[11px] rounded-lg px-2 py-1 mr-1 glass-elevated outline-none"
              style={{ color: 'var(--text-muted)', background: 'transparent' }}
            >
              <option value="nova">Nova</option>
              <option value="alloy">Alloy</option>
              <option value="echo">Echo</option>
              <option value="fable">Fable</option>
              <option value="onyx">Onyx</option>
              <option value="shimmer">Shimmer</option>
            </select>
            {messages.length > 1 && (
              <button
                onClick={() => {
                  const greeting = [{ role: "assistant" as const, content: `الأيجنت شغال! عندي كل البيانات بتاعة ${account?.username} (${(account?.followers || 0).toLocaleString()} متابع). إيه اللي تحتاجه؟` }];
                  setMessages(greeting);
                  saveHistory(greeting);
                }}
                className="w-7 h-7 rounded-lg flex items-center justify-center glass-elevated hover:opacity-80 transition-all"
                title="مسح المحادثة"
              >
                <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center glass-elevated hover:opacity-80 transition-all"
              title="Close"
            >
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0" dir="rtl" ref={scrollRef} onScroll={handleScroll}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <div className="w-6 h-6 rounded-full glass-elevated flex shrink-0 mt-1 overflow-hidden justify-center relative">
                  <Image src={SarieAvatar} alt="Sarie" fill className="object-cover object-center" />
                </div>
              )}
              <div className="relative group max-w-[85%]">
                {editingIndex === i ? (
                  <div className="flex flex-col gap-2 w-full min-w-[260px]">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-transparent text-[13px] p-3 rounded-xl border outline-none focus:ring-1 focus:ring-purple-500/50"
                      style={{
                        background: 'var(--glass-elevated)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--glass-border)',
                        minHeight: '80px'
                      }}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitEdit(i)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-purple-600 text-white hover:bg-purple-500 transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        m.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                      }`}
                      style={m.role === "user"
                        ? { background: 'var(--glass-elevated)', color: 'var(--text-primary)', border: '1px solid var(--glass-elevated-border)' }
                        : { background: 'var(--glass-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--glass-elevated-border)' }}
                    >
                      {m.role === "user" && m.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.imageUrl} alt="Video cover" className="w-full rounded-lg mb-2 object-cover" style={{ maxHeight: '80px' }} />
                      )}
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

                    {/* Action Row */}
                    <div className="flex items-center gap-3 mt-1.5 px-1" dir="ltr">
                      {m.role === "user" && !m.streaming && (
                        <button
                          onClick={() => handleEdit(i, m.content)}
                          className="flex items-center gap-1 text-[11px] transition-opacity hover:opacity-80 opacity-0 group-hover:opacity-100"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Pencil size={11} /><span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => copyToClipboard(m.content, i)}
                        className="flex items-center gap-1 text-[11px] transition-opacity hover:opacity-80 opacity-0 group-hover:opacity-100"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {copiedId === i ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                        <span>{copiedId === i ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        onClick={() => handleShare(m.content)}
                        className="flex items-center gap-1 text-[11px] transition-opacity hover:opacity-80 opacity-0 group-hover:opacity-100"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Share size={11} /><span>Share</span>
                      </button>
                      <div className="relative ml-auto">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === i ? null : i); }}
                          className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical size={12} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        {activeMenu === i && (
                          <div
                            className="absolute bottom-full mb-2 right-0 z-[60] min-w-[130px] glass-chat rounded-xl border p-1 shadow-2xl"
                            style={{ borderColor: 'var(--glass-border)', direction: 'rtl' }}
                          >
                            <button
                              onClick={() => deleteMessage(i)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={11} />حذف الرسالة
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {m.role === "user" && (
                <div className="w-6 h-6 rounded-full glass-elevated flex items-center justify-center shrink-0 mt-1">
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
              <div className="glass-elevated px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-[12px]"
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

        {/* Prompt chips */}
        {messages.length <= 1 && (
          <div className="px-4 pt-2 pb-1 flex gap-2 overflow-x-auto" dir="rtl">
            {[
              "إيه أضعف نقطة عندي؟",
              "صلح أسوأ فيديو عندي",
              "إيه اللي بيعمله المنافسين صح؟",
            ].map((p) => (
              <button key={p} onClick={() => sendMessage(p)}
                className="shrink-0 text-[11px] glass-elevated px-3 py-1.5 rounded-full transition-all hover:opacity-80 whitespace-nowrap"
                style={{ color: 'var(--text-secondary)' }}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="px-4 py-4 border-t shrink-0 relative" style={{ borderColor: 'var(--glass-border)' }}>
          {/* Voice mode overlay */}
          {isVoiceMode && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-b-none bg-black/70 backdrop-blur-md border-t border-white/10 animate-in fade-in duration-300">
              <div className="mb-3 relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isProcessingVoice ? 'bg-purple-500/20' : isRecording ? 'bg-red-500/20' : 'bg-emerald-500/20'} ${!isProcessingVoice && 'animate-pulse'}`}>
                  {isProcessingVoice ? (
                    <Loader2 size={24} className="animate-spin text-purple-400" />
                  ) : (
                    <Mic size={24} className={isRecording ? "text-red-400" : "text-emerald-400"} />
                  )}
                </div>
                {isRecording && <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-50" />}
              </div>
              <div className="text-sm font-bold text-white mb-1">
                {isProcessingVoice ? "Sarie is thinking..." : isRecording ? "Listening..." : "Waiting for you to speak..."}
              </div>
              <div className="text-[11px] text-white/50 mb-4">Hands-free · ar-EG</div>
              <div className="flex items-center gap-1 h-7 mb-5">
                {[...Array(5)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`audio-wave-bar w-1.5 rounded-full ${isRecording ? 'bg-emerald-400' : 'bg-white/20'}`}
                    style={{ height: '100%', transformOrigin: 'center', transition: 'transform 0.05s', transform: 'scaleY(0.15)' }}
                  />
                ))}
              </div>
              <button
                onClick={stopVoiceMode}
                className="px-6 py-2.5 rounded-full bg-red-500/80 text-white font-bold text-xs hover:bg-red-500 transition-colors shadow-lg"
              >
                End Call
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 glass-input rounded-xl px-3 py-2.5">
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
            <button
              onClick={startVoiceMode}
              disabled={streaming || isVoiceMode}
              className="w-9 h-9 rounded-xl glass-elevated flex items-center justify-center shrink-0 transition-all hover:opacity-90 disabled:opacity-30 relative group"
              style={{ color: 'var(--text-secondary)' }}
              title="Start Voice Mode"
            >
              <Mic size={14} />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </button>
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

      <audio ref={persistentAudioRef} className="hidden" />
    </>
  );
}

