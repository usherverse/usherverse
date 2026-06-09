import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, bgStyle].
 * The background image URL is only injected into the style once the element
 * is within `rootMargin` of the viewport, preventing eager image downloads
 * for off-screen sections on low-end devices.
 */
export function useLazyBg(url: string, rootMargin = "300px") {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, loaded ? { backgroundImage: `url('${url}')` } : {}] as const;
}
