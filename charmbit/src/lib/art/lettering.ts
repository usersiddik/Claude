/**
 * Sticker lettering: traced text with a white die-cut edge and a soft drop,
 * plus helpers to add a caption under any sticker.
 */
import { darken } from "./color.ts";
import { n, place, svgDocument, type Point } from "./kit.ts";
import { LETTERING, type Lettering } from "./lettering-glyphs.ts";

export type { Lettering } from "./lettering-glyphs.ts";

export const LETTER_COLORS = [
  { id: "berry", name: "Berry", hex: "#E8175D" },
  { id: "ink", name: "Ink", hex: "#2A2433" },
  { id: "ocean", name: "Ocean", hex: "#2563EB" },
  { id: "sun", name: "Sun", hex: "#F97316" },
  { id: "leaf", name: "Leaf", hex: "#16A34A" },
  { id: "grape", name: "Grape", hex: "#7C3AED" },
] as const;

export const PHRASES = Object.keys(LETTERING);

/** Traced text centred on `at`, fitted inside `box` (width, height). Takes a known phrase or traced glyphs. */
export function lettering(phrase: string | Lettering, color: string, at: Point, box: readonly [number, number], rotate = -4): string {
  const glyphs = typeof phrase === "string" ? LETTERING[phrase] : phrase;
  if (!glyphs || glyphs.w <= 0 || glyphs.h <= 0) return "";
  const k = Math.min(box[0] / glyphs.w, box[1] / glyphs.h);
  const x = at[0] - (glyphs.w * k) / 2;
  const y = at[1] - (glyphs.h * k) / 2;
  const d = glyphs.d;
  const edge = n(26 / k);
  return (
    `<g transform="rotate(${rotate} ${at[0]} ${at[1]}) translate(${n(x)} ${n(y)}) scale(${n(k * 1000) / 1000})">` +
    `<path d="${d}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="${edge}" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="${darken(color, 0.42)}" transform="translate(0 ${n(5 / k)})"/>` +
    `<path d="${d}" fill="${color}" stroke="${darken(color, 0.3)}" stroke-width="${n(2.4 / k)}" stroke-linejoin="round"/>` +
    `</g>`
  );
}

/** The inside of a complete sticker SVG (its defs and artwork). */
export function innerOf(svg: string): string {
  return svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
}

/** A sticker with a caption: the art moves up and shrinks a little to make room. */
export function withCaption(svg: string, phrase: string | Lettering, color: string): string {
  return svgDocument("", place(innerOf(svg), [256, 226], 0.8) + lettering(phrase, color, [256, 448], [440, 96]));
}
