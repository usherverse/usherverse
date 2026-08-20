import { Search, Bell, RefreshCw, Menu, Command } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  loading: boolean;
  onRefresh: () => void;
  onCommandPalette: () => void;
  onMobileMenuOpen: () => void;
}

export function AdminTopNav({
  title,
  subtitle,
  loading,
  onRefresh,
  onCommandPalette,
  onMobileMenuOpen,
}: Props) {
  return (
    <header
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-6 shrink-0"
      style={{
        background: "rgba(9, 9, 11, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {/* Title & Mobile Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 rounded-xl transition-colors hover:bg-white/5 text-white/60 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white font-semibold text-base leading-none capitalize">{title}</h1>
          <p className="hidden sm:block text-[11px] text-white/40 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger Link */}
        <button
          onClick={onCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/70 text-xs font-medium transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="inline-flex h-4 items-center gap-0.5 rounded border border-white/15 bg-white/10 px-1 font-mono text-[9px] font-medium text-white/50">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 text-white/50 hover:text-white transition-all disabled:opacity-40"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 text-white/50 hover:text-white transition-all">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--aurora-purple)] rounded-full animate-pulse" />
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-white/10" />

        {/* User avatar mockup */}
        <div className="flex items-center gap-2 select-none">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase"
            style={{
              background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-purple))",
            }}
          >
            A
          </div>
        </div>
      </div>
    </header>
  );
}
