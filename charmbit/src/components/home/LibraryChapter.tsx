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
            <span>The studio</span>
            <span>{total} stickers</span>
          </p>
          <div className={styles.head}>
            <h2 id="library-title" className={`display ${styles.title}`}>
              Make it yours.
            </h2>
            <p className={styles.lede}>Tap any sticker. Change its colours, add your words, then copy it into a chat.</p>
          </div>
          <LibraryBlock icons={icons} packs={packs} />
        </div>
      </div>
    </section>
  );
}
