import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const LETTERS = "USHURVERSE".split("");

export function Intro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"spread" | "converge" | "scatter" | "exit">("spread");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("converge"), 900);  // letters fly in together
    const t2 = setTimeout(() => setPhase("scatter"), 4400);  // hold so subtitle is readable, then scatter
    const t3 = setTimeout(() => setPhase("exit"), 5700);     // fade the whole screen out
    const t4 = setTimeout(() => onDone(), 6300);             // signal done
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  const getLetterAnimate = (i: number) => {
    if (phase === "spread") {
      return { x: (i - LETTERS.length / 2) * 60, opacity: 1, filter: "blur(0px)" };
    }
    if (phase === "converge") {
      return { x: 0, opacity: 1, filter: "blur(0px)" };
    }
    if (phase === "scatter") {
      // Mirror the intro: letters fly back out to their original spread positions with blur
      return { x: (i - LETTERS.length / 2) * 80, opacity: 0, filter: "blur(8px)" };
    }
    // exit phase — keep scattered (shouldn't matter since parent fades out)
    return { x: (i - LETTERS.length / 2) * 80, opacity: 0, filter: "blur(8px)" };
  };

  const getLetterTransition = (i: number) => {
    if (phase === "spread") {
      return { duration: 0.9, delay: i * 0.05, ease: [0.6, 0.05, 0.1, 1] as const };
    }
    if (phase === "converge") {
      return { duration: 1.5, delay: 0, ease: [0.6, 0.05, 0.1, 1] as const };
    }
    // scatter — stagger from outside-in or inside-out; mirror intro stagger
    return { duration: 1.0, delay: i * 0.05, ease: [0.4, 0, 0.8, 1] as const };
  };

  // Subtitle: blurry → clear (on converge), then blurry → gone (on scatter)
  const getSubtitleAnimate = () => {
    if (phase === "scatter" || phase === "exit") {
      return { opacity: 0, filter: "blur(14px)", letterSpacing: "0.7em" };
    }
    if (phase === "converge") {
      return { opacity: 0.75, filter: "blur(0px)", letterSpacing: "0.55em" };
    }
    // spread — hidden
    return { opacity: 0, filter: "blur(14px)", letterSpacing: "0.55em" };
  };

  const getSubtitleTransition = () => {
    if (phase === "scatter") {
      // quick blur-out as letters scatter
      return { duration: 0.65, ease: [0.6, 0.05, 0.1, 1] as const };
    }
    // blur-in after the logo has converged and settled
    return { duration: 1.0, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] as const };
  };

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.6, 0.05, 0.1, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] overflow-hidden grain"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.4 }}
            className="absolute top-8 left-8 text-xs tracking-[0.4em] uppercase"
          >
            Ushurverse — 2026
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.4 }}
            className="absolute top-8 right-8 text-xs tracking-[0.4em] uppercase"
          >
            Big Little World
          </motion.div>

          {/* Logo + subtitle stacked */}
          <div className="flex flex-col items-center gap-5">
            <div className="flex font-display text-[12vw] md:text-[9vw] leading-none font-light">
              {LETTERS.map((l, i) => (
                <motion.span
                  key={i}
                  initial={{ x: (i - LETTERS.length / 2) * 80, opacity: 0, filter: "blur(8px)" }}
                  animate={getLetterAnimate(i)}
                  transition={getLetterTransition(i)}
                  className="inline-block"
                >
                  {l}
                </motion.span>
              ))}
            </div>

            {/* Subtitle: blurs in → clears → blurs out */}
            <motion.p
              initial={{ opacity: 0, filter: "blur(14px)", letterSpacing: "0.55em" }}
              animate={getSubtitleAnimate()}
              transition={getSubtitleTransition()}
              className="text-[10px] md:text-xs uppercase font-sans text-[var(--champagne)]"
              style={{ letterSpacing: "0.55em" }}
            >
              Big Little World
            </motion.p>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.6, ease: "linear" }}
            className="absolute bottom-0 left-0 h-px w-full bg-[var(--champagne)] origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}