"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { countByFilter, selectAssets } from "@/lib/assets/filters";
import type { Asset } from "@/lib/assets/types";
import { copyText } from "@/lib/clipboard";
import { customizeSvg, DEFAULT_FILL_ID, DEFAULT_INK_ID, findFill, findInk } from "@/lib/customize";
import { buildExport, DEFAULT_FORMAT, FORMATS } from "@/lib/exports";
import { AssetCard } from "./AssetCard";
import { Toolbar } from "./Toolbar";
import { readState, writeSearch, type LibraryState } from "./url-state";
import styles from "./CharmLibrary.module.css";

interface CharmLibraryProps {
  assets: readonly Asset[];
  /** URL params, or null for the static server render. */
  params: { get(name: string): string | null; toString(): string } | null;
}

interface Toast {
  id: number;
  text: string;
  ok: boolean;
}

export function CharmLibrary({ assets, params }: CharmLibraryProps) {
  const [state, setState] = useState<LibraryState>(() => readState(params));
  // URL strings we wrote ourselves, so URL echoes never overwrite fresher typing.
  const [writes, setWrites] = useState<readonly string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const timers = useRef<{ copied?: ReturnType<typeof setTimeout>; toast?: ReturnType<typeof setTimeout> }>({});
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

  useEffect(() => {
    const pending = timers.current;
    return () => {
      clearTimeout(pending.copied);
      clearTimeout(pending.toast);
    };
  }, []);

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
  const format = FORMATS.find((candidate) => candidate.id === state.format) ?? FORMATS[0]!;
  const inkIsCustom = ink.id !== DEFAULT_INK_ID;

  const results = useMemo(
    () => selectAssets(assets, { query: deferredQuery, filter: state.filter }),
    [assets, deferredQuery, state.filter],
  );
  const counts = useMemo(() => countByFilter(assets, deferredQuery), [assets, deferredQuery]);
  const previews = useMemo(
    () => new Map(assets.map((asset) => [asset.id, customizeSvg(asset, fill.hex)])),
    [assets, fill.hex],
  );

  const handleCopy = useCallback(
    async (asset: Asset) => {
      const code = buildExport(asset, format.id, { fill: fill.hex, ink: inkIsCustom ? ink.hex : undefined });
      let ok = true;
      try {
        await copyText(code);
      } catch {
        ok = false;
      }
      clearTimeout(timers.current.copied);
      clearTimeout(timers.current.toast);
      if (ok) setCopiedId(asset.id);
      setToast({
        id: Date.now(),
        ok,
        text: ok ? `${asset.title} copied as ${format.label}` : `Couldn’t copy ${asset.title}. Check clipboard permissions.`,
      });
      timers.current.copied = setTimeout(() => setCopiedId(null), 1600);
      timers.current.toast = setTimeout(() => setToast(null), 2400);
    },
    [format.id, format.label, fill.hex, ink.hex, inkIsCustom],
  );

  const filtered = state.query.trim() !== "" || state.filter !== "all";
  const customized = state.fill !== DEFAULT_FILL_ID || state.ink !== DEFAULT_INK_ID || state.format !== DEFAULT_FORMAT;

  return (
    <>
      <Toolbar
        state={state}
        counts={counts}
        customized={customized}
        onChange={update}
        onReset={() => update({ fill: DEFAULT_FILL_ID, ink: DEFAULT_INK_ID, format: DEFAULT_FORMAT })}
      />

      <div className={styles.summary}>
        <p id="library-result-summary" role="status">
          {filtered ? `${results.length} of ${assets.length} assets` : `${assets.length} assets`}
        </p>
        <p className={styles.hint}>Click any asset to copy it as {format.label}.</p>
      </div>

      {results.length > 0 ? (
        <ul role="list" className={styles.grid}>
          {results.map((asset) => (
            <li key={asset.id}>
              <AssetCard
                asset={asset}
                svg={previews.get(asset.id) ?? asset.sourceSvg}
                ink={ink.hex}
                formatLabel={format.label}
                copied={copiedId === asset.id}
                onCopy={handleCopy}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No matches</p>
          <p>Try another word, like “happy”, “search”, or “coffee”.</p>
          <button type="button" className={styles.emptyButton} onClick={() => update({ query: "", filter: "all" })}>
            Clear search
          </button>
        </div>
      )}

      <div className={styles.toastRegion} role="status" aria-live="polite">
        {toast ? (
          <div key={toast.id} className={styles.toast} data-error={toast.ok ? undefined : ""}>
            {toast.ok ? <CheckIcon size={16} /> : null}
            {toast.text}
          </div>
        ) : null}
      </div>
    </>
  );
}
