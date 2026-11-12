"use client";

import { useEffect } from "react";

/**
 * Page-wide: any element marked data-tilt leans towards the pointer, like a
 * card held in the hand. One listener for the whole page; writes --rx and --ry.
 * Off for touch screens and reduced motion.
 */
export function Tilt() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current: HTMLElement | null = null;
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      if (!current) return;
      const box = current.getBoundingClientRect();
      const dx = (x - box.left) / box.width - 0.5;
      const dy = (y - box.top) / box.height - 0.5;
      current.style.setProperty("--rx", `${(-dy * 10).toFixed(2)}deg`);
      current.style.setProperty("--ry", `${(dx * 12).toFixed(2)}deg`);
      current.style.setProperty("--mx", `${((dx + 0.5) * 100).toFixed(1)}%`);
    };
    const onMove = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (current && current !== target) {
        current.style.removeProperty("--rx");
        current.style.removeProperty("--ry");
        current.style.removeProperty("--mx");
      }
      current = target;
      x = event.clientX;
      y = event.clientY;
      if (current && !frame) frame = requestAnimationFrame(apply);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
