"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { defaultValues, findItem, GENERATED, renderItem, stickerTitle, type IconAsset, type LiveCollection, type StickerItem, type Value, type Values } from "@/lib/universe";
import { iconsCollection } from "@/lib/universe/collections/icons";
import { stickerPath, svgDataUri } from "@/lib/universe/paths";
import { CopyIsland } from "@/components/ui/CopyIsland";
import { Editor } from "./Editor";
import styles from "./Library.module.css";

export interface Selection {
  collection?: string | null;
  sticker?: string | null;
}

interface LibraryProps {
  icons: readonly IconAsset[];
  selection: Selection;
  onSelect: (next: { collection: string; sticker: string }) => void;
}

const isPhone = () => window.matchMedia("(max-width: 1023px)").matches;

/** Browse a collection, pick a sticker, make it yours, copy it. */
export function Library({ icons, selection, onSelect }: LibraryProps) {
  const universe: LiveCollection[] = useMemo(() => [...GENERATED, iconsCollection(icons)], [icons]);
  const collection = universe.find((candidate) => candidate.id === selection.collection) ?? universe[0]!;
  const item = findItem(collection, selection.sticker);

  // Customisations are remembered per collection while you browse.
  const [edits, setEdits] = useState<Record<string, Values>>({});
  const defaults = useMemo(() => defaultValues(collection), [collection]);
  const values: Values = useMemo(() => ({ ...defaults, ...edits[collection.id] }), [defaults, edits, collection.id]);
  const changed = Object.keys(edits[collection.id] ?? {}).some((key) => edits[collection.id]?.[key] !== defaults[key]);

  // Group filter resets when the collection changes.
  const [groupFor, setGroupFor] = useState({ collection: collection.id, group: "all" });
  const group = groupFor.collection === collection.id ? groupFor.group : "all";
  const visible = collection.items.filter((candidate) => group === "all" || candidate.group === group);
  const index = Math.max(0, visible.findIndex((candidate) => candidate.id === item.id));

  // Tiles use the prerendered files until a colour changes, then render live.
  const tiles = useMemo(() => {
    const custom = (candidate: StickerItem) => candidate.uses.some((use) => values[use] !== defaults[use]);
    return new Map(collection.items.map((candidate) => [candidate.id, custom(candidate) ? svgDataUri(renderItem(collection, candidate, values, true)) : stickerPath(collection.id, candidate.id)]));
  }, [collection, values, defaults]);

  const sheet = useRef<HTMLDialogElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const rail = useRef<HTMLDivElement>(null);

  // Keep the active collection pill in view.
  useEffect(() => {
    const node = rail.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    const track = rail.current;
    if (!node || !track) return;
    const left = node.offsetLeft - track.clientWidth / 2 + node.clientWidth / 2;
    track.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [collection.id]);

  const select = (next: LiveCollection, sticker?: StickerItem) => onSelect({ collection: next.id, sticker: (sticker ?? next.items[0]!).id });
  const change = (property: string, value: Value) => setEdits((previous) => ({ ...previous, [collection.id]: { ...previous[collection.id], [property]: value } }));
  const reset = () => setEdits((previous) => ({ ...previous, [collection.id]: {} }));
  const step = (direction: 1 | -1) => {
    const next = visible[(index + direction + visible.length) % visible.length];
    if (next) select(collection, next);
  };

  function openTile(candidate: StickerItem) {
    select(collection, candidate);
    if (isPhone()) {
      sheet.current?.showModal();
      setSheetOpen(true);
    }
  }

  function closeSheet() {
    sheet.current?.close();
  }

  const editorProps = {
    collection,
    item,
    values,
    position: { index, total: visible.length },
    onChange: change,
    onReset: reset,
    onStep: step,
    changed,
  };

  return (
    <div className={styles.library} style={{ "--accent": collection.accent } as CSSProperties}>
      <div ref={rail} className={styles.rail} role="group" aria-label="Collections">
        {universe.map((candidate) => (
          <button key={candidate.id} type="button" className={styles.pill} aria-pressed={candidate.id === collection.id} onClick={() => select(candidate)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sticker */}
            <img src={stickerPath(candidate.id, candidate.cover[0] ?? candidate.items[0]!.id)} alt="" width={28} height={28} loading="lazy" decoding="async" />
            {candidate.title}
            <span>{candidate.items.length}</span>
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.browser}>
          <div className={styles.browserHead}>
            <div>
              <h3 className={styles.collectionTitle}>{collection.title}</h3>
              <p className={styles.collectionText}>{collection.description}</p>
            </div>
            <div className={styles.groups} role="group" aria-label={`${collection.title} groups`}>
              {[{ id: "all", name: "All" }, ...collection.groups].map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  className={styles.group}
                  aria-pressed={group === candidate.id}
                  onClick={() => setGroupFor({ collection: collection.id, group: candidate.id })}
                >
                  {candidate.name}
                  <span>{candidate.id === "all" ? collection.items.length : collection.items.filter((entry) => entry.group === candidate.id).length}</span>
                </button>
              ))}
            </div>
          </div>

          <ul role="list" className={styles.grid} key={`${collection.id}-${group}`} aria-label={`${collection.title} stickers`}>
            {visible.map((candidate, position) => (
              <li key={candidate.id} style={{ "--i": Math.min(position, 24) } as CSSProperties} className={styles.cell}>
                <button type="button" className={styles.tile} aria-pressed={candidate.id === item.id} aria-label={stickerTitle(collection, candidate)} onClick={() => openTile(candidate)}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static or generated SVG */}
                  <img src={tiles.get(candidate.id)} alt="" width={160} height={160} loading="lazy" decoding="async" draggable={false} />
                  <span className={styles.tileName}>{candidate.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.panel} role="region" aria-label="Sticker editor">
          <Editor {...editorProps} variant="panel" />
        </div>
      </div>

      <dialog ref={sheet} className={styles.sheet} aria-label={`${stickerTitle(collection, item)} editor`} onClose={() => setSheetOpen(false)} onClick={(event) => event.target === sheet.current && closeSheet()}>
        {sheetOpen ? (
          <>
            <Editor {...editorProps} variant="sheet" onClose={closeSheet} />
            <CopyIsland scope="dialog" />
          </>
        ) : null}
      </dialog>
    </div>
  );
}
