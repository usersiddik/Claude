"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pointer parallax for the hero stickers. One listener writes two CSS
 * variables per frame; each sticker turns them into its own offset by depth.
 */
export function HeroStage({ className, children }: { className?: string; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      node.style.setProperty("--px", x.toFixed(3));
      node.style.setProperty("--py", y.toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth) * 2 - 1;
      y = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={stage} className={className}>
      {children}
    </div>
  );
}
