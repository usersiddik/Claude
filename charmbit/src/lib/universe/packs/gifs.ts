import type { PackDefinition } from "./types.ts";

/**
 * GIFs: drop a `.gif` into `public/packs/gifs/` and it appears. The file name
 * becomes the sticker's name and search words, so name files for what happens
 * in them: `cat-sad.gif`, `cat-drinking-water.gif`.
 *
 * To give a GIF a nicer name, caption or extra search words, list it in
 * `stickers` with the same id as its file name.
 */
export const gifs: PackDefinition = {
  id: "gifs",
  kind: "animated",
  title: "GIFs",
  noun: "GIF",
  tagline: "Little loops for big feelings.",
  description: "Animated stickers. Download one and send it in any chat.",
  families: ["feelings"],
  accent: "#CFE3F5",
  identity: "",
  looks: [{ id: "default", name: "Default", swatch: "#CFE3F5", wardrobe: "" }],
  groups: [],
  cover: [],
  stickers: [],
};
