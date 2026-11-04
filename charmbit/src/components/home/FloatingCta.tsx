"use client";

import { useEffect, useState } from "react";
import { stickerPath } from "@/lib/universe/paths";
import styles from "./FloatingCta.module.css";

/** A small pill that offers the library once the hero is gone, until the library is on screen. */
export function FloatingCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const library = document.getElementById("library");
    const footer = document.getElementById("formats");
    if (!hero || !library) return;
    const seen = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target, entry.isIntersecting);
        setShow(!seen.get(hero) && !seen.get(library) && !(footer && seen.get(footer)));
      },
      { threshold: 0.05 },
    );
    observer.observe(hero);
    observer.observe(library);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <a href="#library" className={styles.cta} data-show={show ? "" : undefined} tabIndex={show ? undefined : -1} aria-hidden={show ? undefined : true}>
      <span className={styles.thumb}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sticker */}
        <img src={stickerPath("cats", "hi")} alt="" width={36} height={36} />
      </span>
      Open library
    </a>
  );
}
