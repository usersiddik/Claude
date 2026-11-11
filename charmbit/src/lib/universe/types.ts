/**
 * The sticker universe schema. A collection is data (title, story, groups,
 * properties, items) plus one `render` function that turns an item and the
 * visitor's property values into SVG. The UI only ever reads this shape, so a
 * new collection is one new file and one line in the registry.
 */

export interface Swatch {
  id: string;
  name: string;
  /** null keeps the artwork's original colours. */
  hex: string | null;
}

interface PropertyBase {
  id: string;
  label: string;
}

export interface ColorProperty extends PropertyBase {
  kind: "color";
  swatches: readonly Swatch[];
  default: string | null;
  /** Offer a free colour picker after the swatches. */
  custom?: boolean;
}

export interface ToggleProperty extends PropertyBase {
  kind: "toggle";
  default: boolean;
}

export type Property = ColorProperty | ToggleProperty;

export type Value = string | boolean | null;
export type Values = Readonly<Record<string, Value>>;

export interface StickerItem {
  /** Unique within its collection; kebab-case. */
  id: string;
  name: string;
  /** A short line shown with the sticker. */
  caption: string;
  /** Group id within the collection. */
  group: string;
  /** Property ids that change this sticker. Others are hidden while it's selected. */
  uses: readonly string[];
  /** Extra search words, space separated. */
  tags?: string;
  /** Set for stickers that are image files rather than drawings made in code. */
  image?: StickerImage;
  /** Premium and not yet available: shown blurred with a lock, never opened in the editor. */
  locked?: boolean;
}

/** One look of an image sticker, e.g. an outfit. */
export interface StickerVariant {
  id: string;
  name: string;
  /** Dot colour for the picker. */
  swatch: string;
  src: string;
}

export interface StickerImage {
  /** The default file, e.g. `/packs/sheru/coffee.webp`. */
  src: string;
  /** Looks that have a file for this sticker, default first. Empty when there is only one. */
  variants: readonly StickerVariant[];
  /** True for GIFs: shown and downloaded as they are, never redrawn. */
  animated?: boolean;
}

export type Family = "characters" | "festivals" | "feelings" | "icons";

export interface CollectionBase {
  id: string;
  title: string;
  /** Singular noun used in file and component names, e.g. "Cat". */
  noun: string;
  /** One-line hook for cards. */
  tagline: string;
  description: string;
  /** Discovery filters this collection appears under. */
  families: readonly Family[];
  /** Card tint. */
  accent: string;
}

export interface LiveCollection extends CollectionBase {
  status: "live";
  groups: readonly { id: string; name: string }[];
  properties: readonly Property[];
  items: readonly StickerItem[];
  /** Item ids shown on the collection card, front first. */
  cover: readonly string[];
  render: (item: StickerItem, values: Values, options?: { portable?: boolean }) => string;
  /**
   * How the stickers are made. "vector" (the default) is drawn in code and can be
   * recoloured; "image" is a still image file; "animated" is a GIF.
   */
  media?: "vector" | "image" | "animated";
  /**
   * Premium stickers, shown as locked tiles after `items`. Kept apart so counts,
   * search, covers and the editor only ever deal with stickers people can use.
   */
  locked?: readonly StickerItem[];
}

export interface SoonCollection extends CollectionBase {
  status: "soon";
  /** e.g. "December". */
  arrives: string;
  /** Finished preview stickers for the card. */
  preview: () => readonly string[];
}

export type Collection = LiveCollection | SoonCollection;

/* Categories ---------------------------------------------------------------------- */

/** The three kinds of sticker on the site, in display order. */
export const CATEGORIES = [
  { id: "whatsapp", name: "WhatsApp stickers", short: "WhatsApp", blurb: "High-quality stickers, ready to copy into a chat. With or without a white outline.", empty: "The first WhatsApp stickers are on their way." },
  { id: "colour", name: "Colour stickers", short: "Colour", blurb: "Stickers you can recolour: fur, eyes, outfits and more.", empty: "No colour stickers yet." },
  { id: "gif", name: "GIFs", short: "GIFs", blurb: "Animated stickers to download and send.", empty: "The first GIFs are on their way." },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const categoryOf = (collection: { media?: "vector" | "image" | "animated" }): CategoryId => (collection.media === "image" ? "whatsapp" : collection.media === "animated" ? "gif" : "colour");

/* Value helpers ------------------------------------------------------------------ */

export const colorOf = (values: Values, id: string, fallback: string): string => {
  const value = values[id];
  return typeof value === "string" ? value : fallback;
};

export const flagOf = (values: Values, id: string, fallback: boolean): boolean => {
  const value = values[id];
  return typeof value === "boolean" ? value : fallback;
};
