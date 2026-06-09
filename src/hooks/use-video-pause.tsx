import { useEffect, useRef } from "react";

export function useVideoPause(rootMargin = "200px") {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [rootMargin]);

  return ref;
}
