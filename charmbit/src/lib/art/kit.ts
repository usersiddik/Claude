/**
 * Shared drawing primitives. Every sticker is drawn in a 512 × 512 space as a
 * plain SVG string, so the same code runs on the server and in the browser.
 */
import { darken, lighten } from "./color.ts";

export type Point = readonly [number, number];
export type Id = (name: string) => string;

export const n = (value: number) => Number(value.toFixed(1));
export const pt = ([x, y]: Point) => `${n(x)} ${n(y)}`;

/** Classic heart centred on (x, y); `s` is half the width. */
export function heartPath([x, y]: Point, s: number): string {
  const p = (dx: number, dy: number) => `${n(x + dx * s)} ${n(y + dy * s)}`;
  return `M${p(0, 0.92)}C${p(-0.16, 0.8)} ${p(-1, 0.26)} ${p(-1, -0.3)}C${p(-1, -0.76)} ${p(-0.62, -1)} ${p(-0.33, -1)}C${p(-0.13, -1)} ${p(0, -0.86)} ${p(0, -0.64)}C${p(0, -0.86)} ${p(0.13, -1)} ${p(0.33, -1)}C${p(0.62, -1)} ${p(1, -0.76)} ${p(1, -0.3)}C${p(1, 0.26)} ${p(0.16, 0.8)} ${p(0, 0.92)}Z`;
}

export function sparklePath([x, y]: Point, s: number): string {
  const q = s * 0.18;
  return `M${x} ${n(y - s)}Q${n(x + q)} ${n(y - q)} ${n(x + s)} ${y}Q${n(x + q)} ${n(y + q)} ${x} ${n(y + s)}Q${n(x - q)} ${n(y + q)} ${n(x - s)} ${y}Q${n(x - q)} ${n(y - q)} ${x} ${n(y - s)}Z`;
}

export function dropPath([x, y]: Point, s: number): string {
  return `M${x} ${n(y - s * 1.5)}C${n(x - s * 0.55)} ${n(y - s * 0.6)} ${n(x - s)} ${n(y - s * 0.1)} ${n(x - s)} ${n(y + s * 0.35)}A${s} ${s} 0 0 0 ${n(x + s)} ${n(y + s * 0.35)}C${n(x + s)} ${n(y - s * 0.1)} ${n(x + s * 0.55)} ${n(y - s * 0.6)} ${x} ${n(y - s * 1.5)}Z`;
}

export function classicHeart(id: Id, at: Point, s: number, rotate = 0): string {
  const [x, y] = at;
  return (
    `<g transform="rotate(${rotate} ${x} ${y})">` +
    `<circle data-part="glow" cx="${x}" cy="${y}" r="${n(s * 2)}" fill="url(#${id("heartGlow")})"/>` +
    `<path d="${heartPath(at, s)}" fill="url(#${id("heart")})" stroke="#000000" stroke-opacity="0.18" stroke-width="${n(s * 0.05)}"/>` +
    `<path d="M${n(x - s * 0.62)} ${n(y - s * 0.42)}C${n(x - s * 0.6)} ${n(y - s * 0.72)} ${n(x - s * 0.38)} ${n(y - s * 0.84)} ${n(x - s * 0.18)} ${n(y - s * 0.76)}" stroke="#FFFFFF" stroke-width="${n(s * 0.12)}" stroke-linecap="round" opacity="0.85"/>` +
    `</g>`
  );
}

export function sparkle(at: Point, s: number, color = "#FFD45C"): string {
  return `<path d="${sparklePath(at, s)}" fill="${color}"/>`;
}

/* Scene paints ------------------------------------------------------------- */

export interface ScenePaint {
  /** Festive outfit colour. */
  outfit: string;
  /** Heart colour. */
  heart: string;
}

export const DEFAULT_PAINT: ScenePaint = { outfit: "#D61F6E", heart: "#E4183F" };

