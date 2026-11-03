"use client";

import { SEARCH_INPUT_ID } from "@/components/library/Discovery";
import { SearchIcon } from "@/components/ui/icons";
import styles from "./SiteHeader.module.css";

export function SearchTrigger() {
  return (
    <a
      href="#library"
      className={styles.search}
      aria-label="Search the library"
      onClick={(event) => {
        const input = document.getElementById(SEARCH_INPUT_ID);
        if (!(input instanceof HTMLInputElement)) return;
        event.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        input.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        input.focus({ preventScroll: true });
      }}
    >
      <SearchIcon size={17} />
      <span className={styles.searchLabel}>Search</span>
      <kbd className={styles.kbd} aria-hidden="true">
        /
      </kbd>
    </a>
  );
}
