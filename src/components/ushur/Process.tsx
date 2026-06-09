import { motion } from "framer-motion";
import { useLazyBg } from "@/hooks/use-lazy-bg";

const STEPS = [
  { n: "01", t: "Discovery", d: "Listen, audit, and map the real problem beneath the request." },
  { n: "02", t: "Strategy", d: "Frame the smallest decisive intervention and the metrics that matter." },
  { n: "03", t: "Design", d: "Translate strategy into editorial, considered interface." },
  { n: "04", t: "Development", d: "Engineer with restraint — fast, typed, observable." },
  { n: "05", t: "Testing", d: "Adversarial QA across devices, edge cases, and humans." },
  { n: "06", t: "Launch", d: "Ship deliberately. Document. Hand over with care." },
  { n: "07", t: "Optimization", d: "Measure, refine, automate — the work compounds." },
];

export function Process() {
  const [bgRef, bgStyle] = useLazyBg('/3.webp');
  return (
    <section className="relative py-32 px-6 md:px-12 text-white [clip-path:inset(0)] transform-gpu">
      <div className="absolute -top-[100svh] bottom-0 left-0 right-0 z-0">
        <div 
          ref={bgRef}
          className="sticky top-0 w-full h-[100svh] bg-cover bg-center will-change-transform"
          style={bgStyle}
        />
      </div>
      <div className="max-w-[1600px] mx-auto relative z-10 backdrop-blur-md bg-black/40 border border-white/10 shadow-2xl rounded-3xl p-8 md:p-16 transform-gpu">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/60 mb-16">
          <span className="text-[var(--champagne)]">05</span>
          <span className="w-12 h-px bg-white/30" />
          <span className="text-white drop-shadow-md">Method</span>
        </div>

        <h2 className="font-display font-light text-[8vw] md:text-[5.5vw] leading-[0.95] tracking-[-0.02em] max-w-5xl mb-24 text-white drop-shadow-lg">
          Seven movements,<br />
          <em className="text-[var(--champagne)] drop-shadow-none">one rhythm.</em>
        </h2>

        <div className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md p-8 md:p-12">
          <div className="absolute left-0 right-0 top-0 h-px bg-white/10" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="group grid md:grid-cols-12 gap-8 py-10 border-b border-white/10 hover:bg-[var(--ink)] hover:text-[var(--bone)] transition-colors duration-500 px-4 -mx-4 rounded-xl"
            >
              <div className="md:col-span-2 text-xs uppercase tracking-[0.3em] text-[var(--champagne)] drop-shadow-md">{s.n}</div>
              <div className="md:col-span-4 font-display text-4xl md:text-6xl font-light tracking-tight group-hover:translate-x-3 transition-transform duration-500 drop-shadow-md">
                {s.t}
              </div>
              <div className="md:col-span-5 md:pt-3 text-base text-white/70 group-hover:text-[var(--bone)]/70 leading-relaxed">
                {s.d}
              </div>
              <div className="md:col-span-1 flex md:justify-end items-start pt-2 text-2xl opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-500 drop-shadow-md">
                →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}