/** Gradients shared by props and scenes, namespaced by `id`. */
export function sceneDefs(id: Id, paint: ScenePaint): string {
  const heart = paint.heart;
  return [
    `<linearGradient id="${id("heart")}" x1="0.25" y1="0" x2="0.75" y2="1"><stop offset="0" stop-color="${lighten(heart, 0.38)}"/><stop offset="0.55" stop-color="${heart}"/><stop offset="1" stop-color="${darken(heart, 0.3)}"/></linearGradient>`,
    `<radialGradient id="${id("heartGlow")}" cx="0.5" cy="0.5" r="0.5"><stop offset="0.25" stop-color="${lighten(heart, 0.2)}" stop-opacity="0.55"/><stop offset="1" stop-color="${heart}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="${id("tear")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF7FF"/><stop offset="1" stop-color="#6FB8FF"/></linearGradient>`,
    `<linearGradient id="${id("mug")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E3E1EA"/></linearGradient>`,
    `<linearGradient id="${id("ice")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6F0FF"/><stop offset="1" stop-color="#7DC2F2"/></linearGradient>`,
    `<linearGradient id="${id("pillow")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6E3EF"/></linearGradient>`,
    `<linearGradient id="${id("blanket")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9BBF2"/><stop offset="1" stop-color="#9884D6"/></linearGradient>`,
    `<linearGradient id="${id("cap")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E6EF0"/><stop offset="1" stop-color="#3341B8"/></linearGradient>`,
    `<linearGradient id="${id("shades")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3A46"/><stop offset="1" stop-color="#111116"/></linearGradient>`,
    `<linearGradient id="${id("clay")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F08A3C"/><stop offset="1" stop-color="#B24E1C"/></linearGradient>`,
    `<linearGradient id="${id("flame")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6C4"/><stop offset="0.45" stop-color="#FFC21A"/><stop offset="1" stop-color="#FF6A00"/></linearGradient>`,
    `<radialGradient id="${id("warm")}" cx="0.5" cy="0.5" r="0.5"><stop offset="0.15" stop-color="#FFD15C" stop-opacity="0.75"/><stop offset="1" stop-color="#FFB020" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="${id("outfit")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(paint.outfit, 0.18)}"/><stop offset="1" stop-color="${darken(paint.outfit, 0.18)}"/></linearGradient>`,
    `<linearGradient id="${id("gold")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#D9A228"/></linearGradient>`,
  ].join("");
}

/* Silhouettes -------------------------------------------------------------- */

/**
 * Several shapes drawn as one: outlines first, fills on top, so only the outer
 * edge is outlined. `shapes` are elements without fill or stroke.
 */
export function blob(shapes: string, fill: string, outline: string, width = 5): string {
  return (
    `<g fill="${outline}" stroke="${outline}" stroke-width="${width * 2}" stroke-linejoin="round">${shapes}</g>` +
    `<g fill="${fill}">${shapes}</g>`
  );
}

/* Limbs -------------------------------------------------------------------- */

export interface LimbStyle {
  /** Arm colour: fur, skin, or a sleeve. */
  fill: string;
  outline: string;
  /** Paw or hand colour. */
  paw: string;
  /** Width at the shoulder. */
  width: number;
  /** Wrist width as a share of `width`. */
  taper?: number;
  /** Paint for a cuff at the wrist (sleeves). */
  cuff?: string;
  outlineOpacity?: number;
  /** `paw` (cats and friends), `hand` (people), `nub` (ghosts). */
  end?: "paw" | "hand" | "nub";
}

const quad = (a: number, c: number, b: number, t: number) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t ** 2 * b;

/**
 * A tapered limb along a gentle curve, ending in a paw or hand. The shoulder end
 * has no outline, so the limb grows out of the body instead of sitting on it.
 */
