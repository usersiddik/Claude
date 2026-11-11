"use client";

import { useCallback, useSyncExternalStore } from "react";
import { brandKey } from "@/lib/brand";

/** Saved stickers, kept in this browser only. Keys are `collection/sticker`. */
const KEY = brandKey("favourites");
const EVENT = brandKey("favourites-changed");
const EMPTY: readonly string[] = [];

let cache: { raw: string | null; list: readonly string[] } = { raw: null, list: EMPTY };

function read(): readonly string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.list;
  let list: readonly string[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) list = parsed.filter((entry): entry is string => typeof entry === "string").slice(0, 500);
  } catch {
    // Unreadable data: start empty.
  }
  cache = { raw, list };
  return list;
}

function subscribe(notify: () => void) {
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(EVENT, notify);
    window.removeEventListener("storage", notify);
  };
}

export function useFavourites() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((key: string) => {
    const current = read();
    const next = current.includes(key) ? current.filter((entry) => entry !== key) : [key, ...current];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode): nothing to save.
      return false;
    }
    window.dispatchEvent(new Event(EVENT));
    return true;
  }, []);
  return { list, toggle };
}
