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
  const [sarieVoice, setSarieVoice] = useState("nova"); // default voice
  const [isVoiceMode, setIsVoiceMode] = useState(false); // Continuous Voice Mode
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const persistentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      if (autoPlayTTS) {
        playTTS(accumulated);
      }
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setMessages((prev) => prev.filter((m) => !m.streaming));
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming, account, videos, competitors, ideas, trends, generations, saveHistory, sarieVoice]);

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

  // Voice mode cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (persistentAudioRef.current) {
        persistentAudioRef.current.pause();
        persistentAudioRef.current.src = "";
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Voice Interaction Logic
  const startVoiceMode = async () => {
    try {
      if (persistentAudioRef.current) {
        // Play a silent snippet to unlock the audio element during a user-initiated click
        persistentAudioRef.current.src = "data:audio/mp3;base64,//OwgAAAAAAAAAAAAAAAAAAAAA";
        persistentAudioRef.current.play().catch(() => {});
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsVoiceMode(true);
      startListeningLoop(stream);
    } catch (err) {
      setError("Microphone access denied");
    }
  };

  const startListeningLoop = (stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioCtx = audioContextRef.current;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    
    // WebKit/Chrome bug fix: The analyser will output 0s if the stream isn't connected to a destination.
    // We connect it to a muted gain node, then to the destination to force audio processing.
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let isSpeaking = false;
    let silenceStart = Date.now();
    const threshold = 15; // Increased threshold to avoid background noise triggering it
    const silenceDelay = 1500; // 1.5s of silence triggers stop

    const detectSilence = () => {
      analyser.getByteFrequencyData(dataArray);
      // Use the maximum frequency bin value as the volume indicator (more reliable than average)
      let maxVolume = 0;
      for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxVolume) maxVolume = dataArray[i];
      }

      // Animate the audio waves directly using DOM to avoid expensive React re-renders
      const waveBars = document.querySelectorAll('.audio-wave-bar');
      if (waveBars.length > 0) {
        waveBars.forEach((bar, index) => {
          // Add some randomness based on the index to make it look like a real waveform
          const barHeight = Math.max(0.1, (maxVolume / 255) * (1 + (index % 3) * 0.5));
          (bar as HTMLElement).style.transform = `scaleY(${barHeight})`;
        });
      }

      if (maxVolume > threshold) {
        // Only start recording if not already speaking, not processing STT/TTS, and Sarie is not speaking
        const isSarieSpeaking = persistentAudioRef.current && !persistentAudioRef.current.paused && !persistentAudioRef.current.ended;
        
        if (!isSpeaking && !isProcessingVoice && !isSarieSpeaking) {
           isSpeaking = true;
           startMediaRecorder(stream);
        }
        silenceStart = Date.now();
      } else {
        if (isSpeaking && Date.now() - silenceStart > silenceDelay) {
          isSpeaking = false;
          stopMediaRecorder(); // This triggers STT
        }
      }
      animationFrameRef.current = requestAnimationFrame(detectSilence);
    };

    detectSilence();
  };

  const startMediaRecorder = (stream: MediaStream) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") return;
    
    const options = typeof MediaRecorder !== 'undefined' 
      ? (MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } 
         : MediaRecorder.isTypeSupported('audio/mp4') ? { mimeType: 'audio/mp4' } 
         : undefined)
      : undefined;

    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      if (audioChunksRef.current.length === 0) {
        setIsProcessingVoice(false);
        return;
      }
      setIsProcessingVoice(true);
      
      const mimeType = options?.mimeType || 'audio/webm';
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const formData = new FormData();
      formData.append("file", audioBlob, `voice.${ext}`);

      try {
        const res = await fetch("/api/ai/stt", { method: "POST", body: formData });
        if (!res.ok) throw new Error("STT failed");
        const data = await res.json();
        
        let transcript = (data.text || "").trim();
        // Filter out common Whisper hallucinations when it hears background noise/breathing
        const hallucinations = ["شكرا", "شكراً", "إلى اللقاء", ".", "أم", "اه", "امم", "...", "Thank you.", "Thank you"];
        if (hallucinations.includes(transcript) || transcript.length < 2) {
           transcript = "";
        }

        if (transcript) {
          sendMessage(transcript, undefined, undefined, true);
        } else {
          setIsProcessingVoice(false); // Empty or hallucinated transcript, just resume listening
        }
      } catch (err) {
        console.error("STT Error:", err);
        setError("Failed to transcribe voice");
        setIsProcessingVoice(false);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopMediaRecorder = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopVoiceMode = () => {
    setIsVoiceMode(false);
    setIsRecording(false);
    setIsProcessingVoice(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (persistentAudioRef.current) persistentAudioRef.current.pause();
  };

  const playTTS = async (text: string) => {
    if (persistentAudioRef.current) {
      persistentAudioRef.current.pause();
    }
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: sarieVoice })
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (persistentAudioRef.current) {
        persistentAudioRef.current.src = url;
        persistentAudioRef.current.onended = () => {
          setIsProcessingVoice(false); // Audio finished, resume listening!
        };
        await persistentAudioRef.current.play();
      }
    } catch (err) {
      console.error("Audio playback failed", err);
      setIsProcessingVoice(false); // Fallback
    }
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
          <div className="w-8 h-8 rounded-full glass-elevated flex items-center justify-center overflow-hidden shrink-0 relative">
            <Image src={SarieAvatar} alt="Sarie" fill className="object-cover object-center" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Mas Sarie</div>
            <div className="text-[10px] text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block pulse-dot" />
              Mas AI Studio
            </div>
          </div>
          <div className="flex items-center gap-1">
            <select 
              value={sarieVoice} 
              onChange={(e) => setSarieVoice(e.target.value)}
              className="text-[11px] rounded-lg px-1 py-1 mr-1 glass-elevated outline-none"
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
                <div className="w-6 h-6 rounded-full glass-elevated flex shrink-0 mt-0.5 overflow-hidden justify-center relative">
                  <Image src={SarieAvatar} alt="Sarie" fill className="object-cover object-center" />
                </div>
              )}
              <div className="relative group max-w-[82%]">
                {editingIndex === i ? (
                  <div className="flex flex-col gap-2 w-full min-w-[280px]">
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
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => submitEdit(i)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-purple-600 text-white transition-all hover:bg-purple-500"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`px-3 py-2.5 rounded-xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                        m.role === "user" ? "rounded-br-none" : "rounded-bl-none"
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

                    {/* Action Row Under Message */}
                    <div className="flex items-center gap-4 mt-2 px-1" dir="ltr">
                      {m.role === "user" && !m.streaming && (
                        <button
                          onClick={() => handleEdit(i, m.content)}
                          className="flex items-center gap-1.5 text-[11px] transition-colors hover:opacity-80"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => copyToClipboard(m.content, i)}
                        className="flex items-center gap-1.5 text-[11px] transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {copiedId === i ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>{copiedId === i ? "Copied" : "Copy"}</span>
                      </button>
                      <button
                        onClick={() => handleShare(m.content)}
                        className="flex items-center gap-1.5 text-[11px] transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Share size={12} />
                        <span>Share</span>
                      </button>
                      
                      {/* More options menu button (retained but moved to row) */}
                      <div className="relative ml-auto">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === i ? null : i); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                          title="المزيد"
                        >
                          <MoreVertical size={13} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        {activeMenu === i && (
                          <div 
                            className="absolute bottom-full mb-2 right-0 z-[60] min-w-[120px] glass-chat rounded-xl border p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                            style={{ borderColor: 'var(--glass-border)', direction: 'rtl' }}
                          >
                            <button
                              onClick={() => deleteMessage(i)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={12} />
                              حذف الرسالة
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
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
            {isVoiceMode ? (
              <div className="absolute inset-0 z-10 glass-panel flex flex-col items-center justify-center rounded-b-2xl bg-black/60 backdrop-blur-md border-t border-white/10 animate-in fade-in duration-300">
                <div className="mb-4 relative">
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
                <div className="text-[11px] text-white/50 mb-4">Hands-free mode active</div>
                
                {/* Audio Visualizer Waves */}
                <div className="flex items-center gap-1 h-8 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`audio-wave-bar w-1.5 rounded-full ${isRecording ? 'bg-emerald-400' : 'bg-white/20'}`}
                      style={{ 
                        height: '100%', 
                        transformOrigin: 'bottom',
                        transition: 'transform 0.05s ease-out',
                        transform: 'scaleY(0.1)'
                      }}
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
            ) : (
              <button 
                onClick={startVoiceMode}
                disabled={streaming}
                className="w-9 h-9 rounded-xl glass-elevated flex items-center justify-center shrink-0 transition-all hover:opacity-90 disabled:opacity-30 relative group"
                style={{ color: 'var(--text-secondary)' }}
                title="Start Hands-Free Voice Mode"
              >
                <Mic size={14} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </button>
            )}

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
