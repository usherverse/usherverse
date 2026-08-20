import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ExternalLink, Github, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Nav } from "@/components/ushur/Nav";
import { Footer } from "@/components/ushur/Footer";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Case Study — Usherverse` },
      { name: "description", content: "A detailed case study from Usherverse — problem, solution, and results." },
    ],
  }),
  component: CaseStudyPage,
});

interface GalleryItem {
  url: string;
  caption?: string;
  type?: string;
}

interface Metric {
  value: string;
  label: string;
}

interface Project {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  client_name?: string;
  industry?: string;
  category?: string;
  project_date?: string;
  role?: string;
  problem: string;
  solution: string;
  results?: string;
  key_features?: Array<{ title: string; points: string } | string>;
  metrics?: Metric[];
  technologies?: string[];
  featured_image?: string;
  gallery?: GalleryItem[];
  video_url?: string;
  project_url?: string;
  github_url?: string;
}

function Lightbox({ images, index, onClose, onPrev, onNext }: {
  images: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={onClose}
        id="lightbox-close"
      >
        <X className="w-5 h-5" />
      </button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        id="lightbox-prev"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <img
        src={images[index].url}
        alt={images[index].caption || ""}
        className="max-w-5xl max-h-[85vh] w-full object-contain rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        id="lightbox-next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      {images[index].caption && (
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm">
          {images[index].caption}
        </p>
      )}
    </motion.div>
  );
}

function CaseStudyPage() {
  const { slug } = useParams({ from: "/projects/$slug" });
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setProject)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Nav />
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--champagne)] border-t-transparent animate-spin" />
          <p className="text-white/30 text-sm">Loading case study...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6">
        <Nav />
        <h1 className="font-display text-4xl text-white">Project not found</h1>
        <Link to="/projects" className="text-[var(--champagne)] hover:opacity-80 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to all projects
        </Link>
      </div>
    );
  }

  const gallery = project.gallery || [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <Nav />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, var(--champagne), transparent 60%)`
          }}
        />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Breadcrumb */}
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-10 transition-colors group"
              id="back-to-projects"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              All Projects
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {project.industry && (
                <span className="px-3 py-1 rounded-full text-xs border text-[var(--champagne)] border-[var(--champagne)]/30 bg-[var(--champagne)]/10">
                  {project.industry}
                </span>
              )}
              {project.category && (
                <span className="px-3 py-1 rounded-full text-xs border text-white/40 border-white/15">
                  {project.category}
                </span>
              )}
              {project.project_date && (
                <span className="text-white/25 text-xs">
                  {new Date(project.project_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </span>
              )}
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-light leading-[0.9] tracking-[-0.02em] mb-6">
              {project.title}
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-2xl leading-relaxed mb-8">
              {project.short_description}
            </p>

            {/* Action links */}
            <div className="flex items-center gap-4">
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="project-live-link"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-black transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, var(--champagne), oklch(0.7 0.3 22))" }}
                >
                  View Live <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="project-github-link"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/70 border border-white/15 hover:border-white/30 transition-all"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      {project.featured_image && (
        <section className="px-6 md:px-12 mb-16">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative rounded-3xl overflow-hidden border border-white/8 aspect-video"
            >
              <img
                src={project.featured_image}
                alt={project.title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </motion.div>
          </div>
        </section>
      )}

      {/* Problem + Solution */}
      <section className="px-6 md:px-12 mb-16">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 border border-white/8"
            style={{ background: "rgba(220,38,38,0.04)" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(220,38,38,0.12)" }}>
                <span className="text-red-400 text-sm font-bold">!</span>
              </div>
              <h2 className="text-xs uppercase tracking-[0.3em] text-red-400/80 font-medium">The Problem</h2>
            </div>
            <p className="text-white/70 leading-relaxed">{project.problem}</p>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-3xl p-8 border border-white/8"
            style={{ background: "rgba(34,197,94,0.04)" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.12)" }}>
                <span className="text-green-400 text-sm font-bold">✓</span>
              </div>
              <h2 className="text-xs uppercase tracking-[0.3em] text-green-400/80 font-medium">The Solution</h2>
            </div>
            <p className="text-white/70 leading-relaxed">{project.solution}</p>
          </motion.div>
        </div>
      </section>

      {/* Metrics */}
      {project.metrics && project.metrics.length > 0 && (
        <section className="px-6 md:px-12 mb-16">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {project.metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="text-center py-8 rounded-3xl border border-white/8"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="font-display text-5xl font-light text-[var(--champagne)] mb-2">{m.value}</div>
                  <div className="text-white/30 text-xs uppercase tracking-widest">{m.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Key Features */}
      {project.key_features && project.key_features.length > 0 && (
        <section className="px-6 md:px-12 mb-16">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="font-display text-3xl font-light text-white mb-2">Key Features</h2>
              <p className="text-white/30 text-sm">What was built into this system</p>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-4">
              {project.key_features.map((feature, i) => {
                // Handle both old format (string) and new format ({ title, points })
                const isStructured = typeof feature === "object" && feature !== null;
                const title = isStructured ? (feature as any).title : feature as string;
                const points = isStructured ? ((feature as any).points || "") : "";
                const bulletPoints = points.split("\n").filter((p: string) => p.trim());

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="p-5 rounded-2xl border border-white/6"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-[var(--champagne)] text-sm font-mono shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}.</span>
                      <h3 className="text-white text-sm font-semibold leading-snug">{title}</h3>
                    </div>
                    {bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 pl-7">
                        {bulletPoints.map((pt: string, j: number) => (
                          <li key={j} className="flex items-start gap-2 text-white/50 text-xs leading-relaxed">
                            <span className="text-[var(--champagne)]/60 shrink-0 mt-0.5">›</span>
                            <span>{pt.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="px-6 md:px-12 mb-16">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="font-display text-3xl font-light text-white mb-2">The Interface</h2>
              <p className="text-white/30 text-sm">Screenshots of the finished product</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-4">
              {gallery.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={`relative overflow-hidden rounded-2xl border border-white/8 cursor-zoom-in group ${i === 0 ? "md:col-span-2" : ""}`}
                  style={{ aspectRatio: i === 0 ? "16/7" : "16/9" }}
                  onClick={() => setLightboxIndex(i)}
                  id={`gallery-img-${i}`}
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Screenshot ${i + 1}`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <ArrowUpRight className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white/60 text-xs">{img.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video */}
      {project.video_url && (
        <section className="px-6 md:px-12 mb-16">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-display text-3xl font-light text-white mb-6">Demo</h2>
            <div className="rounded-3xl overflow-hidden border border-white/8 aspect-video">
              <iframe
                src={project.video_url}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                title="Project demo"
              />
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {project.results && (
        <section className="px-6 md:px-12 mb-16">
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-10 border border-white/8 relative overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div
                className="absolute top-0 right-0 w-64 h-64 opacity-10 blur-[80px] pointer-events-none"
                style={{ background: "var(--champagne)" }}
              />
              <div className="relative z-10">
                <h2 className="text-xs uppercase tracking-[0.3em] text-[var(--champagne)]/70 font-medium mb-4">The Result</h2>
                <p className="font-display text-2xl md:text-3xl font-light text-white leading-relaxed">
                  {project.results}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Role + Tech */}
      <section className="px-6 md:px-12 mb-24">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8">
          {project.role && (
            <div className="rounded-3xl p-8 border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h2 className="text-xs uppercase tracking-[0.3em] text-white/30 font-medium mb-4">My Role</h2>
              <p className="text-white/70 leading-relaxed">{project.role}</p>
            </div>
          )}
          {project.technologies && project.technologies.length > 0 && (
            <div className="rounded-3xl p-8 border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h2 className="text-xs uppercase tracking-[0.3em] text-white/30 font-medium mb-4">Technology</h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-xl text-xs text-white/60 border border-white/10"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* More Projects CTA */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="font-display text-3xl font-light text-white mb-4">See more work</h2>
          <p className="text-white/30 text-sm mb-8">More problems solved, more systems built.</p>
          <Link
            to="/projects"
            id="more-projects-btn"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-medium text-black transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--champagne), oklch(0.7 0.3 22))" }}
          >
            View all projects <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i === null || i === 0 ? gallery.length - 1 : i - 1))}
          onNext={() => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % gallery.length))}
        />
      )}

      <Footer />
    </div>
  );
}
