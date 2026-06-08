import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const LETTERS = "Usherverse".split("");

export function Marquee() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"spread" | "converge" | "scatter">("spread");
  const showingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch(e => console.log("Autoplay prevented:", e));

    const handleTime = () => {
      const t = video.currentTime;
      const dur = video.duration;
      if (!dur || isNaN(dur)) return;

      // Show logo during the darker blue frame (later in the video)
      const triggerPoint = dur * 0.75 + 1.5;
      const inWindow = t >= triggerPoint && t < triggerPoint + 3.5;

      if (inWindow && !showingRef.current) {
        showingRef.current = true;
        setPhase("spread");
        setShow(true);
        setTimeout(() => setPhase("converge"), 100);
        setTimeout(() => setPhase("scatter"), 2800);
        setTimeout(() => {
          setShow(false);
          showingRef.current = false;
        }, 3500);
      }
    };

    video.addEventListener("timeupdate", handleTime);
    return () => video.removeEventListener("timeupdate", handleTime);
  }, []);

  const getLetterAnimate = (i: number) => {
    if (phase === "spread") return { x: (i - LETTERS.length / 2) * 40, opacity: 0, filter: "blur(18px)" };
    if (phase === "converge") return { 
      x: 0, 
      opacity: [0, 0.3, 0.5, 1], 
      filter: ["blur(18px)", "blur(12px)", "blur(5px)", "blur(0px)"] 
    };
    return { x: (i - LETTERS.length / 2) * 50, opacity: 0, filter: "blur(18px)" };
  };

  const getLetterTransition = (i: number) => {
    if (phase === "converge") return { duration: 1.4, ease: [0.6, 0.05, 0.1, 1] };
    return { duration: 0.7, delay: i * 0.03, ease: [0.4, 0, 0.8, 1] };
  };

  return (
    <div className="relative border-y border-white/10 overflow-hidden bg-black text-white h-[140px] md:h-[200px] flex items-center justify-center">
      {/* <video
        ref={videoRef}
        src="/stripvid.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-70"
      /> */}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex items-center justify-center text-center drop-shadow-lg">
        <AnimatePresence>
          {show && (
            <motion.div
              key="logo"
              exit={{ opacity: 0, transition: { duration: 0 } }}
              className="flex items-baseline font-display text-[8vw] md:text-[5vw] leading-none font-light tracking-tight"
            >
              {LETTERS.map((l, i) => (
                <motion.span
                  key={i}
                  initial={{ x: (i - LETTERS.length / 2) * 40, opacity: 0, filter: "blur(18px)" }}
                  animate={getLetterAnimate(i)}
                  transition={getLetterTransition(i)}
                  className="inline-block"
                >
                  {l}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, filter: "blur(18px)" }}
                animate={phase === "converge" 
                  ? { opacity: [0, 0.3, 0.5, 1], filter: ["blur(18px)", "blur(12px)", "blur(5px)", "blur(0px)"] }
                  : { opacity: 0, filter: "blur(18px)" }
                }
                transition={{ duration: 1.4, ease: [0.6, 0.05, 0.1, 1] }}
                className="text-[var(--champagne)]"
              >.</motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}