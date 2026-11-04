"use client";

import type { CSSProperties } from "react";
import { normalizeHex } from "@/lib/characters/color";
import type { Swatch } from "@/lib/characters/options";
import styles from "./Studio.module.css";

interface ColorPickerProps {
  name: string;
  label: string;
  swatches: readonly Swatch[];
  value: string;
  onChange: (hex: string) => void;
  /** Show a custom colour well after the presets. */
  custom?: boolean;
}

/** Preset swatches as a radio group, plus an optional any-colour picker. */
export function ColorPicker({ name, label, swatches, value, onChange, custom = true }: ColorPickerProps) {
  const current = swatches.find((swatch) => swatch.hex.toUpperCase() === value.toUpperCase());
  const isCustom = !current;

  return (
    <fieldset className={styles.colorGroup}>
      <legend className={styles.rowLabel}>
        {label}
        <span>{current ? current.name : value.toUpperCase()}</span>
      </legend>
      <div className={styles.swatches}>
        {swatches.map((swatch) => (
          <label key={swatch.id} className={styles.swatch} style={{ "--swatch": swatch.hex } as CSSProperties} title={swatch.name}>
            <input
              type="radio"
              name={name}
              checked={!isCustom && current?.id === swatch.id}
              onChange={() => onChange(swatch.hex)}
              className={styles.hiddenInput}
            />
            <span className="sr-only">{swatch.name}</span>
          </label>
        ))}
        {custom ? (
          <label
            className={`${styles.swatch} ${styles.customSwatch}`}
            data-active={isCustom ? "" : undefined}
            style={{ "--swatch": value } as CSSProperties}
            title="Any colour"
          >
            <input
              type="color"
              value={value.toLowerCase()}
              onChange={(event) => {
                const hex = normalizeHex(event.target.value);
                if (hex) onChange(hex);
              }}
              className={styles.hiddenInput}
              aria-label={`Custom ${label.toLowerCase()} colour`}
            />
          </label>
        ) : null}
      </div>
    </fieldset>
  );
}
