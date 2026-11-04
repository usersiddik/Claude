"use client";

import { memo } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import { CopyIcon } from "@/components/ui/icons";
import type { Asset } from "@/lib/assets/types";
import styles from "./AssetCard.module.css";

const FAMILY: Record<Asset["family"], string> = { charm: "Charm", mark: "Mark", duo: "Duo" };

interface AssetCardProps {
  asset: Asset;
  /** Preview SVG with the chosen fill applied. */
  svg: string;
  ink: string | null;
  /** Visible pill text, e.g. "Copy sticker". */
  copyLabel: string;
  formatLabel: string;
  onOpen: (asset: Asset) => void;
  onCopy: (asset: Asset) => void;
}

/** Click the card to inspect; the pill copies in one click. */
export const AssetCard = memo(function AssetCard({ asset, svg, ink, copyLabel, formatLabel, onOpen, onCopy }: AssetCardProps) {
  const available = asset.status === "available";
  const badge = available ? FAMILY[asset.family] : "Preview";

  return (
    <article className={styles.card} data-family={asset.family}>
      <div className={styles.canvas} style={ink ? { color: ink } : undefined}>
        <AssetArt asset={{ sourceSvg: svg }} className={styles.art} />
      </div>
      <div className={styles.footer}>
        <h3 className={styles.name}>
          <button type="button" className={styles.open} aria-haspopup="dialog" onClick={() => onOpen(asset)}>
            {asset.title}
          </button>
        </h3>
        <span className={styles.badge}>{badge}</span>
      </div>
      {available ? (
        <button type="button" className={styles.copy} onClick={() => onCopy(asset)} aria-label={`Copy ${asset.title} as ${formatLabel}`}>
          <CopyIcon size={14} />
          <span aria-hidden="true">{copyLabel}</span>
        </button>
      ) : null}
    </article>
  );
});
