import { optimizeSvg } from "../assets/svg.ts";
import type { ExportFormat } from "../assets/types.ts";
import { FORMATS } from "../exports/index.ts";
import { drawSticker } from "./draw.ts";
import { findReaction, type StickerSpec } from "./options.ts";

const SPECIES_NAME = { cat: "Cat", ghost: "Ghost" } as const;

export function stickerTitle(spec: StickerSpec): string {
  const reaction = findReaction(spec.reaction);
  return reaction.pair ? `Cat Couple ${reaction.name}` : `${SPECIES_NAME[spec.species]} ${reaction.name}`;
}

export function stickerSlug(spec: StickerSpec): string {
  const reaction = findReaction(spec.reaction);
  return `${reaction.pair ? "cat-couple" : spec.species}-${reaction.id}`;
}

/** Full-fidelity SVG (blur and texture filters included) unless `portable`. */
export function renderSpec(spec: StickerSpec, portable = false): string {
  return drawSticker({ ...spec, portable });
}

/**
 * Code exports reuse the library exporters. Flutter gets the filter-free
 * version because flutter_svg doesn't render SVG filters.
 */
export function exportSpec(spec: StickerSpec, format: ExportFormat): string {
  const definition = FORMATS.find((candidate) => candidate.id === format) ?? FORMATS[0]!;
  return definition.build({
    title: stickerTitle(spec),
    slug: stickerSlug(spec),
    family: "charm",
    sourceSvg: optimizeSvg(renderSpec(spec, format === "flutter")),
  });
}
