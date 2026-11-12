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
  /** Planned for the premium plan. Only locked while the pack's `lockPremium` is on. */
  premium?: boolean;
}

export interface PackLook {
  id: string;
  name: string;
  swatch: string;
  /** How the image prompt describes this look. Leave empty for a character with no outfit. */
  wardrobe: string;
}

/** How a pack's image prompts are worded. Anything left out falls back to the defaults in `stickerPrompt`. */
export interface PackPromptStyle {
  /** Opens the prompt, before the identity, e.g. "Waist-up sticker portrait of". */
  framing: string;
  /** "He" or "She", for the outfit line. */
  pronoun: string;
  /** The instruction that pins the character to the reference image. */
  keep: string;
  /** Render style, lighting and framing. */
  style: string;
  /** What to reject when checking a result, e.g. "his face, mane or outfit". */
  drift: string;
}

export interface PackDefinition {
  id: string;
  /**
   * "image" packs list their stickers below and use PNG or WebP files.
   * "animated" packs are GIFs: every `.gif` in the folder becomes a sticker,
   * named after its file (`cat-sad.gif` is "Cat sad"), so adding one needs no code.
   */
  kind: "image" | "animated";
  title: string;
  noun: string;
  tagline: string;
  description: string;
  families: readonly Family[];
  accent: string;
  /** The character sheet: what must stay the same in every sticker. */
  identity: string;
  /** Wording for this character's prompts. Sheru's wording is the default. */
  prompt?: Partial<PackPromptStyle>;
  /** Looks, default first. The default look's files have no suffix. */
  looks: readonly PackLook[];
  groups: readonly { id: string; name: string }[];
  stickers: readonly PackSticker[];
  /**
   * Show `premium` stickers as blurred, locked tiles. Off for now: every
   * sticker is free and appears as soon as its file exists.
   */
  lockPremium?: boolean;
  /** Sticker ids for the collection card, front first. */
  cover: readonly string[];
}
