import { AssetArt } from "@/components/ui/AssetArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Asset } from "@/lib/assets/types";
import styles from "./Sections.module.css";

const SETS = ["Friends", "Couples", "Celebrations", "Inside jokes"];

export function DuosTeaser({ assets }: { assets: readonly Asset[] }) {
  const previews = assets.filter((asset) => asset.family === "duo");

  return (
    <section id="duos" className={styles.section} aria-labelledby="duos-title">
      <div className={`container ${styles.split}`}>
        <div className={styles.splitText}>
          <SectionHeading
            id="duos-title"
            eyebrow="Duos · Coming soon"
            title="Better together."
            lede="Coordinated pairs of characters for shared moments: matching reactions, celebrations, and inside jokes. Every set is designed to be all-ages."
          />
          <ul role="list" className={styles.tags}>
            {SETS.map((set) => (
              <li key={set}>{set}</li>
            ))}
          </ul>
          <p className={styles.note}>Duos aren’t available to copy yet. The previews show where they’re headed.</p>
        </div>
        {previews.length > 0 ? (
          <ul role="list" className={styles.duoPreviews}>
            {previews.map((asset) => (
              <li key={asset.id}>
                <span className={styles.duoTile}>
                  <AssetArt asset={asset} label={`${asset.title}, Duo preview`} className={styles.duoArt} />
                </span>
                <span className={styles.duoName}>{asset.title}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
