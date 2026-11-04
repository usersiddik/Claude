import type { Asset, ExportFormat } from "../assets/types.ts";
import { customizeSvg } from "../customize.ts";
import { toFlutter } from "./flutter.ts";
import { toReact } from "./react.ts";
import { componentName } from "./naming.ts";
import { toSvg } from "./svg.ts";
import type { ExportOptions, ExportSource } from "./types.ts";

export type { ExportOptions, ExportSource } from "./types.ts";
export { componentName } from "./naming.ts";

export interface FormatDefinition {
  id: ExportFormat;
  label: string;
  /** Language id for syntax highlighting. */
  language: "xml" | "tsx" | "dart";
  /** One line for marketing copy. */
  summary: string;
  /** Props or attributes a developer can change after copying. */
  props: readonly string[];
  fileName: (asset: Pick<Asset, "slug" | "family">) => string;
  build: (asset: ExportSource, options?: ExportOptions) => string;
}

/** Add a format here and it appears in every format switcher automatically. */
export const FORMATS: readonly FormatDefinition[] = [
  {
    id: "svg",
    label: "SVG",
    language: "xml",
    summary: "Clean markup with a title and viewBox. Works anywhere.",
    props: ["viewBox", "width", "height", "color"],
    fileName: (asset) => `${asset.slug}.svg`,
    build: toSvg,
  },
  {
    id: "react",
    label: "React",
    language: "tsx",
    summary: "A typed TSX component. No extra packages.",
    props: ["size", "color", "title", "className"],
    fileName: (asset) => `${componentName(asset.slug, asset.family)}.tsx`,
    build: toReact,
  },
  {
    id: "flutter",
    label: "Flutter",
    language: "dart",
    summary: "A StatelessWidget built on flutter_svg.",
    props: ["size", "color", "semanticsLabel"],
    fileName: (asset) => `${asset.slug.replace(/-/g, "_")}_${asset.family}.dart`,
    build: toFlutter,
  },
];

export function findFormat(id: string): FormatDefinition {
  return FORMATS.find((format) => format.id === id) ?? FORMATS[0]!;
}

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
