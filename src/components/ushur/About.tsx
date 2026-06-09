import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLazyBg } from "@/hooks/use-lazy-bg";

const STATS = [
  { isText: true, text: "Frontend", label: "Development" },
  { isText: true, text: "Responsive", label: "Design" },
  { isText: true, text: "API", label: "Integration" },
  { isText: true, text: "UI/UX", label: "Prototyping" },
  { isText: false, value: 300, suffix: "+", label: "Cups of Coffee" },
  { isText: false, value: 50, suffix: "+", label: "Late Nights Coded" },
];

function Count({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(eased * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

export function About() {
  const [bgRef, bgStyle] = useLazyBg('/1.webp');
  return (
    <section className="relative py-32 px-6 md:px-12 text-white [clip-path:inset(0)] transform-gpu">
      <div className="absolute -top-[100svh] bottom-0 left-0 right-0 z-0">
        <div 
          ref={bgRef}
          className="sticky top-0 w-full h-[100svh] bg-cover bg-center will-change-transform"
          style={bgStyle}
        />
      </div>
      <div 
        className="max-w-[1600px] mx-auto relative z-10 backdrop-blur-md bg-black/40 border border-white/10 shadow-2xl rounded-3xl p-8 md:p-16 transform-gpu will-change-transform"
        style={{ willChange: "transform, backdrop-filter" }}
      >
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/60 mb-16">
          <span className="text-[var(--champagne)]">02</span>
          <span className="w-12 h-px bg-white/30" />
          <span className="text-white drop-shadow-md">The Studio</span>
        </div>

        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.6, 0.05, 0.1, 1] }}
              className="font-display font-light text-[7vw] md:text-[5vw] leading-[0.95] tracking-[-0.02em] text-balance text-white drop-shadow-lg"
            >
              I build <em className="text-[var(--champagne)] drop-shadow-none">technology</em> that works for people —
              <span className="text-white/70"> systems that quietly do the heavy lifting.</span>
            </motion.h2>
          </div>

          <div className="md:col-span-5 md:pt-6 space-y-8 text-[var(--muted-foreground)] leading-relaxed">
            <p className="text-base">
              Usherverse is a one-person studio practicing at the intersection of design,
              engineering, and operations. The mandate is simple: take what's manual,
              fragmented, and slow, and rebuild it as something quiet, fast, and inevitable.
            </p>
            <p>
              Years of shipping production interfaces, internal tools, and bespoke automations
              for founders, agencies, and operators across industries — always with a bias
              toward clarity, performance, and the kind of polish that earns trust.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 text-xs uppercase tracking-[0.2em] text-[var(--ink)]">
              <div>
                <div className="text-[var(--champagne)] mb-2">Philosophy</div>
                Less surface, more system.
              </div>
              <div>
                <div className="text-[var(--champagne)] mb-2">Approach</div>
                Design as engineering.
              </div>
            </div>
          </div>
        </div>

        <div 
          className="mt-32 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md transform-gpu will-change-transform"
          style={{ willChange: "transform, backdrop-filter" }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className="bg-black/30 p-8 group hover:bg-[var(--ink)] hover:text-[var(--bone)] transition-colors duration-500 flex flex-col justify-center text-white"
            >
              <div className={`font-display font-light tracking-tight drop-shadow-md ${s.isText ? 'text-2xl md:text-3xl' : 'text-4xl md:text-5xl'}`}>
                {s.isText ? s.text : <Count to={s.value as number} suffix={s.suffix as string} />}
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-[0.25em] text-white/60 group-hover:text-[var(--bone)]/60">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}