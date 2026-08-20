import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, ArrowUp, Mic, Paperclip } from "lucide-react";
import { VoiceRecognition } from "../../utils/speechRecognition";
import { speakFriday as speakJenny, stopFriday as stopJenny, pauseJenny, resumeJenny, isJennySpeaking } from "../../utils/speech";
import { AnimatePresence, motion } from "framer-motion";
import { VoiceMode } from "./aura/VoiceMode";
import { OrbMark } from "./aura/LiquidOrb";

// ─── Draggable logic ────────────────────────────────────────────────────────

const JENNY_POS_KEY = "jenny_chat_position";
const BTN = 64; // button size px
const MARGIN = 24;

function getDefaultPos() {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  return { x: window.innerWidth - BTN - MARGIN, y: window.innerHeight - BTN - MARGIN };
}

function clampPos(x: number, y: number) {
  const maxX = window.innerWidth - BTN - 4;
  const maxY = window.innerHeight - BTN - 4;
  return { x: Math.max(4, Math.min(x, maxX)), y: Math.max(4, Math.min(y, maxY)) };
}

function loadSavedPos() {
  try {
    const raw = localStorage.getItem(JENNY_POS_KEY);
    if (raw) return clampPos(...(Object.values(JSON.parse(raw)) as [number, number]));
  } catch {}
  return getDefaultPos();
}

function useDraggable() {
  const [pos, setPos] = useState<{ x: number; y: number }>(loadSavedPos);
  const [dragging, setDragging] = useState(false);
  const info = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, moved: false });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    info.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false };
    setDragging(true);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - info.current.startX;
    const dy = e.clientY - info.current.startY;
    if (!info.current.moved && Math.hypot(dx, dy) < 5) return;
    info.current.moved = true;
    setPos(clampPos(info.current.origX + dx, info.current.origY + dy));
  }, [dragging]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
  }, []);

  const wasDrag = () => info.current.moved;

  // Persist position
  useEffect(() => {
    try { localStorage.setItem(JENNY_POS_KEY, JSON.stringify(pos)); } catch {}
  }, [pos]);

  return { pos, dragging, onPointerDown, onPointerMove, onPointerUp, wasDrag };
}

