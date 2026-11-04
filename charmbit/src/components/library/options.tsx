import { CheckerIcon, FlutterGlyph, MoonIcon, ReactGlyph, StickerGlyph, SunIcon, SvgGlyph } from "@/components/ui/icons";
import type { SegmentOption } from "@/components/ui/SegmentedControl";
import type { ExportFormat } from "@/lib/assets/types";
import { FORMATS } from "@/lib/exports";
import type { Canvas, Output } from "./url-state";

const FORMAT_ICONS: Record<ExportFormat, React.ReactNode> = {
  svg: <SvgGlyph size={14} />,
  react: <ReactGlyph size={14} />,
  flutter: <FlutterGlyph size={14} />,
};

export const FORMAT_OPTIONS: readonly SegmentOption<Output>[] = [
  { id: "sticker", label: "Sticker", icon: <StickerGlyph size={14} /> },
  ...FORMATS.map((format) => ({ id: format.id, label: format.label, icon: FORMAT_ICONS[format.id] })),
];

export function outputLabel(output: Output): string {
  return FORMAT_OPTIONS.find((option) => option.id === output)?.label ?? output;
}

export const CANVAS_OPTIONS: readonly SegmentOption<Canvas>[] = [
  { id: "light", label: "Light canvas", icon: <SunIcon size={15} /> },
  { id: "dark", label: "Dark canvas", icon: <MoonIcon size={15} /> },
  { id: "grid", label: "Checkerboard canvas", icon: <CheckerIcon size={15} /> },
];
