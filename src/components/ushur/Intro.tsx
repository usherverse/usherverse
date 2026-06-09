import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const LETTERS = "USHERVERSE".split("");

// Skip the intro on repeat visits within the same browser session
const HAS_SEEN_KEY = "ushurverse_intro_seen";

export function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"spread" | "converge" | "scatter" | "exit">("spread");

  useEffect(() => {
    // If the user has already seen the intro this session, skip immediately
    if (sessionStorage.getItem(HAS_SEEN_KEY)) {
      onDone();
      return;
    }

    // Optimised timeline — total: ~3.2 s (was 6.3 s)
    //  0 ms  → spread  (initial state, letters fanned out)
    //  400ms → converge (fly in faster)
    // 1800ms → scatter  (shorter hold — title is legible, then out)
    // 2600ms → exit     (fade overlay)
    // 3200ms → done     (hand off to Hero)
    const t1 = setTimeout(() => setPhase("converge"), 400);
    const t2 = setTimeout(() => setPhase("scatter"),  1800);
    const t3 = setTimeout(() => setPhase("exit"),     2600);
    const t4 = setTimeout(() => {
      sessionStorage.setItem(HAS_SEEN_KEY, "1");
      onDone();
    }, 3200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  const getLetterAnimate = (i: number) => {
    if (phase === "spread")   return { x: (i - LETTERS.length / 2) * 60, opacity: 1 };
    if (phase === "converge") return { x: 0, opacity: 1 };
    // scatter / exit — fan back out
    return { x: (i - LETTERS.length / 2) * 80, opacity: 0 };
  };

  const getLetterTransition = (i: number) => {
    if (phase === "spread")   return { duration: 0.6, delay: i * 0.03, ease: [0.6, 0.05, 0.1, 1] as const };
    if (phase === "converge") return { duration: 0.9, delay: 0,        ease: [0.6, 0.05, 0.1, 1] as const };
    return                           { duration: 0.6, delay: i * 0.03, ease: [0.4, 0, 0.8, 1]   as const };
  };

  const getSubtitleAnimate = () => {
    if (phase === "scatter" || phase === "exit") return { opacity: 0, y: -6 };
    if (phase === "converge")                   return { opacity: 0.75, y: 0 };
    return                                             { opacity: 0,    y: 6 };
  };

  const getSubtitleTransition = () => {
    if (phase === "scatter") return { duration: 0.4, ease: [0.6, 0.05, 0.1, 1] as const };
    return                          { duration: 0.6, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] as const };
  };

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.6, 0.05, 0.1, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] overflow-hidden grain"
        >
          {/* Corner labels */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.8 }}
            className="absolute top-8 left-8 text-xs tracking-[0.4em] uppercase"
          >
            Usherverse — 2026
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.8 }}
            className="absolute top-8 right-8 text-xs tracking-[0.4em] uppercase"
          >
            Big Little World
          </motion.div>

          {/* Logo + subtitle — use transform only for GPU compositing */}
          <div className="flex flex-col items-center gap-5">
            <div className="flex font-display text-[12vw] md:text-[9vw] leading-none font-light">
              {LETTERS.map((l, i) => (
                <motion.span
                  key={i}
                  initial={{ x: (i - LETTERS.length / 2) * 80, opacity: 0 }}
                  animate={getLetterAnimate(i)}
                  transition={getLetterTransition(i)}
                  style={{ willChange: "transform, opacity" }}
                  className="inline-block"
                >
                  {l}
                </motion.span>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={getSubtitleAnimate()}
              transition={getSubtitleTransition()}
              className="text-[10px] md:text-xs uppercase font-sans text-[var(--champagne)]"
              style={{ letterSpacing: "0.55em", willChange: "transform, opacity" }}
            >
              Big Little World
            </motion.p>
          </div>

          {/* Progress bar at bottom */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.6, ease: "linear" }}
            className="absolute bottom-0 left-0 h-px w-full bg-[var(--champagne)] origin-left"
            style={{ willChange: "transform" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}