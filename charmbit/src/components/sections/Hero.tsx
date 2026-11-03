import Link from "next/link";
import { CodeTabs } from "@/components/ui/CodeTabs";
import { ArrowIcon } from "@/components/ui/icons";
import type { Asset } from "@/lib/assets/types";
import { buildExports, FORMATS } from "@/lib/exports";
import { SITE } from "@/lib/site";
import { CharmShelf } from "./CharmShelf";
import styles from "./Hero.module.css";

export function Hero({ assets, previewSlug = "mochi" }: { assets: readonly Asset[]; previewSlug?: string }) {
  const preview = assets.find((asset) => asset.slug === previewSlug) ?? assets[0];
  const available = assets.filter((asset) => asset.status === "available").length;
  const families = new Set(assets.map((asset) => asset.family)).size;

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>
            <span className={styles.pill}>SVG · React · Flutter</span>
            Original asset library
          </p>
          <h1 id="hero-title" className={styles.title}>
            Tiny charms. <span className={styles.accent}>Serious code.</span>
          </h1>
          <p className={styles.lede}>
            {SITE.supportingLine} Copy any asset as raw SVG, a typed React component, or a Flutter widget, then ship
            it.
          </p>
          <div className={styles.ctas}>
            <Link href="#library" className={styles.primary}>
              Explore the library
              <ArrowIcon size={18} />
            </Link>
            <Link href="#formats" className={styles.secondary}>
              See code formats
            </Link>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>Ready to copy</dt>
              <dd>{available}</dd>
            </div>
            <div>
              <dt>Export formats</dt>
              <dd>{FORMATS.length}</dd>
            </div>
            <div>
              <dt>Families</dt>
              <dd>{families}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.stage}>
          <CharmShelf assets={assets} />
          {preview ? (
            <div className={styles.code}>
              <p className={styles.codeCaption}>
                <span className={styles.liveDot} aria-hidden="true" />
                Real export · {preview.title}
              </p>
              <CodeTabs
                items={buildExports(preview)}
                assetTitle={preview.title}
                compact
                label={`Code format for ${preview.title}`}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
