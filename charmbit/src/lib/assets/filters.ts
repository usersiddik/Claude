import type { Asset } from "./types.ts";

type Filterable = Pick<
  Asset,
  "title" | "slug" | "family" | "subject" | "description" | "tags" | "traits" | "relationship" | "palette" | "status" | "pack"
>;

const available = (asset: Filterable) => asset.status === "available";
const REACTION_TAGS = ["reaction", "celebrate", "onboarding", "welcome", "success", "reward"];

export interface FilterDefinition {
  id: string;
  label: string;
  /** Short label for mobile pills. */
  short: string;
  icon: "all" | "charm" | "mark" | "duo" | "character" | "object" | "ui" | "reaction" | "sticker" | "cat" | "ghost";
  test: (asset: Filterable) => boolean;
}

/**
 * Two tiers: collections (what it is) and use cases (what it's for).
 * Only Duos shows preview assets, so every other view is fully copyable.
 */
export const FILTER_GROUPS = [
  {
    id: "collections",
    label: "Collections",
    filters: [
      { id: "all", label: "All Assets", short: "All", icon: "all", test: available },
      { id: "charms", label: "Charms", short: "Charms", icon: "charm", test: (a) => available(a) && a.family === "charm" && !a.pack },
      { id: "marks", label: "Marks", short: "Marks", icon: "mark", test: (a) => available(a) && a.family === "mark" },
      { id: "duos", label: "Duos", short: "Duos", icon: "duo", test: (a) => a.family === "duo" },
    ],
  },
  {
    id: "packs",
    label: "Sticker packs",
    filters: [
      { id: "stickers", label: "All Stickers", short: "Stickers", icon: "sticker", test: (a) => available(a) && Boolean(a.pack) },
      { id: "miso", label: "Miso the Cat", short: "Miso", icon: "cat", test: (a) => a.pack?.id === "miso" },
      { id: "boo", label: "Boo the Ghost", short: "Boo", icon: "ghost", test: (a) => a.pack?.id === "boo" },
    ],
  },
  {
    id: "use-cases",
    label: "Use cases",
    filters: [
      { id: "characters", label: "Characters & Mascots", short: "Characters", icon: "character", test: (a) => available(a) && a.subject === "character" },
      { id: "objects", label: "Objects & Rewards", short: "Objects", icon: "object", test: (a) => available(a) && a.subject === "object" },
      { id: "ui", label: "UI & Status Marks", short: "UI marks", icon: "ui", test: (a) => available(a) && a.family === "mark" },
      { id: "reactions", label: "Reactions & Celebrations", short: "Reactions", icon: "reaction", test: (a) => available(a) && a.tags.some((tag) => REACTION_TAGS.includes(tag)) },
    ],
  },
] as const satisfies readonly { id: string; label: string; filters: readonly FilterDefinition[] }[];

export const FILTERS: readonly FilterDefinition[] = FILTER_GROUPS.flatMap(
  (group): readonly FilterDefinition[] => group.filters,
);

export type FilterId = (typeof FILTER_GROUPS)[number]["filters"][number]["id"];

export const DEFAULT_FILTER: FilterId = "all";

export function isFilterId(value: string | null | undefined): value is FilterId {
  return FILTERS.some((filter) => filter.id === value);
}

export function findFilter(id: string): FilterDefinition {
  return FILTERS.find((filter) => filter.id === id) ?? FILTERS[0]!;
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
    asset.pack?.colorway,
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
  { query, filter }: { query: string; filter: string },
): T[] {
  const active = findFilter(filter);
  return assets.filter((asset) => active.test(asset) && matchesQuery(asset, query));
}

/** Result counts per filter for the current query — always derived from data. */
export function countByFilter(assets: readonly Filterable[], query: string): Record<FilterId, number> {
  const matching = assets.filter((asset) => matchesQuery(asset, query));
  return Object.fromEntries(
    FILTERS.map((filter) => [filter.id, matching.filter((asset) => filter.test(asset)).length]),
  ) as Record<FilterId, number>;
}
