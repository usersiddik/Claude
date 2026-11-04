import Link from "next/link";
import type { CSSProperties } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import type { Asset } from "@/lib/assets/types";
import { SITE } from "@/lib/site";
import styles from "./Hero.module.css";

const SHOWCASE = ["mochi", "gold-star", "wisp", "brave-mug", "sprout", "nimbus"];

export function Hero({ assets }: { assets: readonly Asset[] }) {
  const showcase = SHOWCASE.flatMap((slug) => assets.filter((asset) => asset.slug === slug));

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <h1 id="hero-title" className={styles.title}>
          Tiny charms.
          <br />
          Serious code.
        </h1>
        <p className={styles.lede}>
          {SITE.supportingLine} Choose a color, pick SVG, React, or Flutter, and copy.
        </p>
        <div className={styles.ctas}>
          <Link href="#library" className={styles.primary}>
            Browse the library
          </Link>
          <Link href="#how" className={styles.secondary}>
            How it works
          </Link>
        </div>

        <ul role="list" className={styles.showcase} aria-label="A few charms from the library">
          {showcase.map((asset, index) => (
            <li key={asset.id} className={styles.item} style={{ "--i": index } as CSSProperties}>
              <AssetArt asset={asset} label={asset.title} className={styles.art} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
