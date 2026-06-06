import { motion } from "framer-motion";
import { useState } from "react";

const FILTERS = ["All", "Websites", "Systems", "Automation", "AI", "Design"];

const PROJECTS = [
  { tag: "Systems", title: "Meridian CRM", year: "2025", color: "from-stone-300 to-stone-500", note: "Unified pipeline & ops for a 40-seat agency. -68% admin time." },
  { tag: "Websites", title: "Atelier Noir", year: "2025", color: "from-neutral-700 to-neutral-900", note: "Editorial commerce for an independent fashion house." },
  { tag: "Automation", title: "Flowbridge", year: "2024", color: "from-amber-200 to-amber-400", note: "Document, invoice & approval automation across 7 tools." },
  { tag: "AI", title: "Lumen Assistant", year: "2025", color: "from-zinc-200 to-zinc-400", note: "Knowledge-grounded assistant for a legal practice." },
  { tag: "Design", title: "North Star System", year: "2024", color: "from-stone-200 to-stone-400", note: "Design system & token pipeline for a SaaS platform." },
  { tag: "Systems", title: "Korex Hospital OS", year: "2025", color: "from-neutral-300 to-neutral-500", note: "Patient, billing & inventory ops for a 200-bed facility." },
];

export function Work() {
  const [f, setF] = useState("All");
  const items = f === "All" ? PROJECTS : PROJECTS.filter((p) => p.tag === f);

  return (
    <section id="work" className="relative py-32 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-16">
          <span className="text-[var(--champagne)]">04</span>
          <span className="w-12 h-px bg-[var(--ink)]" />
          <span>Selected Work</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-8 mb-16">
          <h2 className="font-display font-light text-[8vw] md:text-[6vw] leading-[0.95] tracking-[-0.02em]">
            A small archive of<br />
            <em>quiet, decisive work.</em>
          </h2>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((x) => (
              <button
                key={x}
                onClick={() => setF(x)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.25em] border transition-all duration-300 ${
                  f === x
                    ? "bg-[var(--ink)] text-[var(--bone)] border-[var(--ink)]"
                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-20">
          {items.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, delay: (i % 2) * 0.15 }}
              className={`group cursor-pointer ${i % 2 === 1 ? "md:mt-32" : ""}`}
            >
              <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${p.color}`}>
                <div className="absolute inset-0 grain" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-[20vw] md:text-[12vw] font-light text-white/10 select-none">
                    {p.title.split(" ").map((w) => w[0]).join("")}
                  </span>
                </div>
                <div className="absolute inset-0 bg-[var(--ink)]/0 group-hover:bg-[var(--ink)]/30 transition-colors duration-700" />
                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-[var(--bone)] text-sm leading-relaxed max-w-md">{p.note}</p>
                </div>
                <div className="absolute top-6 left-6 text-xs uppercase tracking-[0.3em] text-[var(--bone)]/80 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--champagne)]" />
                  {p.tag} — {p.year}
                </div>
              </div>
              <div className="flex items-end justify-between mt-6">
                <h3 className="font-display text-3xl md:text-4xl font-light tracking-tight">
                  {p.title}
                </h3>
                <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] group-hover:text-[var(--champagne)] transition-colors">
                  Case study →
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}