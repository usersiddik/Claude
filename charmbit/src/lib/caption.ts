/**
 * Text on a sticker. The layout is pure so it can be tested without a canvas:
 * the caller supplies a measurer (canvas measureText, or a fake in tests).
 */

export interface Caption {
  text: string;
  /** Fill colour as a hex string. */
  color: string;
  /** One of CAPTION_FONTS; Bubbly when missing. */
  font?: CaptionFontId;
}

/**
 * Lettering styles for text on stickers. Each names the CSS variable that
 * next/font sets on <html>, so the canvas draws with the very font the page
 * loaded. `scale` evens out how large each face looks at the same size;
 * `space` is added after every word space when drawing.
 */
export const CAPTION_FONTS = [
  { id: "bubbly", name: "Bubbly", variable: "--font-cap-bubbly", weight: 700, style: "normal", scale: 1, space: "" },
  { id: "bold", name: "Bold", variable: "--font-cap-bold", weight: 800, style: "normal", scale: 1, space: "" },
  { id: "chunky", name: "Chunky", variable: "--font-cap-chunky", weight: 400, style: "normal", scale: 0.94, space: "" },
  // Narrow word spaces vanish under the outline; a thin space after each one gives them back.
  { id: "elegant", name: "Elegant", variable: "--font-fraunces", weight: 800, style: "italic", scale: 1.04, space: "\u2009" },
  { id: "script", name: "Script", variable: "--font-cap-script", weight: 400, style: "normal", scale: 0.9, space: "\u200A" },
  { id: "hand", name: "Handwritten", variable: "--font-cap-hand", weight: 700, style: "normal", scale: 1.22, space: "" },
] as const;

export type CaptionFont = (typeof CAPTION_FONTS)[number];
export type CaptionFontId = CaptionFont["id"];

export const captionFontOf = (id: string | undefined): CaptionFont => CAPTION_FONTS.find((font) => font.id === id) ?? CAPTION_FONTS[0];

/** The text as drawn in `font`: word spaces widened where the face needs it. */
export const spacedFor = (font: CaptionFont, text: string): string => (font.space ? text.replace(/ /g, ` ${font.space}`) : text);

export interface CaptionLayout {
  /** Font size in pixels. */
  size: number;
  lines: string[];
}

export const CAPTION_MAX_LENGTH = 48;

/** Measures the width of `text` at `size`, in pixels. */
export type Measure = (text: string, size: number) => number;

/**
 * Fits text into `maxWidth`: shrink the font from `maxSize` towards `minSize`
 * until it fits on one line; if even the smallest size is too wide, wrap into
 * two lines at `minSize` and cut the second with an ellipsis if needed.
 */
export function fitCaption(measure: Measure, text: string, maxWidth: number, maxSize: number, minSize: number): CaptionLayout {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return { size: maxSize, lines: [] };
  for (let size = maxSize; size >= minSize; size -= Math.max(1, Math.round(maxSize * 0.04))) {
    if (measure(clean, size) <= maxWidth) return { size, lines: [clean] };
  }
  const lines = wrap(measure, clean, maxWidth, minSize, 2);
  return { size: minSize, lines };
}

function wrap(measure: Measure, text: string, maxWidth: number, size: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, size) <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && current) lines.push(current);
  const rest = words.slice(lines.join(" ").split(" ").length).join(" ");
  if (rest) {
    // Out of room: trim the last line until it and an ellipsis fit.
    let last = `${lines[lines.length - 1]} ${rest}`;
    while (last.length > 1 && measure(`${last}…`, size) > maxWidth) last = last.slice(0, -1).trimEnd();
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

/** Relative luminance of a hex colour, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((char) => char + char).join("") : value;
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255).map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** A dark edge around light text, a white edge around dark text, so it reads on any chat background. */
export const captionEdge = (color: string) => (luminance(color) > 0.45 ? "#141312" : "#FFFFFF");

/** Text colours offered in the editor. */
export const CAPTION_COLORS: readonly { id: string; name: string; hex: string }[] = [
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "ink", name: "Ink", hex: "#141312" },
  { id: "red", name: "Red", hex: "#E4183F" },
  { id: "gold", name: "Gold", hex: "#F3B62B" },
  { id: "pink", name: "Pink", hex: "#F48FB1" },
  { id: "sky", name: "Sky", hex: "#3E8FDE" },
  { id: "mint", name: "Mint", hex: "#43C58C" },
  { id: "violet", name: "Violet", hex: "#8A5FD6" },
];
