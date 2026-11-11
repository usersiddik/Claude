"use client";

import { useState, type FormEvent } from "react";
import { searchLibrary } from "@/components/library/search-events";
import { SearchIcon } from "@/components/ui/icons";
import styles from "./Hero.module.css";

/** The hero's main action: search every collection by keyword. */
export function HeroSearch({ suggestions }: { suggestions: readonly string[] }) {
  const [value, setValue] = useState("");

  function run(query: string) {
    const text = query.trim();
    if (!text) return;
    document.getElementById("library")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    searchLibrary(text);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    run(value || suggestions[0] || "love");
  }

  return (
    <div className={styles.searchBlock}>
      {/* Without JavaScript the form still works: ?q= opens the library with results. */}
      <form className={styles.search} role="search" onSubmit={submit} action="/#library" method="get">
        <SearchIcon size={18} className={styles.searchIcon} />
        <label htmlFor="hero-search" className="sr-only">
          Search stickers
        </label>
        <input
          id="hero-search"
          name="q"
          type="search"
          className={styles.searchField}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={`Search stickers: ${suggestions.slice(0, 3).join(", ")}…`}
          maxLength={60}
          autoComplete="off"
          enterKeyHint="search"
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>
      <div className={styles.chips} role="group" aria-label="Popular searches">
        {suggestions.map((query, index) => (
          <button key={query} type="button" className={styles.chip} style={{ "--i": index } as React.CSSProperties} onClick={() => run(query)}>
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}
