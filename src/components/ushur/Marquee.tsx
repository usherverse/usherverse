export function Marquee() {
  const words = ["Design", "Develop", "Automate", "Integrate", "Transform", "Scale", "Refine"];
  const line = (
    <div className="flex items-center gap-12 px-6 shrink-0">
      {words.map((w, i) => (
        <div key={i} className="flex items-center gap-12">
          <span className="font-display italic text-[10vw] md:text-[8vw] leading-none font-light whitespace-nowrap">
            {w}
          </span>
          <span className="text-[var(--champagne)] text-5xl">✦</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="border-y border-[var(--border)] py-10 overflow-hidden bg-[var(--bone)]">
      <div className="flex marquee w-max">
        {line}
        {line}
      </div>
    </div>
  );
}