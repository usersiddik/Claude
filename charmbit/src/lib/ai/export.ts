import { optimizeSvg } from "../assets/svg.ts";
import type { ExportFormat } from "../assets/types.ts";
import { FORMATS } from "../exports/index.ts";
import { designSlug, renderDesign, type ReadyDesign } from "./design.ts";

/** Code for an AI sticker, through the same exporters as the library. */
export function exportDesign(design: ReadyDesign, format: ExportFormat): string {
  const definition = FORMATS.find((candidate) => candidate.id === format) ?? FORMATS[0]!;
  return definition.build({
    title: design.title,
    slug: designSlug(design),
    family: "sticker",
    // flutter_svg skips filters, so Flutter gets the filter-free drawing.
    sourceSvg: optimizeSvg(renderDesign(design, design.lettering, format === "flutter")),
  });
}
