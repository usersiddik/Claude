"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { Popover } from "@/components/ui/Popover";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { swatchBackground, SwatchPicker } from "@/components/ui/SwatchPicker";
import { ChevronIcon, SearchIcon } from "@/components/ui/icons";
import type { ExportFormat } from "@/lib/assets/types";
import { FILL_OPTIONS, findFill, findInk, INK_OPTIONS } from "@/lib/customize";
import { CANVAS_OPTIONS, FORMAT_OPTIONS } from "./options";
import type { Canvas, LibraryState } from "./url-state";
import styles from "./ControlBar.module.css";

export const SEARCH_INPUT_ID = "library-search";

const subscribeNothing = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

interface ControlBarProps {
  state: LibraryState;
  onChange: (patch: Partial<LibraryState>) => void;
}

export function ControlBar({ state, onChange }: ControlBarProps) {
  const input = useRef<HTMLInputElement>(null);
  const apple = useSyncExternalStore(subscribeNothing, isApple, () => true);
  const fill = findFill(state.fill);
  const ink = findInk(state.ink);

  // ⌘K / Ctrl+K anywhere, or "/" when not typing, jumps to search.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const commandK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      const slash = event.key === "/" && !typing && !event.metaKey && !event.ctrlKey;
      if (!commandK && !slash) return;
      if (document.querySelector("dialog[open]")) return;
      event.preventDefault();
      const field = input.current;
      if (!field) return;
      field.focus({ preventScroll: true });
      field.select();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      field.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.bar}>
      <form role="search" className={styles.search} onSubmit={(event) => event.preventDefault()}>
        <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
          Search assets
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
          placeholder="Search happy, coffee, weather…"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-describedby="library-result-summary"
        />
        <kbd className={styles.kbd} aria-hidden="true">
          {apple ? "⌘K" : "Ctrl K"}
        </kbd>
      </form>

      <div className={styles.tools}>
        <SegmentedControl<ExportFormat>
          name="format"
          label="Code format"
          options={FORMAT_OPTIONS}
          value={state.format}
          onChange={(format) => onChange({ format })}
          className={styles.formats}
        />

        <div className={styles.studio}>
          <Popover
            label={`Fill color: ${fill.name}`}
            trigger={
              <>
                <span className={styles.dot} style={{ "--swatch": swatchBackground(fill, "original") } as CSSProperties} />
                <span className={styles.triggerText}>Fill</span>
                <ChevronIcon size={14} className={styles.chevron} />
              </>
            }
          >
            <SwatchPicker name="fill" label="Fill color" options={FILL_OPTIONS} value={state.fill} onChange={(id) => onChange({ fill: id })} />
          </Popover>
          <Popover
            label={`Ink color: ${ink.name}`}
            trigger={
              <>
                <span className={styles.dot} style={{ "--swatch": swatchBackground(ink, "auto") } as CSSProperties} />
                <span className={styles.triggerText}>Ink</span>
                <ChevronIcon size={14} className={styles.chevron} />
              </>
            }
          >
            <SwatchPicker name="ink" label="Ink color" options={INK_OPTIONS} value={state.ink} nullStyle="auto" onChange={(id) => onChange({ ink: id })} />
            <p className={styles.note}>Auto keeps currentColor in your code, so linework follows the text color where you use it.</p>
          </Popover>
        </div>

        <SegmentedControl<Canvas>
          name="canvas"
          label="Preview canvas"
          options={CANVAS_OPTIONS}
          value={state.canvas}
          onChange={(canvas) => onChange({ canvas })}
          iconOnly
          size="sm"
        />
      </div>
    </div>
  );
}
