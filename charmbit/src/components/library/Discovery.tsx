"use client";

import { useEffect, useRef } from "react";
import { FILTERS, type FilterId } from "@/lib/assets/filters";
import { SearchIcon } from "@/components/ui/icons";
import styles from "./Discovery.module.css";

interface DiscoveryProps {
  query: string;
  filter: FilterId;
  counts: Record<FilterId, number>;
  resultCount: number;
  total: number;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: FilterId) => void;
  onClear: () => void;
}

export const SEARCH_INPUT_ID = "library-search";

export function Discovery({
  query,
  filter,
  counts,
  resultCount,
  total,
  onQueryChange,
  onFilterChange,
  onClear,
}: DiscoveryProps) {
  const input = useRef<HTMLInputElement>(null);

  // "/" focuses search, unless the user is already typing somewhere.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], dialog")) return;
      event.preventDefault();
      input.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = query.trim() !== "" || filter !== "all";
  const label = FILTERS.find((candidate) => candidate.id === filter)?.label ?? "All";

  return (
    <div className={styles.discovery}>
      <form role="search" className={styles.form} onSubmit={(event) => event.preventDefault()}>
        <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
          Search the library
        </label>
        <div className={styles.field}>
          <SearchIcon className={styles.icon} size={18} />
          <input
            ref={input}
            id={SEARCH_INPUT_ID}
            className={styles.input}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                onQueryChange("");
              }
            }}
            placeholder="Search by name, mood, or use: try “happy”"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            aria-describedby="library-result-summary"
          />
          <kbd className={styles.kbd} aria-hidden="true">
            /
          </kbd>
        </div>
      </form>

      <fieldset className={styles.chips}>
        <legend className="sr-only">Filter by collection</legend>
        {FILTERS.map((option) => (
          <label key={option.id} className={styles.chip} data-filter={option.id}>
            <input
              type="radio"
              name="library-filter"
              value={option.id}
              checked={filter === option.id}
              onChange={() => onFilterChange(option.id)}
              className={styles.radio}
            />
            <span>{option.label}</span>
            <span className={styles.count}>{counts[option.id]}</span>
          </label>
        ))}
      </fieldset>

      <div className={styles.summaryRow}>
        <p id="library-result-summary" role="status" className={styles.summary}>
          {filtered
            ? `${resultCount} of ${total} assets${filter !== "all" ? ` in ${label}` : ""}${query.trim() ? ` matching “${query.trim()}”` : ""}`
            : `${total} assets on the shelf`}
        </p>
        {filtered ? (
          <button type="button" className={styles.clear} onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
