/** Tiny colour helpers for deriving a full shading palette from one picked colour. */

type RGB = readonly [number, number, number];

export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(value)) {
    return `#${value
      .split("")
      .map((char) => char + char)
      .join("")
      .toUpperCase()}`;
  }
  return /^[0-9a-f]{6}$/i.test(value) ? `#${value.toUpperCase()}` : null;
}

function parse(hex: string): RGB {
  const value = (normalizeHex(hex) ?? "#000000").slice(1);
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16)) as unknown as RGB;
}

function format(rgb: RGB): string {
  return `#${rgb.map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

/** Linear blend: t = 0 returns `a`, t = 1 returns `b`. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return format([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

export const lighten = (color: string, t: number) => mix(color, "#FFFFFF", t);
export const darken = (color: string, t: number) => mix(color, "#000000", t);

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = parse(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Short, stable hash for namespacing SVG ids per rendered variant. */
export function hash(value: string): string {
  let h = 5381;
  for (let index = 0; index < value.length; index += 1) h = ((h << 5) + h + value.charCodeAt(index)) | 0;
  return (h >>> 0).toString(36);
}
