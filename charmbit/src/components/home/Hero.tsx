import type { CSSProperties } from "react";
import { SITE } from "@/lib/site";
import { findItem, stickerSrc, stickerTitle, type LiveCollection, type StickerItem } from "@/lib/universe";
import { libraryHref } from "@/lib/universe/paths";
import { buildSearchIndex, popularSearches } from "@/lib/universe/search";
import { HeroSearch } from "./HeroSearch";
import { HeroStage } from "./HeroStage";
import styles from "./Hero.module.css";

const LINES = ["Stickers", "for every", "feeling."] as const;

/** The sticker that stands through the headline, if its pack has it. */
const FIGURE = { collection: "sheru", item: "boss-point" } as const;

/** Small stickers drifting around the headline: [x%, y%, size vw, tilt, depth]. */
const ORBITS = [
  [85, 9, 10, 9, 0.6],
  [91, 38, 8, -7, 1.1],
  [82, 68, 8.5, 6, 0.85],
] as const;

interface HeroProps {
  total: number;
  /** The collections visitors can see, in display order. */
  collections: readonly LiveCollection[];
}

interface Pick {
  collection: LiveCollection;
  item: StickerItem;
}

const ready = (item: StickerItem) => !item.image?.pending;

/** Casting: the figure, the orbiting stickers and the ticker, all from real artwork. */
function cast(collections: readonly LiveCollection[]) {
  const packs = collections.filter((collection) => collection.media === "image");
  const figurePack = packs.find((collection) => collection.id === FIGURE.collection && collection.items.some((item) => item.id === FIGURE.item && ready(item))) ?? packs.find((collection) => collection.items.some(ready));
  const figure: Pick = figurePack
    ? { collection: figurePack, item: figurePack.items.find((item) => item.id === FIGURE.item && ready(item)) ?? figurePack.items.find(ready)! }
    : { collection: collections[0]!, item: findItem(collections[0]!, "hi") };

  // Alternate characters so neither the orbit nor the ticker is a row of one face.
  const lanes: Pick[][] = [
    ...packs.map((collection) => collection.items.filter((item) => ready(item) && item.id !== figure.item.id).map((item) => ({ collection, item }))),
    collections.filter((collection) => collection.media !== "image").map((collection) => ({ collection, item: findItem(collection, collection.cover[0]) })),
  ].filter((lane) => lane.length > 0);
  const mixed: Pick[] = [];
  for (let index = 0; mixed.length < 40 && lanes.some((lane) => index < lane.length); index += 1) {
    for (const lane of lanes) if (lane[index]) mixed.push(lane[index]!);
  }
  // The orbit shows the other characters first.
  const orbit = [...mixed.filter((pick) => pick.collection.id !== figure.collection.id), ...mixed].slice(0, ORBITS.length);
  const ticker = mixed.slice(0, 28);
  return { figure, orbit, ticker };
}

export function Hero({ total, collections }: HeroProps) {
  const { figure, orbit, ticker } = cast(collections);
  const figureSrc = stickerSrc(figure.collection, figure.item);
  const figureName = stickerTitle(figure.collection, figure.item);
  // One row of chips keeps the whole hero on one screen.
  const suggestions = popularSearches(buildSearchIndex(collections), 6);

  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <HeroStage className={styles.stage}>
        <div className={`eyebrow ${styles.meta}`} aria-hidden="true">
          <span>Chapter 01 — The universe</span>
          <span>
            {total} stickers · {collections.length} collections
          </span>
        </div>

        {/* Small stickers in orbit. */}
        {orbit.map(({ collection, item }, index) => {
          const [x, y, size, tilt, depth] = ORBITS[index]!;
          return (
            <a
              key={`${collection.id}/${item.id}`}
              href={libraryHref(collection.id, item.id)}
              data-library=""
              className={styles.orbit}
              style={{ "--x": `${x}%`, "--y": `${y}%`, "--size": size, "--r": `${tilt}deg`, "--depth": depth, "--i": index } as CSSProperties}
              aria-label={`${stickerTitle(collection, item)}: open in the library`}
              draggable={false}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
              <img src={stickerSrc(collection, item)} alt="" width={160} height={160} loading="lazy" decoding="async" draggable={false} />
            </a>
          );
        })}

        {/* The figure stands behind the headline... */}
        <a href={libraryHref(figure.collection.id, figure.item.id)} data-library="" className={styles.figure} aria-label={`${figureName}: open in the studio`} draggable={false}>
          {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
          <img src={figureSrc} alt="" width={1024} height={1024} loading="eager" fetchPriority="high" decoding="async" draggable={false} />
        </a>

        <div className={`container ${styles.head}`}>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            <span className="sr-only">Stickers for every feeling.</span>
            {LINES.map((line, index) => (
              <span key={line} className={styles.line} aria-hidden="true" style={{ "--i": index } as CSSProperties}>
                <span className={styles.lineText}>{line}</span>
              </span>
            ))}
          </h1>
        </div>

        {/* ...and his head comes forward through it: the same image, clipped to the top. */}
        <span className={`${styles.figure} ${styles.figureFront}`} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
          <img src={figureSrc} alt="" width={1024} height={1024} loading="eager" decoding="async" draggable={false} />
        </span>

        <div className={`container ${styles.deck}`}>
          <p className={styles.lede}>
            {SITE.tagline} {total} original stickers. Find one you love, make it yours, use it anywhere.
          </p>
          <HeroSearch suggestions={suggestions} />
          <div className={styles.actions}>
            <a href="#collections" className={styles.cta}>
              Explore stickers
            </a>
            <a href={libraryHref(figure.collection.id, figure.item.id)} className={`${styles.cta} ${styles.ctaQuiet}`} data-library="">
              Open studio
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </a>
          </div>
        </div>
      </HeroStage>

      {/* A ticker of real stickers along the bottom edge; each one opens in the library. */}
      <div className={styles.ticker} aria-label="A few of the stickers">
        <div className={styles.tickerTrack}>
          {[0, 1].map((copy) => (
            <ul key={copy} role="list" className={styles.tickerList} aria-hidden={copy === 1 ? "true" : undefined}>
              {ticker.map(({ collection, item }) => (
                <li key={`${copy}-${collection.id}/${item.id}`}>
                  <a href={libraryHref(collection.id, item.id)} data-library="" className={styles.tickerItem} tabIndex={copy === 1 ? -1 : undefined} aria-label={copy === 0 ? stickerTitle(collection, item) : undefined}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
                    <img src={stickerSrc(collection, item)} alt="" width={96} height={96} loading="lazy" decoding="async" draggable={false} />
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
