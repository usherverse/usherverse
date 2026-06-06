import { motion } from "framer-motion";

const GROUPS = [
  { label: "Frontend", items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind"] },
  { label: "Backend", items: ["Node.js", "Express", "REST", "GraphQL", "Edge Functions"] },
  { label: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "Supabase", "Redis"] },
  { label: "Automation", items: ["n8n", "Zapier", "Make", "Custom APIs", "Cron", "Webhooks"] },
  { label: "AI", items: ["OpenAI", "Anthropic", "Gemini", "RAG", "Embeddings", "Agents"] },
  { label: "Design", items: ["Figma", "Adobe Suite", "Framer", "Design Tokens"] },
];

export function Stack() {
  return (
    <section className="relative py-32 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-16">
          <span className="text-[var(--champagne)]">06</span>
          <span className="w-12 h-px bg-[var(--ink)]" />
          <span>Instruments</span>
        </div>

        <div className="grid md:grid-cols-12 gap-12 mb-20">
          <h2 className="md:col-span-7 font-display font-light text-[8vw] md:text-[5vw] leading-[0.95] tracking-[-0.02em]">
            Tools are<br /><em className="text-[var(--champagne)]">vocabulary.</em>
          </h2>
          <p className="md:col-span-5 md:pt-4 text-[var(--muted-foreground)] leading-relaxed">
            A curated stack chosen for ergonomics, longevity, and the ability to ship without
            apologising. The work, not the tooling, is the point.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {GROUPS.map((g, i) => (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="border-t border-[var(--ink)] pt-6"
            >
              <div className="flex items-center justify-between mb-6 text-xs uppercase tracking-[0.3em]">
                <span>{g.label}</span>
                <span className="text-[var(--champagne)]">0{i + 1}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.items.map((it) => (
                  <span key={it} className="font-display text-2xl md:text-3xl font-light leading-none mr-3 hover:text-[var(--champagne)] hover:italic transition-all cursor-default">
                    {it}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}