import { motion } from "framer-motion";

const C = [
  { n: "I", t: "Design Thinking", d: "Editorial sensibility, ruthless restraint, and interfaces that feel composed — not assembled." },
  { n: "II", t: "Technical Expertise", d: "Typed, observable, scalable systems engineered for the long haul, not the demo." },
  { n: "III", t: "Automation Mindset", d: "If a human is doing it twice, a machine should be doing it. The hours saved are the brief." },
];

export function Why() {
  return (
    <section className="relative py-32 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-16">
          <span className="text-[var(--champagne)]">08</span>
          <span className="w-12 h-px bg-[var(--ink)]" />
          <span>Why Work With Me</span>
        </div>

        <h2 className="font-display font-light text-[8vw] md:text-[5.5vw] leading-[0.95] tracking-[-0.02em] mb-20 max-w-5xl">
          Three disciplines.<br />
          <em className="text-[var(--champagne)]">One operator.</em>
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-[var(--border)] border border-[var(--border)]">
          {C.map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="bg-[var(--background)] p-12 min-h-[380px] flex flex-col group hover:bg-[var(--ink)] hover:text-[var(--bone)] transition-colors duration-500"
            >
              <div className="font-display text-7xl text-[var(--champagne)] italic mb-12">{c.n}</div>
              <h3 className="font-display text-3xl md:text-4xl font-light mb-6">{c.t}</h3>
              <p className="text-[var(--muted-foreground)] group-hover:text-[var(--bone)]/70 leading-relaxed mt-auto">
                {c.d}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}