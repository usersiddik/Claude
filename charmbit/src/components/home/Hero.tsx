import type { CSSProperties } from "react";
import { findItem, stickerSrc, stickerThumb, stickerTitle, type LiveCollection, type StickerItem } from "@/lib/universe";
import { libraryHref } from "@/lib/universe/paths";
import { buildSearchIndex, popularSearches } from "@/lib/universe/search";
import { HeroSearch } from "./HeroSearch";
import { HeroStage } from "./HeroStage";
import styles from "./Hero.module.css";

/** The portrait at the centre of the page, if its pack has it. */
const FIGURE = { collection: "sheru", item: "crown" } as const;
/** The small trading card in the corner: a different character. */
const CARD = { collection: "lumi", item: "heart-hug" } as const;

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

/** The figure and the corner card, both from real artwork, with fallbacks if either is missing. */
function cast(collections: readonly LiveCollection[]): { figure: Pick; card: Pick | null } {
  const find = (spec: { collection: string; item: string }): Pick | null => {
    const collection = collections.find((candidate) => candidate.id === spec.collection);
    const item = collection?.items.find((candidate) => candidate.id === spec.item && ready(candidate));
    return collection && item ? { collection, item } : null;
  };
  const packs = collections.filter((collection) => collection.media === "image");
  const firstReady = (exclude?: string): Pick | null => {
    for (const collection of packs) {
      if (collection.id === exclude) continue;
      const item = collection.items.find(ready);
      if (item) return { collection, item };
    }
    return null;
  };
  const figure = find(FIGURE) ?? firstReady() ?? { collection: collections[0]!, item: findItem(collections[0]!, collections[0]!.cover[0]) };
  const card = find(CARD) ?? firstReady(figure.collection.id);
  return { figure, card };
}

export function Hero({ total, collections }: HeroProps) {
  const { figure, card } = cast(collections);
  const figureSrc = stickerSrc(figure.collection, figure.item);
  const suggestions = popularSearches(buildSearchIndex(collections), 4);

  return (
    <section className={`grain ${styles.hero}`} id="top" aria-labelledby="hero-title">
      <HeroStage className={styles.stage}>

        <a href={libraryHref(figure.collection.id, figure.item.id)} data-library="" className={styles.figure} aria-label={`${stickerTitle(figure.collection, figure.item)}: open in the studio`} draggable={false}>
          {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
          <img src={figureSrc} alt="" width={1024} height={1024} loading="eager" fetchPriority="high" decoding="async" draggable={false} />
        </a>

        <div className={styles.left}>
          {card ? (
            <a
              href={libraryHref(card.collection.id, card.item.id)}
              data-library=""
              className={styles.card}
              aria-label={`${stickerTitle(card.collection, card.item)}: open in the library`}
              style={{ "--card-tint": card.collection.accent } as CSSProperties}
              draggable={false}
            >
              <span className={styles.cardInner}>
                {/* eslint-disable-next-line @next/next/no-img-element -- sticker artwork */}
                <img src={stickerThumb(card.collection, card.item)} alt="" width={240} height={240} decoding="async" draggable={false} />
              </span>
            </a>
          ) : null}
          <h1 id="hero-title" className={`display ${styles.title}`}>
            Stickers for
            <br />
            <em>every feeling.</em>
          </h1>
          <p className={styles.lede}>
            {total} original stickers. Find one you love, add your words and colours, then paste it into any chat.
          </p>
        </div>

        <div className={styles.right}>
          <p className={`mono ${styles.meet}`}>
            {figure.collection.title} · {figure.item.name}
          </p>
          <p className={styles.caption}>{figure.collection.tagline} Forty moods, and every one takes your words.</p>
          <div className={styles.actions}>
            <a href="#collections" className={styles.cta}>
              Explore stickers
            </a>
            <a href={libraryHref(figure.collection.id, figure.item.id)} className={`${styles.cta} ${styles.ctaQuiet}`} data-library="">
              Make one
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </a>
          </div>
          <HeroSearch suggestions={suggestions} />
        </div>

      </HeroStage>
    </section>
  );
}
