import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Plus, Trash2, ArrowUpRight,
  Star, Globe, Github, Tag, Loader2, Check, Upload, ImageIcon
} from "lucide-react";

// ------- Types -------

export interface KeyFeature {
  title: string;
  points: string;  // newline-separated bullet points
}

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
  key_features: KeyFeature[];
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
  { id: "features", label: "Key Features" },
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
  password: string;
}

// ------- UI Helpers -------

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

// Gallery row sub-component — needed so useRef isn't called inside a .map() callback
function GalleryRow({ img, index, onUpload, onCaptionChange, onRemove, onClearUrl }: {
  img: { url: string; caption: string };
  index: number;
  onUpload: (i: number, file: File) => void;
  onCaptionChange: (i: number, v: string) => void;
  onRemove: (i: number) => void;
  onClearUrl: (i: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex gap-2 items-start bg-white/5 p-3 rounded-xl border border-white/10">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(index, f); }}
      />
      <div className="flex-1 space-y-2">
        {img.url ? (
          <div className="relative">
            <div className="w-full h-28 rounded-lg overflow-hidden bg-black/50 border border-white/10">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => onClearUrl(index)}
              className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-20 rounded-lg border border-dashed border-white/15 flex items-center justify-center gap-2 text-white/30 text-xs hover:border-white/30 hover:text-white/50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Click to upload
          </button>
        )}
        <input
          type="text"
          value={img.caption}
          onChange={(e) => onCaptionChange(index, e.target.value)}
          placeholder="Caption (optional)"
          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25"
        />
      </div>
      <button type="button" onClick={() => onRemove(index)} className="p-2 text-white/20 hover:text-red-400 transition-colors shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ------- ImageUploader -------

function ImageUploader({ onUploaded, password }: { onUploaded: (url: string) => void; password: string }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${password}` },
        body,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onUploaded(url);
    } catch (e) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? "Uploading…" : "Upload Screenshot"}
      </button>
    </div>
  );
}

// ------- Main Form Component -------

export function ProjectForm({ open, onClose, onSave, initialData, password }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProjectFormData>({ ...EMPTY_FORM, ...initialData });
  const [saving, setSaving] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const featuredRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (initialData?.id) {
        // Normalize key_features from old format (string[]) or new format (KeyFeature[])
        const raw: any = initialData.key_features ?? [];
        const normalized: KeyFeature[] = raw.map((item: any) =>
          typeof item === "string"
            ? { title: item, points: "" }
            : item
        );
        setForm({ ...EMPTY_FORM, ...initialData, key_features: normalized });
      } else {
        const draft = localStorage.getItem("usherverse_project_draft");
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            const raw: any = parsed.key_features ?? [];
            const normalized: KeyFeature[] = raw.map((item: any) =>
              typeof item === "string"
                ? { title: item, points: "" }
                : item
            );
            setForm({ ...EMPTY_FORM, ...parsed, key_features: normalized });
          } catch {
            setForm({ ...EMPTY_FORM, ...initialData });
          }
        } else {
          setForm({ ...EMPTY_FORM, ...initialData });
        }
      }
      setStep(0);
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

  // Key Feature helpers
  const addFeature = () => setForm((f) => ({ ...f, key_features: [...f.key_features, { title: "", points: "" }] }));
  const updateFeature = (i: number, field: keyof KeyFeature, v: string) =>
    setForm((f) => ({ ...f, key_features: f.key_features.map((kf, idx) => idx === i ? { ...kf, [field]: v } : kf) }));
  const removeFeature = (i: number) => setForm((f) => ({ ...f, key_features: f.key_features.filter((_, idx) => idx !== i) }));

  // Gallery helpers
  const addGalleryItem = () => setForm((f) => ({ ...f, gallery: [...f.gallery, { url: "", caption: "" }] }));
  const updateGalleryItem = (i: number, field: "url" | "caption", v: string) =>
    setForm((f) => ({ ...f, gallery: f.gallery.map((g, idx) => idx === i ? { ...g, [field]: v } : g) }));
  const removeGalleryItem = (i: number) => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, idx) => idx !== i) }));

  // Upload featured image
  const handleFeaturedFile = async (file: File) => {
    setFeaturedUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${password}` },
        body,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      set("featured_image", url);
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setFeaturedUploading(false);
    }
  };

  // Upload gallery screenshot
  const handleGalleryUpload = async (i: number, file: File) => {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${password}` },
        body,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      updateGalleryItem(i, "url", url);
    } catch {
      alert("Upload failed. Please try again.");
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

              {/* STEP 2 — Key Features */}
              {step === 2 && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <FieldLabel>Key Features</FieldLabel>
                      <p className="text-white/25 text-xs">Add a feature title and describe it with detailed bullet points.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="flex items-center gap-1.5 text-xs text-[var(--champagne)] hover:opacity-80 shrink-0"
                    >
                      <Plus className="w-3 h-3" /> Add Feature
                    </button>
                  </div>

                  {form.key_features.length === 0 && (
                    <div
                      className="rounded-2xl border border-dashed border-white/10 p-8 text-center cursor-pointer hover:border-white/20 transition-colors"
                      onClick={addFeature}
                    >
                      <Plus className="w-6 h-6 text-white/20 mx-auto mb-2" />
                      <p className="text-white/30 text-sm">Click to add your first key feature</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {form.key_features.map((kf, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-white/8 p-4 space-y-3"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-white/20 w-5 text-center">{i + 1}.</span>
                          <input
                            type="text"
                            value={kf.title}
                            onChange={(e) => updateFeature(i, "title", e.target.value)}
                            placeholder="Feature title, e.g. Loan Management & Financials"
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-medium placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(i)}
                            className="p-1.5 text-white/20 hover:text-red-400 transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="pl-8">
                          <p className="text-white/25 text-[11px] mb-1.5">Description / bullet points — one per line</p>
                          <textarea
                            value={kf.points}
                            onChange={(e) => updateFeature(i, "points", e.target.value)}
                            placeholder={"Handles loan applications and approvals\nTracks repayment schedules automatically\nGenerates financial reports in real-time"}
                            rows={4}
                            className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white/70 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* STEP 3 — Media */}
              {step === 3 && (
                <>
                  <div>
                    <FieldLabel>Featured Image</FieldLabel>
                    <input ref={featuredRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFeaturedFile(f); }} />
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => featuredRef.current?.click()}
                        disabled={featuredUploading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        {featuredUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {featuredUploading ? "Uploading…" : "Upload Featured Image"}
                      </button>
                      {form.featured_image && (
                        <div className="relative rounded-xl overflow-hidden aspect-video bg-black/40 border border-white/10">
                          <img src={form.featured_image} alt="Featured" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                          <button
                            type="button"
                            onClick={() => set("featured_image", "")}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/60 hover:text-white hover:bg-black/80 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {!form.featured_image && (
                        <div
                          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 aspect-video cursor-pointer hover:border-white/20 transition-colors"
                          onClick={() => featuredRef.current?.click()}
                        >
                          <ImageIcon className="w-8 h-8 text-white/15 mb-2" />
                          <p className="text-white/25 text-xs">Click to upload featured image</p>
                        </div>
                      )}
                    </div>
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
                        <GalleryRow
                          key={i}
                          img={img}
                          index={i}
                          onUpload={handleGalleryUpload}
                          onCaptionChange={(idx, v) => updateGalleryItem(idx, "caption", v)}
                          onRemove={removeGalleryItem}
                          onClearUrl={(idx) => updateGalleryItem(idx, "url", "")}
                        />
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
