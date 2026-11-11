import type { CSSProperties } from "react";
import { SITE } from "@/lib/site";
import { defaultValues, findItem, renderItem, stickerSrc, stickerTitle, type ColorProperty, type LiveCollection } from "@/lib/universe";
import { libraryHref, svgDataUri } from "@/lib/universe/paths";
import { buildSearchIndex, popularSearches } from "@/lib/universe/search";
import { HeroSearch } from "./HeroSearch";
import { HeroSheet, type SheetSticker, type SheetVariant } from "./HeroSheet";
import styles from "./Hero.module.css";

const LINES = [["Stickers"], ["for", "every"], ["feeling."]] as const;

/** Drawn collections: the sticker that shows off recolouring, and the others on the sheet. */
const FEATURED = { collection: "cats", item: "hi", property: "fur", colours: 6 } as const;
const SHEET = [
  ["love", "glossy-heart"],
  ["diwali", "diya-girl"],
  ["frogs", "yay"],
  ["everyday", "lol"],
  ["ghosts", "boo"],
] as const;
const TILTS = [8, -5, 6, -7, 5] as const;

interface HeroProps {
  total: number;
  /** The collections visitors can see, in display order. */
  collections: readonly LiveCollection[];
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

/** Everything the sheet shows comes from the collections visitors can see. */
function sheetData(collections: readonly LiveCollection[]) {
  // A pack leads the sheet once it has enough stickers to fill it.
  const pack = collections.find((collection) => collection.media === "image" && collection.items.length >= 6);
  if (pack) {
    // An image pack leads: its first sticker is featured, with its outfits as the colour dots.
    const [first, ...rest] = pack.items;
    const variants: SheetVariant[] = (first!.image?.variants.length ? first!.image.variants : [{ name: pack.title, swatch: pack.accent, src: first!.image!.src }]).map((variant) => ({ name: variant.name, hex: variant.swatch, src: variant.src }));
    const stickers: SheetSticker[] = rest.slice(0, 5).map((item, index) => ({ href: libraryHref(pack.id, item.id), src: stickerSrc(pack, item), name: stickerTitle(pack, item), rotate: TILTS[index] ?? 0 }));
    return { featured: { name: stickerTitle(pack, first!), href: libraryHref(pack.id, first!.id), label: "Outfit" }, variants, stickers };
  }
  const find = (id: string) => collections.find((collection) => collection.id === id);
  const collection = find(FEATURED.collection) ?? collections[0]!;
  const item = findItem(collection, FEATURED.item);
  const property = collection.properties.find((candidate): candidate is ColorProperty => candidate.id === FEATURED.property && candidate.kind === "color");
  const defaults = defaultValues(collection);
  const variants: SheetVariant[] = property
    ? property.swatches
        .filter((swatch): swatch is typeof swatch & { hex: string } => typeof swatch.hex === "string")
        .slice(0, FEATURED.colours)
        .map((swatch) => ({ name: swatch.name, hex: swatch.hex, src: svgDataUri(renderItem(collection, item, { ...defaults, [property.id]: swatch.hex }, true)) }))
    : [{ name: collection.title, hex: collection.accent, src: stickerSrc(collection, item) }];
  const stickers: SheetSticker[] = SHEET.flatMap(([collectionId, itemId], index) => {
    const owner = find(collectionId);
    return owner ? [{ href: libraryHref(collectionId, itemId), src: stickerSrc(owner, findItem(owner, itemId)), name: stickerTitle(owner, findItem(owner, itemId)), rotate: TILTS[index] ?? 0 }] : [];
  });
  return { featured: { name: stickerTitle(collection, item), href: libraryHref(collection.id, item.id), label: property?.label ?? "Colour" }, variants, stickers };
}

export function Hero({ total, collections }: HeroProps) {
  const sheet = sheetData(collections);
  const live = collections.length;
  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <span className={styles.kickerMark} aria-hidden="true" />
            {SITE.tagline}
          </p>
          <Headline />
          <p className={styles.lede}>
            {total} original stickers{live > 1 ? ` across ${live} collections` : ""}. Find one you love, make it yours, use it anywhere.
          </p>
          <HeroSearch suggestions={popularSearches(buildSearchIndex(collections))} />
          <div className={styles.actions}>
            <a href="#collections" className={styles.cta}>
              Explore stickers
            </a>
            <a href={sheet.featured.href} className={`${styles.cta} ${styles.ctaQuiet}`} data-library="">
              Open studio
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </a>
          </div>
        </div>

        <HeroSheet {...sheet} total={total} />
      </div>
    </section>
  );
}
