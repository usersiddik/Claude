import type { Asset, ExportFormat } from "../assets/types.ts";
import { customizeSvg } from "../customize.ts";
import { toFlutter } from "./flutter.ts";
import { toReact } from "./react.ts";
import { toSvg } from "./svg.ts";
import type { ExportOptions, ExportSource } from "./types.ts";

export type { ExportOptions, ExportSource } from "./types.ts";
export { componentName } from "./naming.ts";

export interface FormatDefinition {
  id: ExportFormat;
  label: string;
  /** One line for the “How it works” section. */
  summary: string;
  build: (asset: ExportSource, options?: ExportOptions) => string;
}

/** Add a format here and it appears in the Copy as control automatically. */
export const FORMATS: readonly FormatDefinition[] = [
  { id: "svg", label: "SVG", summary: "Clean markup with a title and viewBox. Works anywhere.", build: toSvg },
  { id: "react", label: "React", summary: "A typed component with size, color, and title props.", build: toReact },
  { id: "flutter", label: "Flutter", summary: "A ready-to-use widget built on the flutter_svg package.", build: toFlutter },
];

export const DEFAULT_FORMAT: ExportFormat = "svg";

export function isExportFormat(value: string | null | undefined): value is ExportFormat {
  return FORMATS.some((format) => format.id === value);
}

export interface Customization {
  /** Replacement for the main fill, or null to keep the original colours. */
  fill: string | null;
  /** Custom ink, or undefined to keep currentColor. */
  ink?: string;
}

/** Builds one format with the user's colour choices applied. */
export function buildExport(
  asset: Pick<Asset, "title" | "slug" | "family" | "sourceSvg" | "palette">,
  format: ExportFormat,
  customization: Customization = { fill: null },
): string {
  const definition = FORMATS.find((candidate) => candidate.id === format) ?? FORMATS[0]!;
  const source = { ...asset, sourceSvg: customizeSvg(asset, customization.fill) };
  return definition.build(source, { ink: customization.ink });
}
