"use client";

import { useState, type CSSProperties } from "react";
import type { CategoryId, Family } from "@/lib/universe";
import styles from "./Collections.module.css";

export interface CardData {
  id: string;
  title: string;
  tagline: string;
  accent: string;
  families: readonly Family[];
  category: CategoryId;
  /** Covers are GIFs: show them whole, not fanned. */
  animated?: boolean;
  status: "live" | "soon";
  count?: number;
  arrives?: string;
  covers: readonly string[];
  href?: string;
}

interface CollectionsGridProps {
  cards: readonly CardData[];
  filters: readonly { id: CategoryId | "all"; name: string; count: number }[];
}

function Fan({ covers }: { covers: readonly string[] }) {
  return (
    <span className={styles.fan} data-count={covers.length} aria-hidden="true">
      {covers.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element -- static SVG stickers
        <img key={src} src={src} alt="" width={256} height={256} loading="lazy" decoding="async" className={styles.fanItem} style={{ "--k": index } as CSSProperties} />
      ))}
    </span>
  );
}

/** Collection cards with family filters. Adding a collection adds a card. */
export function CollectionsGrid({ cards, filters }: CollectionsGridProps) {
  const [family, setFamily] = useState<CategoryId | "all">("all");
  const visible = cards.filter((card) => family === "all" || card.category === family);

  return (
    <>
      {filters.length > 2 ? (
        <div className={styles.filters} role="group" aria-label="Filter collections">
          {filters.map((filter) => (
            <button key={filter.id} type="button" className={styles.filter} aria-pressed={family === filter.id} onClick={() => setFamily(filter.id)}>
              {filter.name}
              <span>{filter.count}</span>
            </button>
          ))}
        </div>
      ) : null}
      <ul role="list" className={styles.grid} key={family}>
        {visible.map((card, index) => {
          const style = { "--accent": card.accent, "--i": index } as CSSProperties;
          const body = (
            <>
              <span className={styles.art}>
                <Fan covers={card.covers} />
                {card.status === "soon" ? <span className={styles.badge}>Arriving {card.arrives}</span> : null}
              </span>
              <span className={styles.meta}>
                <span className={styles.cardTitle}>{card.title}</span>
                <span className={styles.count}>{card.status === "live" ? `${card.count} stickers` : "Coming soon"}</span>
                <span className={styles.tagline}>{card.tagline}</span>
                {card.status === "live" ? (
                  <span className={styles.explore}>
                    Explore
                    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10h11M11 5l5 5-5 5" />
                    </svg>
                  </span>
                ) : null}
              </span>
            </>
          );
          return (
            <li key={card.id} className={styles.cell} style={style} data-status={card.status}>
              {card.href ? (
                <a href={card.href} data-library="" className={styles.card} aria-label={`${card.title}: ${card.count} stickers. ${card.tagline}`}>
                  {body}
                </a>
              ) : (
                <div className={styles.card}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
