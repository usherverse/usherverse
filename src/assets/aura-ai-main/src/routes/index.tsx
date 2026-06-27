import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import {
  Mic,
  Paperclip,
  ArrowUp,
  Settings,
  X,
  Sparkles,
  Square,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aura — A next-generation AI companion" },
      { name: "description", content: "Aura is a calm, cinematic AI companion with a living voice orb and luminous glass interface." },
      { property: "og:title", content: "Aura — A next-generation AI companion" },
      { property: "og:description", content: "Aura is a calm, cinematic AI companion with a living voice orb and luminous glass interface." },
    ],
  }),
  component: Index,
});

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const SEED: Msg[] = [
  {
    id: "1",
    role: "user",
    text: "What does an interface from 2035 feel like?",
  },
  {
    id: "2",
    role: "assistant",
    text:
      "Less like a tool, more like a presence. It listens before it speaks, breathes when it thinks, and dissolves the seams between you and the machine. The screen becomes ambient — light, motion, and silence doing the work that buttons used to.",
  },
];

function Index() {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [status, setStatus] = useState<"ready" | "listening" | "thinking" | "speaking">("ready");
  const [focused, setFocused] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const v = input.trim();
    if (!v) return;
    const id = crypto.randomUUID();
    setMessages((m) => [...m, { id, role: "user", text: v }]);
    setInput("");
    setStatus("thinking");
    setTimeout(() => {
      setStatus("speaking");
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text:
            "Mmm — I hear you. Imagine that idea suspended in light, slowly turning so we can see every face of it together.",
        },
      ]);
      setTimeout(() => setStatus("ready"), 1800);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <AmbientBackground />

      <Header status={status} />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[850px] flex-col px-6 pt-28 pb-44">
        <div ref={scrollerRef} className="flex-1 space-y-8 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <Message key={m.id} msg={m} />
            ))}
            {status === "thinking" && <TypingIndicator key="typing" />}
          </AnimatePresence>
        </div>
      </main>

      <Composer
        value={input}
        onChange={setInput}
        onSend={send}
        focused={focused}
        setFocused={setFocused}
        onVoice={() => {
          setVoiceMode(true);
          setStatus("listening");
        }}
      />

      <AnimatePresence>
        {voiceMode && (
          <VoiceMode
            status={status}
            setStatus={setStatus}
            onClose={() => {
              setVoiceMode(false);
              setStatus("ready");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Background                                                          */
/* ------------------------------------------------------------------ */

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div
        className="absolute -left-1/4 top-[-20%] h-[70vmax] w-[70vmax] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--aurora-indigo), transparent 60%)",
          animation: "aurora-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-20%] top-[10%] h-[60vmax] w-[60vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--aurora-purple), transparent 60%)",
          animation: "aurora-drift 28s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-[-30%] left-[20%] h-[60vmax] w-[60vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--aurora-cyan), transparent 60%)",
          animation: "aurora-drift 32s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[5%] h-[50vmax] w-[50vmax] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, var(--aurora-red), transparent 60%)",
          animation: "aurora-drift 26s ease-in-out infinite reverse",
        }}
      />
      <Particles />
      <div className="absolute inset-0 noise opacity-[0.05]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}

function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 10,
      })),
    [],
  );
  return (
    <>
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/60"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            filter: "blur(0.5px)",
            animation: `float-slow ${d.duration}s ease-in-out ${d.delay}s infinite`,
            opacity: 0.35,
          }}
        />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function Header({ status }: { status: "ready" | "listening" | "thinking" | "speaking" }) {
  const label =
    status === "ready"
      ? "Ready"
      : status === "listening"
      ? "Listening"
      : status === "thinking"
      ? "Thinking"
      : "Speaking";
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex justify-center px-6 pt-6">
      <div className="glass flex w-full max-w-[850px] items-center justify-between rounded-full px-5 py-3">
        <div className="flex items-center gap-3">
          <OrbMark />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">Aura</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: "var(--aurora-cyan)",
                  boxShadow: "0 0 8px var(--aurora-cyan)",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }}
              />
              {label}
            </div>
          </div>
        </div>
        <button
          aria-label="Settings"
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}

