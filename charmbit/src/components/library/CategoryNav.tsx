"use client";

import { CategoryIcons } from "@/components/ui/icons";
import { FILTER_GROUPS, type FilterId } from "@/lib/assets/filters";
import styles from "./CategoryNav.module.css";

interface CategoryNavProps {
  value: FilterId;
  counts: Record<FilterId, number>;
  onChange: (id: FilterId) => void;
}

/** Sidebar on desktop, scrollable pills on mobile. One radio group across both tiers. */
export function CategoryNav({ value, counts, onChange }: CategoryNavProps) {
  return (
    <nav className={styles.nav} aria-label="Categories">
      {FILTER_GROUPS.map((group) => (
        <fieldset key={group.id} className={styles.group}>
          <legend className={styles.legend}>{group.label}</legend>
          <div className={styles.items}>
            {group.filters.map((filter) => {
              const Icon = CategoryIcons[filter.icon];
              return (
                <label key={filter.id} className={styles.item}>
                  <input
                    type="radio"
                    name="category"
                    value={filter.id}
                    checked={value === filter.id}
                    onChange={() => onChange(filter.id)}
                    className={styles.input}
                  />
                  <Icon size={16} className={styles.icon} />
                  <span className={styles.long}>{filter.label}</span>
                  <span className={styles.short} aria-hidden="true">
                    {filter.short}
                  </span>
                  <span className={styles.count}>{counts[filter.id]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </nav>
  );
}
