import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const LETTERS = "USHERVERSE".split("");

export function HeroLogoReveal({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"spread" | "converge" | "scatter" | "exit">("spread");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("converge"), 900);
    const t2 = setTimeout(() => setPhase("scatter"), 4400);
    const t3 = setTimeout(() => setPhase("exit"), 5700);
    const t4 = setTimeout(() => onDone(), 6300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  const getLetterAnimate = (i: number) => {
    if (phase === "spread") return { x: (i - LETTERS.length / 2) * 60, opacity: 1, filter: "blur(0px)" };
    if (phase === "converge") return { x: 0, opacity: 1, filter: "blur(0px)" };
    if (phase === "scatter" || phase === "exit") return { x: (i - LETTERS.length / 2) * 80, opacity: 0, filter: "blur(8px)" };
    return { x: 0, opacity: 0 };
  };

  const getLetterTransition = (i: number) => {
    if (phase === "spread") return { duration: 0.9, delay: i * 0.05, ease: [0.6, 0.05, 0.1, 1] as const };
    if (phase === "converge") return { duration: 1.5, delay: 0, ease: [0.6, 0.05, 0.1, 1] as const };
    return { duration: 1.0, delay: i * 0.05, ease: [0.4, 0, 0.8, 1] as const };
  };

  const getSubtitleAnimate = () => {
    if (phase === "scatter" || phase === "exit") return { opacity: 0, filter: "blur(14px)", letterSpacing: "0.7em" };
    if (phase === "converge") return { opacity: 0.6, filter: "blur(0px)", letterSpacing: "0.55em" };
    return { opacity: 0, filter: "blur(14px)", letterSpacing: "0.55em" };
  };

  const getSubtitleTransition = () => {
    if (phase === "scatter") return { duration: 0.65, ease: [0.6, 0.05, 0.1, 1] as const };
    return { duration: 1.0, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] as const };
  };

  return (
    <AnimatePresence>
      {phase !== "exit" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.6, 0.05, 0.1, 1] }}
          /* No background — sits directly on top of the video as a ghost */
          className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-5">
            {/* Bold USHERVERSE on clean dark background */}
            <div className="flex font-display text-[14vw] md:text-[10vw] leading-none font-light text-white">
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

            <motion.p
              initial={{ opacity: 0, filter: "blur(14px)", letterSpacing: "0.55em" }}
              animate={getSubtitleAnimate()}
              transition={getSubtitleTransition()}
              className="text-[10px] md:text-xs uppercase font-sans text-white/70"
              style={{ letterSpacing: "0.55em" }}
            >
              Big Little World
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
