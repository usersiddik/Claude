/**
 * The registry. Collections appear on the site in this order; add one by
 * writing a file in `collections/` and listing it here.
 */
import { optimizeSvg } from "../assets/svg.ts";
import type { ExportFormat } from "../assets/types.ts";
import { FORMATS } from "../exports/index.ts";
import { cats, frogs, ghosts, giraffes, rabbits } from "./collections/creatures.ts";
import { diwali } from "./collections/diwali.ts";
import { everyday } from "./collections/everyday.ts";
import { iconsCollection, type IconAsset } from "./collections/icons.ts";
import { love } from "./collections/love.ts";
import { christmas, eid, halloween } from "./collections/soon.ts";
import type { Collection, Family, LiveCollection, Property, StickerItem, Values } from "./types.ts";

export type * from "./types.ts";
export type { IconAsset } from "./collections/icons.ts";
export { colorOf, flagOf } from "./types.ts";

/** Generated collections (everything except the file-based icons). */
export const GENERATED: readonly LiveCollection[] = [love, cats, diwali, ghosts, everyday, frogs, rabbits, giraffes];
export const UPCOMING = [christmas, eid, halloween] as const;

export const FAMILIES: readonly { id: Family | "all"; name: string }[] = [
  { id: "all", name: "All" },
  { id: "characters", name: "Characters" },
  { id: "festivals", name: "Festivals" },
  { id: "feelings", name: "Feelings" },
  { id: "icons", name: "Icons" },
];

/** Every collection, in display order: live first, then what's coming. */
export function buildUniverse(icons: readonly IconAsset[]): Collection[] {
  return [...GENERATED, iconsCollection(icons), ...UPCOMING];
}

export const isLive = (collection: Collection): collection is LiveCollection => collection.status === "live";

export function findItem(collection: LiveCollection, id: string | null | undefined): StickerItem {
  return collection.items.find((item) => item.id === id) ?? collection.items[0]!;
}

export function defaultValues(collection: LiveCollection): Record<string, string | boolean | null> {
  return Object.fromEntries(collection.properties.map((property) => [property.id, property.default]));
}

/** The properties a sticker actually uses, in the collection's order. */
export function propertiesFor(collection: LiveCollection, item: StickerItem): Property[] {
  return collection.properties.filter((property) => item.uses.includes(property.id));
}

/**
 * Random values for the properties a sticker uses: any swatch for a colour,
 * a coin flip for a toggle. `random` is injectable so tests are repeatable.
 */
export function randomValues(collection: LiveCollection, item: StickerItem, random: () => number = Math.random): Record<string, string | boolean | null> {
  return Object.fromEntries(
    propertiesFor(collection, item).map((property) => {
      if (property.kind === "toggle") return [property.id, random() < 0.5];
      const swatch = property.swatches[Math.floor(random() * property.swatches.length)] ?? property.swatches[0];
      return [property.id, swatch ? swatch.hex : property.default];
    }),
  );
}

export function stickerTitle(collection: LiveCollection, item: StickerItem): string {
  return item.name.toLowerCase().startsWith(collection.noun.toLowerCase()) ? item.name : `${collection.noun} ${item.name}`;
}

export function stickerSlug(collection: LiveCollection, item: StickerItem): string {
  const noun = collection.noun.toLowerCase();
  return item.id.startsWith(`${noun}-`) || item.id === noun ? item.id : `${noun}-${item.id}`;
}

export function renderItem(collection: LiveCollection, item: StickerItem, values: Values, portable = false): string {
  return collection.render(item, values, { portable });
}

/** Code for one sticker. Flutter gets the filter-free drawing (flutter_svg skips filters). */
export function exportItem(collection: LiveCollection, item: StickerItem, values: Values, format: ExportFormat): string {
  const definition = FORMATS.find((candidate) => candidate.id === format) ?? FORMATS[0]!;
  return definition.build({
    title: stickerTitle(collection, item),
    slug: stickerSlug(collection, item),
    family: "sticker",
    sourceSvg: optimizeSvg(renderItem(collection, item, values, format === "flutter")),
  });
}

export function countStickers(collections: readonly Collection[]): number {
  return collections.reduce((total, collection) => total + (isLive(collection) ? collection.items.length : 0), 0);
}
