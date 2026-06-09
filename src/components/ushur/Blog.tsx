import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function Blog() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section id="blog" className="relative py-32 px-6 md:px-12 bg-[var(--ink)] text-[var(--bone)] [clip-path:inset(0)] transform-gpu">
      <div className="absolute -top-[100svh] bottom-0 left-0 right-0 z-0">
        <div 
          className="sticky top-0 w-full h-[100svh] bg-cover bg-center will-change-transform"
          style={{ backgroundImage: "url('/testimonials.webp')" }}
        />
      </div>
      <div className="max-w-[1600px] mx-auto relative z-10 backdrop-blur-2xl bg-white/20 border border-white/30 shadow-2xl rounded-3xl p-8 md:p-16 transform-gpu">
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-[var(--bone)]/60 mb-16">
          <span className="text-[var(--champagne)]">07</span>
          <span className="w-12 h-px bg-[var(--bone)]/40" />
          <span>Blog</span>
        </div>

        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-6">
            <motion.h2 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.6, 0.05, 0.1, 1] }}
              className="font-display font-light text-[7vw] md:text-[5vw] leading-[1] tracking-[-0.02em] text-balance text-white drop-shadow-lg sticky top-32"
            >
              What Happens When Intelligence Is <em className="text-[var(--champagne)] drop-shadow-none">No Longer</em> Exclusively Human?
            </motion.h2>
          </div>

          <div className="md:col-span-6 md:pt-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-8 text-base md:text-lg text-white/90 leading-relaxed font-light"
            >
              <p className="first-letter:text-7xl md:first-letter:text-8xl first-letter:font-display first-letter:text-[var(--champagne)] first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.7]">For centuries, humanity has operated under a simple assumption: intelligence was our defining advantage. Every technological revolution—from the printing press to the internet—was ultimately a tool created and directed by human cognition. Artificial Intelligence challenges that assumption.</p>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: [0.6, 0.05, 0.1, 1] }}
                    className="overflow-hidden space-y-8"
                  >
                    <p>What makes AI revolutionary is not merely its ability to automate tasks; it is its capacity to participate in cognitive processes once considered uniquely human. Pattern recognition, language generation, decision-making, and increasingly sophisticated reasoning are no longer confined to biological minds.</p>
                    <p>From a psychological standpoint, this shift is profound. Human beings derive a sense of identity and purpose from their perceived uniqueness. As machines begin to perform intellectual tasks at scale, society is being forced to re-evaluate what creativity, expertise, and even intelligence truly mean. The question is no longer whether machines can think, but how human thinking adapts when it is no longer alone.</p>
                    <p>AI exposes an uncomfortable truth: intelligence may not be a mystical property of consciousness, but an emergent phenomenon arising from sufficiently complex systems. If that is the case, the boundaries we have drawn between mind and machine become increasingly difficult to defend.</p>
                    <p>The technological implications are obvious. Industries are being transformed, workflows are being redefined, and innovation cycles are accelerating at unprecedented rates. Yet the deeper revolution is occurring within our collective understanding of ourselves. Artificial Intelligence is not simply changing technology; it is forcing humanity to confront one of its oldest questions: What does it mean to be intelligent in a world where intelligence is no longer exclusively human?</p>
                    <p>I believe humanity has always been defined by its ability to create. Every breakthrough, every invention, and every technological leap began as an idea in the human mind. AI is not a departure from that story—it is its continuation. We have been given the power to imagine, build, and transform the world around us, and artificial intelligence stands as one of the most powerful expressions of that capability.</p>
                    <p>The future is not approaching; it has already arrived. Those who embrace this transformation will help shape the next era of civilization. Those who ignore it risk becoming spectators to one of the most significant shifts in human history. The tools are in our hands. The opportunity is before us.</p>
                    
                    <div className="pt-8 space-y-4">
                      <p>The future belongs to the curious, the adaptable, and the creators.</p>
                      <p>Don't be the one left in the dark.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--champagne)] hover:text-white transition-colors duration-300 pt-4"
              >
                <span className="w-8 h-px bg-[var(--champagne)] group-hover:bg-white transition-colors duration-300" />
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
