import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function LiquidOrb({
  status,
}: {
  status: "ready" | "listening" | "thinking" | "speaking";
}) {
  const amp = useMotionValue(0);
  const sAmp = useSpring(amp, { stiffness: 200, damping: 18, mass: 0.4 });

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const dt = (t - start) / 1000;
      let v = 0;
      if (status === "speaking") {
        v = 0.55 + 0.35 * Math.sin(dt * 9) + 0.18 * Math.sin(dt * 18) + 0.1 * Math.sin(dt * 32);
      } else if (status === "thinking") {
        v = 0.35 + 0.15 * Math.sin(dt * 4);
      } else if (status === "listening") {
        v = 0.18 + 0.08 * Math.sin(dt * 5);
      } else {
        v = 0.1;
      }
      amp.set(Math.max(0, Math.min(1, v)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, amp]);

  const scale = useSpring(1, { stiffness: 60, damping: 14 });
  useEffect(() => {
    const unsub = sAmp.on("change", (v) => {
      const base = status === "listening" ? 0.78 : status === "thinking" ? 0.9 : 1;
      scale.set(base + v * 0.18);
    });
    return () => unsub();
  }, [sAmp, scale, status]);

  return (
    <motion.div style={{ scale }} className="relative h-full w-full">
      {/* Outer aura */}
      <div
        className="absolute inset-[-20%] rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(circle, color-mix(in oklab, var(--aurora-blue) 60%, transparent), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-[-10%] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle, color-mix(in oklab, var(--aurora-pink) 50%, transparent), transparent 60%)",
          animation: "aurora-drift 14s ease-in-out infinite",
        }}
      />

      <OrbBlob amp={sAmp} status={status} />
    </motion.div>
  );
}

export function OrbBlob({
  amp,
  status,
}: {
  amp: any;
  status: "ready" | "listening" | "thinking" | "speaking";
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const rot = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const a = amp.get();
      rot.current += status === "thinking" ? 0.4 : status === "speaking" ? 0.7 : 0.12;
      const t = performance.now() / 1000;
      const points = 96;
      const cx = 200;
      const cy = 200;
      const base = 130;
      const wobble =
        status === "speaking" ? 35 : status === "thinking" ? 14 : status === "listening" ? 8 : 6;
      const ampWobble = wobble * (0.4 + a * 1.6);
      
      const speed = status === "speaking" ? 3 : status === "thinking" ? 1.5 : 0.8;
      
      let d = "";
      for (let i = 0; i <= points; i++) {
        const ang = (i / points) * Math.PI * 2;
        const r =
          base +
          Math.sin(ang * 3 + t * 1.3 * speed) * ampWobble * 0.6 +
          Math.sin(ang * 5 - t * 0.9 * speed) * ampWobble * 0.4 +
          Math.sin(ang * 2 + t * 2.1 * speed) * ampWobble * 0.3 +
          Math.sin(ang * 7 + t * 1.7 * speed) * ampWobble * 0.2;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        d += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
      }
      d += "Z";
      pathRef.current?.setAttribute("d", d);
      pathRef.current?.setAttribute("transform", `rotate(${rot.current.toFixed(2)} 200 200)`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amp, status]);

  return (
    <svg
      viewBox="0 0 400 400"
      className="relative h-full w-full"
      style={{ filter: "drop-shadow(0 0 60px color-mix(in oklab, var(--aurora-blue) 40%, transparent))" }}
    >
      <defs>
        <radialGradient id="orbFill" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="20%" stopColor="var(--aurora-cyan)" stopOpacity="0.95" />
          <stop offset="45%" stopColor="var(--aurora-blue)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="var(--aurora-purple)" stopOpacity="0.95" />
          <stop offset="90%" stopColor="var(--aurora-red)" stopOpacity="0.95" />
          <stop offset="100%" stopColor="var(--aurora-pink)" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="orbHi" cx="35%" cy="25%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <filter id="orbBlur">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <g filter="url(#orbBlur)">
        <path ref={pathRef} fill="url(#orbFill)" />
      </g>
      <circle cx="160" cy="150" r="80" fill="url(#orbHi)" />
    </svg>
  );
}

export function OrbMark() {
  return (
    <div className="relative h-8 w-8">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, var(--aurora-cyan), var(--aurora-blue), var(--aurora-purple), var(--aurora-pink), var(--aurora-red), var(--aurora-cyan))",
          animation: "spin-slow 14s linear infinite",
          filter: "blur(2px)",
        }}
      />
      <div className="absolute inset-1 rounded-full bg-background/60 backdrop-blur" />
      <div
        className="absolute inset-1.5 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, white, transparent 50%), conic-gradient(from 180deg, var(--aurora-purple), var(--aurora-red), var(--aurora-cyan), var(--aurora-purple))",
        }}
      />
    </div>
  );
}
