"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { defaultValues, findItem, GENERATED, renderItem, stickerTitle, type IconAsset, type LiveCollection, type StickerItem, type Value, type Values } from "@/lib/universe";
import { iconsCollection } from "@/lib/universe/collections/icons";
import { stickerPath, svgDataUri } from "@/lib/universe/paths";
import { buildSearchIndex, POPULAR_SEARCHES, search } from "@/lib/universe/search";
import { CopyIsland } from "@/components/ui/CopyIsland";
import type { StrokeId } from "@/lib/sticker";
import { BEFORE_SIGN_IN } from "@/components/auth/AuthProvider";
import { brandKey } from "@/lib/brand";
import { Editor } from "./Editor";
import { SEARCH_EVENT } from "./search-events";
import styles from "./Library.module.css";

export interface Selection {
  collection?: string | null;
  sticker?: string | null;
}

interface LibraryProps {
  icons: readonly IconAsset[];
  selection: Selection;
  onSelect: (next: { collection: string; sticker: string }) => void;
  /** Search to start with (from `?q=`). */
  initialQuery?: string;
  /** Bring back colours, outline, and search saved before a sign-in redirect (client-rendered instances only). */
  restore?: boolean;
}

interface Saved {
  edits: Record<string, Values>;
  stroke: StrokeId;
  query: string;
}

const SAVED = brandKey("library");
let saved: Saved | null | undefined;

/** Reads (once) what the library saved before leaving for Google sign-in. */
function takeSaved(): Saved | null {
  if (saved !== undefined) return saved;
  try {
    const raw = sessionStorage.getItem(SAVED);
    sessionStorage.removeItem(SAVED);
    saved = raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    saved = null;
  }
  return saved;
}

interface Entry {
  collection: LiveCollection;
  item: StickerItem;
}

const isPhone = () => window.matchMedia("(max-width: 1023px)").matches;

