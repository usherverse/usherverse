import { motion } from "framer-motion";
import { useState } from "react";

export function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section className="relative py-32 px-6 md:px-12 text-white [clip-path:inset(0)] transform-gpu">
      <div className="absolute -top-[100svh] bottom-0 left-0 right-0 z-0">
        <div 
          className="sticky top-0 w-full h-[100svh] bg-cover bg-center will-change-transform"
          style={{ backgroundImage: "url('/6.webp')" }}
        />
      </div>
      <div className="max-w-[1600px] mx-auto relative z-10 backdrop-blur-2xl bg-black/40 border border-white/10 shadow-2xl rounded-3xl p-8 md:p-16 transform-gpu">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/60 mb-16">
          <span className="text-[var(--champagne)]">09</span>
          <span className="w-12 h-px bg-white/30" />
          <span className="text-white drop-shadow-md">Begin</span>
        </div>

        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <h2 className="font-display font-light text-[10vw] md:text-[6vw] leading-[0.9] tracking-[-0.02em] text-white drop-shadow-lg">
              Let's build<br />
              <em className="text-[var(--champagne)] drop-shadow-none">something</em><br />
              inevitable.
            </h2>
            <div className="mt-16 space-y-6 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">Telephone</div>
                <a href="tel:0110000284" className="font-display text-2xl hover:text-[var(--champagne)] transition-colors text-white drop-shadow-md">0110 000 284</a>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">Correspondence</div>
                <a href="mailto:ushurverse@gmail.com" className="font-display text-2xl hover:text-[var(--champagne)] transition-colors text-white drop-shadow-md">usherverse@gmail.com</a>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">Hours</div>
                <p className="font-display text-2xl text-white drop-shadow-md">Mon — Sat, 09:00 — 19:00 EAT</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget);
              const name = formData.get("name") || "N/A";
              const email = formData.get("email") || "N/A";
              const phone = formData.get("phone") || "N/A";
              const company = formData.get("company") || "N/A";
              const type = formData.get("type") || "N/A";
              const budget = formData.get("budget") || "N/A";
              const desc = formData.get("desc") || "N/A";

              const message = `*New Inquiry from Website*\n\n*Name:* ${name}\n*Email:* ${email}\n*Phone:* ${phone}\n*Company:* ${company}\n*Project Type:* ${type}\n*Budget:* ${budget}\n\n*Description:*\n${desc}`;
              
              const whatsappUrl = `https://wa.me/254110000284?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, "_blank");
              
              setSent(true); 
            }}
            className="md:col-span-7 space-y-px bg-white/10 border border-white/20 rounded-2xl overflow-hidden backdrop-blur-md"
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
                  <Field label="Budget Range" name="budget" placeholder="" />
                </div>
                <div className="bg-black/30 p-6">
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-white/60 mb-3">Project Description</label>
                  <textarea
                    name="desc"
                    rows={5}
                    placeholder="Tell me what you're trying to build, fix, or remove."
                    className="w-full bg-transparent outline-none font-display text-xl placeholder:text-white/40 resize-none text-white"
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
    <div className="bg-black/30 p-6">
      <label className="block text-[10px] uppercase tracking-[0.3em] text-white/60 mb-3">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={name === "name" || name === "email"}
        className="w-full bg-transparent outline-none font-display text-xl placeholder:text-white/40 text-white"
      />
    </div>
  );
}