"use client";

import { useEffect } from "react";

/**
 * Page-wide behaviour: links marked data-library open the library in place
 * (no reload), and [data-reveal] elements fade up as they scroll into view.
 */
export function Reveal() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[data-library]");
      const library = document.getElementById("library");
      if (!link || !library) return;
      event.preventDefault();
      const url = new URL(link.href);
      // Next.js picks up pushState, so the library re-renders with the new selection.
      window.history.pushState(null, "", `${url.pathname}${url.search}`);
      library.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const targets = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-shown", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    // Elements already on screen show at once; the rest wait their turn.
    for (const target of targets) {
      if (target.getBoundingClientRect().top < window.innerHeight) target.setAttribute("data-shown", "");
      else observer.observe(target);
    }
    root.dataset.motion = "";
    return () => observer.disconnect();
  }, []);
  return null;
}