/** Browse a collection, pick a sticker, make it yours, copy it. */
export function Library({ icons, selection, onSelect, initialQuery = "", restore = false }: LibraryProps) {
  const universe: LiveCollection[] = useMemo(() => [...GENERATED, iconsCollection(icons)], [icons]);
  const collection = universe.find((candidate) => candidate.id === selection.collection) ?? universe[0]!;
  const item = findItem(collection, selection.sticker);

  // The outline width carries across stickers and collections.
  const [stroke, setStroke] = useState<StrokeId>(() => (restore && takeSaved()?.stroke) || "none");

  // Customisations are remembered per collection while you browse.
  const [edits, setEdits] = useState<Record<string, Values>>(() => (restore && takeSaved()?.edits) || {});
  const defaults = useMemo(() => defaultValues(collection), [collection]);
  const values: Values = useMemo(() => ({ ...defaults, ...edits[collection.id] }), [defaults, edits, collection.id]);
  const changed = Object.keys(edits[collection.id] ?? {}).some((key) => edits[collection.id]?.[key] !== defaults[key]);

  // Search across every collection. The hero (or ?q=) can start one.
  const [query, setQuery] = useState(() => initialQuery || (restore && takeSaved()?.query) || "");
  const index = useMemo(() => buildSearchIndex(universe), [universe]);
  const results = useMemo(() => (query.trim() ? search(index, query) : null), [index, query]);
  useEffect(() => {
    const onSearch = (event: Event) => {
      const text = (event as CustomEvent<string>).detail;
      if (typeof text === "string") setQuery(text);
    };
    window.addEventListener(SEARCH_EVENT, onSearch);
    return () => window.removeEventListener(SEARCH_EVENT, onSearch);
  }, []);

  // Signing in leaves the page; keep the visitor's work for when they come back.
  useEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem(SAVED, JSON.stringify({ edits, stroke, query } satisfies Saved));
      } catch {
        // Private mode: they'll start fresh, which is fine.
      }
    };
    window.addEventListener(BEFORE_SIGN_IN, save);
    return () => window.removeEventListener(BEFORE_SIGN_IN, save);
  }, [edits, stroke, query]);

  // A new search shows its best match in the editor.
  const first = results?.[0];
  const showingResult = results?.some((entry) => entry.collection.id === collection.id && entry.item.id === item.id);
  useEffect(() => {
    if (first && !showingResult) onSelect({ collection: first.collection.id, sticker: first.item.id });
    // Only when the results change, not on every selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Group filter resets when the collection changes.
  const [groupFor, setGroupFor] = useState({ collection: collection.id, group: "all" });
  const group = groupFor.collection === collection.id ? groupFor.group : "all";
  const visible: Entry[] = useMemo(
    () => results ?? collection.items.filter((candidate) => group === "all" || candidate.group === group).map((candidate) => ({ collection, item: candidate })),
    [results, collection, group],
  );
  const position = Math.max(0, visible.findIndex((entry) => entry.collection.id === collection.id && entry.item.id === item.id));

  // Tiles use the prerendered files until a colour changes, then render live.
  const tiles = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of visible) {
      const base = defaultValues(entry.collection);
      const current = { ...base, ...edits[entry.collection.id] };
      const custom = entry.item.uses.some((use) => current[use] !== base[use]);
      map.set(`${entry.collection.id}/${entry.item.id}`, custom ? svgDataUri(renderItem(entry.collection, entry.item, current, true)) : stickerPath(entry.collection.id, entry.item.id));
    }
    return map;
  }, [visible, edits]);

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
  const browse = (next: LiveCollection) => {
    setQuery("");
    select(next);
  };
  const change = (property: string, value: Value) => setEdits((previous) => ({ ...previous, [collection.id]: { ...previous[collection.id], [property]: value } }));
  const reset = () => setEdits((previous) => ({ ...previous, [collection.id]: {} }));
  const step = (direction: 1 | -1) => {
    const next = visible[(position + direction + visible.length) % visible.length];
    if (next) select(next.collection, next.item);
  };

  function openTile(entry: Entry) {
    select(entry.collection, entry.item);
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
    position: { index: position, total: Math.max(visible.length, 1) },
    onChange: change,
    onReset: reset,
    onStep: step,
    changed,
    stroke,
    onStroke: setStroke,
  };

  return (
    <div className={styles.library} style={{ "--accent": collection.accent } as CSSProperties}>
      <form className={styles.search} role="search" onSubmit={(event) => event.preventDefault()}>
        <SearchIcon size={18} className={styles.searchIcon} />
        <label htmlFor="library-search" className="sr-only">
          Search all stickers
        </label>
        <input
          id="library-search"
          type="search"
          className={styles.searchField}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search all ${universe.reduce((total, entry) => total + entry.items.length, 0)} stickers: kiss, hug, diwali…`}
          maxLength={60}
          autoComplete="off"
          enterKeyHint="search"
        />
        {query ? (
          <button type="button" className={styles.searchClear} aria-label="Clear search" onClick={() => setQuery("")}>
            <CloseIcon size={16} />
          </button>
        ) : null}
      </form>

      <div ref={rail} className={styles.rail} role="group" aria-label="Collections">
        {universe.map((candidate) => (
          <button key={candidate.id} type="button" className={styles.pill} aria-pressed={!results && candidate.id === collection.id} onClick={() => browse(candidate)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sticker */}
            <img src={stickerPath(candidate.id, candidate.cover[0] ?? candidate.items[0]!.id)} alt="" width={28} height={28} loading="lazy" decoding="async" />
            {candidate.title}
            <span>{candidate.items.length}</span>
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.browser}>
          {results ? (
            <div className={styles.browserHead} aria-live="polite">
              <div>
                <h3 className={styles.collectionTitle}>“{query.trim()}”</h3>
                <p className={styles.collectionText}>
                  {results.length === 0
                    ? "No stickers match that yet. Try one of these:"
                    : `${results.length} sticker${results.length === 1 ? "" : "s"} across ${new Set(results.map((entry) => entry.collection.id)).size} collection${new Set(results.map((entry) => entry.collection.id)).size === 1 ? "" : "s"}.`}
                </p>
              </div>
              <div className={styles.groups} role="group" aria-label="Popular searches">
                {POPULAR_SEARCHES.map((suggestion) => (
                  <button key={suggestion} type="button" className={styles.group} aria-pressed={query.trim().toLowerCase() === suggestion} onClick={() => setQuery(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
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
          )}

          <ul role="list" className={styles.grid} key={results ? `search-${query}` : `${collection.id}-${group}`} aria-label={results ? "Search results" : `${collection.title} stickers`}>
            {visible.map((entry, order) => {
              const selected = entry.collection.id === collection.id && entry.item.id === item.id;
              const title = stickerTitle(entry.collection, entry.item);
              return (
                <li key={`${entry.collection.id}/${entry.item.id}`} style={{ "--i": Math.min(order, 24) } as CSSProperties} className={styles.cell}>
                  <button type="button" className={styles.tile} aria-pressed={selected} aria-label={title} onClick={() => openTile(entry)}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static or generated SVG */}
                    <img src={tiles.get(`${entry.collection.id}/${entry.item.id}`)} alt="" width={160} height={160} loading="lazy" decoding="async" draggable={false} />
                    <span className={styles.tileName}>{results ? title : entry.item.name}</span>
                  </button>
                </li>
              );
            })}
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
