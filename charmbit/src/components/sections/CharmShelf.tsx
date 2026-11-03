import type { CSSProperties } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import type { Asset } from "@/lib/assets/types";
import { catalogNumber } from "@/components/library/format";
import styles from "./CharmShelf.module.css";

interface Placement {
  slug: string;
  /** Width as a percentage of the shelf. */
  size: number;
  tilt: number;
  tag?: boolean;
}

const ROWS: readonly (readonly Placement[])[] = [
  [
    { slug: "gold-star", size: 27, tilt: -4, tag: true },
    { slug: "mochi", size: 31, tilt: 2 },
    { slug: "ping", size: 13, tilt: 6 },
  ],
  [
    { slug: "sprout", size: 23, tilt: -2 },
    { slug: "wisp", size: 25, tilt: 3, tag: true },
    { slug: "brave-mug", size: 24, tilt: -3 },
  ],
];

/** The hero composition: collectible charms floating just above two studio shelves. */
export function CharmShelf({ assets }: { assets: readonly Asset[] }) {
  const bySlug = new Map(assets.map((asset) => [asset.slug, asset]));
  const rows = ROWS.map((row) =>
    row.flatMap((placement) => {
      const asset = bySlug.get(placement.slug);
      return asset ? [{ ...placement, asset }] : [];
    }),
  );
  const names = rows.flat().map((item) => item.asset.title);
  let index = 0;

  return (
    <div className={styles.panel} role="img" aria-label={`A studio shelf holding ${names.join(", ")}.`}>
      <p className={styles.stamp} aria-hidden="true">
        <span>The Charm Shelf</span>
        <span>Set 01</span>
      </p>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          <ul role="list" className={styles.items} aria-hidden="true">
            {row.map((item) => {
              const style = {
                "--i": index++,
                "--size": `${item.size}%`,
                "--tilt": `${item.tilt}deg`,
              } as CSSProperties;
              return (
                <li key={item.asset.id} className={styles.item} style={style}>
                  <span className={styles.float}>
                    <AssetArt asset={item.asset} className={styles.art} />
                  </span>
                  <span className={styles.shadow} />
                  {item.tag ? (
                    <span className={styles.tag}>
                      {catalogNumber(item.asset.number)} · {item.asset.title}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className={styles.ledge} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
