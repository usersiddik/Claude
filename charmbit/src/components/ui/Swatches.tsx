"use client";

import type { CSSProperties } from "react";
import type { ColorOption } from "@/lib/customize";
import styles from "./Controls.module.css";

interface SwatchesProps {
  name: string;
  label: string;
  options: readonly ColorOption[];
  value: string;
  onChange: (id: string) => void;
}

/** A radio group of colour swatches. Arrow keys move between options. */
export function Swatches({ name, label, options, value, onChange }: SwatchesProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.swatches}>
        {options.map((option) => (
          <label
            key={option.id}
            className={styles.swatch}
            data-original={option.hex === null ? "" : undefined}
            style={option.hex ? ({ "--swatch": option.hex } as CSSProperties) : undefined}
            title={option.name}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className={styles.input}
            />
            <span className="sr-only">{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
