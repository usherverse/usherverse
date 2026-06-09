import { motion } from "framer-motion";
import { useVideoPause } from "@/hooks/use-video-pause";

export function Footer() {
  const videoRef = useVideoPause();
  // Video commented out — re-enable by restoring the useRef/useEffect and <video> block below
  return (
    <footer className="relative text-[var(--foreground)] overflow-hidden bg-black">

      {/* Background video */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/footer-video-1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/50" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-24 pb-10">
        <div className="grid md:grid-cols-12 gap-12 pb-20 border-b border-[var(--foreground)]/15">
          <div className="md:col-span-5">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--champagne)] mb-6">— Big Little World</div>
            <p className="font-display text-2xl md:text-3xl font-light leading-snug max-w-md">
              A digital universe for building, automating, and refining the systems behind modern businesses.
            </p>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/50 mb-4">Sitemap</div>
            <ul className="space-y-2 font-display text-xl">
              <li><a href="#services" className="hover:text-[var(--champagne)] transition-colors">Services</a></li>
              <li><a href="#process" className="hover:text-[var(--champagne)] transition-colors">Process</a></li>
              <li><a href="#about" className="hover:text-[var(--champagne)] transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-[var(--champagne)] transition-colors">Contact</a></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/50 mb-4">Elsewhere</div>
            <ul className="space-y-2 font-display text-xl">
              {[
                { name: "WhatsApp", url: "https://wa.me/254110000284" },
                { name: "X (Twitter)", url: "https://x.com/Usherverse_" },
                { name: "TikTok", url: "https://www.tiktok.com/@usherverse_" },
                { name: "Instagram", url: "https://www.instagram.com/usherverse_/" }
              ].map((s) => (
                <li key={s.name}>
                  <a href={s.url} target={s.url !== "#" ? "_blank" : undefined} rel="noreferrer" className="group inline-flex items-center gap-3 hover:text-[var(--champagne)] transition-colors">
                    {s.name} <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">↗</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-1 text-sm text-[var(--foreground)]/60">
              <div>0110 000 284</div>
              <div>usherverse@gmail.com</div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.6, 0.05, 0.1, 1] }}
          className="py-12 select-none"
        >
          <div className="font-display font-light text-[18vw] leading-[0.85] tracking-[-0.04em]">
            Usherverse<span className="text-[var(--champagne)]">.</span>
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-8 border-t border-[var(--foreground)]/15 text-xs uppercase tracking-[0.3em] text-[var(--foreground)]/50">
          <div>© 2026 Usherverse — All rights reserved</div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[var(--champagne)] animate-pulse" />
            Available for new engagements
          </div>
          <div>Crafted in Nairobi</div>
        </div>
      </div>
    </footer>
  );
}