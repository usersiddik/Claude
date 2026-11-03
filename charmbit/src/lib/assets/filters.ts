import type { Asset } from "./types.ts";

type Filterable = Pick<
  Asset,
  "title" | "slug" | "family" | "subject" | "description" | "tags" | "traits" | "relationship" | "palette" | "isNew"
>;

export const FILTERS = [
  { id: "all", label: "All", test: () => true },
  { id: "charms", label: "Charms", test: (asset: Filterable) => asset.family === "charm" },
  { id: "marks", label: "Marks", test: (asset: Filterable) => asset.family === "mark" },
  { id: "duos", label: "Duos", test: (asset: Filterable) => asset.family === "duo" },
  { id: "reactions", label: "Reactions", test: (asset: Filterable) => asset.tags.includes("reaction") },
  { id: "new", label: "New", test: (asset: Filterable) => Boolean(asset.isNew) },
] as const;

export type FilterId = (typeof FILTERS)[number]["id"];

export const DEFAULT_FILTER: FilterId = "all";

export function isFilterId(value: string | null | undefined): value is FilterId {
  return FILTERS.some((filter) => filter.id === value);
}

export function normalizeQuery(query: string): string[] {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean);
}

function haystack(asset: Filterable): string {
  return [
    asset.title,
    asset.slug,
    asset.family,
    asset.subject,
    asset.description,
    ...asset.tags,
    ...asset.palette,
    asset.traits?.character,
    asset.traits?.pose,
    asset.traits?.expression,
    asset.relationship?.occasion,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Every word in the query must appear somewhere in the asset's searchable text. */
export function matchesQuery(asset: Filterable, query: string): boolean {
  const terms = normalizeQuery(query);
  if (terms.length === 0) return true;
  const text = haystack(asset);
  return terms.every((term) => text.includes(term));
}

export function selectAssets<T extends Filterable>(
  assets: readonly T[],
  { query, filter }: { query: string; filter: FilterId },
): T[] {
  const active = FILTERS.find((candidate) => candidate.id === filter) ?? FILTERS[0];
  return assets.filter((asset) => active.test(asset) && matchesQuery(asset, query));
}

/** Result counts per filter for the current query — always derived from data. */
export function countByFilter(assets: readonly Filterable[], query: string): Record<FilterId, number> {
  const matching = assets.filter((asset) => matchesQuery(asset, query));
  return Object.fromEntries(
    FILTERS.map((filter) => [filter.id, matching.filter((asset) => filter.test(asset)).length]),
  ) as Record<FilterId, number>;
}
