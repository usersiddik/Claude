"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CloseIcon, HeartGlyph, LockIcon } from "@/components/ui/icons";
import { buildUniverse, CATEGORIES, categoryOf, defaultValues, findItem, isLive, randomValues, renderItem, stickerSrc, stickerTitle, type IconAsset, type LiveCollection, type CategoryId, type StickerItem, type Value, type Values } from "@/lib/universe";
import type { PackFiles } from "@/lib/universe/packs";
import { svgDataUri } from "@/lib/universe/paths";
import { buildSearchIndex, popularSearches, search } from "@/lib/universe/search";
import { CopyIsland } from "@/components/ui/CopyIsland";
import type { StrokeId } from "@/lib/sticker";
import { CAPTION_COLORS, type Caption } from "@/lib/caption";
import { BEFORE_SIGN_IN } from "@/components/auth/AuthProvider";
import { brandKey } from "@/lib/brand";
import { Editor } from "./Editor";
import { SEARCH_EVENT } from "./search-events";
import { useFavourites } from "./useFavourites";
import styles from "./Library.module.css";

export interface Selection {
  collection?: string | null;
  sticker?: string | null;
}

interface LibraryProps {
  icons: readonly IconAsset[];
  /** Image files present in each pack folder. */
  packs: PackFiles;
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
  caption?: Caption;
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
export function Library({ icons, packs, selection, onSelect, initialQuery = "", restore = false }: LibraryProps) {
  const universe: LiveCollection[] = useMemo(() => buildUniverse(icons, packs).filter(isLive), [icons, packs]);
  const collection = universe.find((candidate) => candidate.id === selection.collection) ?? universe[0]!;
  const item = findItem(collection, selection.sticker);

  // The outline width carries across stickers and collections.
  const [stroke, setStroke] = useState<StrokeId>(() => (restore && takeSaved()?.stroke) || "none");
  // Text on the sticker carries across stickers too, like the outline.
  const [caption, setCaption] = useState<Caption>(() => (restore && takeSaved()?.caption) || { text: "", color: CAPTION_COLORS[0]!.hex });

  // Customisations are remembered per collection while you browse.
  const [edits, setEdits] = useState<Record<string, Values>>(() => (restore && takeSaved()?.edits) || {});
  const defaults = useMemo(() => defaultValues(collection), [collection]);
  const values: Values = useMemo(() => ({ ...defaults, ...edits[collection.id] }), [defaults, edits, collection.id]);
  const changed = Object.keys(edits[collection.id] ?? {}).some((key) => edits[collection.id]?.[key] !== defaults[key]);

  // Search across every collection. The hero (or ?q=) can start one.
  const [query, setQuery] = useState(() => initialQuery || (restore && takeSaved()?.query) || "");
  const index = useMemo(() => buildSearchIndex(universe), [universe]);
  const results = useMemo(() => (query.trim() ? search(index, query) : null), [index, query]);
  const suggestions = useMemo(() => popularSearches(index), [index]);
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
        sessionStorage.setItem(SAVED, JSON.stringify({ edits, stroke, caption, query } satisfies Saved));
      } catch {
        // Private mode: they'll start fresh, which is fine.
      }
    };
    window.addEventListener(BEFORE_SIGN_IN, save);
    return () => window.removeEventListener(BEFORE_SIGN_IN, save);
  }, [edits, stroke, caption, query]);

  // A new search shows its best match in the editor.
  const first = results?.[0];
  const showingResult = results?.some((entry) => entry.collection.id === collection.id && entry.item.id === item.id);
  useEffect(() => {
    if (first && !showingResult) onSelect({ collection: first.collection.id, sticker: first.item.id });
    // Only when the results change, not on every selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Three kinds of sticker. The tab follows the open collection unless an empty tab was chosen.
  const [emptyTab, setEmptyTab] = useState<CategoryId | null>(null);
  const category = emptyTab ?? categoryOf(collection);
  const inCategory = (id: CategoryId) => universe.filter((candidate) => categoryOf(candidate) === id);

  // Saved stickers live in this browser; no account needed.
  const favourites = useFavourites();
  const [showSaved, setShowSaved] = useState(false);
  const savedEntries: Entry[] = useMemo(
    () =>
      favourites.list.flatMap((key) => {
        const [collectionId, itemId] = key.split("/");
        const owner = universe.find((candidate) => candidate.id === collectionId);
        const found = owner?.items.find((candidate) => candidate.id === itemId);
        return owner && found ? [{ collection: owner, item: found }] : [];
      }),
    [favourites.list, universe],
  );
  const [sort, setSort] = useState<"default" | "az">("default");

  // Group filter resets when the collection changes.
  const [groupFor, setGroupFor] = useState({ collection: collection.id, group: "all" });
  const group = groupFor.collection === collection.id ? groupFor.group : "all";
  const mode = results ? "search" : showSaved ? "saved" : emptyTab ? "empty" : "browse";
  const visible: Entry[] = useMemo(() => {
    const list = results ?? (showSaved ? savedEntries : emptyTab ? [] : collection.items.filter((candidate) => group === "all" || candidate.group === group).map((candidate) => ({ collection, item: candidate })));
    return sort === "az" ? [...list].sort((a, b) => a.item.name.localeCompare(b.item.name)) : list;
  }, [results, showSaved, savedEntries, emptyTab, collection, group, sort]);
  const position = Math.max(0, visible.findIndex((entry) => entry.collection.id === collection.id && entry.item.id === item.id));

  // Tiles use the prerendered files until a colour changes, then render live.
  const tiles = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of visible) {
      const base = defaultValues(entry.collection);
      const current = { ...base, ...edits[entry.collection.id] };
      const custom = entry.item.uses.some((use) => current[use] !== base[use]);
      const look = entry.item.image?.variants.find((variant) => variant.id === current.look)?.src;
      map.set(`${entry.collection.id}/${entry.item.id}`, look ?? (custom ? svgDataUri(renderItem(entry.collection, entry.item, current, true)) : stickerSrc(entry.collection, entry.item)));
    }
    return map;
  }, [visible, edits]);

  // Premium stickers show as locked tiles after the free ones. Payments are not open yet.
  const lockedTiles = mode === "browse" ? (collection.locked ?? []).filter((candidate) => group === "all" || candidate.group === group) : [];
  const premium = useRef<HTMLDialogElement>(null);

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
    setShowSaved(false);
    setEmptyTab(null);
    select(next);
  };
  const openSaved = () => {
    setQuery("");
    setShowSaved(true);
  };
  const openCategory = (id: CategoryId) => {
    const first = inCategory(id)[0];
    if (first) {
      // Stay put when the open collection is already in this category.
      browse(categoryOf(collection) === id ? collection : first);
    } else {
      setQuery("");
      setShowSaved(false);
      setEmptyTab(id);
    }
  };
  const random = () => setEdits((previous) => ({ ...previous, [collection.id]: { ...previous[collection.id], ...randomValues(collection, item) } }));
  const itemKey = `${collection.id}/${item.id}`;
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
    onRandom: random,
    saved: favourites.list.includes(itemKey),
    onToggleSaved: () => favourites.toggle(itemKey),
    onStep: step,
    changed,
    stroke,
    onStroke: setStroke,
    caption,
    onCaption: setCaption,
  };

  return (
    <div className={styles.library} style={{ "--accent": collection.accent } as CSSProperties}>
      <div className={styles.tabs} role="group" aria-label="Sticker type">
        {CATEGORIES.map((entry) => {
          const count = inCategory(entry.id).reduce((total, candidate) => total + candidate.items.length, 0);
          return (
            <button key={entry.id} type="button" className={styles.tab} aria-pressed={(mode === "browse" || mode === "empty") && category === entry.id} onClick={() => openCategory(entry.id)}>
              <b className={styles.tabFull}>{entry.name}</b>
              <b className={styles.tabShort} aria-hidden="true">{entry.short}</b>
              <span>{count > 0 ? count : "Soon"}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.tabBlurb}>{CATEGORIES.find((entry) => entry.id === category)!.blurb}</p>

      <div ref={rail} className={styles.rail} role="group" aria-label="Collections">
        <button type="button" className={`${styles.pill} ${styles.savedPill}`} aria-pressed={mode === "saved"} onClick={openSaved}>
          <HeartGlyph size={18} />
          Saved
          <span>{savedEntries.length}</span>
        </button>
        {inCategory(category).map((candidate) => (
          <button key={candidate.id} type="button" className={styles.pill} aria-pressed={mode === "browse" && candidate.id === collection.id} onClick={() => browse(candidate)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG sticker */}
            <img src={stickerSrc(candidate, findItem(candidate, candidate.cover[0]))} alt="" width={28} height={28} loading="lazy" decoding="async" />
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
                <h3 className={styles.collectionTitle}>
                  “{query.trim()}”
                  <button type="button" className={styles.clearSearch} onClick={() => setQuery("")}>
                    <CloseIcon size={14} />
                    Clear
                  </button>
                </h3>
                <p className={styles.collectionText}>
                  {results.length === 0
                    ? "No stickers match that yet. Try one of these:"
                    : `${results.length} sticker${results.length === 1 ? "" : "s"} across ${new Set(results.map((entry) => entry.collection.id)).size} collection${new Set(results.map((entry) => entry.collection.id)).size === 1 ? "" : "s"}.`}
                </p>
              </div>
              <div className={styles.groups} role="group" aria-label="Popular searches">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" className={styles.group} aria-pressed={query.trim().toLowerCase() === suggestion} onClick={() => setQuery(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : mode === "empty" ? (
            <div className={styles.browserHead}>
              <div>
                <h3 className={styles.collectionTitle}>{CATEGORIES.find((entry) => entry.id === category)!.name}</h3>
                <p className={styles.collectionText}>
                  {CATEGORIES.find((entry) => entry.id === category)!.empty} {CATEGORIES.find((entry) => entry.id === category)!.blurb}
                </p>
              </div>
            </div>
          ) : mode === "saved" ? (
            <div className={styles.browserHead}>
              <div>
                <h3 className={styles.collectionTitle}>Saved</h3>
                <p className={styles.collectionText}>
                  {savedEntries.length === 0
                    ? "Nothing saved yet. Open a sticker and tap Save to keep it here."
                    : `${savedEntries.length} sticker${savedEntries.length === 1 ? "" : "s"} saved in this browser. No account needed.`}
                </p>
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

          {visible.length > 1 ? (
            <div className={styles.sortRow}>
              <span>
                {visible.length} sticker{visible.length === 1 ? "" : "s"}
              </span>
              <div role="group" aria-label="Sort">
                <button type="button" className={styles.sort} aria-pressed={sort === "default"} onClick={() => setSort("default")}>
                  {mode === "search" ? "Best match" : mode === "saved" ? "Recently saved" : "Featured"}
                </button>
                <button type="button" className={styles.sort} aria-pressed={sort === "az"} onClick={() => setSort("az")}>
                  A–Z
                </button>
              </div>
            </div>
          ) : null}

          <ul role="list" className={styles.grid} key={`${mode}-${results ? query : showSaved ? "saved" : `${collection.id}-${group}`}-${sort}`} aria-label={mode === "search" ? "Search results" : mode === "saved" ? "Saved stickers" : `${collection.title} stickers`}>
            {visible.map((entry, order) => {
              const selected = entry.collection.id === collection.id && entry.item.id === item.id;
              const title = stickerTitle(entry.collection, entry.item);
              return (
                <li key={`${entry.collection.id}/${entry.item.id}`} style={{ "--i": Math.min(order, 24) } as CSSProperties} className={styles.cell}>
                  <button type="button" className={styles.tile} aria-pressed={selected} aria-label={entry.item.image?.pending ? `${title}, coming soon` : title} data-pending={entry.item.image?.pending ? "" : undefined} onClick={() => openTile(entry)}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- static or generated SVG */}
                    <img src={tiles.get(`${entry.collection.id}/${entry.item.id}`)} alt="" width={160} height={160} loading="lazy" decoding="async" draggable={false} data-animated={entry.item.image?.animated ? "" : undefined} />
                    <span className={styles.tileName}>{mode === "browse" ? entry.item.name : title}</span>
                  </button>
                  {favourites.list.includes(`${entry.collection.id}/${entry.item.id}`) ? <HeartGlyph size={14} className={styles.tileSaved} aria-label="Saved" /> : null}
                </li>
              );
            })}
            {lockedTiles.map((locked) => (
              <li key={`locked-${locked.id}`} className={styles.cell}>
                <button type="button" className={`${styles.tile} ${styles.lockedTile}`} aria-label={`${locked.name}: premium, coming soon`} onClick={() => premium.current?.showModal()}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- blurred teaser */}
                  <img src={locked.image?.src} alt="" width={160} height={160} loading="lazy" decoding="async" draggable={false} />
                  <span className={styles.lockBadge} aria-hidden="true">
                    <LockIcon size={18} />
                  </span>
                  <span className={styles.tileName}>Premium</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.panel} role="region" aria-label="Sticker editor">
          <Editor {...editorProps} variant="panel" />
        </div>
      </div>

      <dialog ref={premium} className={styles.premium} aria-labelledby="premium-title" onClick={(event) => event.target === premium.current && premium.current?.close()}>
        <span className={styles.premiumLock} aria-hidden="true">
          <LockIcon size={26} />
        </span>
        <h3 id="premium-title" className={styles.premiumTitle}>
          Premium is coming soon
        </h3>
        <p className={styles.premiumText}>
          {collection.locked?.length ?? 0} more {collection.title} stickers are being saved for a premium plan. Payments aren&rsquo;t open yet, so there is nothing to buy today. The free stickers are yours to use now.
        </p>
        <button type="button" className={styles.premiumClose} onClick={() => premium.current?.close()}>
          Got it
        </button>
      </dialog>

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
