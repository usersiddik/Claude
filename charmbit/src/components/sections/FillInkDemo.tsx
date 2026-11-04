"use client";

import { useState } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import { SwatchPicker } from "@/components/ui/SwatchPicker";
import { applyFill, FILL_OPTIONS, findFill, findInk, INK_OPTIONS } from "@/lib/customize";
import styles from "./Bento.module.css";

const FILLS = FILL_OPTIONS.filter((option) => ["original", "coral", "lilac", "sky", "mint"].includes(option.id));
const INKS = INK_OPTIONS.filter((option) => ["auto", "indigo", "aubergine", "pine"].includes(option.id));

/** Shows the two layers separately: Fill (shapes) and Ink (linework). */
export function FillInkDemo({ svg, primary }: { svg: string; primary: string }) {
  const [fillId, setFillId] = useState("original");
  const [inkId, setInkId] = useState("auto");
  const fill = findFill(fillId);
  const ink = findInk(inkId);

  const recolored = applyFill(svg, primary, fill.hex);
  const fillLayer = recolored.replace(/(stroke|fill)="currentColor"/g, '$1="none"');
  const inkLayer = recolored.replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="none"');
  const inkStyle = ink.hex ? { color: ink.hex } : undefined;

  return (
    <div className={styles.demo}>
      <div className={styles.layers} style={inkStyle}>
        <figure className={styles.layer}>
          <AssetArt asset={{ sourceSvg: fillLayer }} className={styles.layerArt} />
          <figcaption>Fill</figcaption>
        </figure>
        <span className={styles.operator} aria-hidden="true">
          +
        </span>
        <figure className={styles.layer}>
          <AssetArt asset={{ sourceSvg: inkLayer }} className={styles.layerArt} />
          <figcaption>Ink</figcaption>
        </figure>
        <span className={styles.operator} aria-hidden="true">
          =
        </span>
        <figure className={`${styles.layer} ${styles.result}`}>
          <AssetArt asset={{ sourceSvg: recolored }} label="Combined result" className={styles.layerArt} />
          <figcaption>Result</figcaption>
        </figure>
      </div>
      <div className={styles.demoControls}>
        <SwatchPicker name="demo-fill" label="Fill" options={FILLS} value={fillId} onChange={setFillId} />
        <SwatchPicker name="demo-ink" label="Ink" options={INKS} value={inkId} nullStyle="auto" onChange={setInkId} />
      </div>
    </div>
  );
}
