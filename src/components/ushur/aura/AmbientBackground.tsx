import { useEffect, useMemo, useState } from "react";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div
        className="absolute -left-1/4 top-[-20%] h-[70vmax] w-[70vmax] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle at 30% 30%, var(--aurora-indigo), transparent 60%)",
          animation: "aurora-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-20%] top-[10%] h-[60vmax] w-[60vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--aurora-purple), transparent 60%)",
          animation: "aurora-drift 28s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-[-30%] left-[20%] h-[60vmax] w-[60vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--aurora-cyan), transparent 60%)",
          animation: "aurora-drift 32s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[5%] h-[50vmax] w-[50vmax] rounded-full opacity-35 blur-3xl"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--aurora-red), transparent 60%)",
          animation: "aurora-drift 26s ease-in-out infinite reverse",
        }}
      />
      <Particles />
      <div className="absolute inset-0 noise opacity-[0.05]" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </div>
  );
}

export function Particles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const dots = useMemo(
    () =>
      Array.from({ length: 28 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 10,
      })),
    [],
  );

  if (!mounted) return null;

  return (
    <>
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/60"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            filter: "blur(0.5px)",
            animation: `float-slow ${d.duration}s ease-in-out ${d.delay}s infinite`,
            opacity: 0.35,
          }}
        />
      ))}
    </>
  );
}

