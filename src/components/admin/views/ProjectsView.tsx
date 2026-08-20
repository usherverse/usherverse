import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus, Edit2, Trash2, Star, StarOff, Eye, EyeOff,
  ExternalLink, RefreshCw, AlertTriangle, FolderOpen
} from "lucide-react";
import { ProjectForm, type ProjectFormData } from "../ProjectForm";

interface Project extends ProjectFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  password: string;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  published: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.2)" },
  draft: { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", border: "rgba(255,255,255,0.1)" },
};

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 rounded-2xl p-6 w-full max-w-sm"
        style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-white font-medium text-sm">Are you sure?</h3>
        </div>
        <p className="text-white/50 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-sm text-white/50 border border-white/10 hover:border-white/20 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            id="confirm-delete-btn"
            className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function ProjectsView({ password }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const headers = { Authorization: `Bearer ${password}`, "Content-Type": "application/json" };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", { headers });
      if (!res.ok) throw new Error("Failed to fetch");
      setProjects(await res.json());
    } catch {
      toast.error("Could not load projects.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSave = async (data: ProjectFormData) => {
    if (editingProject) {
      const res = await fetch(`/api/admin/projects/${editingProject.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) { toast.error("Failed to save project."); return; }
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => p.id === editingProject.id ? { ...p, ...updated } : p));
      toast.success("Project updated.");
    } else {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) { toast.error("Failed to create project."); return; }
      const created = await res.json();
      setProjects((prev) => [created, ...prev]);
      toast.success("Project created.");
    }
    setEditingProject(null);
  };

  const toggleStatus = async (project: Project) => {
    const newStatus = project.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) { toast.error("Failed to update status."); return; }
    setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, status: newStatus } : p));
    toast.success(`Project ${newStatus === "published" ? "published" : "set to draft"}.`);
  };

  const toggleFeatured = async (project: Project) => {
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ featured: !project.featured }),
    });
    if (!res.ok) { toast.error("Failed to update."); return; }
    setProjects((prev) => prev.map((p) => p.id === project.id ? { ...p, featured: !p.featured } : p));
    toast.success(project.featured ? "Removed from featured." : "Marked as featured.");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/projects/${deleteTarget.id}`, { method: "DELETE", headers });
    if (!res.ok) { toast.error("Failed to delete."); return; }
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success("Project deleted.");
    setDeleteTarget(null);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const openAdd = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white font-semibold text-lg">Projects</h2>
          <p className="text-white/30 text-sm mt-0.5">{projects.length} total · {projects.filter((p) => p.featured).length} featured · {projects.filter((p) => p.status === "published").length} published</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProjects}
            className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            id="add-project-btn"
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-black transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, var(--champagne), oklch(0.7 0.3 22))" }}
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <FolderOpen className="w-7 h-7 text-purple-400" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-medium mb-1">No projects yet</h3>
            <p className="text-white/30 text-sm">Add your first project to start building your portfolio.</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-black"
            style={{ background: "linear-gradient(135deg, var(--champagne), oklch(0.7 0.3 22))" }}
          >
            <Plus className="w-4 h-4" /> Add your first project
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl border border-white/6 animate-pulse" style={{ background: "rgba(255,255,255,0.02)" }} />
          ))}
        </div>
      )}

      {/* Projects table */}
      {!loading && projects.length > 0 && (
        <div className="rounded-2xl border border-white/6 overflow-hidden">
          {/* Table header */}
          <div
            className="grid items-center px-4 py-3 text-xs uppercase tracking-widest text-white/20 border-b border-white/6"
            style={{ gridTemplateColumns: "1fr auto auto auto auto auto", gap: "1rem", background: "rgba(255,255,255,0.02)" }}
          >
            <span>Project</span>
            <span className="hidden md:block">Category</span>
            <span>Featured</span>
            <span>Status</span>
            <span className="hidden sm:block">Updated</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          <AnimatePresence>
            {projects.map((project, i) => {
              const statusStyle = STATUS_STYLE[project.status] || STATUS_STYLE.draft;
              const updatedDate = project.updated_at
                ? new Date(project.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                : "—";

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="grid items-center px-4 py-4 border-b border-white/4 last:border-b-0 hover:bg-white/2 transition-colors group"
                  style={{ gridTemplateColumns: "1fr auto auto auto auto auto", gap: "1rem" }}
                >
                  {/* Title + slug */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {project.featured_image && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                          <img src={project.featured_image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{project.title}</p>
                        <p className="text-white/25 text-xs truncate">/projects/{project.slug}</p>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <span className="hidden md:block text-white/35 text-xs whitespace-nowrap">
                    {project.industry || project.category || "—"}
                  </span>

                  {/* Featured toggle */}
                  <button
                    onClick={() => toggleFeatured(project)}
                    className="transition-transform hover:scale-110"
                    title={project.featured ? "Remove from featured" : "Mark as featured"}
                    id={`featured-toggle-${project.id}`}
                  >
                    {project.featured
                      ? <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      : <StarOff className="w-4 h-4 text-white/15 hover:text-yellow-400/50" />
                    }
                  </button>

                  {/* Status badge */}
                  <button
                    onClick={() => toggleStatus(project)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all hover:opacity-80 whitespace-nowrap"
                    style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
                    id={`status-toggle-${project.id}`}
                    title="Click to toggle"
                  >
                    {project.status === "published"
                      ? <><Eye className="w-3 h-3" /> Published</>
                      : <><EyeOff className="w-3 h-3" /> Draft</>
                    }
                  </button>

                  {/* Updated */}
                  <span className="hidden sm:block text-white/20 text-xs">{updatedDate}</span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/8 text-white/20 hover:text-white/60 transition-colors"
                        title="Open live site"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => openEdit(project)}
                      className="p-1.5 rounded-lg hover:bg-white/8 text-white/20 hover:text-white/60 transition-colors"
                      title="Edit"
                      id={`edit-project-${project.id}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(project)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/15 hover:text-red-400 transition-colors"
                      title="Delete"
                      id={`delete-project-${project.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Project Form Modal */}
      <AnimatePresence>
        {formOpen && (
          <ProjectForm
            open={formOpen}
            onClose={() => { setFormOpen(false); setEditingProject(null); }}
            onSave={handleSave}
            initialData={editingProject || undefined}
            password={password}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
