import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopNav } from "./AdminTopNav";
import { DashboardView } from "./views/DashboardView";
import { ConsultationsView } from "./views/ConsultationsView";
import { ProjectsView } from "./views/ProjectsView";
import { CommandPalette } from "./CommandPalette";

export interface Consultation {
  id: string;
  created_at: string;
  status: "new" | "reviewed" | "booked" | "archived";
  business_name: string;
  industry: string;
  target_audience: string;
  website_goals: string;
  recommended_pages: string[];
  recommended_features: string[];
  suggested_design_style: string;
  seo_recommendations: string[];
  ux_recommendations: string[];
  detailed_prompt: string;
  chat_history: { role: string; content: string }[];
  phone?: string;
  notes?: string;
}

export type AdminView = "dashboard" | "consultations" | "projects" | "messages" | "analytics" | "settings";

export function AdminDashboard({ onLogout, password }: { onLogout: () => void; password: string }) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const headers = { Authorization: `Bearer ${password}`, "Content-Type": "application/json" };

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/consultations", { headers });
      if (!res.ok) throw new Error("Failed to fetch");
      setConsultations(await res.json());
    } catch {
      toast.error("Could not load consultations. Check your connection.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

  // Ctrl+K command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    const body: any = { status };
    if (notes !== undefined) body.notes = notes;
    await fetch(`/api/admin/consultations/${id}`, { method: "PATCH", headers, body: JSON.stringify(body) });
    setConsultations((prev) => prev.map((c) => c.id === id ? { ...c, status: status as Consultation["status"], ...(notes !== undefined ? { notes } : {}) } : c));
    toast.success(`Status updated to "${status}"`);
  };

  const deleteConsultation = async (id: string) => {
    await fetch(`/api/admin/consultations/${id}`, { method: "DELETE", headers });
    setConsultations((prev) => prev.filter((c) => c.id !== id));
    toast.success("Consultation deleted");
  };

  const VIEW_TITLES: Record<AdminView, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "Welcome back to Usherverse HQ" },
    consultations: { title: "Consultations", subtitle: "All website discovery sessions from clients" },
    projects: { title: "Projects", subtitle: "Portfolio — Problems I've Solved" },
    messages: { title: "Messages", subtitle: "Client communications" },
    analytics: { title: "Analytics", subtitle: "Business performance insights" },
    settings: { title: "Settings", subtitle: "Admin panel configuration" },
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#09090B", color: "#FAFAFA" }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "#171717", border: "1px solid rgba(255,255,255,0.08)", color: "#FAFAFA" },
        }}
      />

      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        currentView={currentView}
        onViewChange={(v) => { setCurrentView(v as AdminView); setMobileSidebarOpen(false); }}
        onLogout={onLogout}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminTopNav
          title={VIEW_TITLES[currentView].title}
          subtitle={VIEW_TITLES[currentView].subtitle}
          loading={loading}
          onRefresh={fetchConsultations}
          onCommandPalette={() => setCommandPaletteOpen(true)}
          onMobileMenuOpen={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {currentView === "dashboard" && (
                <DashboardView
                  consultations={consultations}
                  loading={loading}
                  onViewChange={(v) => setCurrentView(v as AdminView)}
                />
              )}
              {currentView === "consultations" && (
                <ConsultationsView
                  consultations={consultations}
                  loading={loading}
                  onStatusChange={updateStatus}
                  onDelete={deleteConsultation}
                  onRefresh={fetchConsultations}
                />
              )}
              {currentView === "projects" && (
                <ProjectsView password={password} />
              )}
              {(currentView === "messages" || currentView === "analytics" || currentView === "settings") && (
                <PlaceholderView view={currentView} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        consultations={consultations}
        onViewChange={(v) => { setCurrentView(v as AdminView); setCommandPaletteOpen(false); }}
      />
    </div>
  );
}

function PlaceholderView({ view }: { view: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-white font-semibold text-xl capitalize">{view}</h2>
      <p className="text-white/40 text-sm max-w-xs">This section is coming soon. Focus for now is on the Consultations workflow.</p>
    </div>
  );
}
