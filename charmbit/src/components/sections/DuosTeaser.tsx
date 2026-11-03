import { AssetArt } from "@/components/ui/AssetArt";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Asset } from "@/lib/assets/types";
import styles from "./Sections.module.css";

const SETS = [
  { name: "Friends", note: "Matching reactions for group chats and shared spaces." },
  { name: "Couples", note: "Sweet, all-ages pairs for two-person moments." },
  { name: "Celebrations", note: "High fives, toasts, and finish-line moments." },
  { name: "Inside jokes", note: "Characters that only make full sense side by side." },
];

export function DuosTeaser({ assets }: { assets: readonly Asset[] }) {
  const previews = assets.filter((asset) => asset.family === "duo");

  return (
    <section id="duos" className={`${styles.section} ${styles.duos}`} aria-labelledby="duos-title">
      <div className={`container ${styles.duosGrid}`}>
        <div className={styles.duosText}>
          <SectionHeading
            id="duos-title"
            eyebrow="Duos"
            badge="Coming next"
            title="Better together, soon."
            lede="Duos will be coordinated sticker sets for two: paired reactions and shared-moment characters designed to sit side by side."
          />
          <ul role="list" className={styles.sets}>
            {SETS.map((set) => (
              <li key={set.name}>
                <strong>{set.name}</strong>
                <span>{set.note}</span>
              </li>
            ))}
          </ul>
          <p className={styles.fine}>
            Duos aren’t available to copy yet. Every set will stay tasteful and all-ages. The previews here show the
            direction, not a finished release.
          </p>
        </div>
        {previews.length > 0 ? (
          <div className={styles.ticket}>
            <p className={styles.ticketStamp}>Preview</p>
            <ul role="list" className={styles.ticketItems}>
              {previews.map((asset) => (
                <li key={asset.id}>
                  <AssetArt asset={asset} label={`${asset.title} Duo preview`} className={styles.ticketArt} />
                  <span>{asset.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
