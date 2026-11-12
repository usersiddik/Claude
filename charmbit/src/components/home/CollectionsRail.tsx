"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { CategoryId } from "@/lib/universe";
import styles from "./Collections.module.css";

export interface CastCard {
  id: string;
  title: string;
  tagline: string;
  tint: string;
  category: CategoryId;
  categoryName: string;
  count: number;
  src: string;
  href: string;
}

interface RailProps {
  cards: readonly CastCard[];
  filters: readonly { id: CategoryId; name: string; count: number }[];
}

/** A sideways rail of trading cards, with a category filter and arrow buttons. */
export function CollectionsRail({ cards, filters }: RailProps) {
  const [filter, setFilter] = useState<CategoryId | "all">("all");
  const rail = useRef<HTMLUListElement>(null);
  const visible = cards.filter((card) => filter === "all" || card.category === filter);

  const step = (direction: 1 | -1) => {
    const node = rail.current;
    if (!node) return;
    const card = node.querySelector("li");
    const distance = card ? card.getBoundingClientRect().width * 2 : node.clientWidth * 0.8;
    node.scrollBy({ left: direction * distance, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <div className={styles.railWrap}>
      <div className={`container ${styles.controls}`}>
        <div className={styles.filters} role="group" aria-label="Filter collections">
          <button type="button" className={`mono ${styles.filter}`} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            All <span>{cards.length}</span>
          </button>
          {filters.map((entry) => (
            <button key={entry.id} type="button" className={`mono ${styles.filter}`} aria-pressed={filter === entry.id} onClick={() => setFilter(entry.id)}>
              {entry.name} <span>{entry.count}</span>
            </button>
          ))}
        </div>
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} aria-label="Previous collections" onClick={() => step(-1)}>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 10H5M9 5l-5 5 5 5" />
            </svg>
          </button>
          <button type="button" className={styles.arrow} aria-label="Next collections" onClick={() => step(1)}>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h11M11 5l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>

      <ul ref={rail} role="list" className={styles.rail} key={filter} aria-label="Collections">
        {visible.map((card, index) => (
          <li key={card.id} className={styles.slot} style={{ "--i": index } as CSSProperties}>
            <a href={card.href} data-library="" data-tilt="" className={styles.card} style={{ "--tint": card.tint } as CSSProperties} aria-label={`${card.title}: ${card.count} stickers. ${card.tagline}`}>
              <span className={styles.cardFace}>
                {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
                <img src={card.src} alt="" width={320} height={320} loading="lazy" decoding="async" draggable={false} />
                <span className={`mono ${styles.badge}`}>{card.categoryName}</span>
              </span>
            </a>
            <p className={`mono ${styles.cardTitle}`}>{card.title}</p>
            <p className={`mono ${styles.cardMeta}`}>
              {card.count} stickers · {card.tagline.replace(/\.$/, "")}
            </p>
          </li>
        ))}
      </ul>
      <div className={styles.yard} aria-hidden="true" />
    </div>
  );
}
