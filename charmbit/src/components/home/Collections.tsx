import { CATEGORIES, categoryOf, findItem, isLive, stickerSrc, type Collection, type LiveCollection } from "@/lib/universe";
import { libraryHref } from "@/lib/universe/paths";
import { CollectionsRail, type CastCard } from "./CollectionsRail";
import styles from "./Collections.module.css";

const ready = (collection: LiveCollection) => collection.items.filter((item) => !item.image?.pending).length;

/** The cast: every collection as a trading card, on the dark field. */
export function Collections({ universe }: { universe: readonly Collection[] }) {
  const live = universe.filter(isLive).filter((collection) => ready(collection) > 0);
  const cards: CastCard[] = live.map((collection) => {
    const cover = findItem(collection, collection.cover.find((id) => collection.items.some((item) => item.id === id && !item.image?.pending)) ?? collection.items.find((item) => !item.image?.pending)?.id);
    const category = CATEGORIES.find((entry) => entry.id === categoryOf(collection))!;
    return {
      id: collection.id,
      title: collection.title,
      tagline: collection.tagline,
      tint: collection.accent,
      category: category.id,
      categoryName: category.short,
      count: ready(collection),
      src: stickerSrc(collection, cover),
      href: libraryHref(collection.id),
    };
  });
  const filters = CATEGORIES.map((entry) => ({ id: entry.id, name: entry.name, count: cards.filter((card) => card.category === entry.id).length })).filter((filter) => filter.count > 0);

  return (
    <section id="collections" className={`grain grainNight ${styles.section}`} aria-labelledby="collections-title">
      <div className={styles.word} aria-hidden="true">
        Collections
      </div>
      <div className={`container ${styles.head}`}>
        <p className="eyebrow">
          <span>The cast</span>
          <span>
            {cards.length} collections · {cards.reduce((total, card) => total + card.count, 0)} stickers
          </span>
        </p>
        <h2 id="collections-title" className={`display ${styles.title}`} data-reveal="">
          Pick a character.
        </h2>
        <p className={styles.lede} data-reveal="" style={{ "--i": 1 } as React.CSSProperties}>
          WhatsApp stickers are ready to send. Colour stickers change to any colour you like. Every one takes your own words.
        </p>
      </div>
      <CollectionsRail cards={cards} filters={filters} />
    </section>
  );
}
