"use client";
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  // Initialize synchronously on the client so conditional renders based on
  // this value are stable from the first paint — prevents mount/unmount cycles.
  // Falls back to false during SSR where window is unavailable.
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
