"use client";

import { useState, type CSSProperties } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import { CopyIcon } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { REACTION_ICONS } from "@/components/library/Variations";
import type { Colorway, Reaction } from "@/lib/assets/packs";
import { announceCopy } from "@/lib/copy-events";
import { copyImage, download, renderSticker } from "@/lib/sticker";
import styles from "./HeroStage.module.css";

export interface StageSticker {
  slug: string;
  title: string;
  svg: string;
  colorway: string;
  reaction: string;
}

interface HeroStageProps {
  pack: { colorways: readonly Colorway[]; reactions: readonly Reaction[] };
  stickers: readonly StageSticker[];
  floaters: readonly { slug: string; title: string; svg: string }[];
}

const BUBBLES: Record<Reaction["id"], string> = {
  happy: "Hiii!",
  love: "Love you",
  sad: "Miss you…",
  blush: "Stop it, you",
};

/** Miso peeks up from the stage. Pick a mood and a colorway, then copy the sticker. */
export function HeroStage({ pack, stickers, floaters }: HeroStageProps) {
  const [reaction, setReaction] = useState<Reaction["id"]>("love");
  const [colorway, setColorway] = useState(pack.colorways[0]?.id ?? "ginger");
  const current =
    stickers.find((sticker) => sticker.colorway === colorway && sticker.reaction === reaction) ?? stickers[0];
  if (!current) return null;

  function cycle() {
    const ids = pack.reactions.map((item) => item.id);
    setReaction(ids[(ids.indexOf(reaction) + 1) % ids.length] ?? "happy");
  }

  async function copy() {
    if (!current) return;
    const blob = renderSticker(current.svg);
    const notice = { title: current.title, svg: current.svg, ink: null };
    try {
      await copyImage(blob);
      announceCopy({ ...notice, format: "Sticker", ok: true });
    } catch {
      try {
        download(await blob, `${current.slug}.png`);
        announceCopy({ ...notice, format: "PNG", verb: "Saved", ok: true });
      } catch {
        announceCopy({ ...notice, format: "Sticker", ok: false });
      }
    }
  }

  return (
    <div className={styles.stage} data-colorway={colorway}>
      {pack.colorways.map((item) => (
        <span key={item.id} className={styles.backdrop} data-for={item.id} aria-hidden="true" />
      ))}

      <ul role="list" className={styles.floaters} aria-hidden="true">
        {floaters.map((floater, index) => (
          <li key={floater.slug} className={styles.floater} style={{ "--i": index } as CSSProperties}>
            <AssetArt asset={{ sourceSvg: floater.svg }} className={styles.floaterArt} />
          </li>
        ))}
      </ul>

      <div className={styles.controls}>
        <SegmentedControl<Reaction["id"]>
          name="hero-reaction"
          label="Reaction"
          options={pack.reactions.map((item) => ({ id: item.id, label: item.name, icon: REACTION_ICONS[item.id] }))}
          value={reaction}
          onChange={setReaction}
          size="sm"
          className={styles.reactions}
        />
        <fieldset className={styles.colorways}>
          <legend className="sr-only">Colorway</legend>
          {pack.colorways.map((item) => (
            <label key={item.id} className={styles.swatch} style={{ "--swatch": item.swatch } as CSSProperties} title={item.name}>
              <input
                type="radio"
                name="hero-colorway"
                checked={item.id === colorway}
                onChange={() => setColorway(item.id)}
                className={styles.swatchInput}
              />
              <span className="sr-only">{item.name}</span>
            </label>
          ))}
        </fieldset>
        <button type="button" className={styles.copy} onClick={copy} aria-label={`Copy ${current.title} sticker`}>
          <CopyIcon size={15} />
          <span aria-hidden="true">Copy sticker</span>
        </button>
      </div>

      <p key={`bubble-${reaction}`} className={styles.bubble} aria-live="polite">
        {BUBBLES[reaction]}
      </p>

      <button
        type="button"
        className={styles.peek}
        onClick={cycle}
        aria-label={`${current.title}. Click to change mood.`}
      >
        <AssetArt key={current.slug} asset={{ sourceSvg: current.svg }} className={styles.cat} />
      </button>
    </div>
  );
}
