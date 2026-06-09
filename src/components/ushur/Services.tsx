import { motion } from "framer-motion";
import { useLazyBg } from "@/hooks/use-lazy-bg";

const SERVICES = [
  {
    num: "01",
    title: "Website Development",
    desc: "Corporate, portfolio, landing, e-commerce, and bespoke web applications.",
    items: ["Corporate sites", "Portfolios", "Landing pages", "E-commerce", "Web apps"],
  },
  {
    num: "02",
    title: "System Development",
    desc: "CRMs, ERPs, booking, inventory, school, hospital and HR systems built to scale.",
    items: ["CRM / ERP", "Booking", "Inventory", "School & Hospital", "HR & Ops"],
  },
  {
    num: "03",
    title: "Business Automation",
    desc: "Workflows that quietly run the business — approvals, reports, comms, documents.",
    items: ["Workflow automation", "Reporting", "Document generation", "Approvals", "Comms"],
  },
  {
    num: "04",
    title: "AI Solutions",
    desc: "Integrations, assistants, and knowledge bases that augment human capacity.",
    items: ["AI integrations", "Chatbots", "Knowledge bases", "AI workflows", "Assistants"],
  },
  {
    num: "05",
    title: "UI / UX Design",
    desc: "Research-led interfaces and design systems with editorial sensibility.",
    items: ["User research", "Wireframing", "Prototyping", "Interface design", "Design systems"],
  },
  {
    num: "06",
    title: "Custom Solutions",
    desc: "When the problem is unique, the solution is too. Bespoke from first principles.",
    items: ["Discovery", "Strategy", "Bespoke build", "Integration", "Ongoing care"],
  },
];

export function Services() {
  const [bgRef, bgStyle] = useLazyBg('/2.webp');
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
          <span className="text-[var(--champagne)]">03</span>
          <span className="w-12 h-px bg-white/30" />
          <span className="text-white drop-shadow-md">Capabilities</span>
        </div>

        <div className="grid md:grid-cols-12 gap-12 mb-24">
          <h2 className="md:col-span-8 font-display font-light text-[8vw] md:text-[5.5vw] leading-[0.95] tracking-[-0.02em] text-white drop-shadow-lg">
            A studio that<br />
            <em className="text-[var(--champagne)] drop-shadow-none">designs, ships</em><br />
            and automates.
          </h2>
          <p className="md:col-span-4 md:pt-6 text-white/70 leading-relaxed drop-shadow-md">
            Six disciplines. One operator. Every engagement combines strategy, design,
            development and automation into a single, accountable practice.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          {SERVICES.map((s, i) => (
            <motion.article
              key={s.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: (i % 3) * 0.1 }}
              className="bg-black/30 p-10 group relative overflow-hidden cursor-pointer min-h-[420px] flex flex-col hover:bg-[var(--ink)] hover:text-[var(--bone)] transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-12">
                <span className="text-xs tracking-[0.3em] text-[var(--champagne)]">{s.num}</span>
                <span className="text-2xl opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-500">→</span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl font-light leading-tight mb-4 group-hover:translate-x-2 transition-transform duration-500 drop-shadow-md">
                {s.title}
              </h3>
              <p className="text-white/70 group-hover:text-[var(--bone)]/80 mb-8 leading-relaxed transition-colors duration-500">{s.desc}</p>
              <ul className="mt-auto space-y-2 text-xs uppercase tracking-[0.2em] text-white/80 group-hover:text-[var(--bone)] transition-colors duration-500">
                {s.items.map((it) => (
                  <li key={it} className="flex items-center gap-3 border-t border-white/10 group-hover:border-[var(--bone)]/20 pt-2 transition-colors duration-500">
                    <span className="text-[var(--champagne)]">—</span>{it}
                  </li>
                ))}
              </ul>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-1000 scale-110 group-hover:scale-100 pointer-events-none mix-blend-screen" 
                style={{ 
                  backgroundImage: "url('/abstract-texture.png')", 
                  backgroundSize: "300%",
                  backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 100}%` 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}