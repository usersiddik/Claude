"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import { CodeView } from "@/components/ui/CodeView";
import { CopyIsland } from "@/components/ui/CopyIsland";
import { CloseIcon, CopyIcon } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SwatchPicker } from "@/components/ui/SwatchPicker";
import type { Asset } from "@/lib/assets/types";
import { customizeSvg, FILL_OPTIONS, INK_OPTIONS } from "@/lib/customize";
import { buildExport, findFormat } from "@/lib/exports";
import type { Colors } from "./copy";
import { CANVAS_OPTIONS, FORMAT_OPTIONS, outputLabel } from "./options";
import { StickerPanel } from "./StickerPanel";
import type { Canvas, LibraryState, Output } from "./url-state";
import styles from "./Inspector.module.css";

const SIZES = [24, 48, 64, 128] as const;

interface InspectorProps {
  asset: Asset | null;
  state: LibraryState;
  colors: Colors;
  onChange: (patch: Partial<LibraryState>) => void;
  onClose: () => void;
  onCopy: (asset: Asset) => void;
}

/**
 * Detail sheet on a native modal <dialog>: focus is trapped, Escape closes,
 * the page behind is inert, and focus returns to the card that opened it.
 */
export function Inspector({ asset, state, colors, onChange, onClose, onCopy }: InspectorProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Lock page scroll while the sheet is open.
  const isOpen = asset !== null;
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (asset && !node.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      node.showModal();
    } else if (!asset && node.open) {
      node.close();
    }
  }, [asset]);

  function handleClose() {
    onClose();
    const target = opener.current;
    opener.current = null;
    if (target?.isConnected) target.focus();
  }

  const sticker = state.format === "sticker";
  const format = findFormat(sticker ? "svg" : state.format);
  const code = useMemo(
    () => (asset && !sticker ? buildExport(asset, format.id, { fill: colors.fill, ink: colors.ink ?? undefined }) : ""),
    [asset, sticker, format.id, colors.fill, colors.ink],
  );
  const svg = asset ? customizeSvg(asset, colors.fill) : "";
  const available = asset?.status === "available";
  const inkStyle = colors.ink ? ({ color: colors.ink } as CSSProperties) : undefined;

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="inspector-title"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {asset ? (
        <div className={styles.sheet} data-canvas={state.canvas}>
          <CopyIsland scope="dialog" />
          <header className={styles.header}>
            <div className={styles.titles}>
              <h2 id="inspector-title" className={styles.title} tabIndex={-1} autoFocus>
                {asset.title}
              </h2>
              <p className={styles.meta}>
                <span>{asset.family === "mark" ? "Mark" : "Charm"}</span>
                <span>
                  {asset.width}×{asset.height}
                </span>
                <span>{asset.tags.slice(0, 3).join(" · ")}</span>
              </p>
            </div>
            <button type="button" className={styles.close} aria-label={`Close ${asset.title}`} onClick={() => dialog.current?.close()}>
              <CloseIcon size={16} />
            </button>
          </header>

          <div className={styles.body}>
            <section className={styles.previewPane} aria-label="Preview">
              <div className={styles.stage} style={inkStyle}>
                <AssetArt asset={{ sourceSvg: svg }} label={`${asset.title} preview`} className={styles.stageArt} />
                <div className={styles.canvasSwitch}>
                  <SegmentedControl<Canvas>
                    name="inspector-canvas"
                    label="Preview canvas"
                    options={CANVAS_OPTIONS}
                    value={state.canvas}
                    onChange={(canvas) => onChange({ canvas })}
                    iconOnly
                    size="sm"
                  />
                </div>
              </div>

              <ul role="list" className={styles.sizes} aria-label="Sizes">
                {SIZES.map((size) => (
                  <li key={size}>
                    <span className={styles.sizeTile} style={inkStyle}>
                      <span style={{ width: size, height: size }} className={styles.sizeArt}>
                        <AssetArt asset={{ sourceSvg: svg }} />
                      </span>
                    </span>
                    <span className={styles.sizeLabel}>{size}px</span>
                  </li>
                ))}
              </ul>

              <div className={styles.colors}>
                {asset.recolorable === false ? null : (
                  <SwatchPicker name="inspector-fill" label="Fill" options={FILL_OPTIONS} value={state.fill} onChange={(id) => onChange({ fill: id })} />
                )}
                <SwatchPicker name="inspector-ink" label="Ink" options={INK_OPTIONS} value={state.ink} nullStyle="auto" onChange={(id) => onChange({ ink: id })} />
              </div>
            </section>

            <section className={styles.codePane} aria-labelledby="inspector-code-title">
              <h3 id="inspector-code-title" className="sr-only">
                Code
              </h3>
              <div className={styles.codeHead}>
                <SegmentedControl<Output>
                  name="inspector-format"
                  label="Copy as"
                  options={FORMAT_OPTIONS}
                  value={state.format}
                  onChange={(id) => onChange({ format: id })}
                />
                {available && !sticker ? (
                  <button type="button" className={styles.copy} onClick={() => onCopy(asset)}>
                    <CopyIcon size={15} />
                    Copy {outputLabel(state.format)}
                  </button>
                ) : null}
              </div>

              {available && sticker ? (
                <StickerPanel
                  asset={asset}
                  svg={svg}
                  ink={colors.ink}
                  border={state.border}
                  onBorderChange={(border) => onChange({ border })}
                  onCopy={() => onCopy(asset)}
                />
              ) : available ? (
                <>
                  <div className={styles.fileRow}>
                    <code className={styles.file}>{format.fileName(asset)}</code>
                    <ul role="list" className={styles.props} aria-label="Customizable props">
                      {format.props.map((prop) => (
                        <li key={prop}>{prop}</li>
                      ))}
                    </ul>
                  </div>
                  <CodeView
                    code={code}
                    language={format.language}
                    label={`${format.label} code for ${asset.title}`}
                    swapKey={`${asset.id}-${format.id}`}
                    className={styles.code}
                  />
                </>
              ) : (
                <div className={styles.soon}>
                  <p className={styles.soonTitle}>Coming soon</p>
                  <p>This asset is a preview. Code will be ready here when it ships.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
