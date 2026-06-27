import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, FileText, CheckCircle2, Copy, Download, Calendar, Check, Paperclip, ArrowUp, Mic, Square, Settings, X } from "lucide-react";
import { speakFriday as speakJenny, stopFriday as stopJenny, pauseJenny, resumeJenny, isJennySpeaking } from "../../utils/speech";
import { VoiceRecognition } from "../../utils/speechRecognition";
import { AmbientBackground } from "./aura/AmbientBackground";
import { OrbMark } from "./aura/LiquidOrb";
import { VoiceMode } from "./aura/VoiceMode";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  options?: string[];
  isMultiSelect?: boolean;
}

// Parse [OPTIONS: A | B | C] from AI text — returns { cleanText, options }
function parseMessage(raw: string): { cleanText: string; options: string[]; isMultiSelect: boolean } {
  const match = raw.match(/\[OPTIONS:\s*([^\]]+)\]/);
  if (!match) return { cleanText: raw, options: [], isMultiSelect: false };
  const options = match[1].split("|").map((o) => o.trim()).filter(Boolean);
  const cleanText = raw.replace(/\[OPTIONS:[^\]]+\]/, "").trim();
  const isMultiSelect = options.length > 0;
  return { cleanText, options, isMultiSelect };
}

interface SpecData {
  businessSummary: { businessName: string; industry: string; targetAudience: string; websiteGoals: string };
  recommendedPages: string[];
  recommendedFeatures: string[];
  suggestedDesignStyle: string;
  seoRecommendations: string[];
  userExperienceRecommendations: string[];
  detailedPrompt: string;
}

// Typewriter that plays once per message
function TypewriterText({ text, animate }: { text: string; animate: boolean }) {
  const [displayed, setDisplayed] = useState(animate ? "" : text);
  useEffect(() => {
    if (!animate) { setDisplayed(text); return; }
    let i = 0;
    const t = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, ++i)); }
      else clearInterval(t);
    }, 14);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, animate]);
  return <>{displayed}</>;
}

