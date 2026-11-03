import { escapeXml, formatMarkup, parseSvg, readViewBox } from "../assets/svg.ts";
import type { ExportSource } from "./types.ts";

/** Standalone SVG with an accessible title and intrinsic size. */
export function toSvg(asset: ExportSource): string {
  const { attributes, inner } = parseSvg(asset.sourceSvg);
  const viewBox = attributes.viewBox ?? "0 0 24 24";
  const { width, height } = readViewBox(viewBox);
  const fill = attributes.fill ?? "none";

  const markup =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}" fill="${fill}" role="img">` +
    `<title>${escapeXml(asset.title)}</title>${inner}</svg>`;
  return formatMarkup(markup);
}
