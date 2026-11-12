import type { LiveCollection, StickerItem, StickerVariant } from "../types.ts";
import { gifs } from "./gifs.ts";
import { lumi } from "./lumi.ts";
import { sheru } from "./sheru.ts";
import type { PackDefinition, PackLook, PackPromptStyle, PackSticker } from "./types.ts";

export type { PackDefinition, PackLook, PackPromptStyle, PackSticker } from "./types.ts";

/** Image packs, in display order. Add a character by adding its definition here. */
export const PACKS: readonly PackDefinition[] = [sheru, lumi, gifs];

/**
 * File names found in each pack's folder, keyed by pack id; thumbnails are
 * listed as `thumbs/<name>.webp`. Plain data, safe to send to the browser.
 */
export type PackFiles = Readonly<Record<string, readonly string[]>>;

const EXTENSIONS = ["webp", "png"] as const;

/** Shown for stickers whose artwork has not been added yet. */
export const PLACEHOLDER = "/packs/placeholder.svg";

export const packPath = (packId: string, file: string) => `/packs/${packId}/${file}`;

/** The thumbnail listed for a pack file, if there is one. */
function thumbFor(files: ReadonlySet<string>, packId: string, file: string): string | undefined {
  const name = `thumbs/${file.replace(/\.[a-z0-9]+$/, "")}.webp`;
  return files.has(name) ? packPath(packId, name) : undefined;
}

/** The file for a sticker in a look, if present. The default look has no suffix. */
function fileFor(files: ReadonlySet<string>, stickerId: string, look: PackLook, isDefault: boolean): string | undefined {
  const base = isDefault ? stickerId : `${stickerId}.${look.id}`;
  return EXTENSIONS.map((extension) => `${base}.${extension}`).find((name) => files.has(name));
}

/**
 * Turns a pack definition and the files that exist into a collection. Only
 * stickers with a file for the default look are included, so a pack can be
 * published a few stickers at a time. Returns null while it has none.
 */
export function buildPack(definition: PackDefinition, fileNames: readonly string[]): LiveCollection | null {
  if (definition.kind === "animated") return buildAnimatedPack(definition, fileNames);
  const files = new Set(fileNames);
  const items: StickerItem[] = [];
  const premium: { sticker: PackSticker; src?: string }[] = [];
  for (const sticker of definition.stickers) {
    const found = definition.looks.flatMap((look, index) => {
      const file = fileFor(files, sticker.id, look, index === 0);
      return file ? [{ id: look.id, name: look.name, swatch: look.swatch, src: packPath(definition.id, file), thumb: thumbFor(files, definition.id, file) } satisfies StickerVariant] : [];
    });
    const main = found.find((variant) => variant.id === definition.looks[0]?.id);
    if (sticker.premium && definition.lockPremium) {
      premium.push({ sticker, src: main?.thumb ?? main?.src });
      continue;
    }
    // No file yet: still listed, as a "Coming soon" tile, so the full set is visible.
    items.push({
      id: sticker.id,
      name: sticker.name,
      caption: sticker.caption,
      group: sticker.group,
      tags: sticker.tags,
      uses: [],
      image: main
        ? { src: main.src, thumb: main.thumb, variants: found.length > 1 ? found : [] }
        : { src: PLACEHOLDER, variants: [], pending: true },
    });
  }
  if (items.length === 0) return null;
  const ready = items.filter((item) => !item.image?.pending);
  const present = new Set(items.map((item) => item.id));
  const cover = definition.cover.filter((id) => present.has(id));
  return {
    status: "live",
    media: "image",
    id: definition.id,
    title: definition.title,
    noun: definition.noun,
    tagline: definition.tagline,
    description: definition.description,
    families: definition.families,
    accent: definition.accent,
    groups: definition.groups.filter((group) => items.some((item) => item.group === group.id)),
    properties: [],
    items,
    cover: cover.length > 0 ? cover : items.slice(0, 3).map((item) => item.id),
    // A locked tile is only ever seen blurred, so one without its own art yet borrows a free sticker's.
    locked: premium.map(({ sticker, src }, index) => ({
      id: sticker.id,
      name: sticker.name,
      caption: sticker.caption,
      group: sticker.group,
      uses: [],
      locked: true,
      image: { src: src ?? (ready[index % ready.length]?.image?.thumb ?? ready[index % ready.length]?.image?.src ?? PLACEHOLDER), variants: [] },
    })),
    // Image stickers are files; this wrapper exists only to satisfy code that expects SVG.
    render: (item) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image href="${item.image?.src ?? ""}" width="512" height="512"/></svg>`,
  };
}

const sentence = (words: string) => words.charAt(0).toUpperCase() + words.slice(1);

/** A GIF pack: one sticker per `.gif` file, described by its file name unless the definition says more. */
function buildAnimatedPack(definition: PackDefinition, fileNames: readonly string[]): LiveCollection | null {
  const items: StickerItem[] = fileNames
    .filter((name) => /^[a-z0-9]+(-[a-z0-9]+)*\.gif$/.test(name))
    .sort()
    .map((name) => {
      const id = name.replace(/\.gif$/, "");
      const words = id.replace(/-/g, " ");
      const listed = definition.stickers.find((sticker) => sticker.id === id);
      return {
        id,
        name: listed?.name ?? sentence(words),
        caption: listed?.caption ?? sentence(words),
        group: listed?.group ?? "all",
        tags: `${words} gif animated ${listed?.tags ?? ""}`,
        uses: [],
        image: { src: packPath(definition.id, name), variants: [], animated: true },
      };
    });
  if (items.length === 0) return null;
  return {
    status: "live",
    media: "animated",
    id: definition.id,
    title: definition.title,
    noun: definition.noun,
    tagline: definition.tagline,
    description: definition.description,
    families: definition.families,
    accent: definition.accent,
    groups: definition.groups.filter((group) => items.some((item) => item.group === group.id)),
    properties: [],
    items,
    cover: items.slice(0, 3).map((item) => item.id),
    render: (item) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image href="${item.image?.src ?? ""}" width="512" height="512"/></svg>`,
  };
}

export function buildPacks(files: PackFiles): LiveCollection[] {
  return PACKS.flatMap((definition) => buildPack(definition, files[definition.id] ?? []) ?? []);
}

const DEFAULT_PROMPT: PackPromptStyle = {
  framing: "Waist-up sticker portrait of",
  pronoun: "He",
  keep: "Keep his face, mane, fur, chain and watch exactly the same as the attached reference image.",
  style: "Photorealistic 3D render style, crisp studio lighting, centered framing with a little empty space on every side.",
  drift: "his face, mane or outfit",
};

export const promptStyle = (definition: PackDefinition): PackPromptStyle => ({ ...DEFAULT_PROMPT, ...definition.prompt });

/** The prompt for one sticker in one look. Attach the reference image of the character when you run it. */
export function stickerPrompt(definition: PackDefinition, sticker: PackSticker, look: PackLook = definition.looks[0]!): string {
  const style = promptStyle(definition);
  return [
    `${style.framing} ${definition.identity}`,
    ...(look.wardrobe ? [`${style.pronoun} is wearing ${look.wardrobe}.`] : []),
    `Action and expression: ${sticker.scene}.`,
    style.keep,
    style.style,
    "Isolated on a flat solid neutral grey background (#808080). No white sticker border or outline, no drop shadow, no background clutter, no extra text, no watermark.",
  ].join("\n");
}
