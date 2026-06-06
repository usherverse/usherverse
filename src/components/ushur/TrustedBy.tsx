import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

const BRANDS = [
  { name: "Meridian Group", type: "System Development", result: "Unified operations across 6 departments. -68% admin overhead.", mark: "MG" },
  { name: "Atelier Noir", type: "Website & Commerce", result: "Editorial flagship that lifted average order value by 34%.", mark: "AN" },
  { name: "Korex Health", type: "Hospital Operating System", result: "Patient throughput improved by 22% in eight weeks.", mark: "KH" },
  { name: "Flowbridge", type: "Workflow Automation", result: "Replaced 9 manual processes across finance and ops.", mark: "FB" },
  { name: "Lumen Legal", type: "AI Knowledge Base", result: "Research time reduced from hours to minutes per matter.", mark: "LL" },
  { name: "North Star SaaS", type: "Design System", result: "Shipping velocity doubled across three product squads.", mark: "N★" },
  { name: "Halcyon Studio", type: "Brand & Web", result: "Repositioned for enterprise — pipeline grew 3.4×.", mark: "HS" },
  { name: "Verda Logistics", type: "Custom Dashboard", result: "Realtime visibility across 240+ active shipments.", mark: "VL" },
  { name: "Solene & Co.", type: "E-commerce Platform", result: "Conversion lift of 41% post-relaunch.", mark: "S&" },
  { name: "Indigo Capital", type: "Investor Portal", result: "Quarterly reporting compressed from weeks to a day.", mark: "IC" },
];

const STATEMENTS = [
  "Building digital experiences.",
  "Designing systems that scale.",
  "Automating what slows businesses down.",
  "Where design meets intelligence.",
];

function LogoTile({ b, i }: { b: (typeof BRANDS)[number]; i: number }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay: (i % 5) * 0.08, ease: [0.6, 0.05, 0.1, 1] }}
      animate={{ y: hover ? -6 : [0, -4, 0] }}
      // gentle float when idle
      style={{ animationDelay: `${i * 0.3}s` }}
      className="relative group aspect-[5/3] border border-[var(--border)] flex items-center justify-center cursor-pointer overflow-hidden bg-[var(--background)]"
    >
      <span
        className={`font-display font-light text-5xl md:text-6xl tracking-[-0.04em] transition-all duration-700 ${
          hover ? "text-[var(--champagne)] scale-110" : "text-[var(--ink)]/30 grayscale group-hover:grayscale-0"
        }`}
      >
        {b.mark}
      </span>

      {/* Floating refined card */}
      <motion.div
        initial={false}
        animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 12 }}
        transition={{ duration: 0.4, ease: [0.6, 0.05, 0.1, 1] }}
        className="absolute left-4 right-4 bottom-4 bg-[var(--ink)] text-[var(--bone)] p-5 pointer-events-none shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
      >
        <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--champagne)] mb-2">
          {b.type}
        </div>
        <div className="font-display text-xl leading-tight mb-2">{b.name}</div>
        <p className="text-xs text-[var(--bone)]/70 leading-relaxed">{b.result}</p>
      </motion.div>
    </motion.div>
  );
}

export function TrustedBy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const xSlow = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const xFast = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const yFloat = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <section ref={ref} className="relative py-32 px-6 md:px-12 overflow-hidden bg-[var(--background)]">
      {/* Massive editorial backdrop word */}
      <motion.div
        style={{ x: xSlow }}
        className="absolute -top-10 left-0 right-0 pointer-events-none select-none"
      >
        <div className="font-display italic font-light text-[22vw] leading-[0.85] tracking-[-0.05em] text-[var(--ink)]/[0.04] whitespace-nowrap">
          Trusted — Trusted — Trusted
        </div>
      </motion.div>

      <div className="max-w-[1600px] mx-auto relative">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-16">
          <span className="text-[var(--champagne)]">10</span>
          <span className="w-12 h-px bg-[var(--ink)]" />
          <span>Trusted By</span>
        </div>

        {/* Title */}
        <div className="relative">
          <motion.h2
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.6, 0.05, 0.1, 1] }}
            className="font-display font-light text-[12vw] md:text-[8vw] leading-[0.9] tracking-[-0.03em] text-balance max-w-[1500px]"
          >
            Trusted by{" "}
            <em className="text-[var(--champagne)]">visionaries</em>,
            <br />
            chosen by{" "}
            <span className="italic font-display">operators.</span>
          </motion.h2>
        </div>

        {/* Logo Wall — asymmetric */}
        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative">
          {BRANDS.slice(0, 4).map((b, i) => (
            <div key={b.name} className={i === 1 ? "md:mt-12" : i === 3 ? "md:mt-20" : ""}>
              <LogoTile b={b} i={i} />
            </div>
          ))}
        </div>

        {/* Editorial statement break */}
        <motion.div
          style={{ x: xFast }}
          className="my-32 relative"
        >
          <motion.h3
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, ease: [0.6, 0.05, 0.1, 1] }}
            className="font-display italic font-light text-[10vw] md:text-[7vw] leading-[0.95] tracking-[-0.03em] text-right"
          >
            {STATEMENTS[0]}
          </motion.h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative">
          {BRANDS.slice(4, 7).map((b, i) => (
            <div key={b.name} className={i === 1 ? "md:mt-16" : ""}>
              <LogoTile b={b} i={i + 4} />
            </div>
          ))}
        </div>

        <motion.div style={{ y: yFloat }} className="my-32">
          <motion.h3
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="font-display font-light text-[10vw] md:text-[7vw] leading-[0.95] tracking-[-0.03em] max-w-5xl"
          >
            Designing systems
            <br />
            <em className="text-[var(--champagne)]">that scale.</em>
          </motion.h3>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {BRANDS.slice(7, 10).map((b, i) => (
            <div key={b.name} className={i === 0 ? "md:mt-20" : i === 2 ? "md:mt-10" : ""}>
              <LogoTile b={b} i={i + 7} />
            </div>
          ))}
        </div>

        {/* Marquee strip */}
        <div className="mt-24 -mx-6 md:-mx-12 border-y border-[var(--border)] py-8 overflow-hidden bg-[var(--card)]">
          <div className="flex marquee w-max items-center gap-16 px-6">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <div key={i} className="flex items-center gap-16 shrink-0">
                <span className="font-display text-3xl font-light tracking-[-0.02em] text-[var(--muted-foreground)] hover:text-[var(--ink)] transition-colors whitespace-nowrap">
                  {b.name}
                </span>
                <span className="text-[var(--champagne)]">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* Credibility statement */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.6, 0.05, 0.1, 1] }}
          className="mt-32 max-w-5xl"
        >
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--champagne)] mb-8">
            — A note on the work
          </div>
          <p className="font-display font-light text-3xl md:text-5xl leading-[1.15] tracking-[-0.01em] text-balance">
            From startups to established organizations, every project is approached with the
            same commitment to <em className="text-[var(--champagne)]">excellence</em>,
            innovation, and <span className="italic">measurable results.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}