function TypewriterText({ text, animate, onUpdate }: { text: string, animate: boolean, onUpdate?: () => void }) {
  const [displayedText, setDisplayedText] = useState(animate ? "" : text);
  
  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      return;
    }
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (onUpdate) onUpdate();
      } else {
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate]);

  return <>{displayedText}</>;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  
  // Voice mode states
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"ready" | "listening" | "thinking" | "speaking">("ready");
  const [voiceSubmitTrigger, setVoiceSubmitTrigger] = useState<{text: string, timestamp: number} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<VoiceRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Drag ────────────────────────────────────────────────────────────────
  const { pos, dragging, onPointerDown, onPointerMove, onPointerUp, wasDrag } = useDraggable();

  const getPanelStyle = (): React.CSSProperties => {
    const PANEL_W = Math.min(420, window.innerWidth - 16);
    const PANEL_H = Math.min(600, window.innerHeight * 0.8);
    const mg = 8;
    let left = pos.x - PANEL_W + BTN;
    let top  = pos.y - PANEL_H + BTN;
    if (left < mg) left = mg;
    if (left + PANEL_W > window.innerWidth - mg) left = window.innerWidth - PANEL_W - mg;
    if (top  < mg) top  = mg;
    if (top + PANEL_H > window.innerHeight - mg) top = pos.y - PANEL_H - mg;
    return { left, top, width: PANEL_W, height: PANEL_H };
  };

  useEffect(() => {
    if (!isLoading && isOpen && !voiceMode && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isLoading, isOpen, voiceMode]);

  useEffect(() => {
    voiceRef.current = new VoiceRecognition({
      onSpeechStart: () => {
        // User started talking — pause Jenny immediately
        pauseJenny();
        setVoiceStatus("listening");
      },
      onResult: (text) => {
        setVoiceStatus("thinking");
        setVoiceSubmitTrigger({ text, timestamp: Date.now() });
      },
      onError: (err) => {
        // "no-speech" just means silence — stay in voice mode and restart mic
        if (err === "no-speech" || err === "aborted") {
          setVoiceStatus("listening");
          setTimeout(() => voiceRef.current?.start(), 300);
          return;
        }
        // Real errors — bail to text mode
        resumeJenny();
        setVoiceStatus("ready");
        setVoiceMode(false);
      },
      onEnd: () => {
        // Only restart mic if Jenny isn't still speaking and we're still in voice mode
        setVoiceStatus((prev) => {
          if (prev === "listening" && !isJennySpeaking()) {
            setTimeout(() => {
              if (voiceRef.current && !isJennySpeaking()) {
                voiceRef.current.start();
              }
            }, 400);
          }
          return prev;
        });
      },
    });
    return () => voiceRef.current?.stop();
  }, []);

  const toggleListening = () => {
    if (!voiceRef.current) return;
    setVoiceMode(true);
    setVoiceStatus("listening");
    voiceRef.current.start();
    stopJenny();
  };

  const stopListening = () => {
    if (!voiceRef.current) return;
    voiceRef.current.stop();
    setVoiceMode(false);
    setVoiceStatus("ready");
    stopJenny();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = "Hi there! I'm Jenny, your AI assistant. How can I help you today?";
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: greeting,
        },
      ]);
      speakJenny(greeting);
      setVoiceStatus("speaking");
    }
    if (!isOpen) {
      stopJenny();
      if (voiceMode) stopListening();
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (voiceSubmitTrigger) {
      const text = voiceSubmitTrigger.text.trim().toLowerCase().replace(/[.,!?]/g, "");
      if (text.includes("end conversation") || text.includes("end the conversation")) {
        const newMessages = [
          ...messages,
          { id: crypto.randomUUID(), role: "user", content: voiceSubmitTrigger.text },
          { id: crypto.randomUUID(), role: "assistant", content: "It was great chatting with you! Feel free to reach out any time you need to chat. Take care!" },
        ];
        setMessages(newMessages);
        setVoiceStatus("speaking");
        speakJenny("It was great chatting with you! Feel free to reach out any time you need to chat. Take care!", () => {
          stopListening();
          setIsOpen(false);
        });
      } else {
        submitMessage(voiceSubmitTrigger.text, "voice");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceSubmitTrigger]);

  const submitMessage = async (userMsg: string, mode: "text" | "voice") => {
    if (!userMsg.trim() || isLoading) return;

    setInput("");
    const newMessages = [...messages, { id: crypto.randomUUID(), role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);
    if (mode === "voice") setVoiceStatus("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          mode: "general",
        }),
      });

      if (!res.ok) throw new Error(`API returned status: ${res.status}`);

      const text = await res.text();
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: text }]);
      
      if (mode === "voice") {
        setVoiceStatus("speaking");
        speakJenny(text, () => {
          // Only start listening after Jenny has fully finished speaking
          if (voiceRef.current && voiceMode) {
            setVoiceStatus("listening");
            setTimeout(() => voiceRef.current?.start(), 300);
          } else {
            setVoiceStatus("ready");
          }
        });
      } else {
        stopJenny();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "⚠️ Sorry, I encountered an error. Please try again." },
      ]);
      if (mode === "voice") {
        setVoiceStatus("speaking");
        speakJenny("Sorry, I encountered an error. Please try again.", () => {
          if (voiceRef.current && voiceMode) {
            setVoiceStatus("listening");
            voiceRef.current.start();
          } else {
            setVoiceStatus("ready");
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(input, "text");
  };

  return (
    <>
      {/* ── Draggable toggle button ────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: BTN,
          height: BTN,
          zIndex: 50,
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => {
          onPointerUp(e);
          if (!wasDrag()) setIsOpen((o) => !o);
        }}
        title="Drag to reposition · Click to open"
      >
        <div
          className={`w-full h-full flex items-center justify-center rounded-full shadow-2xl transition-all duration-200 ${
            isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
          } ${!dragging ? "hover:scale-105" : ""}`}
        >
          <OrbMark />
        </div>
        {/* Drag-handle dots hint */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/20 backdrop-blur flex items-center justify-center pointer-events-none">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" className="text-white/70">
              <circle cx="3" cy="3" r="1.2" /><circle cx="7" cy="3" r="1.2" />
              <circle cx="3" cy="7" r="1.2" /><circle cx="7" cy="7" r="1.2" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Chat panel — pinned near button ───────────────────────────────── */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden rounded-3xl bg-background shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-8 opacity-0 pointer-events-none"
        }`}
        style={isOpen ? { ...getPanelStyle(), maxHeight: "80vh" } : { left: pos.x, top: pos.y, width: 0, height: 0 }}

      >
        <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <OrbMark />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-foreground">Jenny</div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: isLoading ? "var(--aurora-cyan)" : "#22c55e",
                    boxShadow: isLoading
                      ? "0 0 8px var(--aurora-cyan)"
                      : "0 0 8px #22c55e, 0 0 16px #16a34a",
                    animation: "pulse-dot 2s ease-in-out infinite",
                  }}
                />
                {isLoading ? "Thinking" : "Online"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-white/10 relative">
          <div className="flex flex-col gap-6 relative z-10">
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {isUser ? (
                    <div
                      className="max-w-[80%] rounded-[28px] px-5 py-3 text-[15px] leading-relaxed text-foreground"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in oklab, var(--aurora-indigo) 35%, transparent), color-mix(in oklab, var(--aurora-purple) 25%, transparent))",
                        border: "1px solid color-mix(in oklab, white 10%, transparent)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex max-w-[90%] gap-3">
                      <div className="mt-1 shrink-0 scale-75 origin-top">
                        <OrbMark />
                      </div>
                      <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        <TypewriterText 
                          text={msg.content} 
                          animate={i === messages.length - 1} 
                          onUpdate={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="scale-75 origin-top"><OrbMark /></div>
                <div className="flex items-center gap-1.5 pt-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-foreground/70"
                      style={{
                        animation: `pulse-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 shrink-0 bg-black/20 border-t border-white/5 relative z-10">
          <motion.div
            layout
            className="relative w-full"
            animate={{
              boxShadow: focused
                ? "0 0 60px -10px color-mix(in oklab, var(--aurora-blue) 50%, transparent), 0 0 0 1px color-mix(in oklab, white 14%, transparent) inset"
                : "0 10px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in oklab, white 8%, transparent) inset",
            }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            style={{ borderRadius: 32 }}
          >
            <div className="glass-strong flex items-end gap-2 rounded-[32px] px-3 py-2.5">
              <button
                aria-label="Attach"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-all hover:scale-105 hover:bg-white/5 hover:text-foreground"
              >
                <Paperclip size={18} />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                rows={1}
                placeholder={isLoading ? "Jenny is typing..." : voiceMode ? "Listening..." : "Ask Jenny anything…"}
                className="min-h-[44px] max-h-32 flex-1 resize-none bg-transparent px-2 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none scrollbar-thin scrollbar-thumb-white/10"
              />
              <button
                type="button"
                onClick={toggleListening}
                aria-label="Voice mode"
                className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-foreground transition-transform hover:scale-105"
              >
                <span
                  className="absolute inset-0 rounded-full opacity-70 transition-opacity group-hover:opacity-100"
                  style={{
                    background:
                      "conic-gradient(from 90deg, var(--aurora-cyan), var(--aurora-blue), var(--aurora-purple), var(--aurora-pink), var(--aurora-cyan))",
                    filter: "blur(4px)",
                  }}
                />
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur">
                  <Mic size={16} />
                </span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                aria-label="Send"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                style={{
                  background:
                    "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-blue), var(--aurora-purple))",
                  boxShadow:
                    "0 8px 24px -6px color-mix(in oklab, var(--aurora-blue) 60%, transparent)",
                }}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {voiceMode && (
          <VoiceMode
            status={voiceStatus}
            setStatus={setVoiceStatus}
            onClose={stopListening}
          />
        )}
      </AnimatePresence>
    </>
  );
}
