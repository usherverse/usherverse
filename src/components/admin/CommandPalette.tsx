import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, FileText, LayoutDashboard, Sliders, LogOut, ArrowRight, X } from "lucide-react";
import type { Consultation } from "./AdminDashboard";

interface Props {
  open: boolean;
  onClose: () => void;
  consultations: Consultation[];
  onViewChange: (view: string) => void;
}

export function CommandPalette({ open, onClose, consultations, onViewChange }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Switch tabs
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const filteredConsultations = query
    ? consultations.filter((c) =>
        (c.business_name || "").toLowerCase().includes(query.toLowerCase()) ||
        (c.industry || "").toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const defaultActions = [
    {
      label: "Go to Dashboard",
      icon: LayoutDashboard,
      shortcut: "G + D",
      action: () => onViewChange("dashboard"),
    },
    {
      label: "Go to Consultations",
      icon: FileText,
      shortcut: "G + C",
      action: () => onViewChange("consultations"),
    },
    {
      label: "Go to Settings",
      icon: Sliders,
      shortcut: "G + S",
      action: () => onViewChange("settings"),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg overflow-hidden glass-strong border border-white/10 rounded-2xl pointer-events-auto flex flex-col"
              style={{ background: "#171717" }}
            >
              {/* Search Header */}
              <div className="relative flex items-center border-b border-white/5 px-4">
                <Search className="w-4 h-4 text-white/30 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search client business name..."
                  className="w-full bg-transparent px-3 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none"
                />
                <button
                  onClick={onClose}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Suggestions / Results */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {/* Consultation Search Results */}
                {filteredConsultations.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-white/30 font-semibold font-mono">
                      Client Consultations
                    </div>
                    {filteredConsultations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleAction(() => {
                          onViewChange("consultations");
                          // We could trigger selection in the parent, but simply going to consultations is a good start.
                        })}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-white/40" />
                          <span>{c.business_name || "Anonymous"}</span>
                          <span className="text-[10px] text-white/30">({c.industry})</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-white/20" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Default commands/actions */}
                <div>
                  <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-white/30 font-semibold font-mono">
                    Navigation Commands
                  </div>
                  {defaultActions.map((act, idx) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAction(act.action)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-white/40" />
                          <span>{act.label}</span>
                        </div>
                        <kbd className="inline-flex h-4 items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1 font-mono text-[9px] font-medium text-white/30">
                          {act.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>

                {query && filteredConsultations.length === 0 && (
                  <div className="p-4 text-center text-xs text-white/20">
                    No results matching "{query}"
                  </div>
                )}
              </div>

              {/* Command Palette Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-[9px] font-mono text-white/20 bg-black/10">
                <span>Esc to close</span>
                <span>⌘/Ctrl + K to toggle</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
