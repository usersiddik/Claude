/**
 * Text on a sticker. The layout is pure so it can be tested without a canvas:
 * the caller supplies a measurer (canvas measureText, or a fake in tests).
 */

export interface Caption {
  text: string;
  /** Fill colour as a hex string. */
  color: string;
}

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
