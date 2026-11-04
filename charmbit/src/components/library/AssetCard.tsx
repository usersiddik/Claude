"use client";

import { memo } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import type { Asset } from "@/lib/assets/types";
import { familyLabel } from "./format";
import styles from "./AssetCard.module.css";

interface AssetCardProps {
  asset: Asset;
  /** The SVG to preview, with the chosen colour applied. */
  svg: string;
  ink: string;
  formatLabel: string;
  copied: boolean;
  onCopy: (asset: Asset) => void;
}

/** One asset. The whole tile is the copy button; Duos that aren't ready are inert. */
export const AssetCard = memo(function AssetCard({ asset, svg, ink, formatLabel, copied, onCopy }: AssetCardProps) {
  const available = asset.status === "available";
  const art = <AssetArt asset={{ sourceSvg: svg }} className={styles.art} />;

  if (!available) {
    return (
      <div className={styles.card} data-family={asset.family} data-disabled="">
        <div className={styles.stage} style={{ color: ink }}>
          {art}
        </div>
        <div className={styles.meta}>
          <span className={styles.name}>{asset.title}</span>
          <span className={styles.soon}>Coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.card}
      data-family={asset.family}
      data-copied={copied ? "" : undefined}
      onClick={() => onCopy(asset)}
    >
      <span className={styles.stage} style={{ color: ink }}>
        {art}
        <span className={styles.badge} aria-hidden="true">
          <CopyIcon className={styles.copyIcon} size={15} />
          <CheckIcon className={styles.checkIcon} size={15} />
        </span>
      </span>
      <span className={styles.meta}>
        <span className={styles.name}>
          <span className="sr-only">Copy </span>
          {asset.title}
          <span className="sr-only"> as {formatLabel}</span>
        </span>
        <span className={styles.kind}>{familyLabel(asset.family)}</span>
      </span>
    </button>
  );
});
