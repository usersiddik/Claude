"use client";

import { useId, useRef, useState } from "react";
import type { BuiltExport } from "@/lib/exports";
import { CopyButton } from "./CopyButton";
import { highlight } from "./highlight";
import styles from "./CodeTabs.module.css";

interface CodeTabsProps {
  items: readonly BuiltExport[];
  assetTitle: string;
  /** Compact variant for the hero: shorter code area. */
  compact?: boolean;
  label?: string;
}

export function CodeTabs({ items, assetTitle, compact = false, label = "Code format" }: CodeTabsProps) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const current = items[active] ?? items[0];

  if (!current) return null;

  function focusTab(index: number) {
    const next = (index + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const keys: Record<string, () => void> = {
      ArrowRight: () => focusTab(active + 1),
      ArrowLeft: () => focusTab(active - 1),
      Home: () => focusTab(0),
      End: () => focusTab(items.length - 1),
    };
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  return (
    <div className={`${styles.root} ${compact ? styles.compact : ""}`}>
      <div className={styles.bar}>
        <div role="tablist" aria-label={label} className={styles.tablist} onKeyDown={onKeyDown}>
          {items.map((item, index) => (
            <button
              key={item.format}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.format}`}
              aria-selected={index === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={index === active ? 0 : -1}
              className={styles.tab}
              onClick={() => setActive(index)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <CopyButton
          getText={() => current.code}
          label={`Copy ${current.label} code for ${assetTitle}`}
          what={`${current.label} code`}
          variant="solid"
        >
          Copy
        </CopyButton>
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${current.format}`}
        className={styles.panel}
      >
        <p className={styles.meta}>
          <span className={styles.file}>{current.fileName}</span>
          <span className={styles.note}>{current.note}</span>
        </p>
        <pre className={styles.pre} tabIndex={0} aria-label={`${current.label} code for ${assetTitle}`}>
          <code>{highlight(current.code)}</code>
        </pre>
      </div>
    </div>
  );
}
