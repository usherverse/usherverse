import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, FolderOpen, MessageSquare,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  Sparkles, Menu, X, Zap
} from "lucide-react";
import type { AdminView } from "./AdminDashboard";

const NAV_ITEMS: { id: AdminView; label: string; icon: any }[] = [
  { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { id: "consultations", label: "Consultations",  icon: FileText },
  { id: "projects",      label: "Projects",       icon: FolderOpen },
  { id: "messages",      label: "Messages",       icon: MessageSquare },
  { id: "analytics",     label: "Analytics",      icon: BarChart3 },
  { id: "settings",      label: "Settings",       icon: Settings },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  currentView: AdminView;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent({ collapsed, currentView, onViewChange, onLogout, onToggle }: Omit<Props, "mobileOpen" | "onMobileClose">) {
  return (
    <div className="flex flex-col h-full" style={{ background: "#111111" }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-none">Usherverse</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Admin Panel</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex p-1.5 rounded-lg transition-colors hover:bg-white/5 text-white/30 hover:text-white"
          style={{ marginLeft: collapsed ? "auto" : undefined }}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Profile */}
      <div className="px-3 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${collapsed ? "justify-center" : ""}`}>
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              A
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 bg-emerald-400"
              style={{ borderColor: "#111111" }} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium leading-none truncate">Administrator</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>usherverse.co.ke</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group relative ${
                collapsed ? "justify-center" : ""
              }`}
              style={{
                background: isActive ? "rgba(124,58,237,0.15)" : "transparent",
                color: isActive ? "#A78BFA" : "rgba(255,255,255,0.45)",
                border: isActive ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
              }}
              title={collapsed ? label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.22)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-4 h-4 shrink-0 relative z-10" />
              {!collapsed && <span className="relative z-10 font-medium">{label}</span>}
              {!isActive && !collapsed && (
                <span className="ml-auto relative z-10 text-white/0 group-hover:text-white/20 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-500/10 group ${collapsed ? "justify-center" : ""}`}
          style={{ color: "rgba(255,255,255,0.35)" }}
          title={collapsed ? "Log Out" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 group-hover:text-red-400 transition-colors" />
          {!collapsed && <span className="group-hover:text-red-400 transition-colors">Log Out</span>}
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar(props: Props) {
  const { collapsed, mobileOpen, onMobileClose } = props;

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 224 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:block shrink-0 h-screen sticky top-0 overflow-hidden"
        style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        <SidebarContent {...props} />
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 left-0 h-full w-64 z-50"
              style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
            >
              <SidebarContent {...props} collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
