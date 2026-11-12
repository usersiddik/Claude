"use client";

import { useEffect } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const easeInOut = (value: number) => (value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2);

/**
 * Scroll-linked motion for [data-scene] elements. While one is on screen it
 * gets, every frame it moves:
 *   --p  0 → 1 as it travels from the bottom of the viewport to the top,
 *   --e  0 → 1 eased, while its top travels between two points of the
 *        viewport: data-scene="0.85 0.05" (the default) starts when the top
 *        is 85% of the way down and finishes at 5%,
 *   --w / --h  its size in pixels.
 * CSS turns those into transforms. With reduced motion everything sits at rest.
 */
export function ScrollScene() {
  useEffect(() => {
    const scenes = [...document.querySelectorAll<HTMLElement>("[data-scene]")];
    if (!scenes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

    const ranges = new Map(
      scenes.map((scene) => {
        const [from = 0.85, to = 0.05] = (scene.dataset.scene ?? "").split(/\s+/).filter(Boolean).map(Number);
        return [scene, { from, span: Math.max(0.05, from - to) }] as const;
      }),
    );
    const active = new Set<HTMLElement>();
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      for (const scene of active) {
        const box = scene.getBoundingClientRect();
        scene.style.setProperty("--p", clamp((viewport - box.top) / (viewport + box.height)).toFixed(4));
        const range = ranges.get(scene)!;
        scene.style.setProperty("--e", easeInOut(clamp((viewport * range.from - box.top) / (viewport * range.span))).toFixed(4));
        scene.style.setProperty("--w", `${Math.round(box.width)}px`);
        scene.style.setProperty("--h", `${Math.round(box.height)}px`);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) active.add(entry.target as HTMLElement);
        else active.delete(entry.target as HTMLElement);
      }
      schedule();
    });
    for (const scene of scenes) {
      scene.dataset.sceneLive = "";
      observer.observe(scene);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