function OrbMark() {
  return (
    <div className="relative h-8 w-8">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, var(--aurora-cyan), var(--aurora-blue), var(--aurora-purple), var(--aurora-pink), var(--aurora-red), var(--aurora-cyan))",
          animation: "spin-slow 14s linear infinite",
          filter: "blur(2px)",
        }}
      />
      <div className="absolute inset-1 rounded-full bg-background/60 backdrop-blur" />
      <div
        className="absolute inset-1.5 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, white, transparent 50%), conic-gradient(from 180deg, var(--aurora-purple), var(--aurora-red), var(--aurora-cyan), var(--aurora-purple))",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

function Message({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
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
          {msg.text}
        </div>
      ) : (
        <div className="flex max-w-[90%] gap-3">
          <div className="mt-1 shrink-0">
            <OrbMark />
          </div>
          <div className="text-[15px] leading-relaxed text-foreground/90">
            {msg.text}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <OrbMark />
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
  );
}

/* ------------------------------------------------------------------ */
/* Composer                                                            */
/* ------------------------------------------------------------------ */

function Composer({
  value,
  onChange,
  onSend,
  focused,
  setFocused,
  onVoice,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  focused: boolean;
  setFocused: (b: boolean) => void;
  onVoice: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-6 pb-8">
      <motion.div
        layout
        className="relative w-full max-w-[850px]"
        animate={{
          boxShadow: focused
            ? "0 0 60px -10px color-mix(in oklab, var(--aurora-blue) 50%, transparent), 0 0 0 1px color-mix(in oklab, white 14%, transparent) inset"
            : "0 10px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in oklab, white 8%, transparent) inset",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={{ borderRadius: 32 }}
      >
        <div
          className="glass-strong flex items-end gap-2 rounded-[32px] px-3 py-2.5"
          style={{ borderRadius: 32 }}
        >
          <button
            aria-label="Attach"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-all hover:scale-105 hover:bg-white/5 hover:text-foreground"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            placeholder="Ask Aura anything…"
            className="min-h-[44px] max-h-40 flex-1 resize-none bg-transparent px-2 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <button
            onClick={onVoice}
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
            onClick={onSend}
            disabled={!value.trim()}
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
  );
}

/* ------------------------------------------------------------------ */
/* Voice Mode + Orb                                                    */
/* ------------------------------------------------------------------ */

function VoiceMode({
  status,
  setStatus,
  onClose,
}: {
  status: "ready" | "listening" | "thinking" | "speaking";
  setStatus: (s: "ready" | "listening" | "thinking" | "speaking") => void;
  onClose: () => void;
}) {
  // Cycle states for demo: listening -> thinking -> speaking -> listening
  useEffect(() => {
    const seq: Array<"listening" | "thinking" | "speaking"> = [
      "listening",
      "thinking",
      "speaking",
    ];
    let i = 0;
    setStatus("listening");
    const t = setInterval(() => {
      i = (i + 1) % seq.length;
      setStatus(seq[i]);
    }, 4200);
    return () => clearInterval(t);
  }, [setStatus]);

  const label =
    status === "listening"
      ? "Listening"
      : status === "thinking"
      ? "Thinking"
      : status === "speaking"
      ? "Speaking"
      : "Ready";

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/70"
    >
      <AmbientBackground />

      <button
        onClick={onClose}
        aria-label="Close voice mode"
        className="glass absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full text-foreground transition-transform hover:scale-105"
      >
        <X size={18} />
      </button>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative flex items-center justify-center"
        style={{ width: "min(72vmin, 720px)", height: "min(72vmin, 720px)" }}
      >
        <LiquidOrb status={status} />
      </motion.div>

      <motion.div
        key={label}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mt-8 flex flex-col items-center gap-3"
      >
        <div className="text-3xl font-light tracking-tight text-gradient">
          {label}
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          <Sparkles size={12} />
          Aura voice
        </div>
      </motion.div>

      <button
        onClick={onClose}
        className="glass relative z-10 mt-10 flex items-center gap-2 rounded-full px-5 py-3 text-sm text-foreground/90 transition-transform hover:scale-105"
      >
        <Square size={12} fill="currentColor" />
        End conversation
      </button>
    </motion.div>
  );
}

function LiquidOrb({
  status,
}: {
  status: "ready" | "listening" | "thinking" | "speaking";
}) {
  // Simulated amplitude
  const amp = useMotionValue(0);
  const sAmp = useSpring(amp, { stiffness: 80, damping: 14, mass: 0.6 });

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const dt = (t - start) / 1000;
      let v = 0;
      if (status === "speaking") {
        v =
          0.55 +
          0.35 * Math.sin(dt * 4.5) +
          0.18 * Math.sin(dt * 11) +
          0.1 * Math.sin(dt * 19);
      } else if (status === "thinking") {
        v = 0.35 + 0.15 * Math.sin(dt * 1.5);
      } else if (status === "listening") {
        v = 0.15 + 0.08 * Math.sin(dt * 2.2);
      } else {
        v = 0.1;
      }
      amp.set(Math.max(0, Math.min(1, v)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, amp]);

  const scale = useSpring(1, { stiffness: 60, damping: 14 });
  useEffect(() => {
    const unsub = sAmp.on("change", (v) => {
      const base = status === "listening" ? 0.78 : status === "thinking" ? 0.9 : 1;
      scale.set(base + v * 0.18);
    });
    return () => unsub();
  }, [sAmp, scale, status]);

  return (
    <motion.div
      style={{ scale }}
      className="relative h-full w-full"
    >
      {/* Outer aura */}
      <div
        className="absolute inset-[-20%] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--aurora-blue) 60%, transparent), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-[-10%] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--aurora-pink) 50%, transparent), transparent 60%)",
          animation: "aurora-drift 14s ease-in-out infinite",
        }}
      />

      <OrbBlob amp={sAmp} status={status} />
    </motion.div>
  );
}

