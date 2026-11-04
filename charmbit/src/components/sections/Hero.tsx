import Link from "next/link";
import type { Asset, ExportFormat } from "@/lib/assets/types";
import { buildExport, FORMATS } from "@/lib/exports";
import { SITE } from "@/lib/site";
import { HeroDock, type DockItem } from "./HeroDock";
import styles from "./Hero.module.css";

const SHOWCASE = ["mochi", "gold-star", "wisp", "brave-mug", "sprout", "nimbus"];

export function Hero({ assets }: { assets: readonly Asset[] }) {
  // Code is generated at build time so the hero ships no export logic of its own.
  const items: DockItem[] = SHOWCASE.flatMap((slug) => assets.filter((asset) => asset.slug === slug)).map((asset) => ({
    id: asset.id,
    title: asset.title,
    svg: asset.sourceSvg,
    files: Object.fromEntries(
      FORMATS.map((format) => [
        format.id,
        { name: format.fileName(asset), language: format.language, code: buildExport(asset, format.id) },
      ]),
    ) as DockItem["files"],
    formats: FORMATS.map((format) => ({ id: format.id as ExportFormat, label: format.label })),
  }));

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <p className={styles.eyebrow}>SVG · React · Flutter</p>
        <h1 id="hero-title" className={styles.title}>
          Tiny charms.
          <br />
          Serious code.
        </h1>
        <p className={styles.lede}>{SITE.supportingLine}</p>
        <div className={styles.ctas}>
          <Link href="#library" className={styles.primary}>
            Browse the library
          </Link>
          <Link href="#features" className={styles.secondary}>
            How it works <span aria-hidden="true">›</span>
          </Link>
        </div>
        <HeroDock items={items} />
      </div>
    </section>
  );
}
