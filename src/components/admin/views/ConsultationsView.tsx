import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ChevronRight,
  MessageSquare,
  Sparkles,
  X,
  Copy,
  Check,
  Download,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowUpDown,
  BookOpen,
  Mail,
  Phone,
  User,
  PlusCircle,
  RefreshCw,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import type { Consultation } from "../AdminDashboard";
import { toast } from "sonner";

interface Props {
  consultations: Consultation[];
  loading: boolean;
  onStatusChange: (id: string, status: string, notes?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const STATUS_CONFIG = {
  new:      { label: "New",      color: "bg-[var(--aurora-cyan)]/10 text-[var(--aurora-cyan)] border-[var(--aurora-cyan)]/25" },
  reviewed: { label: "Reviewed", color: "bg-[var(--aurora-purple)]/10 text-[var(--aurora-purple)] border-[var(--aurora-purple)]/25" },
  booked:   { label: "Booked",   color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" },
  archived: { label: "Archived", color: "bg-white/5 text-white/40 border-white/5" },
};

export function ConsultationsView({ consultations, loading, onStatusChange, onDelete, onRefresh }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<"created_at" | "business_name" | "status">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Unique industries for filter dropdown
  const industries = useMemo(() => {
    const list = consultations.map((c) => c.industry).filter(Boolean);
    return ["all", ...Array.from(new Set(list))];
  }, [consultations]);

  // Handle Bulk Selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Sorting Handler
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter & Sort Logic
  const filtered = useMemo(() => {
    let result = consultations.filter((c) => {
      const matchSearch = [
        c.business_name || "",
        c.industry || "",
        c.website_goals || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchIndustry = industryFilter === "all" || c.industry === industryFilter;

      return matchSearch && matchStatus && matchIndustry;
    });

    result.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (sortField === "created_at") {
        return sortOrder === "asc"
          ? new Date(valA).getTime() - new Date(valB).getTime()
          : new Date(valB).getTime() - new Date(valA).getTime();
      }

      return sortOrder === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return result;
  }, [consultations, search, statusFilter, industryFilter, sortField, sortOrder]);

  // Paginated item slice
  const paginated = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  // Export to PDF
  const exportToPDF = async () => {
    if (filtered.length === 0) {
      toast.error("No data to export");
      return;
    }
    setIsExporting(true);
    toast.info("Generating PDF…");
    try {
      // Wait for React to render the template + font to load
      await new Promise((r) => setTimeout(r, 600));
      const el = document.getElementById("admin-pdf-export");
      if (!el) throw new Error("PDF template not found");

      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: "#ffffff" });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const printW = pageW - margin * 2;
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgH = (imgProps.height * printW) / imgProps.width;

      // Split into pages if content is taller than one page
      let yPos = margin;
      let remainingH = imgH;
      let srcY = 0;
      const pageContentH = pageH - margin * 2;

      while (remainingH > 0) {
        const sliceH = Math.min(remainingH, pageContentH);
        pdf.addImage(dataUrl, "PNG", margin, yPos, printW, imgH, undefined, "FAST", 0);
        remainingH -= sliceH;
        srcY += sliceH;
        if (remainingH > 0) {
          pdf.addPage();
          yPos = margin - srcY * (printW / imgProps.width);
        }
      }

      pdf.save(`Usherverse_Consultations_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to insert a test consultation directly to make testing simple
  const handleCreateTest = async () => {
    try {
      const mockPayload = {
        messages: [
          { role: "user", content: "Hi Jenny, I need a website" },
          { role: "assistant", content: "What is your business name?" },
          { role: "user", content: "Luxe Coffee Roasters" },
          { role: "assistant", content: "What industry are you in?" },
          { role: "user", content: "Specialty Coffee Shop" },
          { role: "assistant", content: "Who are your ideal customers?" },
          { role: "user", content: "Coffee connoisseurs and local cafe visitors" },
          { role: "assistant", content: "Why do you need a website?" },
          { role: "user", content: "Accept bookings for tasting events and sell coffee beans online" },
        ],
      };

      const res = await fetch("/api/generate-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockPayload),
      });

      if (res.ok) {
        toast.success("Test consultation generated! Refreshing...");
        // Wait a moment for the DB write to complete then refresh
        setTimeout(() => onRefresh(), 1500);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(`Failed to generate test: ${(err as any)?.error || res.statusText}`);
      }
    } catch {
      toast.error("Network error while creating test data");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Search and Filters Bar */}
      <div className="glass rounded-2xl p-4 border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by business name, industry, goals..."
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--aurora-cyan)]/50 transition-colors"
            />
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white/80 hover:text-white transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting…" : "Export PDF"}</span>
            </button>
            <button
              onClick={handleCreateTest}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--aurora-purple)]/20 to-[var(--aurora-pink)]/20 hover:from-[var(--aurora-purple)]/30 hover:to-[var(--aurora-pink)]/30 border border-[var(--aurora-purple)]/30 rounded-xl text-xs font-semibold text-white/90 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[var(--aurora-pink)]" />
              <span>Create Test</span>
            </button>
          </div>
        </div>

        {/* Filters and sorting options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-white/30 mr-1" />

            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 text-white/70 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-white/20"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="booked">Booked</option>
              <option value="archived">Archived</option>
            </select>

            {/* Industry Selector */}
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white/5 border border-white/10 text-white/70 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-white/20 capitalize"
            >
              <option value="all">All Industries</option>
              {industries
                .filter((ind) => ind !== "all")
                .map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
            </select>
          </div>

          <div className="text-[10px] text-white/40 font-mono">
            Showing {filtered.length} of {consultations.length} records
          </div>
        </div>
      </div>

      {/* Main Table / Card List */}
      {loading ? (
        <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
          {/* Table Skeletons */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/3 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="glass rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/3 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white/20" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold">No consultations found</h3>
            <p className="text-white/40 text-xs mt-1 max-w-sm mx-auto">
              There are no consultation results matching your search terms or filters. Try adjusting your query or create a test one.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setIndustryFilter("all");
              }}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/10 bg-white/5 rounded-xl text-xs text-white/80 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear Filters
            </button>
            <button
              onClick={handleCreateTest}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Create Test Session
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block glass rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/3 select-none">
                  <th className="w-12 px-5 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-white/25 bg-white/5 text-[var(--aurora-purple)] focus:ring-[var(--aurora-purple)]"
                    />
                  </th>
                  <th
                    className="px-5 py-3 text-xs uppercase tracking-widest text-white/30 font-semibold cursor-pointer hover:text-white transition-colors text-left"
                    onClick={() => toggleSort("business_name")}
                  >
                    <div className="flex items-center gap-1.5">
                      Business <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-widest text-white/30 font-semibold text-left">
                    Industry
                  </th>
                  <th className="px-5 py-3 text-xs uppercase tracking-widest text-white/30 font-semibold text-left">
                    Goals
                  </th>
                  <th
                    className="px-5 py-3 text-xs uppercase tracking-widest text-white/30 font-semibold cursor-pointer hover:text-white transition-colors text-left"
                    onClick={() => toggleSort("created_at")}
                  >
                    <div className="flex items-center gap-1.5">
                      Submitted Date <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs uppercase tracking-widest text-white/30 font-semibold cursor-pointer hover:text-white transition-colors text-left"
                    onClick={() => toggleSort("status")}
                  >
                    <div className="flex items-center gap-1.5">
                      Status <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-5 py-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, idx) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/3 cursor-pointer group transition-colors"
                  >
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={(e) => handleSelectOne(c.id, e.target.checked)}
                        className="rounded border-white/25 bg-white/5 text-[var(--aurora-purple)] focus:ring-[var(--aurora-purple)]"
                      />
                    </td>
                    <td className="px-5 py-4 font-medium text-white text-sm" onClick={() => setSelected(c)}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-white/40 shrink-0" />
                        <span>{c.business_name || "Anonymous Business"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60 text-sm" onClick={() => setSelected(c)}>
                      {c.industry || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs max-w-[240px] truncate" onClick={() => setSelected(c)}>
                      {c.website_goals || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap" onClick={() => setSelected(c)}>
                      {new Date(c.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4" onClick={() => setSelected(c)}>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          STATUS_CONFIG[c.status]?.color || STATUS_CONFIG.new.color
                        }`}
                      >
                        {STATUS_CONFIG[c.status]?.label || "New"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors ml-auto" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden space-y-4">
            {paginated.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className="glass rounded-2xl p-5 border border-white/5 space-y-3 cursor-pointer hover:border-white/15 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white/40" />
                    <h4 className="text-white text-sm font-semibold">{c.business_name || "Anonymous Business"}</h4>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      STATUS_CONFIG[c.status]?.color || STATUS_CONFIG.new.color
                    }`}
                  >
                    {STATUS_CONFIG[c.status]?.label || "New"}
                  </span>
                </div>
                <div className="text-xs text-white/60">
                  <span className="text-white/30 font-medium">Industry:</span> {c.industry || "N/A"}
                </div>
                <div className="text-xs text-white/40 max-w-full truncate">{c.website_goals}</div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-white/30">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  <button className="flex items-center gap-1 text-[var(--aurora-cyan)] font-medium">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 border border-white/10 bg-white/5 rounded-xl text-xs text-white/80 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="text-xs text-white/40 font-mono">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 border border-white/10 bg-white/5 rounded-xl text-xs text-white/80 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Slide-over Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs"
            />
            {/* Drawer */}
            <DetailDrawer
              c={selected}
              onClose={() => setSelected(null)}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── OFF-SCREEN PDF TEMPLATE ─────────────────────────────────────────── */}
      {isExporting && (
        <div className="fixed left-[-9999px] top-0 z-[-1] pointer-events-none">
          <div
            id="admin-pdf-export"
            style={{
              width: 900,
              background: "#ffffff",
              color: "#111111",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              padding: "60px 60px 40px",
            }}
          >
            {/* Ensure Fraunces is loaded for the snapshot */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400&family=Space+Grotesk:wght@400;600;700&display=swap');`}</style>
            {/* ── Header / Branding ── */}
            <div style={{ borderBottom: "1px solid #e5e5e5", paddingBottom: 32, marginBottom: 40 }}>
              {/* Big Fraunces wordmark matching the footer */}
              <div
                style={{
                  fontFamily: "'Fraunces', 'Times New Roman', serif",
                  fontWeight: 300,
                  fontSize: 80,
                  lineHeight: 0.85,
                  letterSpacing: "-0.04em",
                  marginBottom: 20,
                }}
              >
                Usherverse<span style={{ color: "#ef4444" }}>.</span>
              </div>

              {/* Contact strip */}
              <div style={{ display: "flex", gap: 40, fontSize: 13, color: "#555" }}>
                <span>🌐 usherverse.studio</span>
                <span>📧 usherverse@gmail.com</span>
                <span>📞 0110 000 284</span>
                <span>🐦 @Usherverse_</span>
              </div>

              {/* Report meta */}
              <div
                style={{
                  marginTop: 28,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Consultations Report
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    {filtered.length} record{filtered.length !== 1 ? "s" : ""} ·{" "}
                    {statusFilter !== "all" ? `Status: ${statusFilter}` : "All statuses"} ·{" "}
                    {industryFilter !== "all" ? `Industry: ${industryFilter}` : "All industries"}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#aaa", textAlign: "right" }}>
                  <div>Generated {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</div>
                  <div style={{ marginTop: 2 }}>Usherverse Internal · Confidential</div>
                </div>
              </div>
            </div>

            {/* ── Table ── */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  {["#", "Business", "Industry", "Status", "Goals", "Date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontWeight: 700,
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#555",
                        borderBottom: "2px solid #e0e0e0",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{ background: i % 2 === 0 ? "#ffffff" : "#fafafa" }}
                  >
                    <td style={{ padding: "10px 14px", color: "#bbb", fontWeight: 600, borderBottom: "1px solid #f0f0f0" }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, borderBottom: "1px solid #f0f0f0" }}>
                      {c.business_name || "Anonymous"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#555", borderBottom: "1px solid #f0f0f0" }}>
                      {c.industry || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #f0f0f0" }}>
                      <span
                        style={{
                          padding: "2px 10px",
                          borderRadius: 99,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background:
                            c.status === "booked" ? "#d1fae5" :
                            c.status === "reviewed" ? "#ede9fe" :
                            c.status === "archived" ? "#f3f4f6" :
                            "#e0f2fe",
                          color:
                            c.status === "booked" ? "#065f46" :
                            c.status === "reviewed" ? "#5b21b6" :
                            c.status === "archived" ? "#6b7280" :
                            "#0369a1",
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#444",
                        borderBottom: "1px solid #f0f0f0",
                        maxWidth: 260,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.website_goals || "—"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#888", whiteSpace: "nowrap", borderBottom: "1px solid #f0f0f0" }}>
                      {new Date(c.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Footer ── */}
            <div
              style={{
                marginTop: 48,
                paddingTop: 20,
                borderTop: "1px solid #e5e5e5",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#aaa",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <span>© {new Date().getFullYear()} Usherverse — All rights reserved</span>
              <span>Made in the Usherverse</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Detail Drawer subcomponent */
function DetailDrawer({
  c,
  onClose,
  onStatusChange,
  onDelete,
}: {
  c: Consultation;
  onClose: () => void;
  onStatusChange: (id: string, status: string, notes?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState(c.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(c.detailed_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("AI prompt copied to clipboard");
  };

  const handleNotesBlur = async () => {
    setIsSavingNotes(true);
    try {
      await onStatusChange(c.id, c.status, notes);
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const whatsappUrl = `https://wa.me/254110000284?text=${encodeURIComponent(
    `Hi ${c.business_name}! Thanks for your consultation with Usherverse. We've reviewed your website requirements and would love to discuss your ${c.industry} website project. 🚀`
  )}`;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-2xl z-50 flex flex-col bg-[#111] shadow-2xl border-l border-white/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 bg-black/10">
        <div>
          <h2 className="text-white font-display text-lg tracking-tight">{c.business_name || "Anonymous Business"}</h2>
          <p className="text-white/40 text-[10px] mt-1 uppercase tracking-widest font-mono">
            {c.industry || "No Industry"} · {new Date(c.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Section */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2">Lead Status</p>
          <div className="flex flex-wrap gap-2">
            {(["new", "reviewed", "booked", "archived"] as const).map((s) => (
              <button
                key={s}
                onClick={async () => {
                  await onStatusChange(c.id, s);
                  c.status = s; // optimistic local update for current frame
                }}
                className={`px-3 py-1.5 rounded-xl text-xs border font-medium transition-all ${
                  c.status === s
                    ? STATUS_CONFIG[s].color + " font-semibold ring-1 ring-white/10"
                    : "bg-white/3 border-white/5 text-white/40 hover:border-white/10 hover:text-white/70"
                }`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Business Summary */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--aurora-cyan)]" /> Business Details
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-white/30 block mb-1">Target Audience</span>
              <span className="text-white font-medium">{c.target_audience || "N/A"}</span>
            </div>
            <div>
              <span className="text-white/30 block mb-1">Industry</span>
              <span className="text-white font-medium">{c.industry || "N/A"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-white/30 block mb-1">Website Goals</span>
              <span className="text-white/80 leading-relaxed">{c.website_goals || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Pages and Features lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2.5">Recommended Pages</p>
            <ul className="space-y-1.5">
              {c.recommended_pages?.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--aurora-cyan)] shrink-0" />
                  <span>{p}</span>
                </li>
              )) || <span className="text-white/20 text-xs">None specified</span>}
            </ul>
          </div>

          <div className="glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-2.5">Recommended Features</p>
            <ul className="space-y-1.5">
              {c.recommended_features?.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--aurora-purple)] shrink-0" />
                  <span>{f}</span>
                </li>
              )) || <span className="text-white/20 text-xs">None specified</span>}
            </ul>
          </div>
        </div>

        {/* Design Direction & AI spec prompt */}
        <div className="glass rounded-2xl p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Suggested Design Direction</p>
          <p className="text-xs text-white/80 leading-relaxed">{c.suggested_design_style || "N/A"}</p>
        </div>

        {/* AI System Spec Prompt Codeblock */}
        <div className="glass rounded-2xl p-4 relative group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Developer Spec Builder Prompt
            </p>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/80 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied!" : "Copy Prompt"}</span>
            </button>
          </div>
          <pre className="text-[11px] text-white/60 font-mono bg-black/30 border border-white/5 rounded-xl p-3.5 overflow-x-auto whitespace-pre-wrap max-h-48 scrollbar-thin">
            {c.detailed_prompt || "No prompt details available"}
          </pre>
        </div>

        {/* Notes editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Internal Notes</p>
            {isSavingNotes && <span className="text-[9px] text-[var(--aurora-cyan)] animate-pulse">Saving...</span>}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add internal notes, next action items, follow-up dates..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none"
          />
        </div>

        {/* Chat History transcript */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">Full Chat Transcript</p>
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {c.chat_history?.map((msg, i) => (
              <div
                key={i}
                className={`text-xs p-3 rounded-xl ${
                  msg.role === "user" ? "bg-[var(--aurora-indigo)]/15 border border-[var(--aurora-indigo)]/20 text-white ml-8" : "bg-white/5 border border-white/5 text-white/70 mr-8"
                }`}
              >
                <div className="font-semibold text-[10px] text-white/40 mb-1">
                  {msg.role === "user" ? "Client" : "Jenny (AI)"}
                </div>
                <div className="leading-relaxed">{msg.content}</div>
              </div>
            )) || <div className="text-white/20 text-xs text-center py-4">No chat history available</div>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/10 shrink-0 flex items-center justify-between">
        <button
          onClick={async () => {
            if (confirm("Are you sure you want to permanently delete this client submission?")) {
              await onDelete(c.id);
              onClose();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Consultation</span>
        </button>
        <span className="text-[10px] text-white/20 font-mono">ID: {c.id}</span>
      </div>
    </motion.div>
  );
}