export function AIConsultant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localInput, setLocalInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isConsultationComplete, setIsConsultationComplete] = useState(false);
  const [specData, setSpecData] = useState<SpecData | null>(null);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [latestAssistantId, setLatestAssistantId] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<"ready" | "listening" | "thinking" | "speaking">("ready");
  const [voiceSubmitTrigger, setVoiceSubmitTrigger] = useState<{text: string, timestamp: number} | null>(null);
  const [focused, setFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<VoiceRecognition | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input when loading finishes, unless listening
  useEffect(() => {
    if (!isLoading && hasStarted && !isConsultationComplete && !voiceMode && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isLoading, hasStarted, isConsultationComplete, voiceMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    voiceRef.current = new VoiceRecognition({
      onSpeechStart: () => {
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
    return () => {
      stopJenny();
      voiceRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (voiceSubmitTrigger) {
      const text = voiceSubmitTrigger.text.trim().toLowerCase().replace(/[.,!?]/g, "");
      if (text.includes("end conversation") || text.includes("end the conversation")) {
        const newMessages = [
          ...messages,
          { id: Date.now().toString(), role: "user", content: voiceSubmitTrigger.text },
          { id: (Date.now() + 1).toString(), role: "assistant", content: "It was great chatting with you! Feel free to reach out any time you need to chat. Take care!" },
        ] as ChatMessage[];
        setMessages(newMessages);
        setVoiceStatus("speaking");
        speakJenny("It was great chatting with you! Feel free to reach out any time you need to chat. Take care!", () => {
          stopListening();
        });
      } else {
        sendMessage(voiceSubmitTrigger.text, "voice");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceSubmitTrigger]);

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

  const sendMessage = async (userText: string, mode: "text" | "voice" = "text") => {
    if (!userText.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLocalInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          mode: "questionnaire",
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const text = await response.text();
      const assistantId = (Date.now() + 1).toString();
      const { cleanText, options, isMultiSelect } = parseMessage(text);

      if (text.includes("[CONSULTATION_COMPLETE]")) {
        const clean = cleanText.replace("[CONSULTATION_COMPLETE]", "").trim();
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: clean }]);
        setLatestAssistantId(assistantId);
        setIsConsultationComplete(true);
        if (mode === "voice") {
          setVoiceStatus("speaking");
          speakJenny(clean, () => {
            if (voiceRef.current && voiceMode) {
              setVoiceStatus("listening");
              setTimeout(() => voiceRef.current?.start(), 300);
            } else {
              setVoiceStatus("ready");
            }
          });
        } else stopJenny();
        generateSpec([...updatedMessages, { id: assistantId, role: "assistant", content: clean }]);
      } else {
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: cleanText, options, isMultiSelect }]);
        setLatestAssistantId(assistantId);
        setSelectedOptions([]);
        if (mode === "voice") {
          setVoiceStatus("speaking");
          speakJenny(cleanText, () => {
            if (voiceRef.current && voiceMode) {
              setVoiceStatus("listening");
              setTimeout(() => voiceRef.current?.start(), 300);
            } else {
              setVoiceStatus("ready");
            }
          });
        } else stopJenny();
      }
    } catch (err) {
      const errId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: errId, role: "assistant", content: "⚠️ Sorry, I ran into an error. Please try again." }]);
      if (mode === "voice") {
        setVoiceStatus("speaking");
        speakJenny("Sorry, I ran into an error. Please try again.", () => {
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

  const generateSpec = async (chatHistory: ChatMessage[]) => {
    setIsGeneratingSpec(true);
    try {
      const response = await fetch("/api/generate-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory.map(m => ({ role: m.role, content: m.content })) }),
      });
      if (response.ok) setSpecData(await response.json());
    } catch (e) { console.error(e); }
    finally { setIsGeneratingSpec(false); }
  };

  const toggleOption = (option: string, isMultiSelect: boolean) => {
    if (!isMultiSelect) {
      // Single select — send immediately
      setLocalInput(""); // Clear any typed text
      sendMessage(option);
    } else {
      // Multi select — toggle in selection
      setLocalInput(""); // Clear any typed text
      setSelectedOptions((prev) =>
        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
      );
    }
  };

  const submitMultiSelect = () => {
    if (selectedOptions.length === 0) return;
    setLocalInput(""); // Clear any typed text
    sendMessage(selectedOptions.join(", "));
    setSelectedOptions([]);
  };

  const handleCopyPrompt = () => {
    if (specData?.detailedPrompt) { navigator.clipboard.writeText(specData.detailedPrompt); }
  };

  const handleExport = () => {
    if (!specData) return;
    const a = document.createElement("a");
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(specData, null, 2));
    a.download = "website_specification.json";
    a.click();
  };

  const handleWhatsAppShare = async () => {
    if (!specData) return;
    setIsGeneratingPdf(true);

    try {
      const element = document.getElementById('spec-content');
      if (!element) return;
      
      const opt = {
        margin:       10,
        filename:     'Usherverse_Specification.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();

      // Open WhatsApp with pre-filled message
      // Note: You can replace '1234567890' with the actual Usherverse business WhatsApp number 
      // by changing the URL to https://wa.me/1234567890?text=...
      const message = encodeURIComponent(`Hi Usherverse! Here are my website requirements. I've attached the PDF specification to this chat.`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
      
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col bg-background overflow-hidden text-foreground">
      <AmbientBackground />

      <div className="relative z-10 flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--champagne)]/30 bg-[var(--champagne)]/5 text-xs text-[var(--champagne)] uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> AI Powered Discovery
          </div>
          <h1 className="font-display font-light text-3xl md:text-5xl text-white tracking-tight">
            Website Discovery <span className="text-[var(--champagne)] italic">Questionnaire</span>
          </h1>
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            Jenny will guide you through a series of questions and generate a full specification for your new site.
          </p>
        </motion.div>

        {/* Chat Container — fixed height with internal scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex-1 flex flex-col rounded-3xl border border-white/5 bg-background shadow-2xl overflow-hidden relative z-10"
          style={{ minHeight: 0, height: "calc(100vh - 280px)" }}
        >
          {/* Chat top bar */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-black/20 shrink-0">
            <OrbMark />
            <div>
              <p className="text-foreground text-sm font-semibold leading-none tracking-wide">Jenny</p>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: "var(--aurora-cyan)",
                    boxShadow: "0 0 8px var(--aurora-cyan)",
                    animation: "pulse-dot 2s ease-in-out infinite",
                  }}
                />
                {isLoading ? "Thinking" : "Ready"}
              </p>
            </div>
          </div>

          {/* Messages — this is the only scrollable zone */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">

            {!hasStarted && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                <div className="scale-[1.5] origin-center mb-4"><OrbMark /></div>
                <div>
                  <h2 className="text-foreground text-xl font-medium mb-2">Ready to plan your website?</h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Jenny will ask you a few targeted questions and generate a comprehensive blueprint for your new site.
                  </p>
                </div>
                <button
                  onClick={() => { setHasStarted(true); sendMessage("Hi Jenny, let's start the questionnaire.", "text"); }}
                  className="bg-gradient-to-r from-[var(--aurora-cyan)] to-[var(--aurora-blue)] text-primary-foreground px-8 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-[var(--aurora-blue)]/20"
                >
                  <Sparkles className="w-4 h-4" /> Begin Consultation
                </button>
              </div>
            )}

            {hasStarted && messages.map((m, idx) => {
              const isLastAssistant = m.role === "assistant" && idx === messages.length - 1 && !isLoading;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 ${
                    m.role === "user"
                      ? "bg-white/10"
                      : "bg-gradient-to-tr from-[var(--champagne)] to-rose-600"
                  }`}>
                    {m.role === "user"
                      ? <User className="w-3.5 h-3.5 text-white/70" />
                      : <Hexagon className="w-3.5 h-3.5 text-white" />}
                  </div>

                  {/* Bubble + Options */}
                  <div className={`flex flex-col gap-3 ${m.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}>
                    <div className={`rounded-[28px] px-5 py-3 text-[15px] leading-relaxed text-foreground ${
                      m.role === "user"
                        ? "bg-white/10"
                        : "border border-white/10 backdrop-blur-[20px]"
                    }`}
                    style={m.role === "user" ? {
                      background: "linear-gradient(135deg, color-mix(in oklab, var(--aurora-indigo) 35%, transparent), color-mix(in oklab, var(--aurora-purple) 25%, transparent))",
                      border: "1px solid color-mix(in oklab, white 10%, transparent)",
                    } : {}}
                    >
                      <TypewriterText text={m.content} animate={m.id === latestAssistantId && m.role === "assistant"} />
                    </div>

                    {/* Option chips — only on the last assistant message when not loading */}
                    {isLastAssistant && m.options && m.options.length > 0 && !isConsultationComplete && (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-wrap gap-2">
                          {m.options.map((opt) => {
                            const isSelected = selectedOptions.includes(opt);
                            return (
                              <button
                                key={opt}
                                onClick={() => toggleOption(opt, m.isMultiSelect ?? false)}
                                disabled={isLoading}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border transition-all hover:scale-105 active:scale-95 ${
                                  isSelected
                                    ? "bg-[var(--champagne)] border-[var(--champagne)] text-white"
                                    : "bg-white/5 border-white/20 text-white/80 hover:border-[var(--champagne)]/60 hover:text-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {/* Multi-select confirm button */}
                        {m.isMultiSelect && selectedOptions.length > 0 && (
                          <button
                            onClick={submitMultiSelect}
                            disabled={isLoading}
                            className="self-start flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--aurora-cyan)] to-[var(--aurora-blue)] text-primary-foreground rounded-full text-xs font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                          >
                            <Send className="w-3 h-3" /> Confirm selection ({selectedOptions.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}


            {/* Typing indicator */}
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

            {/* Generating spec */}
            {isGeneratingSpec && (
              <div className="flex items-center justify-center gap-3 py-4 text-white/50 text-sm">
                <div className="w-5 h-5 border-2 border-[var(--champagne)] border-t-transparent rounded-full animate-spin" />
                Compiling your website specification...
              </div>
            )}

            {/* Spec Card */}
            {specData && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-white text-black rounded-2xl p-6 mt-4 shadow-xl">
                <div id="spec-content">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/10">
                    <FileText className="w-6 h-6" />
                    <div>
                      <h3 className="text-lg font-semibold">Website Specification</h3>
                      <p className="text-black/50 text-xs">Generated for {specData.businessSummary.businessName}</p>
                    </div>
                  </div>
                  <div className="space-y-5 text-sm">
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
                      <div><span className="text-black/40 text-xs block">Industry</span>{specData.businessSummary.industry}</div>
                      <div><span className="text-black/40 text-xs block">Audience</span>{specData.businessSummary.targetAudience}</div>
                      <div className="col-span-2"><span className="text-black/40 text-xs block">Goals</span>{specData.businessSummary.websiteGoals}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-black/40 font-bold mb-2">Pages</p>
                        <ul className="space-y-1">{specData.recommendedPages.map((p, i) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />{p}</li>)}</ul>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-black/40 font-bold mb-2">Features</p>
                        <ul className="space-y-1">{specData.recommendedFeatures.map((f, i) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />{f}</li>)}</ul>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-black/40 font-bold mb-2">Design Direction</p>
                      <p className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-black/70">{specData.suggestedDesignStyle}</p>
                    </div>
                    <div className="relative group html2pdf__page-break">
                      <p className="text-xs uppercase tracking-widest text-black/40 font-bold mb-2">AI Builder Prompt</p>
                      <pre className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap font-mono">{specData.detailedPrompt}</pre>
                      <button onClick={handleCopyPrompt} className="absolute top-8 right-3 bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity" data-html2canvas-ignore>
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Actions (Not included in PDF) */}
                <div className="flex flex-wrap gap-3 pt-6 mt-6 border-t border-black/10">
                  <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">
                    <Download className="w-3.5 h-3.5" />Export JSON
                  </button>
                  <button onClick={handleWhatsAppShare} disabled={isGeneratingPdf} className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {isGeneratingPdf ? "Generating PDF..." : "Send to WhatsApp"}
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-black/80 text-white rounded-lg text-xs font-medium transition-colors ml-auto">
                    <Calendar className="w-3.5 h-3.5" />Book Project
                  </button>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input — anchored to bottom, never scrolls away */}
          {hasStarted && !isConsultationComplete && (
            <div className="shrink-0 p-4 border-t border-white/5 bg-black/20">
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
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(localInput, "text"); }} className="glass-strong flex items-end gap-2 rounded-[32px] px-3 py-2.5">
                  <button
                    type="button"
                    aria-label="Attach"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-all hover:scale-105 hover:bg-white/5 hover:text-foreground"
                  >
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    ref={inputRef}
                    value={localInput}
                    onChange={(e) => setLocalInput(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(localInput, "text");
                      }
                    }}
                    placeholder={isLoading ? "Jenny is typing..." : voiceMode ? "Listening..." : "Type your answer..."}
                    disabled={isLoading || voiceMode}
                    className="min-h-[44px] max-h-32 flex-1 resize-none bg-transparent px-2 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none scrollbar-thin scrollbar-thumb-white/10"
                    rows={1}
                    id="ai-consultant-input"
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
                        background: "conic-gradient(from 90deg, var(--aurora-cyan), var(--aurora-blue), var(--aurora-purple), var(--aurora-pink), var(--aurora-cyan))",
                        filter: "blur(4px)",
                      }}
                    />
                    <span className="relative grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur">
                      <Mic size={16} />
                    </span>
                  </button>
                  <button
                    type="submit"
                    id="ai-consultant-send"
                    disabled={isLoading || voiceMode || !localInput.trim()}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                    style={{
                      background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-blue), var(--aurora-purple))",
                      boxShadow: "0 8px 24px -6px color-mix(in oklab, var(--aurora-blue) 60%, transparent)",
                    }}
                  >
                    <ArrowUp size={18} strokeWidth={2.5} />
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </motion.div>
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
    </section>
  );
}
