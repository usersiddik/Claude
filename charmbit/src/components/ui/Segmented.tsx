"use client";

import styles from "./Controls.module.css";

interface SegmentedProps<T extends string> {
  name: string;
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  hideLabel?: boolean;
}

/** A compact segmented control built on native radios. */
export function Segmented<T extends string>({ name, label, options, value, onChange, hideLabel }: SegmentedProps<T>) {
  return (
    <fieldset className={styles.group}>
      <legend className={hideLabel ? "sr-only" : styles.label}>{label}</legend>
      <div className={styles.segmented}>
        {options.map((option) => (
          <label key={option.id} className={styles.segment}>
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className={styles.input}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
