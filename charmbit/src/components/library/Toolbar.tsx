"use client";

import { useEffect, useRef } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { Swatches } from "@/components/ui/Swatches";
import { SearchIcon } from "@/components/ui/icons";
import { FILTERS, type FilterId } from "@/lib/assets/filters";
import type { ExportFormat } from "@/lib/assets/types";
import { FILL_OPTIONS, INK_OPTIONS } from "@/lib/customize";
import { FORMATS } from "@/lib/exports";
import type { LibraryState } from "./url-state";
import styles from "./Toolbar.module.css";

export const SEARCH_INPUT_ID = "library-search";

interface ToolbarProps {
  state: LibraryState;
  counts: Record<FilterId, number>;
  customized: boolean;
  onChange: (patch: Partial<LibraryState>) => void;
  onReset: () => void;
}

export function Toolbar({ state, counts, customized, onChange, onReset }: ToolbarProps) {
  const input = useRef<HTMLInputElement>(null);

  // "/" focuses search unless the user is already typing.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      input.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        <form role="search" className={styles.search} onSubmit={(event) => event.preventDefault()}>
          <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
            Search the library
          </label>
          <SearchIcon className={styles.searchIcon} size={16} />
          <input
            ref={input}
            id={SEARCH_INPUT_ID}
            className={styles.input}
            type="search"
            value={state.query}
            onChange={(event) => onChange({ query: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Escape" && state.query) {
                event.preventDefault();
                onChange({ query: "" });
              }
            }}
            placeholder="Search by name or mood"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            aria-describedby="library-result-summary"
          />
          <kbd className={styles.kbd} aria-hidden="true">
            /
          </kbd>
        </form>

        <fieldset className={styles.filters}>
          <legend className="sr-only">Show</legend>
          {FILTERS.map((filter) => (
            <label key={filter.id} className={styles.filter}>
              <input
                type="radio"
                name="library-filter"
                value={filter.id}
                checked={state.filter === filter.id}
                onChange={() => onChange({ filter: filter.id })}
                className={styles.radio}
              />
              <span>{filter.label}</span>
              <span className={styles.count}>{counts[filter.id]}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <div className={`${styles.row} ${styles.customize}`}>
        <Swatches name="fill" label="Color" options={FILL_OPTIONS} value={state.fill} onChange={(fill) => onChange({ fill })} />
        <Swatches name="ink" label="Ink" options={INK_OPTIONS} value={state.ink} onChange={(ink) => onChange({ ink })} />
        <Segmented<ExportFormat>
          name="format"
          label="Copy as"
          options={FORMATS}
          value={state.format}
          onChange={(format) => onChange({ format })}
        />
        <button type="button" className={styles.reset} onClick={onReset} hidden={!customized}>
          Reset
        </button>
      </div>
    </div>
  );
}
