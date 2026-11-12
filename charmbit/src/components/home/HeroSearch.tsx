"use client";

import { searchLibrary } from "@/components/library/search-events";
import styles from "./Hero.module.css";

/** Popular searches under the headline. Search itself lives in the navigation. */
export function HeroSearch({ suggestions }: { suggestions: readonly string[] }) {
  function run(query: string) {
    document.getElementById("library")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    searchLibrary(query);
  }

  return (
    <div className={styles.chips} role="group" aria-label="Popular searches">
      <span className={styles.chipsLabel}>Popular</span>
      {suggestions.map((query, index) => (
        <button key={query} type="button" className={styles.chip} style={{ "--i": index } as React.CSSProperties} onClick={() => run(query)}>
          {query}
        </button>
      ))}
    </div>
  );
}