export function limb(style: LimbStyle, from: Point, to: Point, bend: number, opts: { pads?: boolean } = {}): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = (x1 + x2) / 2 + (-(y2 - y1) / length) * bend;
  const cy = (y1 + y2) / 2 + ((x2 - x1) / length) * bend;
  const w0 = style.width;
  const w1 = style.width * (style.taper ?? 0.74);
  const left: Point[] = [];
  const right: Point[] = [];
  const steps = 10;
  let dir: Point = [1, 0];
  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const x = quad(x1, cx, x2, t);
    const y = quad(y1, cy, y2, t);
    const dx = 2 * (1 - t) * (cx - x1) + 2 * t * (x2 - cx);
    const dy = 2 * (1 - t) * (cy - y1) + 2 * t * (y2 - cy);
    const size = Math.hypot(dx, dy) || 1;
    dir = [dx / size, dy / size];
    const half = (w0 + (w1 - w0) * t) / 2;
    left.push([x - dir[1] * half, y + dir[0] * half]);
    right.push([x + dir[1] * half, y - dir[0] * half]);
  }
  const r = n(w1 / 2);
  const tip = right[steps]!;
  const sides = `M${left.map(pt).join("L")}A${r} ${r} 0 0 0 ${pt(tip)}L${[...right].reverse().map(pt).join("L")}`;
  const angle = n((Math.atan2(dir[1], dir[0]) * 180) / Math.PI);
  const end = style.end ?? "paw";
  const outlineAttrs = `stroke="${style.outline}"${style.outlineOpacity === undefined ? "" : ` stroke-opacity="${style.outlineOpacity}"`} stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  let hand = "";
  if (end === "paw") {
    const rx = w1 * (opts.pads ? 0.8 : 0.7);
    const ry = w1 * (opts.pads ? 0.86 : 0.74);
    const [px, py]: Point = [x2 + dir[0] * w1 * 0.12, y2 + dir[1] * w1 * 0.12];
    hand =
      `<g transform="translate(${n(px)} ${n(py)}) rotate(${n(angle - 90)})">` +
      `<ellipse rx="${n(rx)}" ry="${n(ry)}" fill="${style.paw}" ${outlineAttrs}/>` +
      (opts.pads
        ? `<ellipse cy="${n(-ry * 0.12)}" rx="${n(rx * 0.42)}" ry="${n(ry * 0.32)}" fill="#F7A1B3"/>` +
          `<circle cx="${n(-rx * 0.52)}" cy="${n(ry * 0.42)}" r="${n(rx * 0.17)}" fill="#F7A1B3"/>` +
          `<circle cy="${n(ry * 0.6)}" r="${n(rx * 0.17)}" fill="#F7A1B3"/>` +
          `<circle cx="${n(rx * 0.52)}" cy="${n(ry * 0.42)}" r="${n(rx * 0.17)}" fill="#F7A1B3"/>`
        : `<path d="M${n(-rx * 0.3)} ${n(ry * 0.98)}v${n(-ry * 0.42)}M${n(rx * 0.3)} ${n(ry * 0.98)}v${n(-ry * 0.42)}" stroke="${style.outline}" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round"/>`) +
      `</g>`;
  } else if (end === "hand") {
    const [px, py]: Point = [x2 + dir[0] * w1 * 0.3, y2 + dir[1] * w1 * 0.3];
    hand = `<circle cx="${n(px)}" cy="${n(py)}" r="${n(w1 * 0.6)}" fill="${style.paw}" ${outlineAttrs}/>`;
  }
  const cuff = style.cuff
    ? (() => {
        const [lx, ly] = left[8]!;
        const [rx2, ry2] = right[8]!;
        return `<path d="M${n(lx)} ${n(ly)}L${n(rx2)} ${n(ry2)}" stroke="${style.cuff}" stroke-width="${n(w1 * 0.32)}" stroke-linecap="butt"/>`;
      })()
    : "";
  return `<path d="${sides}Z" fill="${style.fill}"/>` + cuff + `<path d="${sides}" fill="none" ${outlineAttrs}/>` + hand;
}

/* Composition -------------------------------------------------------------- */

/** Draws 512-space markup at `at`, scaled and rotated around (256, 290). */
export const place = (markup: string, [x, y]: Point, scale: number, rotate = 0) =>
  `<g transform="translate(${n(x)} ${n(y)}) rotate(${rotate}) scale(${scale}) translate(-256 -290)">${markup}</g>`;

/** Where a point of placed markup lands on the sticker. */
export function local([x, y]: Point, at: Point, scale: number, rotate = 0): Point {
  const lx = (x - 256) * scale;
  const ly = (y - 290) * scale;
  const rad = (rotate * Math.PI) / 180;
  return [at[0] + lx * Math.cos(rad) - ly * Math.sin(rad), at[1] + lx * Math.sin(rad) + ly * Math.cos(rad)];
}

export const SVG_OPEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">`;

export const svgDocument = (defs: string, body: string) => `${SVG_OPEN}<defs>${defs}</defs>${body}</svg>`;

/** Short, stable namespace for ids so many stickers can share a page. */
export function namespace(key: string): (part: string) => Id {
  return (part: string) => (name: string) => `${key}${part}-${name}`;
}

/**
 * SVG without parts that shouldn't shape a sticker's outline: whiskers, soft
 * glows, string lights, and sparks.
 */
export function silhouetteOf(svg: string): string {
  return svg
    .replace(/<g data-part="(?:whiskers|decor)"[\s\S]*?<\/g>/g, "")
    .replace(/<circle data-part="glow"[^>]*\/>/g, "");
}
