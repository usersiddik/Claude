import { PALETTE } from "./assets/palette.ts";
import type { Asset } from "./assets/types.ts";

/**
 * Colour customisation. Each asset's first palette entry is its main fill,
 * which the Color control can replace. Ink (linework) is the SVG's currentColor.
 */

export interface ColorOption {
  id: string;
  name: string;
  /** null = keep the artwork's original colours. */
  hex: string | null;
}

export const FILL_OPTIONS: readonly ColorOption[] = [
  { id: "original", name: "Original", hex: null },
  { id: "butter", name: "Butter", hex: "#F6D673" },
  { id: "coral", name: "Coral", hex: "#F4A28C" },
  { id: "rose", name: "Rose", hex: "#F2B5C7" },
  { id: "lilac", name: "Lilac", hex: "#BDB0E3" },
  { id: "sky", name: "Sky", hex: "#B4D2F0" },
  { id: "mint", name: "Mint", hex: "#BFE6D2" },
  { id: "stone", name: "Stone", hex: "#E6DCCB" },
];

export const INK_OPTIONS: readonly (ColorOption & { hex: string })[] = [
  { id: "ink", name: "Ink", hex: PALETTE.ink.hex },
  { id: "indigo", name: "Indigo", hex: "#2B3576" },
  { id: "aubergine", name: "Aubergine", hex: "#4E2A4F" },
  { id: "pine", name: "Pine", hex: "#1F4A3D" },
];

export const DEFAULT_FILL_ID = "original";
export const DEFAULT_INK_ID = "ink";

export function findFill(id: string | null | undefined): ColorOption {
  return FILL_OPTIONS.find((option) => option.id === id) ?? FILL_OPTIONS[0]!;
}

export function findInk(id: string | null | undefined): ColorOption & { hex: string } {
  return INK_OPTIONS.find((option) => option.id === id) ?? INK_OPTIONS[0]!;
}

/** The recolourable main fill of an asset. */
export function primaryFill(asset: Pick<Asset, "palette">): string {
  const key = asset.palette[0];
  return key ? PALETTE[key].hex : PALETTE.ink.hex;
}

/** Replaces every `fill="<from>"` with `fill="<to>"` (case-insensitive). */
export function applyFill(svg: string, from: string, to: string | null): string {
  if (!to || to.toLowerCase() === from.toLowerCase()) return svg;
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return svg.replace(new RegExp(`fill="${escaped}"`, "gi"), `fill="${to}"`);
}

/** Returns the asset's SVG with the chosen main fill applied. */
export function customizeSvg(asset: Pick<Asset, "palette" | "sourceSvg">, fill: string | null): string {
  return applyFill(asset.sourceSvg, primaryFill(asset), fill);
}
