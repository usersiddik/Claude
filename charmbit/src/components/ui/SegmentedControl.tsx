"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "./SegmentedControl.module.css";

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  name: string;
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Show icons only; labels become tooltips and accessible names. */
  iconOnly?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * iOS-style segmented control. Equal-width segments let the selection pill
 * slide with a single transform. Native radios provide keyboard support.
 */
export function SegmentedControl<T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  iconOnly = false,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );
  const style = { "--count": options.length, "--index": index } as CSSProperties;

  return (
    <fieldset className={[styles.control, styles[size], className].filter(Boolean).join(" ")} style={style}>
      <legend className="sr-only">{label}</legend>
      <span className={styles.pill} aria-hidden="true" />
      {options.map((option) => (
        <label key={option.id} className={styles.segment} title={iconOnly ? option.label : undefined}>
          <input
            type="radio"
            name={name}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
            className={styles.input}
          />
          {option.icon}
          <span className={iconOnly ? "sr-only" : styles.text}>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
