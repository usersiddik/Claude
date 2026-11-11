import type { CSSProperties } from "react";
import { SITE } from "@/lib/site";
import { defaultValues, findItem, GENERATED, renderItem, stickerTitle, type ColorProperty } from "@/lib/universe";
import { libraryHref, stickerPath, svgDataUri } from "@/lib/universe/paths";
import { HeroSearch } from "./HeroSearch";
import { HeroSheet, type SheetSticker, type SheetVariant } from "./HeroSheet";
import styles from "./Hero.module.css";

const LINES = [["Stickers"], ["for", "every"], ["feeling."]] as const;

/** The sticker that shows off recolouring, and the property it changes. */
const FEATURED = { collection: "cats", item: "hi", property: "fur", colours: 6 } as const;

/** The smaller stickers on the sheet: [collection, sticker, tilt]. */
const SHEET = [
  ["love", "glossy-heart", 8],
  ["diwali", "diya-girl", -5],
  ["frogs", "yay", 6],
  ["everyday", "lol", -7],
  ["ghosts", "boo", 5],
] as const;

interface HeroProps {
  total: number;
  live: number;
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

/** Everything the sheet shows is drawn from the real collections. */
function sheetData() {
  const find = (id: string) => GENERATED.find((collection) => collection.id === id)!;
  const collection = find(FEATURED.collection);
  const item = findItem(collection, FEATURED.item);
  const property = collection.properties.find((candidate): candidate is ColorProperty => candidate.id === FEATURED.property && candidate.kind === "color")!;
  const defaults = defaultValues(collection);
  const variants: SheetVariant[] = property.swatches
    .filter((swatch): swatch is typeof swatch & { hex: string } => typeof swatch.hex === "string")
    .slice(0, FEATURED.colours)
    .map((swatch) => ({ name: swatch.name, hex: swatch.hex, src: svgDataUri(renderItem(collection, item, { ...defaults, [property.id]: swatch.hex }, true)) }));
  const stickers: SheetSticker[] = SHEET.map(([collectionId, itemId, rotate]) => {
    const owner = find(collectionId);
    return { href: libraryHref(collectionId, itemId), src: stickerPath(collectionId, itemId), name: stickerTitle(owner, findItem(owner, itemId)), rotate };
  });
  return { featured: { name: stickerTitle(collection, item), href: libraryHref(collection.id, item.id), label: property.label }, variants, stickers };
}

export function Hero({ total, live }: HeroProps) {
  const sheet = sheetData();
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
            {total} original stickers across {live} collections. Find one you love, make it yours, use it anywhere.
          </p>
          <HeroSearch />
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
