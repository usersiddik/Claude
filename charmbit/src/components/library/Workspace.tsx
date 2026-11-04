"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { countByFilter, findFilter, selectAssets } from "@/lib/assets/filters";
import type { Asset } from "@/lib/assets/types";
import { customizeSvg, findFill, findInk } from "@/lib/customize";
import { findPack } from "@/lib/assets/packs";
import { AssetCard } from "./AssetCard";
import { CategoryNav } from "./CategoryNav";
import { ControlBar } from "./ControlBar";
import { copyAsset } from "./copy";
import { Inspector } from "./Inspector";
import { outputLabel } from "./options";
import { readState, writeSearch, type LibraryState } from "./url-state";
import styles from "./Workspace.module.css";

interface WorkspaceProps {
  assets: readonly Asset[];
  /** URL params, or null for the static server render. */
  params: { get(name: string): string | null; toString(): string } | null;
}

const PACK_VIEWS = new Set(["stickers", "miso", "boo"]);

/** Pack views read as a matrix: one row per colorway, one card per reaction. */
function groupByColorway(items: Asset[]) {
  const groups = new Map<string, { key: string; title: string; swatch: string; items: Asset[] }>();
  for (const asset of items) {
    const pack = findPack(asset.pack?.id);
    const colorway = pack?.colorways.find((item) => item.id === asset.pack?.colorway);
    if (!pack || !colorway) continue;
    const key = `${pack.id}-${colorway.id}`;
    const group = groups.get(key) ?? { key, title: `${pack.name} · ${colorway.name}`, swatch: colorway.swatch, items: [] };
    group.items.push(asset);
    groups.set(key, group);
  }
  return [...groups.values()];
}

export function Workspace({ assets, params }: WorkspaceProps) {
  const [state, setState] = useState<LibraryState>(() => readState(params));
  // URL strings we wrote ourselves, so URL echoes never overwrite fresher typing.
  const [writes, setWrites] = useState<readonly string[]>([]);
  const deferredQuery = useDeferredValue(state.query);

  // Follow external URL changes (header links, back/forward) without an effect.
  const paramString = params?.toString() ?? null;
  const [seenParams, setSeenParams] = useState(paramString);
  if (paramString !== seenParams) {
    setSeenParams(paramString);
    const echo = paramString === null ? -1 : writes.indexOf(paramString);
    if (echo >= 0) {
      setWrites(writes.slice(echo + 1));
    } else if (paramString !== null) {
      setWrites([]);
      setState(readState(new URLSearchParams(paramString)));
    }
  }

  function update(patch: Partial<LibraryState>) {
    const next = { ...state, ...patch };
    setState(next);
    const search = writeSearch(window.location.search, next);
    if (search === window.location.search) return;
    setWrites((previous) => [...previous.slice(-24), search.replace(/^\?/, "")]);
    window.history.replaceState(null, "", `${window.location.pathname}${search}${window.location.hash}`);
  }

  const fill = findFill(state.fill);
  const ink = findInk(state.ink);
  const label = outputLabel(state.format);
  const copyLabel = state.format === "sticker" ? "Copy sticker" : `Copy ${label}`;
  const colors = useMemo(() => ({ fill: fill.hex, ink: ink.hex }), [fill.hex, ink.hex]);

  const results = useMemo(
    () => selectAssets(assets, { query: deferredQuery, filter: state.filter }),
    [assets, deferredQuery, state.filter],
  );
  const counts = useMemo(() => countByFilter(assets, deferredQuery), [assets, deferredQuery]);
  const previews = useMemo(
    () => new Map(assets.map((asset) => [asset.id, customizeSvg(asset, fill.hex)])),
    [assets, fill.hex],
  );
  const selected = assets.find((asset) => asset.slug === state.asset) ?? null;

  const handleCopy = useCallback(
    (asset: Asset) => void copyAsset(asset, state.format, colors, state.border),
    [state.format, colors, state.border],
  );
  // `update` closes over the latest state; cards only need a stable reference per render.
  const handleOpen = (asset: Asset) => update({ asset: asset.slug });

  const active = findFilter(state.filter);
  const groups = PACK_VIEWS.has(state.filter) ? groupByColorway(results) : [{ key: "all", title: "", swatch: "", items: results }];
  const renderCard = (asset: Asset) => (
    <li key={asset.id}>
      <AssetCard
        asset={asset}
        svg={previews.get(asset.id) ?? asset.sourceSvg}
        ink={ink.hex}
        copyLabel={copyLabel}
        formatLabel={label}
        onOpen={handleOpen}
        onCopy={handleCopy}
      />
    </li>
  );
  const searching = state.query.trim() !== "";

  return (
    <>
      <ControlBar state={state} onChange={update} />

      <div className={styles.layout} data-canvas={state.canvas}>
        <div className={styles.sidebar}>
          <CategoryNav value={state.filter} counts={counts} onChange={(filter) => update({ filter })} />
        </div>

        <div className={styles.main}>
          <div className={styles.summary}>
            <h3 className={styles.heading}>{active.label}</h3>
            <p id="library-result-summary" role="status" className={styles.count}>
              {results.length} {results.length === 1 ? "asset" : "assets"}
              {searching ? ` for “${state.query.trim()}”` : ""}
            </p>
          </div>

          {PACK_VIEWS.has(state.filter) && state.format === "sticker" ? (
            <p className={styles.notice}>
              Stickers copy as transparent 512 × 512 images. Paste them into WhatsApp, iMessage, Telegram, or Slack.
            </p>
          ) : null}

          {state.filter === "duos" ? (
            <p className={styles.notice}>Duos are in preview. You can inspect them now; code arrives when the set ships.</p>
          ) : null}

          {results.length > 0 ? (
            groups.length === 1 && !groups[0]!.title ? (
              <ul role="list" className={styles.grid}>
                {results.map(renderCard)}
              </ul>
            ) : (
              <div className={styles.groups}>
                {groups.map((group) => (
                  <section key={group.key} aria-labelledby={`group-${group.key}`}>
                    <h4 id={`group-${group.key}`} className={styles.groupTitle}>
                      <span className={styles.groupSwatch} style={{ background: group.swatch }} aria-hidden="true" />
                      {group.title}
                    </h4>
                    <ul role="list" className={styles.grid}>
                      {group.items.map(renderCard)}
                    </ul>
                  </section>
                ))}
              </div>
            )
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No results</p>
              <p>Try “happy”, “coffee”, or “weather”.</p>
              <button type="button" className={styles.emptyButton} onClick={() => update({ query: "", filter: "all" })}>
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      <Inspector
        asset={selected}
        state={state}
        colors={colors}
        onChange={update}
        onClose={() => update({ asset: null })}
        onCopy={handleCopy}
      />
    </>
  );
}
