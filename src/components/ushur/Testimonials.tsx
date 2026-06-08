import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const T = [
  { q: "Usherverse rebuilt our entire operations stack in eight weeks. We've reclaimed roughly twenty hours a week, every week.", a: "Naledi K.", r: "COO, Logistics Group" },
  { q: "Equal parts designer, engineer and operator. The system he shipped is the calmest software we own.", a: "Marcus D.", r: "Founder, FinTech Studio" },
  { q: "He looked at a workflow we'd lived with for years and quietly removed it. The result is honestly elegant.", a: "Imani R.", r: "Director, Health Practice" },
  { q: "The brand site looks like it belongs in a magazine. The CMS behind it is even better than the front.", a: "Jules P.", r: "Creative Director" },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % T.length), 6000);
    return () => clearInterval(id);
  }, []);
  return (
    <section className="relative py-32 px-6 md:px-12 bg-[var(--ink)] text-[var(--bone)] [clip-path:inset(0)] transform-gpu">
      <div className="absolute -top-[100svh] bottom-0 left-0 right-0 z-0">
        <div 
          className="sticky top-0 w-full h-[100svh] bg-cover bg-center will-change-transform"
          style={{ backgroundImage: "url('/testimonials.jpg')" }}
        />
      </div>
      <div className="max-w-[1600px] mx-auto relative z-10 backdrop-blur-2xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl p-8 md:p-16 transform-gpu">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--bone)]/60 mb-16">
          <span className="text-[var(--champagne)]">07</span>
          <span className="w-12 h-px bg-[var(--bone)]/40" />
          <span>Voices</span>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-end mb-16 relative z-10">
          <h2 className="md:col-span-8 font-display font-light text-[7vw] md:text-[4.5vw] leading-[0.95] tracking-[-0.02em]">
            Operators, founders<br />and creative directors.
          </h2>
          <div className="md:col-span-4 flex gap-3 md:justify-end">
            {T.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)}
                className={`h-px transition-all duration-500 shadow-sm ${i === idx ? "w-16 bg-[var(--champagne)]" : "w-10 bg-[var(--bone)]"}`} />
            ))}
          </div>
        </div>

        <div className="relative min-h-[260px] z-10">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
              transition={{ duration: 0.7, ease: [0.6, 0.05, 0.1, 1] }}
              className="max-w-5xl"
            >
              <p className="font-display font-light text-3xl md:text-5xl leading-[1.15] tracking-[-0.01em]">
                <span className="text-[var(--champagne)]">"</span>{T[i].q}<span className="text-[var(--champagne)]">"</span>
              </p>
              <div className="mt-10 flex items-center gap-4 text-xs uppercase tracking-[0.3em]">
                <span className="w-12 h-px bg-[var(--champagne)]" />
                <span>{T[i].a}</span>
                <span className="text-[var(--bone)]/70">— {T[i].r}</span>
              </div>
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}