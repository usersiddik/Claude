import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadAssets } from "../assets/load.ts";
import { buildArchive, buildUniverse, type IconAsset } from "./index.ts";
import { PACKS, type PackFiles } from "./packs/index.ts";

/** Icon assets trimmed to what the browser needs. */
export function iconAssets(): IconAsset[] {
  return loadAssets().map(({ id, slug, title, description, family, palette, recolorable, sourceSvg }) => ({ id, slug, title, description, family, palette, recolorable, sourceSvg }));
}

/** The image files present in each pack's folder under `public/packs`. */
export function packFiles(): PackFiles {
  return Object.fromEntries(
    PACKS.map((pack) => {
      const folder = join(process.cwd(), "public", "packs", pack.id);
      const images = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((name) => /\.(webp|png|gif)$/.test(name)) : []);
      const thumbs = images(join(folder, "thumbs")).map((name) => `thumbs/${name}`);
      return [pack.id, [...images(folder), ...thumbs].sort()];
    }),
  );
}

let cached: ReturnType<typeof buildUniverse> | undefined;
let archive: ReturnType<typeof buildArchive> | undefined;

/** What visitors see, built once per server process. */
export function getUniverse() {
  cached ??= buildUniverse(iconAssets(), packFiles());
  return cached;
}

/** Every collection drawn in code, shown or not. Keeps their sticker files being generated. */
export function getArchive() {
  archive ??= buildArchive(iconAssets());
  return archive;
}
