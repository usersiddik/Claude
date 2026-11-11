import type { Asset } from "../../assets/types.ts";
import { customizeSvg } from "../../customize.ts";
import { FILLS, INKS } from "../swatches.ts";
import { colorOf, type LiveCollection } from "../types.ts";

/** What the icon collection needs from each asset (safe to pass to the browser). */
export type IconAsset = Pick<Asset, "id" | "slug" | "title" | "description" | "family" | "palette" | "recolorable" | "sourceSvg">;

/** The original flat charms and UI marks, recolourable, with ink control. */
export function iconsCollection(assets: readonly IconAsset[]): LiveCollection {
  return {
    status: "live",
    id: "icons",
    title: "Charms & Icons",
    noun: "Charm",
    tagline: "Flat, crisp, recolourable.",
    description: "The original set: flat charms and UI marks with an ink line that follows your text colour.",
    families: ["icons"],
    accent: "#ECEAE6",
    groups: [
      { id: "charm", name: "Charms" },
      { id: "mark", name: "Marks" },
    ],
    properties: [
      { id: "fill", kind: "color", label: "Colour", swatches: FILLS, default: null },
      { id: "ink", kind: "color", label: "Ink", swatches: INKS, default: null },
    ],
    items: assets.map((asset) => ({ id: asset.slug, name: asset.title, caption: asset.description, group: asset.family, uses: asset.recolorable === false ? ["ink"] : ["fill", "ink"] })),
    cover: ["mochi", "gold-star", "wisp"],
    render: (item, values) => {
      const asset = assets.find((candidate) => candidate.slug === item.id) ?? assets[0];
      if (!asset) return "";
      const fill = values.fill;
      const svg = customizeSvg(asset, typeof fill === "string" ? fill : null);
      // In a standalone image, currentColor has nothing to inherit: write the ink in.
      return svg.replace(/currentColor/g, colorOf(values, "ink", "#1D1D1F"));
    },
  };
}
