import type { ExportFormat } from "../assets/types.ts";
import { toFlutter } from "./flutter.ts";
import { toReact } from "./react.ts";
import { toSvg } from "./svg.ts";
import type { ExportSource } from "./types.ts";

export type { ExportSource } from "./types.ts";
export { componentName } from "./naming.ts";

export interface FormatDefinition {
  id: ExportFormat;
  label: string;
  /** Short hint shown beside the code. */
  note: string;
  fileExtension: string;
  build: (asset: ExportSource) => string;
}

/** Add a format here and it appears in every code tab automatically. */
export const FORMATS: readonly FormatDefinition[] = [
  { id: "svg", label: "SVG", note: "Paste anywhere. Ink uses currentColor.", fileExtension: "svg", build: toSvg },
  { id: "react", label: "React", note: "Typed TSX. Props: size, color, title, className.", fileExtension: "tsx", build: toReact },
  { id: "flutter", label: "Flutter", note: "Uses flutter_svg’s SvgPicture.string.", fileExtension: "dart", build: toFlutter },
];

export interface BuiltExport {
  format: ExportFormat;
  label: string;
  note: string;
  fileName: string;
  code: string;
}

export function buildExports(
  asset: ExportSource & { exports: readonly ExportFormat[] },
): BuiltExport[] {
  return FORMATS.filter((format) => asset.exports.includes(format.id)).map((format) => ({
    format: format.id,
    label: format.label,
    note: format.note,
    fileName: `${asset.slug}.${format.fileExtension}`,
    code: format.build(asset),
  }));
}
