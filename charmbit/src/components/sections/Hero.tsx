import Link from "next/link";
import { findPack } from "@/lib/assets/packs";
import type { Asset } from "@/lib/assets/types";
import { HeroStage, type StageSticker } from "./HeroStage";
import styles from "./Hero.module.css";

const FLOATERS = ["boo-cloud-happy", "boo-moon-love", "gold-star", "mochi", "soft-like"];

export function Hero({ assets }: { assets: readonly Asset[] }) {
  const pack = findPack("miso");
  const stickers: StageSticker[] = assets
    .filter((asset) => asset.pack?.id === "miso")
    .map((asset) => ({
      slug: asset.slug,
      title: asset.title,
      svg: asset.sourceSvg,
      colorway: asset.pack!.colorway,
      reaction: asset.pack!.reaction,
    }));
  const floaters = FLOATERS.flatMap((slug) => assets.filter((asset) => asset.slug === slug)).map((asset) => ({
    slug: asset.slug,
    title: asset.title,
    svg: asset.sourceSvg,
  }));

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>
          <span className={styles.new}>New</span> Miso &amp; Boo sticker packs
        </p>
        <h1 id="hero-title" className={styles.title}>
          Tiny charms.
          <br />
          Serious code.
        </h1>
        <p className={styles.lede}>
          Original stickers and SVG characters. Send them to the people you love, or ship them in your app.
        </p>
        <div className={styles.ctas}>
          <Link href="/?filter=stickers#library" className={styles.primary}>
            Browse stickers
          </Link>
          <Link href="#features" className={styles.secondary}>
            For developers <span aria-hidden="true">›</span>
          </Link>
        </div>
        {pack ? <HeroStage pack={{ colorways: pack.colorways, reactions: pack.reactions }} stickers={stickers} floaters={floaters} /> : null}
      </div>
    </section>
  );
}
