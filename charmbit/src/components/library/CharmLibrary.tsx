"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { countByFilter, selectAssets, type FilterId } from "@/lib/assets/filters";
import type { Asset } from "@/lib/assets/types";
import { AssetCard } from "./AssetCard";
import { AssetDrawer } from "./AssetDrawer";
import { Discovery } from "./Discovery";
import { readState, writeSearch, type LibraryState } from "./url-state";
import styles from "./CharmLibrary.module.css";

interface CharmLibraryProps {
  assets: readonly Asset[];
  /** URL params, or null for the static server render. */
  params: { get(name: string): string | null; toString(): string } | null;
}

export function CharmLibrary({ assets, params }: CharmLibraryProps) {
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

  const results = useMemo(
    () => selectAssets(assets, { query: deferredQuery, filter: state.filter }),
    [assets, deferredQuery, state.filter],
  );
  const counts = useMemo(() => countByFilter(assets, deferredQuery), [assets, deferredQuery]);
  const featured = useMemo(() => assets.filter((asset) => asset.featured), [assets]);
  const selected = useMemo(() => assets.find((asset) => asset.slug === state.asset) ?? null, [assets, state.asset]);
  const browsing = state.query.trim() === "" && state.filter === "all";

  const open = (asset: Asset) => update({ asset: asset.slug });
  const close = () => update({ asset: null });
  const clear = () => update({ query: "", filter: "all" });

  return (
    <>
      <Discovery
        query={state.query}
        filter={state.filter}
        counts={counts}
        resultCount={results.length}
        total={assets.length}
        onQueryChange={(query) => update({ query })}
        onFilterChange={(filter: FilterId) => update({ filter })}
        onClear={clear}
      />

      {browsing && featured.length > 0 ? (
        <section className={styles.featured} aria-labelledby="featured-title">
          <div className={styles.subhead}>
            <h3 id="featured-title" className={styles.subtitle}>
              Fresh from the shelf
            </h3>
            <p className={styles.subnote}>Hand-picked favourites from the current set.</p>
          </div>
          <div className={styles.shelfWrap}>
            <ul role="list" className={styles.shelf}>
              {featured.map((asset) => (
                <li key={asset.id} className={styles.shelfItem}>
                  <AssetCard asset={asset} onOpen={open} headingLevel="h4" />
                </li>
              ))}
            </ul>
            <div className={styles.ledge} aria-hidden="true" />
          </div>
        </section>
      ) : null}

      <section className={styles.all} aria-labelledby="all-title">
        <div className={styles.subhead}>
          <h3 id="all-title" className={styles.subtitle}>
            {browsing ? "Everything on the shelf" : "Results"}
          </h3>
        </div>
        {results.length > 0 ? (
          <ul role="list" className={styles.grid}>
            {results.map((asset) => (
              <li key={asset.id}>
                <AssetCard asset={asset} onOpen={open} headingLevel="h4" />
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Nothing on this shelf yet.</p>
            <p>Try a different word, like “happy”, “search”, or “coffee”.</p>
            <button type="button" className={styles.emptyButton} onClick={clear}>
              Clear search and filters
            </button>
          </div>
        )}
      </section>

      <AssetDrawer asset={selected} assets={assets} onClose={close} onSelect={open} />
    </>
  );
}
