import type { CSSProperties } from "react";
import { SITE } from "@/lib/site";
import { libraryHref, stickerPath } from "@/lib/universe/paths";
import { HERO_STICKERS } from "./hero-stickers";
import { HeroPrompt } from "./HeroPrompt";
import { HeroStage } from "./HeroStage";
import styles from "./Hero.module.css";

const LINES = [["Stickers"], ["for", "every"], ["feeling."]] as const;

interface HeroProps {
  total: number;
  live: number;
  /** Sticker names for hover labels, keyed by `collection/item`. */
  names: Record<string, string>;
}

/** Letters rise one by one, like type being set. */
function Headline() {
  let index = 0;
  return (
    <h1 id="hero-title" className={`display ${styles.title}`}>
      <span className="sr-only">Stickers for every feeling.</span>
      {LINES.map((words, line) => (
        <span key={line} className={styles.line} aria-hidden="true">
          {words.map((word, w) => (
            <span key={w} className={styles.word}>
              {[...word].map((char, c) => (
                <span key={c} className={styles.char} style={{ "--i": index++ } as CSSProperties}>
                  {char}
                </span>
              ))}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

export function Hero({ total, live, names }: HeroProps) {
  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <HeroStage className={styles.stage}>
        {HERO_STICKERS.map((sticker, index) => {
          const key = `${sticker.collection}/${sticker.item}`;
          const style = {
            "--x": `${sticker.x}%`,
            "--y": `${sticker.y}%`,
            "--size": sticker.size,
            "--r": `${sticker.rotate}deg`,
            "--depth": sticker.depth,
            "--i": index,
            "--mx": `${sticker.mx ?? sticker.x}%`,
            "--my": `${sticker.my ?? sticker.y}%`,
            "--msize": sticker.msize ?? sticker.size * 2.4,
            "--dur": `${5.2 + (index % 4) * 0.9}s`,
          } as CSSProperties;
          return (
            <a
              key={key}
              href={libraryHref(sticker.collection, sticker.item)}
              className={styles.sticker}
              data-library=""
              style={style}
              data-phone={sticker.phone === false ? "hide" : undefined}
              tabIndex={-1}
              aria-hidden="true"
              draggable={false}
            >
              <span className={styles.drift}>
                <span className={styles.float}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static SVGs; next/image adds nothing here */}
                  <img src={stickerPath(sticker.collection, sticker.item)} alt="" width={256} height={256} loading={index < 6 ? "eager" : "lazy"} decoding="async" draggable={false} />
                </span>
              </span>
              <span className={styles.label}>{names[key]}</span>
            </a>
          );
        })}
      </HeroStage>

      <div className={styles.copy}>
        <p className={styles.kicker}>{SITE.tagline}</p>
        <Headline />
        <p className={styles.lede}>
          Describe any sticker and AI draws it from our cast, with your words lettered in. Or pick from {total} originals across {live} collections.
        </p>
        <HeroPrompt />
        <div className={styles.actions}>
          <a href="#library" className={styles.textLink}>
            Or browse the library
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h11M11 5l5 5-5 5" />
            </svg>
          </a>
        </div>
      </div>

      <div className={`eyebrow ${styles.meta}`} aria-hidden="true">
        <span>Chapter 01 — The universe</span>
        <span>
          {total} stickers · {live} collections
        </span>
      </div>
    </section>
  );
}
