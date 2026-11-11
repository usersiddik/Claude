import type { Family } from "../types.ts";

/**
 * An image pack: a character whose stickers are image files (PNG or WebP with
 * a transparent background) in `public/packs/<id>/`. The definition lists
 * every planned sticker; one appears on the site as soon as its file exists.
 *
 * File names: `<sticker>.webp` for the default look, `<sticker>.<look>.webp`
 * for another look, e.g. `coffee.webp` and `coffee.black.webp`.
 */
export interface PackSticker {
  id: string;
  name: string;
  caption: string;
  group: string;
  /** Extra search words, space separated. */
  tags: string;
  /** What to ask the image generator for: pose, expression, props. */
  scene: string;
}

export interface PackLook {
  id: string;
  name: string;
  swatch: string;
  /** How the image prompt describes this look. */
  wardrobe: string;
}

export interface PackDefinition {
  id: string;
  title: string;
  noun: string;
  tagline: string;
  description: string;
  families: readonly Family[];
  accent: string;
  /** The character sheet: what must stay the same in every sticker. */
  identity: string;
  /** Looks, default first. The default look's files have no suffix. */
  looks: readonly PackLook[];
  groups: readonly { id: string; name: string }[];
  stickers: readonly PackSticker[];
  /** Sticker ids for the collection card, front first. */
  cover: readonly string[];
}
