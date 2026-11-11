import { brandKey } from "@/lib/brand";

/** Sent to the library to run a search. Detail: the query text. */
export const SEARCH_EVENT = brandKey("search");

export function searchLibrary(query: string): void {
  window.dispatchEvent(new CustomEvent<string>(SEARCH_EVENT, { detail: query }));
}
