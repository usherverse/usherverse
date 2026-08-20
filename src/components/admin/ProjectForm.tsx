import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Plus, Trash2, ArrowUpRight,
  Star, Globe, Github, Tag, Loader2, Check
} from "lucide-react";

export interface ProjectFormData {
  title: string;
  slug: string;
  short_description: string;
  client_name: string;
  industry: string;
  category: string;
  project_date: string;
  role: string;
  problem: string;
  solution: string;
  results: string;
  key_features: string[];
  metrics: { value: string; label: string }[];
  technologies: string[];
  featured_image: string;
  gallery: { url: string; caption: string }[];
  video_url: string;
  project_url: string;
  github_url: string;
  status: "draft" | "published";
  featured: boolean;
  sort_order: number;
}

const EMPTY_FORM: ProjectFormData = {
  title: "",
  slug: "",
  short_description: "",
  client_name: "",
  industry: "",
  category: "",
  project_date: "",
  role: "",
  problem: "",
  solution: "",
  results: "",
  key_features: [],
  metrics: [],
  technologies: [],
  featured_image: "",
  gallery: [],
  video_url: "",
  project_url: "",
  github_url: "",
  status: "draft",
  featured: false,
  sort_order: 0,
};

const STEPS = [
  { id: "basic", label: "Basic Info" },
  { id: "problem", label: "Problem → Solution" },
  { id: "features", label: "Features & Metrics" },
  { id: "media", label: "Media" },
  { id: "links", label: "Links & Tech" },
  { id: "publish", label: "Publish" },
];

const INDUSTRIES = ["Fintech", "Beauty", "Business", "E-commerce", "Healthcare", "Education", "Real Estate", "Hospitality", "Other"];
const CATEGORIES = ["Web Application", "Mobile App", "Business System", "E-commerce", "Landing Page", "Portfolio", "API / Backend", "Other"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => Promise<void>;
  initialData?: Partial<ProjectFormData> & { id?: string };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">{children}</label>;
}

function Input({ id, value, onChange, placeholder, type = "text" }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
    />
  );
}

function Textarea({ id, value, onChange, placeholder, rows = 4 }: {
  id: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors resize-none"
    />
  );
}

function Select({ id, value, onChange, options }: {
  id: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 transition-colors"
      style={{ colorScheme: "dark" }}
    >
      <option value="" className="bg-[#161616] text-white">Select…</option>
      {options.map((o) => <option key={o} value={o} className="bg-[#161616] text-white">{o}</option>)}
    </select>
  );
}

