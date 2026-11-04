"use client";

import type { CSSProperties } from "react";
import { normalizeHex } from "@/lib/art/color";
import { STROKES, type StrokeId } from "@/lib/sticker";
import type { ColorProperty, Swatch, ToggleProperty } from "@/lib/universe";
import styles from "./Library.module.css";

const NULL_LOOK: Record<string, string> = {
  original: "conic-gradient(#f6d673 0 25%, #f4a28c 0 50%, #bdb0e3 0 75%, #bfe6d2 0)",
  auto: "linear-gradient(135deg, #1d1d1f 0 50%, #f5f5f7 50% 100%)",
};

const paint = (swatch: Swatch) => swatch.hex ?? NULL_LOOK[swatch.id] ?? NULL_LOOK.original!;

interface ColorFieldProps {
  name: string;
  property: ColorProperty;
  value: string | null;
  onChange: (value: string | null) => void;
}

/** Swatches as a radio group (arrow keys move), plus an optional any-colour well. */
export function ColorField({ name, property, value, onChange }: ColorFieldProps) {
  const current = property.swatches.find((swatch) => (swatch.hex ?? null) === value || (swatch.hex && value && swatch.hex.toUpperCase() === value.toUpperCase()));
  const custom = !current && typeof value === "string";
  return (
    <fieldset className={styles.field}>
      <legend className={styles.fieldLabel}>
        {property.label}
        <span>{current ? current.name : (value ?? "").toUpperCase()}</span>
      </legend>
      <div className={styles.swatches}>
        {property.swatches.map((swatch) => (
          <label key={swatch.id} className={styles.swatch} style={{ "--swatch": paint(swatch) } as CSSProperties} title={swatch.name}>
            <input type="radio" name={name} checked={!custom && current?.id === swatch.id} onChange={() => onChange(swatch.hex)} className={styles.radio} />
            <span className="sr-only">{swatch.name}</span>
          </label>
        ))}
        {property.custom ? (
          <label className={`${styles.swatch} ${styles.customSwatch}`} data-active={custom ? "" : undefined} style={{ "--swatch": value ?? "#ffffff" } as CSSProperties} title="Any colour">
            <input
              type="color"
              value={(value ?? "#ffffff").toLowerCase()}
              onChange={(event) => {
                const hex = normalizeHex(event.target.value);
                if (hex) onChange(hex);
              }}
              className={styles.radio}
              aria-label={`Custom ${property.label.toLowerCase()} colour`}
            />
          </label>
        ) : null}
      </div>
    </fieldset>
  );
}

export function ToggleField({ property, value, onChange }: { property: ToggleProperty; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" className={styles.toggle} aria-pressed={value} onClick={() => onChange(!value)}>
      <span className={styles.switch} aria-hidden="true" />
      {property.label}
    </button>
  );
}

/** Outline width presets as a segmented radio group. Each option previews its own thickness. */
export function StrokeField({ name, value, onChange }: { name: string; value: StrokeId; onChange: (value: StrokeId) => void }) {
  const current = STROKES.find((stroke) => stroke.id === value) ?? STROKES[0];
  return (
    <fieldset className={styles.field}>
      <legend className={styles.fieldLabel}>
        Outline
        <span>{current.id === "none" ? "None" : `${current.name} white edge`}</span>
      </legend>
      <div className={styles.strokes}>
        {STROKES.map((stroke) => (
          <label key={stroke.id} className={styles.stroke} style={{ "--edge": `${Math.round(stroke.width * 100)}px` } as CSSProperties}>
            <input type="radio" name={name} checked={value === stroke.id} onChange={() => onChange(stroke.id)} className={styles.radio} />
            <span className={styles.strokeDot} aria-hidden="true" data-none={stroke.id === "none" ? "" : undefined} />
            {stroke.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