function OrbBlob({
  amp,
  status,
}: {
  amp: ReturnType<typeof useSpring>;
  status: "ready" | "listening" | "thinking" | "speaking";
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const rot = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const a = amp.get();
      rot.current += status === "thinking" ? 0.25 : 0.08;
      const t = performance.now() / 1000;
      const points = 96;
      const cx = 200;
      const cy = 200;
      const base = 130;
      const wobble =
        status === "speaking" ? 26 : status === "thinking" ? 14 : status === "listening" ? 8 : 6;
      const ampWobble = wobble * (0.4 + a * 1.6);
      let d = "";
      for (let i = 0; i <= points; i++) {
        const ang = (i / points) * Math.PI * 2;
        const r =
          base +
          Math.sin(ang * 3 + t * 1.3) * ampWobble * 0.6 +
          Math.sin(ang * 5 - t * 0.9) * ampWobble * 0.4 +
          Math.sin(ang * 2 + t * 2.1) * ampWobble * 0.3 +
          Math.sin(ang * 7 + t * 1.7) * ampWobble * 0.2;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
      }
      d += "Z";
      pathRef.current?.setAttribute("d", d);
      pathRef.current?.setAttribute(
        "transform",
        `rotate(${rot.current.toFixed(2)} 200 200)`,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amp, status]);

  return (
    <svg
      viewBox="0 0 400 400"
      className="relative h-full w-full"
      style={{ filter: "drop-shadow(0 0 60px color-mix(in oklab, var(--aurora-blue) 40%, transparent))" }}
    >
      <defs>
        <radialGradient id="orbFill" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="20%" stopColor="var(--aurora-cyan)" stopOpacity="0.95" />
          <stop offset="45%" stopColor="var(--aurora-blue)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="var(--aurora-purple)" stopOpacity="0.95" />
          <stop offset="90%" stopColor="var(--aurora-red)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--aurora-pink)" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="orbHi" cx="35%" cy="25%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="orbBlur">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <g filter="url(#orbBlur)">
        <path ref={pathRef} fill="url(#orbFill)" />
      </g>
      <circle cx="160" cy="150" r="80" fill="url(#orbHi)" />
    </svg>
  );
}
