"use client";

import { useEffect, useState, type ReactNode } from "react";

/** The header element: clear at the top of the page, frosted once the page scrolls. */
export function HeaderShell({ className, children }: { className?: string; children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={className} data-scrolled={scrolled ? "" : undefined}>
      {children}
    </header>
  );
}
