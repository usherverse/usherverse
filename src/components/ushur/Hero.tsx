import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const SLIDES = [
  { tag: "Website Development", num: "01" },
  { tag: "System Development", num: "02" },
  { tag: "Business Automation", num: "03" },
  { tag: "AI Integrations", num: "04" },
  { tag: "UI / UX Design", num: "05" },
  { tag: "Workflow Automation", num: "06" },
  { tag: "Custom Dashboards", num: "07" },
  { tag: "SaaS Platforms", num: "08" },
  { tag: "Business Systems", num: "09" },
  { tag: "Digital Transformation", num: "10" },
];

const TRANSITIONS = [
  { initial: { opacity: 0, scale: 1.1 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } },
  { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -60 } },
  { initial: { opacity: 0, y: 40, filter: "blur(20px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -40, filter: "blur(20px)" } },
  { initial: { clipPath: "inset(0 100% 0 0)" }, animate: { clipPath: "inset(0 0% 0 0)" }, exit: { clipPath: "inset(0 0 0 100%)" } },
  { initial: { opacity: 0, scale: 0.85, rotate: -2 }, animate: { opacity: 1, scale: 1, rotate: 0 }, exit: { opacity: 0, scale: 1.1, rotate: 2 } },
];

export function Hero() {
  const [i, setI] = useState(0);
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setI((p) => (p + 1) % SLIDES.length);
      setT(Math.floor(Math.random() * TRANSITIONS.length));
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const tr = TRANSITIONS[t];

  return (
    <section id="top" className="relative isolate min-h-screen pt-32 pb-20 px-6 md:px-12 overflow-hidden">
      {/* Background Video — infinite loop */}
      <div className="absolute inset-0 -z-20 overflow-hidden bg-[var(--background)]">
        <video
          src="/hero-video-1080p.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-35 mix-blend-screen"
        />
      </div>

      {/* slideshow backdrop */}
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="sync">
          <motion.div
            key={i}
            initial={tr.initial}
            animate={tr.animate}
            exit={tr.exit}
            transition={{ duration: 1.2, ease: [0.6, 0.05, 0.1, 1] }}
            className="absolute inset-0 flex items-end justify-end p-12 md:p-20"
          >
            <div className="text-right">
              <div className="text-[15vw] md:text-[10vw] font-display font-light leading-[0.9] text-[var(--ink)]/[0.05] select-none">
                {SLIDES[i].tag.split(" ")[0]}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 grain" />
      </div>

      <div className="max-w-[1600px] mx-auto h-full">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-12">
          <span className="w-12 h-px bg-[var(--ink)]" />
          <span>Big Little World</span>
          <span className="text-[var(--champagne)]">— Est. Ushurverse</span>
        </div>

        <h1 className="font-display font-light text-[10vw] md:text-[7vw] leading-[0.95] tracking-[-0.03em] text-balance max-w-[1400px]">
          I build websites,<br />
          <span className="italic">systems</span> &amp; automations<br />
          <span className="text-[var(--foreground)]/70">that eliminate </span>
          <span className="italic text-[var(--champagne)]">repetitive work.</span>
        </h1>

        <div className="mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="max-w-md text-base text-[var(--muted-foreground)] leading-relaxed"
          >
            Helping businesses streamline operations, automate workflows, and create digital experiences that drive growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="#contact" className="group inline-flex items-center justify-center gap-3 bg-[var(--ink)] text-[var(--bone)] px-8 py-5 text-xs uppercase tracking-[0.3em] hover:bg-[var(--champagne)] hover:text-[var(--ink)] transition-all duration-500">
              Let's build something
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a href="#work" className="group inline-flex items-center justify-center gap-3 border border-[var(--ink)] text-[var(--ink)] px-8 py-5 text-xs uppercase tracking-[0.3em] hover:bg-[var(--ink)] hover:text-[var(--bone)] transition-all duration-500">
              View my work
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-20 flex items-center justify-between border-t border-[var(--border)] pt-6"
        >
          <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em]">
            <span className="text-[var(--champagne)]">{SLIDES[i].num}</span>
            <span>/ Now showing</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="font-display normal-case tracking-normal text-sm"
              >
                {SLIDES[i].tag}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] hidden md:block">
            Scroll ↓
          </div>
        </motion.div>
      </div>
    </section>
  );
}