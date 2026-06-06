import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 84, suffix: "+", label: "Projects Completed" },
  { value: 37, suffix: "+", label: "Systems Built" },
  { value: 12500, suffix: "h", label: "Hours Saved" },
  { value: 46, suffix: "+", label: "Businesses Served" },
  { value: 220, suffix: "+", label: "Automations Created" },
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
  return (
    <section id="about" className="relative py-32 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-16">
          <span className="text-[var(--champagne)]">02</span>
          <span className="w-12 h-px bg-[var(--ink)]" />
          <span>The Studio</span>
        </div>

        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.6, 0.05, 0.1, 1] }}
              className="font-display font-light text-[7vw] md:text-[5vw] leading-[0.95] tracking-[-0.02em] text-balance"
            >
              I build <em className="text-[var(--champagne)]">technology</em> that works for people —
              <span className="text-[var(--muted-foreground)]"> systems that quietly do the heavy lifting.</span>
            </motion.h2>
          </div>

          <div className="md:col-span-5 md:pt-6 space-y-8 text-[var(--muted-foreground)] leading-relaxed">
            <p className="text-base">
              Ushurverse is a one-person studio practicing at the intersection of design,
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

        <div className="mt-32 grid grid-cols-2 md:grid-cols-5 gap-px bg-[var(--border)] border border-[var(--border)]">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.08 }}
              className="bg-[var(--background)] p-8 group hover:bg-[var(--ink)] hover:text-[var(--bone)] transition-colors duration-500"
            >
              <div className="font-display text-5xl md:text-6xl font-light tracking-tight">
                <Count to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] group-hover:text-[var(--bone)]/60">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}