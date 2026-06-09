import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, isVisible]. Attach `ref` to a wrapper element.
 * `isVisible` becomes true once the element enters the viewport
 * and stays true (so the section is never unmounted once loaded).
 *
 * @param rootMargin  How far ahead of the viewport to start loading.
 *                    "200px" means start rendering 200 px before it scrolls in.
 */
export function useLazySection(rootMargin = "200px") {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver isn't supported (rare), just show everything.
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only need to trigger once
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isVisible] as const;
}
