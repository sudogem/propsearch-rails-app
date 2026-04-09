// src/hooks/useIntersectionObserver.js

import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to a ref element.
 * Calls onIntersect when the element enters the viewport.
 */
export function useIntersectionObserver(onIntersect, { threshold = 0.1, rootMargin = "200px" } = {}) {
  const targetRef = useRef(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [onIntersect, threshold, rootMargin]);

  return targetRef;
}
