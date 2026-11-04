"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CloseIcon } from "@/components/ui/icons";
import { silhouetteOf } from "@/lib/art/kit";
import { paddingFor, renderSticker, strokeWidth, type StrokeId } from "@/lib/sticker";
import { svgDataUri } from "@/lib/universe/paths";
import { exportItem, propertiesFor, renderItem, stickerSlug, stickerTitle, type LiveCollection, type StickerItem, type Value, type Values } from "@/lib/universe";
import { ColorField, StrokeField, ToggleField } from "./Fields";
import { StickerActions } from "./StickerActions";
import styles from "./Library.module.css";

type Canvas = "light" | "dark" | "grid";

interface EditorProps {
  collection: LiveCollection;
  item: StickerItem;
  values: Values;
  /** Position within the visible list, for the counter and arrows. */
  position: { index: number; total: number };
  onChange: (property: string, value: Value) => void;
  onReset: () => void;
  onStep: (direction: 1 | -1) => void;
  /** Panel beside the grid, or a sheet on phones. */
  variant: "panel" | "sheet";
  onClose?: () => void;
  changed: boolean;
  stroke: StrokeId;
  onStroke: (stroke: StrokeId) => void;
}

const CANVASES: readonly { id: Canvas; label: string }[] = [
  { id: "light", label: "Light background" },
  { id: "dark", label: "Dark background" },
  { id: "grid", label: "Transparent background" },
];

export function Editor({ collection, item, values, position, onChange, onReset, onStep, variant, onClose, changed, stroke, onStroke }: EditorProps) {
  const [canvas, setCanvas] = useState<Canvas>("light");
  const [pulse, setPulse] = useState(0);
  const svg = useMemo(() => renderItem(collection, item, values), [collection, item, values]);
  const title = stickerTitle(collection, item);
  const properties = propertiesFor(collection, item);
  const prefix = `${variant}-${collection.id}`;
  const width = strokeWidth(stroke);

  // With an outline on, preview the exact bitmap that will be copied.
  const [rendered, setRendered] = useState<{ key: string; url: string } | null>(null);
  const renderKey = `${width}:${svg}`;
  useEffect(() => {
    if (width === 0) return;
    let live = true;
    let url = "";
    renderSticker(svg, { stroke: width, silhouette: silhouetteOf(svg), size: 768 })
      .then((blob) => {
        if (!live) return;
        url = URL.createObjectURL(blob);
        setRendered({ key: `${width}:${svg}`, url });
      })
      .catch(() => {});
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [svg, width]);
  const outlined = width > 0 && rendered?.key === renderKey ? rendered.url : null;
  // The bitmap has margins for the outline; scale it so the art stays the same size.
  const scale = outlined ? 1 / (1 - 2 * paddingFor(width)) : 1;

  return (
    <div className={styles.editor} data-variant={variant}>
      <div className={styles.preview} data-canvas={canvas}>
        <div key={`${item.id}-${pulse}`} className={styles.previewArt} data-pulse={pulse > 0 ? "" : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG; an image keeps its ids isolated */}
          <img src={outlined ?? svgDataUri(svg)} alt={title} className={styles.previewSvg} style={{ "--scale": scale } as CSSProperties} draggable={false} />
        </div>
        <div className={styles.canvasPicker} role="group" aria-label="Preview background">
          {CANVASES.map((option) => (
            <button key={option.id} type="button" className={styles.canvasButton} data-canvas-swatch={option.id} aria-pressed={canvas === option.id} aria-label={option.label} onClick={() => setCanvas(option.id)} />
          ))}
        </div>
        <button type="button" className={`${styles.step} ${styles.stepPrev}`} aria-label="Previous sticker" onClick={() => onStep(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m14.5 6-6 6 6 6" />
          </svg>
        </button>
        <button type="button" className={`${styles.step} ${styles.stepNext}`} aria-label="Next sticker" onClick={() => onStep(1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9.5 6 6 6-6 6" />
          </svg>
        </button>
        {onClose ? (
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        ) : null}
      </div>

      <div className={styles.info}>
        <p className={styles.infoKicker}>
          {collection.title} · {position.index + 1} of {position.total}
        </p>
        <h3 className={styles.infoTitle}>{item.name}</h3>
        <p className={styles.infoCaption}>“{item.caption}”</p>
      </div>

      <div className={styles.fields}>
        {properties.map((property) =>
          property.kind === "color" ? (
            <ColorField key={property.id} name={`${prefix}-${property.id}`} property={property} value={(values[property.id] as string | null) ?? null} onChange={(value) => onChange(property.id, value)} />
          ) : null,
        )}
        {properties.some((property) => property.kind === "toggle") ? (
          <div className={styles.toggles} role="group" aria-label="Details">
            {properties.map((property) =>
              property.kind === "toggle" ? <ToggleField key={property.id} property={property} value={Boolean(values[property.id])} onChange={(value) => onChange(property.id, value)} /> : null,
            )}
          </div>
        ) : null}
        <StrokeField name={`${variant}-stroke`} value={stroke} onChange={onStroke} />
        {changed ? (
          <button type="button" className={styles.reset} onClick={onReset}>
            Reset colours
          </button>
        ) : null}
      </div>

      <StickerActions stroke={width} svg={svg} title={title} slug={stickerSlug(collection, item)} code={(format) => exportItem(collection, item, values, format)} onCopied={() => setPulse((value) => value + 1)} />
    </div>
  );
}
