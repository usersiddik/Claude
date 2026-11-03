"use client";

import type { CSSProperties } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import { CopyButton } from "@/components/ui/CopyButton";
import type { Asset } from "@/lib/assets/types";
import { toSvg } from "@/lib/exports/svg";
import { catalogNumber, familyLabel } from "./format";
import styles from "./AssetCard.module.css";

interface AssetCardProps {
  asset: Asset;
  onOpen: (asset: Asset) => void;
  headingLevel?: "h3" | "h4";
}

/** A tiny printed charm label. The title button opens the drawer; the whole card is its hit area. */
export function AssetCard({ asset, onOpen, headingLevel: Heading = "h4" }: AssetCardProps) {
  const available = asset.status === "available";
  const tone = { "--tone": `var(--${asset.preview.tone})` } as CSSProperties;

  return (
    <article className={styles.card} style={tone} data-family={asset.family}>
      <span className={styles.hole} aria-hidden="true" />
      <p className={styles.top}>
        <span>{catalogNumber(asset.number)}</span>
        <span className={styles.family}>{familyLabel(asset.family)}</span>
      </p>
      <div className={styles.preview}>
        <AssetArt asset={asset} className={styles.art} />
      </div>
      <Heading className={styles.title}>
        <button type="button" className={styles.open} aria-haspopup="dialog" onClick={() => onOpen(asset)}>
          {asset.title}
        </button>
      </Heading>
      <p className={styles.tags}>{asset.tags.slice(0, 3).join(" · ")}</p>
      <div className={styles.action}>
        {available ? (
          <CopyButton
            variant="chip"
            getText={() => toSvg(asset)}
            label={`Copy SVG for ${asset.title}`}
            what={`${asset.title} SVG`}
          />
        ) : (
          <span className={styles.soon}>Soon</span>
        )}
      </div>
    </article>
  );
}
