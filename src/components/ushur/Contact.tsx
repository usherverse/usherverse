import { motion } from "framer-motion";
import { useState } from "react";

export function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="relative py-32 px-6 md:px-12 bg-[var(--card)]">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-16">
          <span className="text-[var(--champagne)]">09</span>
          <span className="w-12 h-px bg-[var(--ink)]" />
          <span>Begin</span>
        </div>

        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <h2 className="font-display font-light text-[10vw] md:text-[6vw] leading-[0.9] tracking-[-0.02em]">
              Let's build<br />
              <em className="text-[var(--champagne)]">something</em><br />
              inevitable.
            </h2>
            <div className="mt-16 space-y-6 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-2">Telephone</div>
                <a href="tel:0110000284" className="font-display text-2xl hover:text-[var(--champagne)] transition-colors">0110 000 284</a>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-2">Correspondence</div>
                <a href="mailto:ushurverse@gmail.com" className="font-display text-2xl hover:text-[var(--champagne)] transition-colors">ushurverse@gmail.com</a>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-2">Hours</div>
                <p className="font-display text-2xl">Mon — Sat, 09:00 — 19:00 EAT</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="md:col-span-7 space-y-px bg-[var(--border)] border border-[var(--border)]"
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--ink)] text-[var(--bone)] p-16 text-center"
              >
                <div className="font-display text-5xl mb-4 italic text-[var(--champagne)]">Received.</div>
                <p className="text-[var(--bone)]/70">A reply lands in your inbox within 24 hours.</p>
              </motion.div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-px">
                  <Field label="Name" name="name" />
                  <Field label="Email" name="email" type="email" />
                  <Field label="Phone" name="phone" />
                  <Field label="Company" name="company" />
                </div>
                <div className="grid md:grid-cols-2 gap-px">
                  <Field label="Project Type" name="type" placeholder="Website / System / Automation" />
                  <Field label="Budget Range" name="budget" placeholder="USD 5k — 50k+" />
                </div>
                <div className="bg-[var(--background)] p-6">
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-3">Project Description</label>
                  <textarea
                    name="desc"
                    rows={5}
                    placeholder="Tell me what you're trying to build, fix, or remove."
                    className="w-full bg-transparent outline-none font-display text-xl placeholder:text-[var(--muted-foreground)]/40 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="block w-full bg-[var(--ink)] text-[var(--bone)] py-6 text-xs uppercase tracking-[0.3em] hover:bg-[var(--champagne)] hover:text-[var(--ink)] transition-colors duration-500"
                >
                  Send enquiry →
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <div className="bg-[var(--background)] p-6">
      <label className="block text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-3">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={name === "name" || name === "email"}
        className="w-full bg-transparent outline-none font-display text-xl placeholder:text-[var(--muted-foreground)]/40"
      />
    </div>
  );
}