import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Search, Filter } from "lucide-react";
import { Nav } from "@/components/ushur/Nav";
import { Footer } from "@/components/ushur/Footer";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Problems I've Solved — Usherverse" },
      { name: "description", content: "Real systems designed and built by Usherverse. From fintech platforms to custom business systems — each project started with a problem." },
    ],
  }),
  component: ProjectsPage,
});

interface Project {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  industry: string;
  category: string;
  featured_image?: string;
  technologies?: string[];
  featured: boolean;
  metrics?: { value: string; label: string }[];
  project_url?: string;
}

const CATEGORY_TEXT: Record<string, string> = {
  "Fintech": "#4ade80",
  "Beauty": "#f472b6",
  "Business": "#a78bfa",
  "E-commerce": "#fbbf24",
  "Healthcare": "#22d3ee",
  "Education": "#60a5fa",
};

const CATEGORY_BG: Record<string, string> = {
  "Fintech": "rgba(34,197,94,0.12)",
  "Beauty": "rgba(236,72,153,0.12)",
  "Business": "rgba(124,58,237,0.12)",
  "E-commerce": "rgba(245,158,11,0.12)",
  "Healthcare": "rgba(6,182,212,0.12)",
  "Education": "rgba(59,130,246,0.12)",
};

function ProjectListCard({ project, index }: { project: Project; index: number }) {
  const accent = CATEGORY_TEXT[project.industry] || "var(--champagne)";
  const bg = CATEGORY_BG[project.industry] || "rgba(255,255,255,0.04)";

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.07 }}
      className="group relative overflow-hidden rounded-3xl border border-white/8 hover:border-white/15 transition-all duration-500 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {project.featured_image ? (
          <img
            src={project.featured_image}
            alt={project.title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: bg }}>
            <span className="font-display text-5xl text-white/8">{project.title[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {project.featured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-yellow-300 bg-yellow-300/15 border border-yellow-300/25">
              ⭐ Featured
            </span>
          )}
          <span
            className="px-3 py-1 rounded-full text-[10px] font-medium"
            style={{ color: accent, background: bg, border: `1px solid ${accent}25` }}
          >
            {project.industry || project.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 gap-3">
        <h2 className="font-display text-xl font-light text-white group-hover:text-[var(--champagne)] transition-colors duration-300">
          {project.title}
        </h2>
        <p className="text-white/45 text-sm leading-relaxed line-clamp-2 flex-1">
          {project.short_description}
        </p>

        {project.metrics && project.metrics.length > 0 && (
          <div className="flex gap-5 flex-wrap py-3 border-y border-white/5">
            {project.metrics.slice(0, 3).map((m, i) => (
              <div key={i}>
                <div className="font-display text-xl font-light" style={{ color: accent }}>{m.value}</div>
                <div className="text-white/25 text-[10px] uppercase tracking-widest">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:gap-3"
          style={{ color: accent }}
          id={`project-link-${project.slug}`}
        >
          View Case Study <ArrowRight className="w-3.5 h-3.5 transition-all" />
        </Link>
      </div>
    </motion.article>
  );
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.industry || p.category).filter(Boolean)))];

  const filtered = projects.filter((p) => {
    const matchesSearch =
      query === "" ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.short_description?.toLowerCase().includes(query.toLowerCase()) ||
      p.industry?.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.industry === activeCategory || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <Nav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 30% 0%, var(--champagne), transparent 55%)" }}
        />
        <div className="max-w-[1400px] mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/30 mb-8">
              <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[var(--champagne)]">Problems I've Solved</span>
            </div>
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-7">
                <h1 className="font-display text-[12vw] md:text-[7vw] font-light leading-[0.9] tracking-[-0.02em] mb-6">
                  Problems<br />
                  <em className="text-[var(--champagne)]">I've Solved</em>
                </h1>
                <p className="text-white/40 text-lg max-w-xl leading-relaxed">
                  Real systems designed and built from scratch. Each project started with a problem — here's what was built to solve it.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="px-6 md:px-12 mb-10">
        <div className="max-w-[1400px] mx-auto flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search projects..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id="projects-search"
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors w-56"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                id={`filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={
                  activeCategory === cat
                    ? { background: "var(--champagne)", color: "black" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="ml-auto text-xs text-white/25">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 rounded-3xl border border-white/8 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display text-2xl text-white mb-2">No projects found</h3>
              <p className="text-white/30 text-sm">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <ProjectListCard key={p.id} project={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-24 border-t border-white/6">
        <div className="max-w-[1400px] mx-auto pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl font-light text-white mb-2">Have a problem to solve?</h2>
            <p className="text-white/35 text-sm">Let's talk about what you need built.</p>
          </div>
          <a
            href="/#contact"
            id="projects-contact-cta"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-medium text-black shrink-0 transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--champagne), oklch(0.7 0.3 22))" }}
          >
            Start a conversation <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
