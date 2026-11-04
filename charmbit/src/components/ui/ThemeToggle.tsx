"use client";

import { MoonIcon, SunIcon } from "./icons";
import styles from "./ThemeToggle.module.css";

/** Switches between light and dark; the choice is remembered on this device. */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("charmbit-theme", next);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }

  return (
    <button type="button" className={styles.toggle} onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      <MoonIcon className={styles.moon} size={17} />
      <SunIcon className={styles.sun} size={17} />
    </button>
  );
}
