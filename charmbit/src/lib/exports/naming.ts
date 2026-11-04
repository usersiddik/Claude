import type { AssetFamily } from "../assets/types.ts";

export type ExportFamily = AssetFamily | "sticker";

const FAMILY_SUFFIX: Record<ExportFamily, string> = { charm: "Charm", mark: "Mark", duo: "Duo", sticker: "Sticker" };

function words(value: string): string[] {
  return value.split(/[^a-zA-Z0-9]+/).filter(Boolean);
}

export function pascalCase(value: string): string {
  const result = words(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
  return /^[0-9]/.test(result) ? `Asset${result}` : result;
}

/** e.g. `gold-star` + `charm` → `GoldStarCharm`. Shared by React and Flutter. */
export function componentName(slug: string, family: ExportFamily): string {
  return `${pascalCase(slug)}${FAMILY_SUFFIX[family]}`;
}
