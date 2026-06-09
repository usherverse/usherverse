import { motion } from "framer-motion";

const C = [
  { n: "I", t: "Design Thinking", d: "Editorial sensibility, ruthless restraint, and interfaces that feel composed — not assembled." },
  { n: "II", t: "Technical Expertise", d: "Typed, observable, scalable systems engineered for the long haul, not the demo." },
  { n: "III", t: "Automation Mindset", d: "If a human is doing it twice, a machine should be doing it. The hours saved are the brief." },
];

export function Why() {
  return (
    <section className="relative py-32 px-6 md:px-12 [clip-path:inset(0)] transform-gpu">
      <div className="absolute -top-[100svh] bottom-0 left-0 right-0 z-0">
        <div 
          className="sticky top-0 w-full h-[100svh] bg-cover bg-center will-change-transform"
          style={{ backgroundImage: "url('/three disciplines.webp')" }}
        />
      </div>
      <div className="max-w-[1600px] mx-auto relative z-10 backdrop-blur-2xl bg-black/40 border border-white/10 shadow-2xl rounded-3xl p-8 md:p-16 transform-gpu">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/60 mb-16">
          <span className="text-[var(--champagne)]">08</span>
          <span className="w-12 h-px bg-white/30" />
          <span className="text-white drop-shadow-md">Why Work With Me</span>
        </div>

        <h2 className="font-display font-light text-[8vw] md:text-[5.5vw] leading-[0.95] tracking-[-0.02em] mb-20 max-w-5xl text-white drop-shadow-lg">
          Three disciplines.<br />
          <em className="text-[var(--champagne)] drop-shadow-none">One operator.</em>
        </h2>

        <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          {C.map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="bg-black/30 p-12 min-h-[380px] flex flex-col group hover:bg-neutral-200 hover:text-[var(--bone)] transition-colors duration-500"
            >
              <div className="font-display text-7xl text-[var(--champagne)] italic mb-12 drop-shadow-md">{c.n}</div>
              <h3 className="font-display text-3xl md:text-4xl font-light mb-6 text-white group-hover:text-[var(--champagne)] drop-shadow-sm transition-colors duration-500">{c.t}</h3>
              <p className="text-white/70 group-hover:text-neutral-600 leading-relaxed mt-auto transition-colors duration-500">
                {c.d}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}