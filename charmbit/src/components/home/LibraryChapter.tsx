import { LibraryBlock } from "@/components/library/LibrarySection";
import type { IconAsset } from "@/lib/universe";
import type { PackFiles } from "@/lib/universe/packs";
import styles from "./LibraryChapter.module.css";

/** Chapter 03: the library sheet slides up over the collections. */
export function LibraryChapter({ icons, packs, total }: { icons: readonly IconAsset[]; packs: PackFiles; total: number }) {
  return (
    <section id="library" className={styles.chapter} aria-labelledby="library-title">
      <div className={styles.sheet}>
        <div className="container">
          <p className="eyebrow">
            <span>Chapter 03 — Library</span>
            <span>{total} stickers</span>
          </p>
          <div className={styles.head}>
            <h2 id="library-title" className={`display ${styles.title}`}>
              Make it
              <br />
              yours.
            </h2>
            <ol className={styles.steps}>
              <li>
                <span>01</span>Search, or pick a collection
              </li>
              <li>
                <span>02</span>Tap a sticker, change its colours
              </li>
              <li>
                <span>03</span>Copy, then paste into any chat
              </li>
            </ol>
          </div>
          <LibraryBlock icons={icons} packs={packs} />
        </div>
      </div>
    </section>
  );
}
