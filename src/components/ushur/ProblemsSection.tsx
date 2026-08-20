import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";

interface Project {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  industry: string;
  category: string;
  featured_image?: string;
  technologies?: string[];
  metrics?: { value: string; label: string }[];
  project_url?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Fintech": "rgba(34,197,94,0.15)",
  "Beauty": "rgba(236,72,153,0.15)",
  "Business": "rgba(124,58,237,0.15)",
  "E-commerce": "rgba(245,158,11,0.15)",
  "Healthcare": "rgba(6,182,212,0.15)",
  "Education": "rgba(59,130,246,0.15)",
};

const CATEGORY_TEXT: Record<string, string> = {
  "Fintech": "#4ade80",
  "Beauty": "#f472b6",
  "Business": "#a78bfa",
  "E-commerce": "#fbbf24",
  "Healthcare": "#22d3ee",
  "Education": "#60a5fa",
};

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const accent = CATEGORY_TEXT[project.industry] || "var(--champagne)";
  const bgAccent = CATEGORY_COLORS[project.industry] || "rgba(255,255,255,0.05)";

  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.12 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/3 hover:border-white/15 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative h-56 md:h-64 overflow-hidden bg-white/5">
        {project.featured_image ? (
          <img
            src={project.featured_image}
            alt={project.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: bgAccent }}>
            <span className="font-display text-6xl text-white/10 select-none">{project.title[0]}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-80" />
        {/* Category pill */}
        <div
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium tracking-wide"
          style={{ background: bgAccent, color: accent, border: `1px solid ${accent}30` }}
        >
          {project.industry || project.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-7 gap-4">
        <div>
          <h3 className="font-display text-2xl font-light text-white leading-tight mb-2 group-hover:text-[var(--champagne)] transition-colors duration-300">
            {project.title}
          </h3>
          <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
            {project.short_description}
          </p>
        </div>

        {/* Metrics */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="flex gap-4 flex-wrap">
            {project.metrics.slice(0, 3).map((m, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-2xl font-light" style={{ color: accent }}>{m.value}</div>
                <div className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tech pills */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-auto">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider text-white/40 border border-white/8"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/6 mt-2">
          <Link
            to="/projects/$slug"
            params={{ slug: project.slug }}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: accent }}
            id={`view-case-study-${project.slug}`}
          >
            View Case Study
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Live Demo <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ProblemsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects?featured=true")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && projects.length === 0) return null;

  return (
    <section id="work" className="relative py-32 px-6 md:px-12 overflow-hidden">
      {/* Subtle ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-10 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, var(--champagne), transparent 70%)" }}
      />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Section header */}
        <div className="grid md:grid-cols-12 gap-8 mb-20">
          <div className="md:col-span-8">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/40 mb-8">
              <span className="text-[var(--champagne)]">04</span>
              <span className="w-12 h-px bg-white/20" />
              <span>Selected Work</span>
            </div>
            <h2 className="font-display text-[10vw] md:text-[5.5vw] font-light leading-[0.9] tracking-[-0.02em] text-white">
              Problems<br />
              <em className="text-[var(--champagne)]">I've Solved</em>
            </h2>
          </div>
          <div className="md:col-span-4 md:pt-6 flex flex-col justify-end gap-6">
            <p className="text-white/50 leading-relaxed text-sm">
              I don't just build websites. I build systems that solve real business problems.
              Each project below started with a challenge — and ended with something that works.
            </p>
            <Link
              to="/projects"
              id="view-all-projects-link"
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--champagne)] hover:gap-3 transition-all"
            >
              View all projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Project cards */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-96 rounded-3xl border border-white/8 animate-pulse"
                style={{ background: "rgba(255,255,255,0.03)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Link
              to="/projects"
              id="see-all-work-btn"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-medium text-black transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg, var(--champagne), oklch(0.7 0.3 22))" }}
            >
              See all my work
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
