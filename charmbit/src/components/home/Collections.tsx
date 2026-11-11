import { FAMILIES, findItem, isLive, stickerSrc, type Collection } from "@/lib/universe";
import { coverPath, libraryHref } from "@/lib/universe/paths";
import { CollectionsGrid, type CardData } from "./CollectionsGrid";
import styles from "./Collections.module.css";

export function Collections({ universe }: { universe: readonly Collection[] }) {
  const cards: CardData[] = universe.map((collection) =>
    isLive(collection)
      ? {
          id: collection.id,
          title: collection.title,
          tagline: collection.tagline,
          accent: collection.accent,
          families: collection.families,
          status: "live",
          count: collection.items.length,
          covers: collection.cover.map((id) => stickerSrc(collection, findItem(collection, id))),
          href: libraryHref(collection.id),
        }
      : {
          id: collection.id,
          title: collection.title,
          tagline: collection.tagline,
          accent: collection.accent,
          families: collection.families,
          status: "soon",
          arrives: collection.arrives,
          covers: [coverPath(collection.id)],
        },
  );
  const live = cards.filter((card) => card.status === "live").length;
  // Only filters that have something in them; none at all when there is a single choice.
  const filters = FAMILIES.map((family) => ({
    ...family,
    count: family.id === "all" ? cards.length : cards.filter((card) => card.families.includes(family.id as never)).length,
  })).filter((family) => family.count > 0);

  return (
    <section id="collections" className={styles.section} aria-labelledby="collections-title">
      <div className="container">
        <p className="eyebrow">
          <span>Chapter 02 — Collections</span>
          <span>
            {live} live{cards.length > live ? ` · ${cards.length - live} on the way` : ""}
          </span>
        </p>
        <div className={styles.head}>
          <h2 id="collections-title" className={`display ${styles.title}`} data-reveal="">
            Pick your
            <br />
            collection.
          </h2>
          <p className={styles.lede} data-reveal="" style={{ "--i": 2 } as React.CSSProperties}>
            Every collection is a cast with its own moods and colours. New ones land every season; the library grows, nothing gets replaced.
          </p>
        </div>
        <CollectionsGrid cards={cards} filters={filters} />
        <div className={styles.more} data-reveal="">
          <a href="#library" className={styles.moreLink}>
            Open the full library
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h11M11 5l5 5-5 5" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
