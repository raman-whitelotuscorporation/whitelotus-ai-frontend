"use client";
import { useEffect, useRef } from "react";

/**
 * Observes all `.reveal-hidden` elements inside `containerRef` and swaps
 * them to `.reveal-visible` once (viewport once = true).
 *
 * Re-queries on every effect run so React Strict Mode double-invocation
 * and late-mounting elements are handled correctly.
 */
export function useReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  options: { threshold?: number; rootMargin?: string } = {},
) {
  const { threshold = 0.1, rootMargin = "0px 0px -48px 0px" } = options;

  // Track which elements have already been revealed so a second observer
  // run (Strict Mode) doesn't re-observe already-visible elements.
  const revealed = useRef(new WeakSet<Element>());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect prefers-reduced-motion: reveal everything immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      container
        .querySelectorAll<HTMLElement>(".reveal-hidden")
        .forEach((el) => {
          el.classList.remove("reveal-hidden");
          el.classList.add("reveal-visible");
          revealed.current.add(el);
        });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          if (revealed.current.has(el)) return;
          revealed.current.add(el);
          el.classList.remove("reveal-hidden");
          el.classList.add("reveal-visible");
          observer.unobserve(el);
        });
      },
      { threshold, rootMargin },
    );

    // Query fresh each time — handles Strict Mode double-invoke correctly.
    container.querySelectorAll<HTMLElement>(".reveal-hidden").forEach((el) => {
      if (!revealed.current.has(el)) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
