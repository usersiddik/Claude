import type { AssetFamily } from "../assets/types.ts";

const FAMILY_SUFFIX: Record<AssetFamily, string> = { charm: "Charm", mark: "Mark", duo: "Duo" };

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
export function componentName(slug: string, family: AssetFamily): string {
  return `${pascalCase(slug)}${FAMILY_SUFFIX[family]}`;
}
