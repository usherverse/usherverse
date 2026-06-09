import { useState } from "react";
import { motion } from "framer-motion";
import { useLazyBg } from "@/hooks/use-lazy-bg";
import { 
  SiHtml5, SiCss, SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiTailwindcss, 
  SiNodedotjs, SiExpress, SiGraphql, SiPostgresql, SiMysql, SiMongodb, SiSupabase, SiRedis, 
  SiN8N, SiZapier, SiOpenai, SiFigma, SiFramer, SiGoogle 
} from "react-icons/si";
import { Network, Zap, Code, Clock, Webhook, Brain, Database, Layers, Bot, Palette, PenTool } from "lucide-react";

const GROUPS = [
  { label: "Frontend", items: [
    { name: "HTML", icon: SiHtml5, color: "#E34F26" },
    { name: "CSS", icon: SiCss, color: "#1572B6" },
    { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
    { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    { name: "React", icon: SiReact, color: "#61DAFB" },
    { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" },
    { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" }
  ]},
  { label: "Backend", items: [
    { name: "Node.js", icon: SiNodedotjs, color: "#339933" },
    { name: "Express", icon: SiExpress, color: "#ffffff" },
    { name: "REST", icon: Network, color: "#D4AF37" }, // Champagne-ish
    { name: "GraphQL", icon: SiGraphql, color: "#E10098" },
    { name: "Edge Functions", icon: Zap, color: "#FACC15" }
  ]},
  { label: "Databases", items: [
    { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
    { name: "MySQL", icon: SiMysql, color: "#4479A1" },
    { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
    { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
    { name: "Redis", icon: SiRedis, color: "#DC382D" }
  ]},
  { label: "Automation", items: [
    { name: "n8n", icon: SiN8N, color: "#FF6D5A" },
    { name: "Zapier", icon: SiZapier, color: "#FF4A00" },
    { name: "Custom APIs", icon: Code, color: "#A855F7" },
    { name: "Cron", icon: Clock, color: "#3B82F6" },
    { name: "Webhooks", icon: Webhook, color: "#10B981" }
  ]},
  { label: "AI", items: [
    { name: "OpenAI", icon: SiOpenai, color: "#412991" },
    { name: "Anthropic", icon: Brain, color: "#D97757" },
    { name: "Gemini", icon: SiGoogle, color: "#4285F4" },
    { name: "RAG", icon: Database, color: "#F59E0B" },
    { name: "Embeddings", icon: Layers, color: "#6366F1" },
    { name: "Agents", icon: Bot, color: "#EC4899" }
  ]},
  { label: "Design", items: [
    { name: "Figma", icon: SiFigma, color: "#F24E1E" },
    { name: "Adobe Suite", icon: PenTool, color: "#FF0000" },
    { name: "Framer", icon: SiFramer, color: "#0055FF" },
    { name: "Design Tokens", icon: Palette, color: "#EAB308" }
  ]},
];

function StackGroup({ g, i }: { g: typeof GROUPS[0]; i: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const items = isExpanded ? g.items : g.items.slice(0, 3);
  const hasMore = g.items.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: i * 0.08 }}
      className="border-t border-[var(--ink)] pt-6 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-8 text-xs uppercase tracking-[0.3em]">
        <span>{g.label}</span>
        <span className="text-[var(--champagne)]">0{i + 1}</span>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {items.map((it) => (
          <div
            key={it.name}
            className="group relative flex flex-col items-center gap-3 cursor-pointer"
          >
            <div 
              className="p-5 rounded-2xl bg-[var(--foreground)]/5 border border-[var(--foreground)]/10 transition-all duration-500 group-hover:-translate-y-2 flex items-center justify-center relative overflow-hidden w-full aspect-square"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 25px ${it.color}30, inset 0 0 15px ${it.color}20`;
                e.currentTarget.style.borderColor = `${it.color}60`;
                const icon = e.currentTarget.querySelector('svg');
                if (icon) {
                  icon.style.color = it.color;
                  icon.style.filter = `drop-shadow(0 0 8px ${it.color}80)`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.borderColor = '';
                const icon = e.currentTarget.querySelector('svg');
                if (icon) {
                  icon.style.color = '';
                  icon.style.filter = '';
                }
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl" 
                style={{ backgroundColor: it.color }} 
              />
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500" 
                style={{ backgroundColor: it.color }} 
              />
              <it.icon 
                size={34} 
                className="transition-all duration-500 text-[var(--foreground)]/40 relative z-10 group-hover:scale-110"
              />
            </div>
            <span className="text-[11px] font-medium tracking-widest uppercase text-[var(--foreground)]/40 group-hover:text-[var(--foreground)] transition-colors duration-300 text-center">
              {it.name}
            </span>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-8 flex justify-center mt-auto pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group relative px-6 py-2 rounded-full border border-[var(--ink)] hover:border-[var(--champagne)] transition-colors duration-300"
          >
            <div className="absolute inset-0 bg-[var(--champagne)]/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)] group-hover:text-[var(--champagne)] transition-colors duration-300 font-medium tracking-widest">
              {isExpanded ? "Show Less" : "Show More"}
            </span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

export function Stack() {
  const [bgRef, bgStyle] = useLazyBg('/5.webp');
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
          <span className="text-[var(--champagne)]">06</span>
          <span className="w-12 h-px bg-white/30" />
          <span className="text-white drop-shadow-md">Instruments</span>
        </div>

        <div className="grid md:grid-cols-12 gap-12 mb-20">
          <h2 className="md:col-span-7 font-display font-light text-[8vw] md:text-[5vw] leading-[0.95] tracking-[-0.02em] text-white drop-shadow-lg">
            Tools are<br /><em className="text-[var(--champagne)] drop-shadow-none">vocabulary.</em>
          </h2>
          <p className="md:col-span-5 md:pt-4 text-white/70 leading-relaxed drop-shadow-md">
            A curated stack chosen for ergonomics, longevity, and the ability to ship without
            apologising. The work, not the tooling, is the point.
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12 items-stretch">
          {GROUPS.map((g, i) => (
            <StackGroup key={g.label} g={g} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}