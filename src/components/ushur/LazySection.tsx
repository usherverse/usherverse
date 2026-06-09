import { ReactNode } from "react";
import { useLazySection } from "@/hooks/use-lazy-section";

interface LazySectionProps {
  children: ReactNode;
  /** Minimum height placeholder so the page layout/scroll doesn't collapse */
  minHeight?: string;
  /** How far before it enters the viewport to start loading (default 200px) */
  rootMargin?: string;
  className?: string;
}

/**
 * Wraps a page section so it is only rendered once it (or is close to)
 * entering the viewport. Before that it renders a transparent placeholder
 * that preserves scroll height.
 */
export function LazySection({
  children,
  minHeight = "1px",
  rootMargin = "200px",
  className,
}: LazySectionProps) {
  const [ref, isVisible] = useLazySection(rootMargin);

  return (
    <div
      ref={ref}
      style={{ minHeight: isVisible ? undefined : minHeight }}
      className={className}
    >
      {isVisible ? children : null}
    </div>
  );
}
