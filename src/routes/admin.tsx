import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, Eye, EyeOff } from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AmbientBackground } from "@/components/ushur/aura/AmbientBackground";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Usherverse" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/consultations", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setError("Incorrect password. Try again.");
      } else {
        setAdminPass(password);
        setIsAuthenticated(true);
      }
    } catch {
      setError("Connection error. Make sure the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <AdminDashboard
        password={adminPass}
        onLogout={() => {
          setIsAuthenticated(false);
          setPassword("");
          setAdminPass("");
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
      <AmbientBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-purple))" }}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-2xl text-white tracking-tight">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Usherverse Internal Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-3xl p-7">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
                  id="admin-password-input"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              id="admin-login-btn"
              disabled={isLoading || !password}
              className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, var(--aurora-cyan), var(--aurora-blue), var(--aurora-purple))" }}
            >
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Restricted access · Usherverse internal use only
        </p>
      </motion.div>
    </div>
  );
}
