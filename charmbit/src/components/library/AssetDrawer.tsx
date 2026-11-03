"use client";

import { useEffect, useMemo, useRef } from "react";
import { AssetArt } from "@/components/ui/AssetArt";
import { CodeTabs } from "@/components/ui/CodeTabs";
import { CloseIcon } from "@/components/ui/icons";
import { PALETTE } from "@/lib/assets/palette";
import type { Asset } from "@/lib/assets/types";
import { buildExports } from "@/lib/exports";
import { catalogNumber, familyLabel } from "./format";
import styles from "./AssetDrawer.module.css";

interface AssetDrawerProps {
  asset: Asset | null;
  assets: readonly Asset[];
  onClose: () => void;
  onSelect: (asset: Asset) => void;
}

/**
 * Native modal <dialog>: traps focus, closes on Escape, makes the page inert,
 * and returns focus to the opener when closed.
 */
export function AssetDrawer({ asset, assets, onClose, onSelect }: AssetDrawerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Lock page scroll while the drawer is open.
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
    } else if (asset && node.open) {
      heading.current?.focus();
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

  const byId = useMemo(() => new Map(assets.map((item) => [item.id, item])), [assets]);
  const exports = useMemo(() => (asset ? buildExports(asset) : []), [asset]);

  return (
    <dialog
      ref={dialog}
      className={styles.drawer}
      aria-labelledby="drawer-title"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      {asset ? (
        <div className={styles.sheet}>
          <header className={styles.head}>
            <div>
              <p className={styles.kicker}>
                {catalogNumber(asset.number)} · {familyLabel(asset.family)} · {asset.subject}
              </p>
              <h2 id="drawer-title" ref={heading} tabIndex={-1} className={styles.title}>
                {asset.title}
              </h2>
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label={`Close ${asset.title}`}
              onClick={() => dialog.current?.close()}
            >
              <CloseIcon size={20} />
            </button>
          </header>

          <div className={styles.previews}>
            <figure className={`${styles.tile} ${styles.light}`}>
              <AssetArt asset={asset} label={`${asset.title} on a light background`} className={styles.art} />
              <figcaption>Light</figcaption>
            </figure>
            <figure className={`${styles.tile} ${styles.dark}`}>
              <AssetArt asset={asset} label={`${asset.title} on a dark background`} className={styles.art} />
              <figcaption>Dark</figcaption>
            </figure>
          </div>

          <p className={styles.description}>{asset.description}</p>

          <dl className={styles.meta}>
            <div>
              <dt>Type</dt>
              <dd>
                {familyLabel(asset.family)} · {asset.subject}
              </dd>
            </div>
            <div>
              <dt>Canvas</dt>
              <dd>
                {asset.width} × {asset.height}
              </dd>
            </div>
            {asset.traits?.expression ? (
              <div>
                <dt>Expression</dt>
                <dd>{asset.traits.expression}</dd>
              </div>
            ) : null}
            {asset.traits?.pose ? (
              <div>
                <dt>Pose</dt>
                <dd>{asset.traits.pose}</dd>
              </div>
            ) : null}
            {asset.relationship ? (
              <div className={styles.wide}>
                <dt>Pairs</dt>
                <dd>
                  {asset.relationship.memberIds.map((id) => byId.get(id)?.title ?? id).join(" + ")} ·{" "}
                  {asset.relationship.occasion}
                </dd>
              </div>
            ) : null}
            <div className={styles.wide}>
              <dt>Tags</dt>
              <dd>
                <ul role="list" className={styles.tags}>
                  {asset.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className={styles.wide}>
              <dt>Palette</dt>
              <dd>
                <ul role="list" className={styles.palette}>
                  {asset.palette.map((key) => (
                    <li key={key}>
                      <span className={styles.swatch} style={{ background: PALETTE[key].hex }} aria-hidden="true" />
                      {PALETTE[key].name}
                      <code>{PALETTE[key].hex}</code>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <section className={styles.code} aria-labelledby="drawer-code-title">
            <h3 id="drawer-code-title" className={styles.sectionTitle}>
              Code label
            </h3>
            {asset.status === "available" ? (
              <CodeTabs key={asset.id} items={exports} assetTitle={asset.title} />
            ) : (
              <div className={styles.soon}>
                <p className={styles.soonTitle}>Coming next</p>
                <p>
                  This Duo is a preview of a set that hasn’t shipped yet. SVG, React, and Flutter code will be
                  available here when it does.
                </p>
              </div>
            )}
          </section>

          {asset.relatedAssetIds.length > 0 ? (
            <section aria-labelledby="drawer-related-title">
              <h3 id="drawer-related-title" className={styles.sectionTitle}>
                On the same shelf
              </h3>
              <ul role="list" className={styles.related}>
                {asset.relatedAssetIds.map((id) => {
                  const related = byId.get(id);
                  if (!related) return null;
                  return (
                    <li key={id}>
                      <button type="button" className={styles.relatedButton} onClick={() => onSelect(related)}>
                        <AssetArt asset={related} className={styles.relatedArt} />
                        <span>{related.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
