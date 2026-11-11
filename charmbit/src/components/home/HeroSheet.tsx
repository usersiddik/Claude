"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./Hero.module.css";

export interface SheetVariant {
  name: string;
  hex: string;
  /** The featured sticker drawn in this colour, as an image URL. */
  src: string;
}

export interface SheetSticker {
  href: string;
  src: string;
  name: string;
  rotate: number;
}

interface HeroSheetProps {
  featured: { name: string; href: string; label: string };
  variants: readonly SheetVariant[];
  stickers: readonly SheetSticker[];
  total: number;
}

/**
 * A sticker sheet you can play with: the big sticker changes colour (on its
 * own until you choose one), and the others peel up and open in the library.
 */
export function HeroSheet({ featured, variants, stickers, total }: HeroSheetProps) {
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched || variants.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % variants.length), 2400);
    return () => window.clearInterval(timer);
  }, [touched, variants.length]);

  const current = variants[index] ?? variants[0]!;

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheet}>
        <p className={styles.sheetHead} aria-hidden="true">
          <span>Sheet No. 01</span>
          <span>{total} to peel</span>
        </p>

        <div className={styles.sheetGrid}>
          <a href={featured.href} data-library="" className={`${styles.peel} ${styles.featured}`} aria-label={`${featured.name}: open in the studio`}>
            {variants.map((variant, order) => (
              // eslint-disable-next-line @next/next/no-img-element -- generated SVG
              <img key={variant.hex} src={variant.src} alt="" width={320} height={320} data-on={order === index ? "" : undefined} loading={order === 0 ? "eager" : "lazy"} decoding="async" draggable={false} />
            ))}
          </a>
          {stickers.map((sticker, order) => (
            <a key={sticker.href} href={sticker.href} data-library="" className={styles.peel} style={{ "--r": `${sticker.rotate}deg`, "--i": order } as CSSProperties} aria-label={`${sticker.name}: open in the library`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sticker */}
              <img src={sticker.src} alt="" width={160} height={160} loading="lazy" decoding="async" draggable={false} />
              <span className={styles.peelName} aria-hidden="true">
                {sticker.name}
              </span>
            </a>
          ))}
        </div>

        <div className={styles.sheetFoot} hidden={variants.length < 2}>
          <div className={styles.dots} role="radiogroup" aria-label={`${featured.label} colour`}>
            {variants.map((variant, order) => (
              <button
                key={variant.hex}
                type="button"
                role="radio"
                aria-checked={order === index}
                aria-label={variant.name}
                className={styles.dot}
                style={{ "--swatch": variant.hex } as CSSProperties}
                onClick={() => {
                  setTouched(true);
                  setIndex(order);
                }}
              />
            ))}
          </div>
          <p className={styles.sheetNote}>
            {featured.label}: <strong>{current.name}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
