import type { LiveCollection, StickerItem, StickerVariant } from "../types.ts";
import { gifs } from "./gifs.ts";
import { sheru } from "./sheru.ts";
import type { PackDefinition, PackLook, PackSticker } from "./types.ts";

export type { PackDefinition, PackLook, PackSticker } from "./types.ts";

/** Image packs, in display order. Add a character by adding its definition here. */
export const PACKS: readonly PackDefinition[] = [sheru, gifs];

/** File names found in each pack's folder, keyed by pack id. Plain data, safe to send to the browser. */
export type PackFiles = Readonly<Record<string, readonly string[]>>;

const EXTENSIONS = ["webp", "png"] as const;

export const packPath = (packId: string, file: string) => `/packs/${packId}/${file}`;

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
  for (const sticker of definition.stickers) {
    const found = definition.looks.flatMap((look, index) => {
      const file = fileFor(files, sticker.id, look, index === 0);
      return file ? [{ id: look.id, name: look.name, swatch: look.swatch, src: packPath(definition.id, file) } satisfies StickerVariant] : [];
    });
    const main = found.find((variant) => variant.id === definition.looks[0]?.id);
    if (!main) continue;
    items.push({
      id: sticker.id,
      name: sticker.name,
      caption: sticker.caption,
      group: sticker.group,
      tags: sticker.tags,
      uses: [],
      image: { src: main.src, variants: found.length > 1 ? found : [] },
    });
  }
  if (items.length === 0) return null;
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

/** The first prompt to run: the master image every later sticker is matched against. */
export function masterPrompt(definition: PackDefinition): string {
  const look = definition.looks[0]!;
  return [
    `Design an original character: ${definition.identity}`,
    `Outfit: ${look.wardrobe}.`,
    "Show him standing, facing the camera, full body, arms relaxed, neutral confident expression.",
    "Style: polished, natural-looking premium 3D character render with detailed, realistic fur and soft studio lighting from the upper left.",
    "Background: one flat, solid, bright green colour (#00B140) with no gradient, no floor, no scenery.",
    "Do not add any text, letters, logos, watermarks, borders or decorations.",
  ].join("\n");
}

/** The full prompt for one sticker in one look. Paste it with the master image attached. */
export function stickerPrompt(definition: PackDefinition, sticker: PackSticker, look: PackLook = definition.looks[0]!): string {
  return [
    `Using the attached master image of ${definition.title} for his face, mane and build, create one sticker of the same character: ${definition.identity}`,
    `Outfit: ${look.wardrobe}.`,
    `Pose and expression: ${sticker.scene}.`,
    "Style: polished, natural-looking premium 3D character render with detailed, realistic fur and soft studio lighting from the upper left. Keep his face, eye colour, nose, ear notch, mane shape and body proportions exactly the same as the master image.",
    "Framing: the whole character fits inside a square frame with a little empty space on every side, nothing cropped.",
    "Background: one flat, solid, bright green colour (#00B140) with no gradient, no floor, no shadow on the background, no scenery.",
    "Do not add any text, letters, logos, watermarks, borders, sparkles or extra decorations.",
  ].join("\n");
}
