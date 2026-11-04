"use client";

import type { CSSProperties } from "react";
import type { ColorOption } from "@/lib/customize";
import styles from "./SwatchPicker.module.css";

interface SwatchPickerProps {
  name: string;
  label: string;
  options: readonly ColorOption[];
  value: string;
  onChange: (id: string) => void;
  /** How a null-hex option is drawn. */
  nullStyle?: "original" | "auto";
  showLabel?: boolean;
}

export function swatchBackground(option: ColorOption, nullStyle: "original" | "auto"): string {
  if (option.hex) return option.hex;
  return nullStyle === "original"
    ? "conic-gradient(#f6d673 0 25%, #f4a28c 0 50%, #bdb0e3 0 75%, #bfe6d2 0)"
    : "linear-gradient(135deg, #1d1d1f 0 50%, #f5f5f7 50% 100%)";
}

/** Radio group of colour swatches. Arrow keys move between options. */
export function SwatchPicker({ name, label, options, value, onChange, nullStyle = "original", showLabel = true }: SwatchPickerProps) {
  const current = options.find((option) => option.id === value);
  return (
    <fieldset className={styles.picker}>
      <legend className={showLabel ? styles.legend : "sr-only"}>
        {label}
        {showLabel && current ? <span className={styles.current}>{current.name}</span> : null}
      </legend>
      <div className={styles.swatches}>
        {options.map((option) => (
          <label
            key={option.id}
            className={styles.swatch}
            style={{ "--swatch": swatchBackground(option, nullStyle) } as CSSProperties}
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
