/**
 * Charmbit asset schema.
 *
 * `AssetMeta` is what you author in `catalog.ts`. The loader joins it with the
 * SVG file at `assets/svg/<family>s/<slug>.svg` to produce a full `Asset`.
 */

export type AssetFamily = "charm" | "mark" | "duo";

/** What the artwork depicts. Used for search and future generators. */
export type AssetSubject = "character" | "object" | "icon" | "pair";

export type AssetStatus = "available" | "comingSoon";

export type ExportFormat = "svg" | "react" | "flutter";

export type PaletteKey =
  | "ink"
  | "cream"
  | "stone"
  | "butter"
  | "lilac"
  | "mint"
  | "coral"
  | "white";

/** Optional character traits — lets future sets vary pose/expression per character. */
export interface AssetTraits {
  character: string;
  pose?: string;
  expression?: string;
}

/** Links Duo assets to the characters they pair, and to their wider set. */
export interface AssetRelationship {
  groupId: string;
  kind: "pair" | "group";
  occasion: string;
  /** Asset ids of the individual characters appearing in this Duo. */
  memberIds: readonly string[];
}

export interface AssetMeta {
  id: string;
  slug: string;
  title: string;
  family: AssetFamily;
  subject: AssetSubject;
  description: string;
  tags: readonly string[];
  /** Colours used in the artwork, in visual order. */
  palette: readonly PaletteKey[];
  traits?: AssetTraits;
  relationship?: AssetRelationship;
  /** Card presentation. `tone` tints the label behind the artwork. */
  preview: { tone: PaletteKey };
  relatedAssetIds: readonly string[];
  /** Formats offered once the asset is available. */
  exports: readonly ExportFormat[];
  status: AssetStatus;
  featured?: boolean;
  isNew?: boolean;
  /** Sticker-pack membership: character pack, colorway, and reaction. */
  pack?: { id: string; colorway: string; reaction: string };
  /** False when the artwork has fixed colorways (packs); the Fill control then doesn't apply. */
  recolorable?: boolean;
}

export interface Asset extends AssetMeta {
  /** 1-based catalogue number, derived from catalogue order. */
  number: number;
  /** Optimised SVG markup (single line, no metadata). */
  sourceSvg: string;
  viewBox: string;
  /** Intrinsic width/height from the viewBox. */
  width: number;
  height: number;
}
