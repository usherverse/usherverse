import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn(); 
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    setTimeout(() => {
      window.history.pushState(null, '', href);
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150); // wait for menu to start closing and overflow to reset
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.6, 0.05, 0.1, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "py-3 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border)]" : "py-6"
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#top" className="font-display text-xl tracking-tight z-50 relative">
            Usherverse<span className="text-[var(--champagne)]">.</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.25em]">
            {LINKS.map((l, i) => (
              <a key={l.href} href={l.href} onClick={(e) => handleNavClick(e, l.href)} className="relative group">
                <span className="text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
                  <span className="text-[var(--champagne)] mr-2">0{i + 1}</span>{l.label}
                </span>
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] border-b border-[var(--foreground)] pb-1 hover:text-[var(--champagne)] hover:border-[var(--champagne)] transition-colors"
          >
            Start a project →
          </a>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden z-50 relative flex flex-col justify-center items-center w-10 h-10 gap-[6px]"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="block w-6 h-px bg-[var(--foreground)] origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block w-6 h-px bg-[var(--foreground)] origin-center"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="block w-6 h-px bg-[var(--foreground)] origin-center"
            />
          </button>
        </div>
      </motion.header>

      {/* Mobile full-screen menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.6, 0.05, 0.1, 1] }}
            className="fixed inset-0 z-40 flex flex-col px-6 pt-32 pb-12 bg-[var(--background)]"
          >
            {/* Background Image with overlay for readability */}
            <div 
              className="absolute inset-0 -z-10 opacity-30 mix-blend-screen bg-cover bg-center"
              style={{ backgroundImage: "url('/menu.webp')" }}
            />
            {/* Nav links */}
            <nav className="flex flex-col gap-0 flex-1">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: [0.6, 0.05, 0.1, 1] }}
                  className="group flex items-center justify-between border-b border-[var(--border)] py-6"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-[var(--champagne)] text-xs tracking-[0.3em] uppercase">0{i + 1}</span>
                    <span className="font-display text-4xl font-light tracking-tight text-[var(--foreground)] group-hover:text-[var(--champagne)] transition-colors duration-300">
                      {l.label}
                    </span>
                  </div>
                  <span className="text-[var(--muted-foreground)] group-hover:translate-x-1 group-hover:text-[var(--champagne)] transition-all duration-300">→</span>
                </motion.a>
              ))}
            </nav>

            {/* CTA at bottom */}
            <motion.a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-10 inline-flex items-center justify-center gap-3 bg-[var(--champagne)] text-white px-8 py-5 text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-opacity"
            >
              Start a project →
            </motion.a>

            {/* Corner label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]"
            >
              Usherverse — 2026
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}