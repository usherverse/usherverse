import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Square } from "lucide-react";
import { AmbientBackground } from "./AmbientBackground";
import { LiquidOrb } from "./LiquidOrb";

export function VoiceMode({
  status,
  setStatus,
  onClose,
}: {
  status: "ready" | "listening" | "thinking" | "speaking";
  setStatus?: (s: "ready" | "listening" | "thinking" | "speaking") => void;
  onClose: () => void;
}) {
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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/70"
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
          Jenny voice
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
