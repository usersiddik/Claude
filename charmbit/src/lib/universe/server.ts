import { loadAssets } from "../assets/load.ts";
import { buildUniverse, type IconAsset } from "./index.ts";

/** Icon assets trimmed to what the browser needs. */
export function iconAssets(): IconAsset[] {
  return loadAssets().map(({ id, slug, title, description, family, palette, recolorable, sourceSvg }) => ({ id, slug, title, description, family, palette, recolorable, sourceSvg }));
}

let cached: ReturnType<typeof buildUniverse> | undefined;

/** The full universe, built once per server process. */
export function getUniverse() {
  cached ??= buildUniverse(iconAssets());
  return cached;
}
