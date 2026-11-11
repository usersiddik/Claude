"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CloseIcon, HeartGlyph, ShuffleIcon } from "@/components/ui/icons";
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
  /** Random colours and details for this sticker. */
  onRandom: () => void;
  saved: boolean;
  onToggleSaved: () => void;
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

export function Editor({ collection, item, values, position, onChange, onReset, onRandom, saved, onToggleSaved, onStep, variant, onClose, changed, stroke, onStroke }: EditorProps) {
  const [canvas, setCanvas] = useState<Canvas>("light");
  const [pulse, setPulse] = useState(0);
  // Image stickers are files; the chosen look (e.g. an outfit) picks which one.
  const looks = item.image?.variants ?? [];
  const file = item.image ? (looks.find((look) => look.id === values.look)?.src ?? item.image.src) : undefined;
  const svg = useMemo(() => (item.image ? "" : renderItem(collection, item, values)), [collection, item, values]);
  const title = stickerTitle(collection, item);
  const properties = propertiesFor(collection, item);
  const prefix = `${variant}-${collection.id}`;
  // GIFs are sent as they are: no outline, no redrawing.
  const animated = Boolean(item.image?.animated);
  const width = animated ? 0 : strokeWidth(stroke);

  // With an outline on, preview the exact bitmap that will be copied.
  const [rendered, setRendered] = useState<{ key: string; url: string } | null>(null);
  const renderKey = `${width}:${file ?? svg}`;
  useEffect(() => {
    if (width === 0) return;
    let live = true;
    let url = "";
    renderSticker(file ? { url: file } : svg, file ? { stroke: width, size: 768 } : { stroke: width, silhouette: silhouetteOf(svg), size: 768 })
      .then((blob) => {
        if (!live) return;
        url = URL.createObjectURL(blob);
        setRendered({ key: `${width}:${file ?? svg}`, url });
      })
      .catch(() => {});
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [svg, file, width]);
  const outlined = width > 0 && rendered?.key === renderKey ? rendered.url : null;
  // The bitmap has margins for the outline; scale it so the art stays the same size.
  const scale = outlined ? 1 / (1 - 2 * paddingFor(width)) : 1;

  return (
    <div className={styles.editor} data-variant={variant}>
      <div className={styles.preview} data-canvas={canvas}>
        <div key={`${item.id}-${pulse}`} className={styles.previewArt} data-pulse={pulse > 0 ? "" : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG; an image keeps its ids isolated */}
          <img src={outlined ?? file ?? svgDataUri(svg)} alt={title} className={styles.previewSvg} style={{ "--scale": scale } as CSSProperties} draggable={false} />
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
        <div className={styles.infoRow}>
          <h3 className={styles.infoTitle}>{item.name}</h3>
          <button type="button" className={styles.save} aria-pressed={saved} onClick={onToggleSaved}>
            <HeartGlyph size={16} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
        <p className={styles.infoCaption}>“{item.caption}”</p>
        <ul role="list" className={styles.tags} aria-label="Category">
          <li>{collection.title}</li>
          {collection.groups.find((candidate) => candidate.id === item.group) ? <li>{collection.groups.find((candidate) => candidate.id === item.group)!.name}</li> : null}
        </ul>
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
        {looks.length > 1 ? (
          <fieldset className={styles.field}>
            <legend className={styles.fieldLabel}>
              Outfit
              <span>{(looks.find((look) => look.id === values.look) ?? looks[0]!).name}</span>
            </legend>
            <div className={styles.swatches}>
              {looks.map((look, order) => (
                <label key={look.id} className={styles.swatch} style={{ "--swatch": look.swatch } as CSSProperties} title={look.name}>
                  <input type="radio" name={`${prefix}-look`} checked={values.look ? values.look === look.id : order === 0} onChange={() => onChange("look", look.id)} className={styles.radio} />
                  <span className="sr-only">{look.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        {animated ? null : <StrokeField name={`${variant}-stroke`} value={stroke} onChange={onStroke} />}
        {properties.length > 0 ? (
          <div className={styles.fieldActions}>
            <button type="button" className={styles.surprise} onClick={onRandom}>
              <ShuffleIcon size={16} />
              Surprise me
            </button>
            {changed ? (
              <button type="button" className={styles.reset} onClick={onReset}>
                Reset to original
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <StickerActions stroke={width} svg={svg} image={file} animated={animated} title={title} slug={stickerSlug(collection, item)} code={item.image ? undefined : (format) => exportItem(collection, item, values, format)} onCopied={() => setPulse((value) => value + 1)} />
    </div>
  );
}