function TagInput({ id, values, onChange, placeholder }: {
  id: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
  };

  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 hover:text-white transition-colors text-sm"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/8 text-white/70 text-xs">
            {v}
            <button type="button" onClick={() => remove(i)} className="text-white/30 hover:text-white/70"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProjectForm({ open, onClose, onSave, initialData }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProjectFormData>({ ...EMPTY_FORM, ...initialData });
  const [saving, setSaving] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData?.id) {
        setForm({ ...EMPTY_FORM, ...initialData });
      } else {
        const draft = localStorage.getItem("usherverse_project_draft");
        if (draft) {
          try {
            setForm({ ...EMPTY_FORM, ...JSON.parse(draft) });
          } catch {
            setForm({ ...EMPTY_FORM, ...initialData });
          }
        } else {
          setForm({ ...EMPTY_FORM, ...initialData });
        }
      }
      setStep(0);
      // Wait for the next tick to enable auto-saving, so we don't immediately overwrite with EMPTY_FORM
      setTimeout(() => setIsDraftLoaded(true), 50);
    } else {
      setIsDraftLoaded(false);
    }
  }, [open, initialData]);

  // Auto-save draft to localStorage if creating new project
  useEffect(() => {
    if (open && !initialData?.id && isDraftLoaded) {
      localStorage.setItem("usherverse_project_draft", JSON.stringify(form));
    }
  }, [form, open, initialData?.id, isDraftLoaded]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData?.slug && form.title) {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      setForm((f) => ({ ...f, slug }));
    }
  }, [form.title, initialData?.slug]);

  const set = (key: keyof ProjectFormData, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      if (!initialData?.id) {
        localStorage.removeItem("usherverse_project_draft");
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const addMetric = () => setForm((f) => ({ ...f, metrics: [...f.metrics, { value: "", label: "" }] }));
  const updateMetric = (i: number, field: "value" | "label", v: string) =>
    setForm((f) => ({ ...f, metrics: f.metrics.map((m, idx) => idx === i ? { ...m, [field]: v } : m) }));
  const removeMetric = (i: number) => setForm((f) => ({ ...f, metrics: f.metrics.filter((_, idx) => idx !== i) }));

  const addGalleryItem = () => setForm((f) => ({ ...f, gallery: [...f.gallery, { url: "", caption: "" }] }));
  const updateGalleryItem = (i: number, field: "url" | "caption", v: string) =>
    setForm((f) => ({ ...f, gallery: f.gallery.map((g, idx) => idx === i ? { ...g, [field]: v } : g) }));
  const removeGalleryItem = (i: number) => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, idx) => idx !== i) }));
    if (newGalleryUrl.trim()) {
      setForm((f) => ({ ...f, gallery: [...f.gallery, { url: newGalleryUrl.trim(), caption: newGalleryCaption.trim() }] }));
      setNewGalleryUrl("");
      setNewGalleryCaption("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <div>
            <h2 className="text-white font-semibold text-sm">{initialData?.id ? "Edit Project" : "Add Project"}</h2>
            <p className="text-white/30 text-xs mt-0.5">{STEPS[step].label}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 py-3 gap-1.5 border-b border-white/6 overflow-x-auto">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              id={`form-step-${s.id}`}
              onClick={() => setStep(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all"
              style={
                i === step
                  ? { background: "rgba(124,58,237,0.2)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.3)" }
                  : i < step
                  ? { color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)" }
                  : { color: "rgba(255,255,255,0.25)" }
              }
            >
              {i < step && <Check className="w-3 h-3 text-green-400" />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* STEP 0 — Basic Info */}
              {step === 0 && (
                <>
                  <div>
                    <FieldLabel>Project Title *</FieldLabel>
                    <Input id="form-title" value={form.title} onChange={(v) => set("title", v)} placeholder="e.g. Fintech Web Application" />
                  </div>
                  <div>
                    <FieldLabel>URL Slug</FieldLabel>
                    <Input id="form-slug" value={form.slug} onChange={(v) => set("slug", v)} placeholder="auto-generated from title" />
                    <p className="text-white/20 text-xs mt-1">usherverse.co.ke/projects/<span className="text-white/40">{form.slug || "…"}</span></p>
                  </div>
                  <div>
                    <FieldLabel>Short Description *</FieldLabel>
                    <Textarea id="form-short-desc" value={form.short_description} onChange={(v) => set("short_description", v)} placeholder="One sentence summary for project cards" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Industry</FieldLabel>
                      <Select id="form-industry" value={form.industry} onChange={(v) => set("industry", v)} options={INDUSTRIES} />
                    </div>
                    <div>
                      <FieldLabel>Category</FieldLabel>
                      <Select id="form-category" value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Client / Business</FieldLabel>
                      <Input id="form-client" value={form.client_name} onChange={(v) => set("client_name", v)} placeholder="Optional" />
                    </div>
                    <div>
                      <FieldLabel>Project Date</FieldLabel>
                      <Input id="form-date" type="date" value={form.project_date} onChange={(v) => set("project_date", v)} />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Your Role</FieldLabel>
                    <Input id="form-role" value={form.role} onChange={(v) => set("role", v)} placeholder="e.g. Full-stack Development, Design, Deployment" />
                  </div>
                </>
              )}

              {/* STEP 1 — Problem → Solution */}
              {step === 1 && (
                <>
                  <div>
                    <FieldLabel>The Problem *</FieldLabel>
                    <p className="text-white/25 text-xs mb-3">What challenge did the client face before you built this?</p>
                    <Textarea id="form-problem" value={form.problem} onChange={(v) => set("problem", v)} placeholder="e.g. Financial operations were fragmented across spreadsheets and manual processes, making it impossible to track transactions or customers efficiently." rows={5} />
                  </div>
                  <div>
                    <FieldLabel>The Solution *</FieldLabel>
                    <p className="text-white/25 text-xs mb-3">What did you build to solve it?</p>
                    <Textarea id="form-solution" value={form.solution} onChange={(v) => set("solution", v)} placeholder="e.g. I built a centralized fintech platform with dashboards, transaction management, user accounts, and a full admin system." rows={5} />
                  </div>
                  <div>
                    <FieldLabel>The Result / Impact</FieldLabel>
                    <p className="text-white/25 text-xs mb-3">What changed because you built this?</p>
                    <Textarea id="form-results" value={form.results} onChange={(v) => set("results", v)} placeholder="e.g. The client replaced 5 manual spreadsheets with a single platform, giving administrators real-time visibility into all operations." rows={4} />
                  </div>
                </>
              )}

              {/* STEP 2 — Features & Metrics */}
              {step === 2 && (
                <>
                  <div>
                    <FieldLabel>Key Features</FieldLabel>
                    <Textarea 
                      id="form-features" 
                      value={form.key_features.join("\n")} 
                      onChange={(v) => set("key_features", v.split("\n"))} 
                      placeholder="e.g. Customer Management Dashboard&#10;Real-time Analytics&#10;Secure Payment Gateway" 
                      rows={5} 
                    />
                    <p className="text-white/25 text-xs mt-2">Enter one feature per line.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <FieldLabel>Metrics / Results (optional)</FieldLabel>
                      <button type="button" onClick={addMetric} className="flex items-center gap-1.5 text-xs text-[var(--champagne)] hover:opacity-80">
                        <Plus className="w-3 h-3" /> Add metric
                      </button>
                    </div>
                    <p className="text-white/25 text-xs mb-3">Only add real, measurable results. Leave blank if you don't have specific numbers.</p>
                    <div className="space-y-3">
                      {form.metrics.map((m, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={m.value}
                            onChange={(e) => updateMetric(i, "value", e.target.value)}
                            placeholder="40%"
                            className="w-24 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 text-center font-display text-lg"
                          />
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) => updateMetric(i, "label", e.target.value)}
                            placeholder="Reduction in manual processes"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
                          />
                          <button type="button" onClick={() => removeMetric(i)} className="text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3 — Media */}
              {step === 3 && (
                <>
                  <div>
                    <FieldLabel>Featured Image URL</FieldLabel>
                    <Input id="form-featured-image" value={form.featured_image} onChange={(v) => set("featured_image", v)} placeholder="https://..." />
                    {form.featured_image && (
                      <div className="mt-3 rounded-xl overflow-hidden aspect-video">
                        <img src={form.featured_image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <FieldLabel>Gallery Screenshots</FieldLabel>
                      <button type="button" onClick={addGalleryItem} className="flex items-center gap-1.5 text-xs text-[var(--champagne)] hover:opacity-80">
                        <Plus className="w-3 h-3" /> Add Screenshot
                      </button>
                    </div>
                    <div className="space-y-3">
                      {form.gallery.map((img, i) => (
                        <div key={i} className="flex gap-2 items-start bg-white/5 p-3 rounded-xl border border-white/10">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={img.url}
                              onChange={(e) => updateGalleryItem(i, "url", e.target.value)}
                              placeholder="Image URL https://..."
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
                            />
                            <input
                              type="text"
                              value={img.caption}
                              onChange={(e) => updateGalleryItem(i, "caption", e.target.value)}
                              placeholder="Caption (optional)"
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
                            />
                          </div>
                          {img.url && (
                            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-black/50 border border-white/10">
                              <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                            </div>
                          )}
                          <button type="button" onClick={() => removeGalleryItem(i)} className="p-2 text-white/20 hover:text-red-400 transition-colors shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Demo Video URL (optional)</FieldLabel>
                    <Input id="form-video-url" value={form.video_url} onChange={(v) => set("video_url", v)} placeholder="YouTube embed URL or direct video URL" />
                  </div>
                </>
              )}

              {/* STEP 4 — Links & Tech */}
              {step === 4 && (
                <>
                  <div>
                    <FieldLabel>Live Project URL</FieldLabel>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        id="form-project-url"
                        type="url"
                        value={form.project_url}
                        onChange={(e) => set("project_url", e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-10 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>GitHub URL (optional)</FieldLabel>
                    <div className="relative">
                      <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        id="form-github-url"
                        type="url"
                        value={form.github_url}
                        onChange={(e) => set("github_url", e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full pl-10 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Technologies</FieldLabel>
                    <TagInput
                      id="form-technologies"
                      values={form.technologies}
                      onChange={(v) => set("technologies", v)}
                      placeholder="e.g. React, Node.js, Supabase (press Enter)"
                    />
                  </div>
                  <div>
                    <FieldLabel>Sort Order</FieldLabel>
                    <input
                      id="form-sort-order"
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => set("sort_order", parseInt(e.target.value) || 0)}
                      className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/25"
                    />
                    <p className="text-white/20 text-xs mt-1">Lower number = shown first (0 is default)</p>
                  </div>
                </>
              )}

              {/* STEP 5 — Publish */}
              {step === 5 && (
                <>
                  <div className="rounded-2xl p-5 border border-white/6" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <h3 className="text-white/70 text-sm font-medium mb-4">Publishing Settings</h3>
                    <div className="space-y-4">
                      {/* Status toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm">Status</p>
                          <p className="text-white/30 text-xs mt-0.5">Published projects appear on the public site</p>
                        </div>
                        <button
                          id="form-status-toggle"
                          type="button"
                          onClick={() => set("status", form.status === "published" ? "draft" : "published")}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                          style={
                            form.status === "published"
                              ? { background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.25)" }
                              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }
                          }
                        >
                          {form.status === "published" ? "✓ Published" : "Draft"}
                        </button>
                      </div>

                      {/* Featured toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/80 text-sm">Featured</p>
                          <p className="text-white/30 text-xs mt-0.5">Featured projects appear on the homepage (max 3)</p>
                        </div>
                        <button
                          id="form-featured-toggle"
                          type="button"
                          onClick={() => set("featured", !form.featured)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                          style={
                            form.featured
                              ? { background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.25)" }
                              : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)" }
                          }
                        >
                          <Star className={`w-3.5 h-3.5 ${form.featured ? "fill-current" : ""}`} />
                          {form.featured ? "Featured" : "Not featured"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="rounded-2xl p-5 border border-white/6" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <h3 className="text-white/70 text-sm font-medium mb-4">Review</h3>
                    <dl className="space-y-2 text-sm">
                      {[
                        { label: "Title", value: form.title || "—" },
                        { label: "Slug", value: form.slug || "—" },
                        { label: "Industry", value: form.industry || "—" },
                        { label: "Screenshots", value: `${form.gallery.length} image${form.gallery.length !== 1 ? "s" : ""}` },
                        { label: "Features", value: `${form.key_features.length} listed` },
                        { label: "Metrics", value: `${form.metrics.length} defined` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                          <dt className="text-white/30">{label}</dt>
                          <dd className="text-white/70">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    {form.project_url && (
                      <a
                        href={form.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center gap-1.5 text-xs text-[var(--champagne)] hover:opacity-80 transition-opacity"
                      >
                        Preview live URL <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/6">
          <button
            type="button"
            id="form-prev-step"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === step ? "var(--champagne)" : i < step ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              id="form-next-step"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="form-save-project"
              onClick={handleSave}
              disabled={saving || !form.title}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-black transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, var(--champagne), oklch(0.7 0.3 22))" }}
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save Project</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
