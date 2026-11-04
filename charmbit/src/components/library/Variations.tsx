"use client";

import type { CSSProperties } from "react";
import { BlushGlyph, DropGlyph, HeartGlyph, SmileGlyph } from "@/components/ui/icons";
import { findPack, packSlug, type Reaction } from "@/lib/assets/packs";
import type { Asset } from "@/lib/assets/types";
import styles from "./Variations.module.css";

export const REACTION_ICONS: Record<Reaction["id"], React.ReactNode> = {
  happy: <SmileGlyph size={15} />,
  love: <HeartGlyph size={15} />,
  sad: <DropGlyph size={15} />,
  blush: <BlushGlyph size={15} />,
};

/** Reaction and colorway pickers for a sticker-pack asset. */
export function Variations({ asset, onSelect }: { asset: Asset; onSelect: (slug: string) => void }) {
  const pack = findPack(asset.pack?.id);
  if (!pack || !asset.pack) return null;
  const colorway = pack.colorways.find((item) => item.id === asset.pack?.colorway) ?? pack.colorways[0]!;
  const reaction = pack.reactions.find((item) => item.id === asset.pack?.reaction) ?? pack.reactions[0]!;

  return (
    <div className={styles.variations}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Reaction</legend>
        <div className={styles.chips}>
          {pack.reactions.map((item) => (
            <label key={item.id} className={styles.chip}>
              <input
                type="radio"
                name="variant-reaction"
                checked={item.id === reaction.id}
                onChange={() => onSelect(packSlug(pack, colorway, item))}
                className={styles.input}
              />
              {REACTION_ICONS[item.id]}
              {item.name}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>
          Colorway <span>{colorway.name}</span>
        </legend>
        <div className={styles.swatches}>
          {pack.colorways.map((item) => (
            <label key={item.id} className={styles.swatch} style={{ "--swatch": item.swatch } as CSSProperties} title={item.name}>
              <input
                type="radio"
                name="variant-colorway"
                checked={item.id === colorway.id}
                onChange={() => onSelect(packSlug(pack, item, reaction))}
                className={styles.input}
              />
              <span className="sr-only">{item.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
