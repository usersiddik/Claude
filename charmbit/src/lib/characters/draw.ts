/**
 * Sticker drawing engine. Pure string building: runs on the server (static
 * previews, OG image) and in the browser (live Studio).
 *
 * Every character is drawn in its own 512 × 512 space. Pair scenes place two
 * characters with one transform each, so poses, outfits, and faces are shared.
 */
import { darken, hash, lighten, luminance, mix } from "./color.ts";
import { findReaction, type Look, type ReactionId, type Species, type StickerSpec } from "./options.ts";

type Point = readonly [number, number];
type Id = (name: string) => string;

const n = (value: number) => Number(value.toFixed(1));
const pt = ([x, y]: Point) => `${n(x)} ${n(y)}`;

/* Palette ----------------------------------------------------------------- */

interface Palette {
  furLight: string;
  fur: string;
  furShade: string;
  outline: string;
  stripe: string;
  muzzle: string;
  irisLight: string;
  iris: string;
  irisDark: string;
  line: string;
  nose: string;
  earInner: string;
}

function palette({ fur, eyes }: Look): Palette {
  const dark = luminance(fur) < 0.16;
  return {
    furLight: lighten(fur, dark ? 0.3 : 0.5),
    fur,
    furShade: darken(fur, 0.16),
    outline: dark ? lighten(fur, 0.18) : mix(darken(fur, 0.45), "#4A2A20", 0.35),
    stripe: dark ? lighten(fur, 0.14) : darken(fur, 0.26),
    muzzle: lighten(fur, dark ? 0.32 : 0.74),
    irisLight: lighten(eyes, 0.55),
    iris: eyes,
    irisDark: darken(eyes, 0.55),
    line: dark ? "#F4EEF6" : "#3A2220",
    nose: "#F08A9C",
    earInner: "#F6A9B6",
  };
}

/* Gradients and filters --------------------------------------------------- */

function characterDefs(id: Id, p: Palette, portable: boolean): string {
  return [
    `<radialGradient id="${id("fur")}" cx="0.42" cy="0.3" r="0.8"><stop offset="0" stop-color="${p.furLight}"/><stop offset="0.6" stop-color="${p.fur}"/><stop offset="1" stop-color="${p.furShade}"/></radialGradient>`,
    `<radialGradient id="${id("muzzle")}" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="${p.muzzle}"/><stop offset="0.7" stop-color="${p.muzzle}" stop-opacity="0.85"/><stop offset="1" stop-color="${p.muzzle}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("iris")}" cx="0.5" cy="0.62" r="0.55"><stop offset="0" stop-color="${p.irisLight}"/><stop offset="0.55" stop-color="${p.iris}"/><stop offset="1" stop-color="${p.irisDark}"/></radialGradient>`,
    `<linearGradient id="${id("nose")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(p.nose, 0.35)}"/><stop offset="1" stop-color="${darken(p.nose, 0.12)}"/></linearGradient>`,
    `<radialGradient id="${id("ear")}" cx="0.45" cy="0.75" r="0.75"><stop offset="0" stop-color="${lighten(p.earInner, 0.3)}"/><stop offset="1" stop-color="${p.earInner}"/></radialGradient>`,
    `<linearGradient id="${id("glass")}" x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.8"/><stop offset="0.5" stop-color="#EAF4FF" stop-opacity="0.25"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0.6"/></linearGradient>`,
    `<radialGradient id="${id("blush")}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FF6F86" stop-opacity="0.65"/><stop offset="0.6" stop-color="#FF8A9E" stop-opacity="0.28"/><stop offset="1" stop-color="#FF8A9E" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("glow")}" cx="0.5" cy="0.45" r="0.5"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.42"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="${id("tear")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF7FF"/><stop offset="1" stop-color="#6FB8FF"/></linearGradient>`,
    portable
      ? ""
      : `<filter id="${id("soft")}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>` +
        `<filter id="${id("noise")}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.4"/><feComposite in2="SourceAlpha" operator="in"/></filter>`,
  ].join("");
}

function sceneDefs(id: Id, outfit: string): string {
  return [
    `<linearGradient id="${id("heart")}" x1="0.25" y1="0" x2="0.75" y2="1"><stop offset="0" stop-color="#FF5C76"/><stop offset="0.55" stop-color="#E4183F"/><stop offset="1" stop-color="#A80C30"/></linearGradient>`,
    `<radialGradient id="${id("heartGlow")}" cx="0.5" cy="0.5" r="0.5"><stop offset="0.25" stop-color="#FF4D6D" stop-opacity="0.55"/><stop offset="1" stop-color="#FF4D6D" stop-opacity="0"/></radialGradient>`,
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
    `<linearGradient id="${id("outfit")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(outfit, 0.18)}"/><stop offset="1" stop-color="${darken(outfit, 0.18)}"/></linearGradient>`,
    `<linearGradient id="${id("gold")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#D9A228"/></linearGradient>`,
  ].join("");
}

/* Shared shapes ----------------------------------------------------------- */

/** Classic heart centred on (x, y); `s` is half the width. */
function heartPath([x, y]: Point, s: number): string {
  const p = (dx: number, dy: number) => `${n(x + dx * s)} ${n(y + dy * s)}`;
  return `M${p(0, 0.92)}C${p(-0.16, 0.8)} ${p(-1, 0.26)} ${p(-1, -0.3)}C${p(-1, -0.76)} ${p(-0.62, -1)} ${p(-0.33, -1)}C${p(-0.13, -1)} ${p(0, -0.86)} ${p(0, -0.64)}C${p(0, -0.86)} ${p(0.13, -1)} ${p(0.33, -1)}C${p(0.62, -1)} ${p(1, -0.76)} ${p(1, -0.3)}C${p(1, 0.26)} ${p(0.16, 0.8)} ${p(0, 0.92)}Z`;
}

function sparklePath([x, y]: Point, s: number): string {
  const q = s * 0.18;
  return `M${x} ${n(y - s)}Q${n(x + q)} ${n(y - q)} ${n(x + s)} ${y}Q${n(x + q)} ${n(y + q)} ${x} ${n(y + s)}Q${n(x - q)} ${n(y + q)} ${n(x - s)} ${y}Q${n(x - q)} ${n(y - q)} ${x} ${n(y - s)}Z`;
}

function dropPath([x, y]: Point, s: number): string {
  return `M${x} ${n(y - s * 1.5)}C${n(x - s * 0.55)} ${n(y - s * 0.6)} ${n(x - s)} ${n(y - s * 0.1)} ${n(x - s)} ${n(y + s * 0.35)}A${s} ${s} 0 0 0 ${n(x + s)} ${n(y + s * 0.35)}C${n(x + s)} ${n(y - s * 0.1)} ${n(x + s * 0.55)} ${n(y - s * 0.6)} ${x} ${n(y - s * 1.5)}Z`;
}

function classicHeart(id: Id, at: Point, s: number, rotate = 0): string {
  const [x, y] = at;
  return (
    `<g transform="rotate(${rotate} ${x} ${y})">` +
    `<circle data-part="glow" cx="${x}" cy="${y}" r="${n(s * 2)}" fill="url(#${id("heartGlow")})"/>` +
    `<path d="${heartPath(at, s)}" fill="url(#${id("heart")})" stroke="#8E0A28" stroke-opacity="0.35" stroke-width="${n(s * 0.05)}"/>` +
    `<path d="M${n(x - s * 0.62)} ${n(y - s * 0.42)}C${n(x - s * 0.6)} ${n(y - s * 0.72)} ${n(x - s * 0.38)} ${n(y - s * 0.84)} ${n(x - s * 0.18)} ${n(y - s * 0.76)}" stroke="#FFFFFF" stroke-width="${n(s * 0.12)}" stroke-linecap="round" opacity="0.85"/>` +
    `</g>`
  );
}

function sparkle(at: Point, s: number, color = "#FFD45C"): string {
  return `<path d="${sparklePath(at, s)}" fill="${color}"/>`;
}

/* Faces ------------------------------------------------------------------- */

type Eyes = "open" | "happy" | "wink" | "closed" | "teary" | "wide" | "angry" | "droopy" | "up" | "laugh" | "side" | "squeeze";
type Mouth = "smile" | "grin" | "open" | "o" | "frown" | "wobble" | "kiss" | "tongue" | "smirk" | "pout" | "wail";
type Brows = "sad" | "angry" | "raised";

interface Face {
  eyes: Eyes;
  mouth: Mouth;
  brows?: Brows;
  blush?: 0 | 1 | 2;
  tears?: "single" | "streams" | "joy";
}

interface FaceAnchors {
  eyes: readonly [Point, Point];
  r: number;
  mouth: Point;
  cheeks: readonly [Point, Point];
  /** Colour used for eyelids so they blend with the head. */
  lid: string;
  scale: number;
}

function openEye(id: Id, p: Palette, [x, y]: Point, r: number, opts: { look?: Point; pupil?: number; wet?: boolean; tiny?: boolean } = {}): string {
  const [lx, ly] = opts.look ?? [0, 0];
  const pr = opts.tiny ? r * 0.28 : (opts.pupil ?? 0.5) * r;
  return [
    `<circle cx="${x}" cy="${y}" r="${n(r + r * 0.09)}" fill="#24150F"/>`,
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id("iris")})"/>`,
    `<circle cx="${x}" cy="${y}" r="${n(r * 0.66)}" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="${n(r * 0.5)}" stroke-dasharray="1.3 3.2"/>`,
    opts.tiny
      ? `<circle cx="${n(x + lx)}" cy="${n(y + ly)}" r="${n(pr)}" fill="#0B0605"/>`
      : `<ellipse cx="${n(x + lx)}" cy="${n(y + ly)}" rx="${n(pr * 0.86)}" ry="${n(pr * 1.18)}" fill="#0B0605"/>`,
    `<circle cx="${n(x + r * 0.34 + lx * 0.4)}" cy="${n(y - r * 0.38 + ly * 0.4)}" r="${n(r * (opts.wet ? 0.36 : 0.3))}" fill="#FFFFFF"/>`,
    `<circle cx="${n(x - r * 0.32)}" cy="${n(y + r * 0.36)}" r="${n(r * 0.13)}" fill="#FFFFFF" opacity="0.9"/>`,
    opts.wet ? `<circle cx="${n(x + r * 0.05)}" cy="${n(y + r * 0.1)}" r="${n(r * 0.12)}" fill="#FFFFFF" opacity="0.8"/>` : "",
    opts.wet ? `<path d="M${n(x - r * 0.8)} ${n(y + r * 0.62)}Q${x} ${n(y + r * 1.08)} ${n(x + r * 0.8)} ${n(y + r * 0.62)}" stroke="#BDE6FF" stroke-width="${n(r * 0.16)}" stroke-linecap="round"/>` : "",
    // Upper lid line with a little wing: gives the eye shape and attitude.
    `<path d="M${n(x - r * 1.08)} ${n(y - r * 0.1)}C${n(x - r * 0.9)} ${n(y - r * 1.12)} ${n(x + r * 0.9)} ${n(y - r * 1.2)} ${n(x + r * 1.16)} ${n(y - r * 0.32)}" stroke="${p.line}" stroke-width="${n(r * 0.16)}" stroke-linecap="round"/>`,
  ].join("");
}

function eyes(id: Id, p: Palette, face: Face, a: FaceAnchors, side: "left" | "right" | "both" = "both"): string {
  const [l, rt] = a.eyes;
  const r = a.r;
  const lineStroke = `stroke="${p.line}" stroke-width="${n(r * 0.2)}" stroke-linecap="round" stroke-linejoin="round"`;
  const happy = ([x, y]: Point) => `<path d="M${n(x - r * 0.85)} ${n(y + r * 0.2)}C${n(x - r * 0.5)} ${n(y - r * 0.6)} ${n(x + r * 0.5)} ${n(y - r * 0.6)} ${n(x + r * 0.85)} ${n(y + r * 0.2)}" ${lineStroke}/>`;
  const closed = ([x, y]: Point) =>
    `<path d="M${n(x - r * 0.85)} ${n(y - r * 0.05)}C${n(x - r * 0.5)} ${n(y + r * 0.5)} ${n(x + r * 0.5)} ${n(y + r * 0.5)} ${n(x + r * 0.85)} ${n(y - r * 0.05)}M${n(x - r * 0.62)} ${n(y + r * 0.28)}l${n(-r * 0.18)} ${n(r * 0.24)}M${n(x + r * 0.62)} ${n(y + r * 0.28)}l${n(r * 0.18)} ${n(r * 0.24)}" ${lineStroke}/>`;
  const squeeze = ([x, y]: Point, dir: 1 | -1) =>
    `<path d="M${n(x - dir * r * 0.75)} ${n(y - r * 0.55)}L${n(x + dir * r * 0.55)} ${n(y)}L${n(x - dir * r * 0.75)} ${n(y + r * 0.55)}" ${lineStroke}/>`;
  // Eyelids are segments of the eye circle, so they read as lids rather than patches.
  const lidCover = ([x, y]: Point, kind: "half" | "angryL" | "angryR") => {
    const R = r * 1.12;
    const lidFill = darken(a.lid, 0.08);
    let shape: string;
    let edge: string;
    if (kind === "half") {
      shape = `M${n(x - R)} ${n(y + r * 0.05)}A${n(R)} ${n(R)} 0 0 1 ${n(x + R)} ${n(y + r * 0.05)}C${n(x + R * 0.5)} ${n(y + r * 0.34)} ${n(x - R * 0.5)} ${n(y + r * 0.34)} ${n(x - R)} ${n(y + r * 0.05)}Z`;
      edge = `M${n(x - R)} ${n(y + r * 0.05)}C${n(x - R * 0.5)} ${n(y + r * 0.34)} ${n(x + R * 0.5)} ${n(y + r * 0.34)} ${n(x + R)} ${n(y + r * 0.05)}`;
    } else {
      const high: Point = kind === "angryL" ? [x - R * 0.72, y - R * 0.7] : [x + R * 0.72, y - R * 0.7];
      const low: Point = kind === "angryL" ? [x + R, y - R * 0.04] : [x - R, y - R * 0.04];
      const [first, second] = kind === "angryL" ? [high, low] : [low, high];
      shape = `M${pt(first)}A${n(R)} ${n(R)} 0 0 1 ${pt(second)}Z`;
      edge = `M${pt(first)}L${pt(second)}`;
    }
    return `<path d="${shape}" fill="${lidFill}"/><path d="${edge}" ${lineStroke}/>`;
  };

  const pick = (left: string, right: string) => (side === "left" ? left : side === "right" ? right : left + right);

  switch (face.eyes) {
    case "happy":
      return pick(happy(l), happy(rt));
    case "closed":
      return pick(closed(l), closed(rt));
    case "laugh":
      return pick(squeeze(l, 1), squeeze(rt, -1));
    case "squeeze":
      return pick(squeeze(l, 1), squeeze(rt, -1));
    case "wink":
      return pick(openEye(id, p, l, r, { look: [r * 0.1, 0] }), happy(rt));
    case "teary":
      return pick(openEye(id, p, l, r, { pupil: 0.62, wet: true }), openEye(id, p, rt, r, { pupil: 0.62, wet: true }));
    case "wide":
      return pick(openEye(id, p, l, r * 1.1, { tiny: true }), openEye(id, p, rt, r * 1.1, { tiny: true }));
    case "angry":
      return pick(openEye(id, p, l, r, { pupil: 0.46 }) + lidCover(l, "angryL"), openEye(id, p, rt, r, { pupil: 0.46 }) + lidCover(rt, "angryR"));
    case "droopy":
      return pick(openEye(id, p, l, r, { look: [0, r * 0.15] }) + lidCover(l, "half"), openEye(id, p, rt, r, { look: [0, r * 0.15] }) + lidCover(rt, "half"));
    case "up":
      return pick(openEye(id, p, l, r, { look: [-r * 0.18, -r * 0.3] }), openEye(id, p, rt, r, { look: [-r * 0.18, -r * 0.3] }));
    case "side":
      return pick(openEye(id, p, l, r, { look: [r * 0.24, r * 0.2] }), openEye(id, p, rt, r, { look: [r * 0.24, r * 0.2] }));
    default:
      return pick(openEye(id, p, l, r), openEye(id, p, rt, r));
  }
}

function brows(p: Palette, face: Face, a: FaceAnchors): string {
  if (!face.brows) return "";
  const [[lx, ly], [rx, ry]] = a.eyes;
  const r = a.r;
  const stroke = `stroke="${p.line}" stroke-width="${n(r * 0.17)}" stroke-linecap="round"`;
  switch (face.brows) {
    case "sad":
      return `<path d="M${n(lx - r * 0.9)} ${n(ly - r * 1.32)}Q${n(lx)} ${n(ly - r * 1.42)} ${n(lx + r * 0.75)} ${n(ly - r * 1.82)}M${n(rx + r * 0.9)} ${n(ry - r * 1.32)}Q${n(rx)} ${n(ry - r * 1.42)} ${n(rx - r * 0.75)} ${n(ry - r * 1.82)}" ${stroke}/>`;
    case "angry":
      return `<path d="M${n(lx - r * 0.9)} ${n(ly - r * 1.75)}L${n(lx + r * 0.8)} ${n(ly - r * 1.18)}M${n(rx + r * 0.9)} ${n(ry - r * 1.75)}L${n(rx - r * 0.8)} ${n(ry - r * 1.18)}" ${stroke}/>`;
    case "raised":
      return `<path d="M${n(lx - r * 0.8)} ${n(ly - r * 1.38)}Q${lx} ${n(ly - r * 1.6)} ${n(lx + r * 0.8)} ${n(ly - r * 1.42)}M${n(rx - r * 0.8)} ${n(ry - r * 1.7)}Q${rx} ${n(ry - r * 2.1)} ${n(rx + r * 0.8)} ${n(ry - r * 1.78)}" ${stroke}/>`;
  }
}

function mouth(p: Palette, face: Face, a: FaceAnchors): string {
  const [x, y] = a.mouth;
  const s = a.scale;
  const v = (value: number) => n(value * s);
  const stroke = `stroke="${p.line}" stroke-width="${v(3.4)}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const omega = `M${x} ${y}V${n(y + v(4))}M${x} ${n(y + v(4))}C${x} ${n(y + v(13))} ${n(x - v(8))} ${n(y + v(16))} ${n(x - v(15))} ${n(y + v(10))}M${x} ${n(y + v(4))}C${x} ${n(y + v(13))} ${n(x + v(8))} ${n(y + v(16))} ${n(x + v(15))} ${n(y + v(10))}`;
  const inside = "#5B2230";
  const tongue = "#FF8DA1";
  switch (face.mouth) {
    case "grin":
      return `<path d="M${n(x - v(13))} ${n(y + v(9))}Q${x} ${n(y + v(30))} ${n(x + v(13))} ${n(y + v(9))}Z" fill="${inside}"/><ellipse cx="${x}" cy="${n(y + v(19))}" rx="${v(6)}" ry="${v(4)}" fill="${tongue}"/><path d="${omega}" ${stroke}/>`;
    case "open":
      return `<path d="M${n(x - v(20))} ${n(y + v(6))}Q${x} ${n(y + v(46))} ${n(x + v(20))} ${n(y + v(6))}Q${x} ${n(y + v(12))} ${n(x - v(20))} ${n(y + v(6))}Z" fill="${inside}"/><ellipse cx="${x}" cy="${n(y + v(28))}" rx="${v(10)}" ry="${v(6)}" fill="${tongue}"/><path d="M${x} ${y}V${n(y + v(6))}" ${stroke}/>`;
    case "wail":
      return `<path d="M${n(x - v(16))} ${n(y + v(30))}Q${n(x - v(16))} ${n(y + v(6))} ${x} ${n(y + v(6))}Q${n(x + v(16))} ${n(y + v(6))} ${n(x + v(16))} ${n(y + v(30))}Q${x} ${n(y + v(24))} ${n(x - v(16))} ${n(y + v(30))}Z" fill="${inside}"/><ellipse cx="${x}" cy="${n(y + v(25))}" rx="${v(8)}" ry="${v(3.5)}" fill="${tongue}"/>`;
    case "o":
      return `<path d="M${x} ${y}V${n(y + v(4))}" ${stroke}/><ellipse cx="${x}" cy="${n(y + v(15))}" rx="${v(6.5)}" ry="${v(8.5)}" fill="${inside}"/>`;
    case "frown":
      return `<path d="M${x} ${y}V${n(y + v(5))}M${n(x - v(12))} ${n(y + v(17))}Q${x} ${n(y + v(7))} ${n(x + v(12))} ${n(y + v(17))}" ${stroke}/>`;
    case "wobble":
      return `<path d="M${x} ${y}V${n(y + v(5))}M${n(x - v(13))} ${n(y + v(16))}q${v(4.3)} ${v(-5)} ${v(8.6)} 0t${v(8.6)} 0t${v(8.6)} 0" ${stroke}/>`;
    case "kiss":
      return `<path d="M${n(x - v(2))} ${n(y + v(5))}c${v(8)} ${v(-3)} ${v(9)} ${v(5)} ${v(2)} ${v(6)}c${v(7)} ${v(1)} ${v(6)} ${v(9)} ${v(-2)} ${v(7)}" ${stroke}/>`;
    case "tongue":
      return `<path d="M${n(x - v(2))} ${n(y + v(10))}h${v(18)}v${v(13)}a${v(9)} ${v(9)} 0 0 1 ${v(-18)} 0Z" fill="${tongue}" stroke="${p.line}" stroke-width="${v(2.8)}" stroke-linejoin="round"/><path d="M${n(x + v(7))} ${n(y + v(13))}v${v(9)}" stroke="#E2607A" stroke-width="${v(2.2)}" stroke-linecap="round"/><path d="${omega}" ${stroke}/>`;
    case "smirk":
      return `<path d="M${x} ${y}V${n(y + v(4))}M${n(x - v(12))} ${n(y + v(13))}C${n(x - v(2))} ${n(y + v(17))} ${n(x + v(8))} ${n(y + v(15))} ${n(x + v(15))} ${n(y + v(5))}" ${stroke}/>`;
    case "pout":
      return `<path d="M${x} ${y}V${n(y + v(4))}M${n(x - v(8))} ${n(y + v(15))}Q${x} ${n(y + v(8))} ${n(x + v(8))} ${n(y + v(15))}" ${stroke}/>`;
    default:
      return `<path d="${omega}" ${stroke}/>`;
  }
}

function cheeks(id: Id, face: Face, a: FaceAnchors, on: boolean): string {
  const level = face.blush ?? 1;
  if (!on || level === 0) return "";
  const s = a.scale;
  const one = ([x, y]: Point) =>
    `<ellipse cx="${x}" cy="${y}" rx="${n((level === 2 ? 34 : 28) * s)}" ry="${n((level === 2 ? 20 : 16) * s)}" fill="url(#${id("blush")})"/>` +
    (level === 2
      ? `<path d="M${n(x - 12 * s)} ${n(y + 4 * s)}l${n(5 * s)} ${n(-9 * s)}M${n(x - 2 * s)} ${n(y + 4 * s)}l${n(5 * s)} ${n(-9 * s)}M${n(x + 8 * s)} ${n(y + 4 * s)}l${n(5 * s)} ${n(-9 * s)}" stroke="#FFFFFF" stroke-width="${n(2.4 * s)}" stroke-linecap="round" opacity="0.85"/>`
      : "");
  return one(a.cheeks[0]) + one(a.cheeks[1]);
}

function tears(id: Id, face: Face, a: FaceAnchors): string {
  if (!face.tears) return "";
  const r = a.r;
  const [[lx, ly], [rx, ry]] = a.eyes;
  switch (face.tears) {
    case "single":
      return (
        `<path d="M${n(rx + r * 0.45)} ${n(ry + r * 0.7)}Q${n(rx + r * 0.55)} ${n(ry + r * 1.1)} ${n(rx + r * 0.5)} ${n(ry + r * 1.4)}" stroke="#A9DBFF" stroke-width="${n(r * 0.14)}" stroke-linecap="round" opacity="0.8"/>` +
        `<path d="${dropPath([rx + r * 0.55, ry + r * 1.85], r * 0.42)}" fill="url(#${id("tear")})" stroke="#4E9BE0" stroke-opacity="0.5" stroke-width="${n(r * 0.05)}"/>` +
        `<ellipse cx="${n(rx + r * 0.44)}" cy="${n(ry + r * 1.92)}" rx="${n(r * 0.09)}" ry="${n(r * 0.15)}" fill="#FFFFFF"/>`
      );
    case "streams":
      return [lx, rx]
        .map((x, index) => {
          const y = index === 0 ? ly : ry;
          return `<path d="M${n(x - r * 0.35)} ${n(y + r * 0.45)}C${n(x - r * 0.45)} ${n(y + r * 1.4)} ${n(x - r * 0.2)} ${n(y + r * 2)} ${n(x - r * 0.4)} ${n(y + r * 2.7)}L${n(x + r * 0.2)} ${n(y + r * 2.7)}C${n(x + r * 0.35)} ${n(y + r * 2)} ${n(x + r * 0.1)} ${n(y + r * 1.4)} ${n(x + r * 0.25)} ${n(y + r * 0.45)}Z" fill="url(#${id("tear")})" stroke="#4E9BE0" stroke-opacity="0.55" stroke-width="${n(r * 0.05)}"/>` + `<path d="M${n(x - r * 0.15)} ${n(y + r * 0.8)}C${n(x - r * 0.2)} ${n(y + r * 1.4)} ${n(x - r * 0.05)} ${n(y + r * 1.9)} ${n(x - r * 0.15)} ${n(y + r * 2.4)}" stroke="#FFFFFF" stroke-width="${n(r * 0.08)}" stroke-linecap="round" opacity="0.8"/>`;
        })
        .join("");
    case "joy":
      return (
        `<path d="${dropPath([lx - r * 1.35, ly - r * 0.2], r * 0.22)}" fill="url(#${id("tear")})" transform="rotate(-40 ${n(lx - r * 1.35)} ${n(ly - r * 0.2)})"/>` +
        `<path d="${dropPath([lx - r * 1.2, ly + r * 0.55], r * 0.18)}" fill="url(#${id("tear")})" transform="rotate(-70 ${n(lx - r * 1.2)} ${n(ly + r * 0.55)})"/>` +
        `<path d="${dropPath([rx + r * 1.35, ry - r * 0.2], r * 0.22)}" fill="url(#${id("tear")})" transform="rotate(40 ${n(rx + r * 1.35)} ${n(ry - r * 0.2)})"/>` +
        `<path d="${dropPath([rx + r * 1.2, ry + r * 0.55], r * 0.18)}" fill="url(#${id("tear")})" transform="rotate(70 ${n(rx + r * 1.2)} ${n(ry + r * 0.55)})"/>`
      );
  }
}

/* Limbs ------------------------------------------------------------------- */

interface LimbStyle {
  fill: string;
  outline: string;
  /** Paw colour (fur) when the arm wears a sleeve. */
  paw: string;
  sleeve?: boolean;
  width: number;
}

function arm(style: LimbStyle, from: Point, to: Point, bend: number, opts: { pads?: boolean; pawFill?: string } = {}): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = mx + (-(y2 - y1) / length) * bend;
  const cy = my + ((x2 - x1) / length) * bend;
  const d = `M${pt(from)}Q${n(cx)} ${n(cy)} ${pt(to)}`;
  const w = style.width;
  const pawR = w * 0.6;
  const pads = opts.pads
    ? `<ellipse cx="${n(x2)}" cy="${n(y2 + pawR * 0.12)}" rx="${n(pawR * 0.42)}" ry="${n(pawR * 0.34)}" fill="#F7A1B3"/>` +
      `<circle cx="${n(x2 - pawR * 0.5)}" cy="${n(y2 - pawR * 0.45)}" r="${n(pawR * 0.17)}" fill="#F7A1B3"/>` +
      `<circle cx="${n(x2)}" cy="${n(y2 - pawR * 0.62)}" r="${n(pawR * 0.17)}" fill="#F7A1B3"/>` +
      `<circle cx="${n(x2 + pawR * 0.5)}" cy="${n(y2 - pawR * 0.45)}" r="${n(pawR * 0.17)}" fill="#F7A1B3"/>`
    : `<path d="M${n(x2 - pawR * 0.3)} ${n(y2 + pawR * 0.2)}v${n(pawR * 0.5)}M${n(x2 + pawR * 0.3)} ${n(y2 + pawR * 0.2)}v${n(pawR * 0.5)}" stroke="${style.outline}" stroke-opacity="0.45" stroke-width="${n(w * 0.06)}" stroke-linecap="round"/>`;
  return (
    `<path d="${d}" stroke="${style.outline}" stroke-width="${n(w + 6)}" stroke-linecap="round" fill="none"/>` +
    `<path d="${d}" stroke="${style.fill}" stroke-width="${w}" stroke-linecap="round" fill="none"/>` +
    (style.sleeve
      ? `<circle cx="${n(x2 - (x2 - cx) * 0.2)}" cy="${n(y2 - (y2 - cy) * 0.2)}" r="${n(w * 0.52)}" fill="url(#__gold__)"/>`
      : "") +
    `<circle cx="${n(x2)}" cy="${n(y2)}" r="${n(pawR + 3)}" fill="${style.outline}"/>` +
    `<circle cx="${n(x2)}" cy="${n(y2)}" r="${n(pawR)}" fill="${opts.pawFill ?? style.paw}"/>` +
    pads
  );
}

/* Props ------------------------------------------------------------------- */

function mug(id: Id, [x, y]: Point, s = 1): string {
  const v = (value: number) => n(value * s);
  return (
    `<path d="M${n(x + v(30))} ${n(y - v(18))}c${v(26)} ${v(-4)} ${v(30)} ${v(30)} ${v(2)} ${v(32)}" stroke="#D9D6E2" stroke-width="${v(10)}" stroke-linecap="round" fill="none"/>` +
    `<rect x="${n(x - v(38))}" y="${n(y - v(34))}" width="${v(72)}" height="${v(70)}" rx="${v(16)}" fill="url(#${id("mug")})" stroke="#A7A3B5" stroke-width="${v(3)}"/>` +
    `<rect x="${n(x - v(38))}" y="${n(y + v(6))}" width="${v(72)}" height="${v(10)}" fill="#F28C38" opacity="0.9"/>` +
    `<ellipse cx="${n(x - v(2))}" cy="${n(y - v(30))}" rx="${v(30)}" ry="${v(7)}" fill="#7A4A2C"/>` +
    `<ellipse cx="${n(x - v(4))}" cy="${n(y - v(31))}" rx="${v(14)}" ry="${v(3.5)}" fill="#E8C9A0"/>` +
    `<path d="M${n(x - v(16))} ${n(y - v(48))}c${v(-8)} ${v(-10)} ${v(8)} ${v(-16)} 0 ${v(-28)}M${n(x)} ${n(y - v(50))}c${v(-8)} ${v(-10)} ${v(8)} ${v(-16)} 0 ${v(-28)}M${n(x + v(16))} ${n(y - v(48))}c${v(-8)} ${v(-10)} ${v(8)} ${v(-16)} 0 ${v(-28)}" stroke="#FFFFFF" stroke-width="${v(5)}" stroke-linecap="round" opacity="0.85" fill="none"/>`
  );
}

function thermometer([x, y]: Point, angle = 24, s = 1): string {
  const v = (value: number) => n(value * s);
  return (
    `<g transform="rotate(${angle} ${x} ${y})">` +
    `<rect x="${x}" y="${n(y - v(5))}" width="${v(78)}" height="${v(10)}" rx="${v(5)}" fill="#F5F8FC" stroke="#8D98AC" stroke-width="${v(2.2)}"/>` +
    `<rect x="${n(x + v(2))}" y="${n(y - v(1.8))}" width="${v(48)}" height="${v(3.6)}" rx="${v(1.8)}" fill="#E5384F"/>` +
    `<path d="M${n(x + v(56))} ${n(y - v(5))}v${v(10)}M${n(x + v(63))} ${n(y - v(5))}v${v(6)}M${n(x + v(70))} ${n(y - v(5))}v${v(10)}" stroke="#8D98AC" stroke-width="${v(1.6)}"/>` +
    `</g>`
  );
}

function icePack(id: Id, [x, y]: Point, s = 1): string {
  const v = (value: number) => n(value * s);
  return (
    `<g transform="rotate(-10 ${x} ${y})">` +
    `<rect x="${n(x - v(52))}" y="${n(y - v(22))}" width="${v(104)}" height="${v(44)}" rx="${v(20)}" fill="url(#${id("ice")})" stroke="#4F9AD4" stroke-width="${v(3)}"/>` +
    `<path d="M${n(x + v(50))} ${n(y - v(6))}l${v(14)} ${v(-8)}v${v(28)}l${v(-14)} ${v(-8)}Z" fill="#7DC2F2" stroke="#4F9AD4" stroke-width="${v(3)}" stroke-linejoin="round"/>` +
    `<path d="M${n(x - v(34))} ${n(y - v(10))}h${v(40)}" stroke="#FFFFFF" stroke-width="${v(5)}" stroke-linecap="round" opacity="0.8"/>` +
    `</g>`
  );
}

function nightcap(id: Id, s: number, [cx, top]: Point): string {
  const v = (value: number) => n(value * s);
  const x = (value: number) => n(cx + value * s);
  const y = (value: number) => n(top + value * s);
  return (
    `<path d="M${x(-104)} ${y(44)}C${x(-86)} ${y(-14)} ${x(-28)} ${y(-48)} ${x(34)} ${y(-46)}C${x(86)} ${y(-44)} ${x(130)} ${y(-14)} ${x(150)} ${y(28)}L${x(136)} ${y(36)}C${x(112)} ${y(10)} ${x(76)} ${y(0)} ${x(44)} ${y(4)}C${x(68)} ${y(18)} ${x(90)} ${y(36)} ${x(100)} ${y(50)}Z" fill="url(#${id("cap")})" stroke="#262F8A" stroke-width="${v(3)}" stroke-linejoin="round"/>` +
    `<path d="${sparklePath([cx - 30 * s, top - 14 * s], 7 * s)} ${sparklePath([cx + 40 * s, top - 26 * s], 6 * s)} ${sparklePath([cx + 6 * s, top + 22 * s], 5 * s)}" fill="#FFE27A"/>` +
    `<rect x="${x(-112)}" y="${y(36)}" width="${v(220)}" height="${v(28)}" rx="${v(14)}" fill="#FFFFFF" stroke="#D5D2E2" stroke-width="${v(2)}"/>` +
    `<circle cx="${x(148)}" cy="${y(38)}" r="${v(19)}" fill="#FFFFFF" stroke="#D5D2E2" stroke-width="${v(2)}"/>`
  );
}

function sunglasses(id: Id, a: FaceAnchors): string {
  const r = a.r;
  const lens = ([x, y]: Point, flip: 1 | -1) => {
    const w = r * 1.45;
    return `<path d="M${n(x - w)} ${n(y - r * 0.62)}H${n(x + w)}C${n(x + w + r * 0.12)} ${n(y - r * 0.62)} ${n(x + w + r * 0.14)} ${n(y - r * 0.4)} ${n(x + w)} ${n(y - r * 0.2)}L${n(x + w * 0.72)} ${n(y + r * 0.62)}C${n(x + w * 0.6)} ${n(y + r * 0.92)} ${n(x + w * 0.32)} ${n(y + r * 1.02)} ${x} ${n(y + r * 1.02)}C${n(x - w * 0.32)} ${n(y + r * 1.02)} ${n(x - w * 0.62)} ${n(y + r * 0.92)} ${n(x - w * 0.76)} ${n(y + r * 0.62)}L${n(x - w)} ${n(y - r * 0.2)}C${n(x - w - r * 0.14)} ${n(y - r * 0.4)} ${n(x - w - r * 0.12)} ${n(y - r * 0.62)} ${n(x - w)} ${n(y - r * 0.62)}Z" fill="url(#${id("shades")})"/><path d="M${n(x - w * 0.62 * flip)} ${n(y - r * 0.32)}L${n(x - w * 0.12 * flip)} ${n(y + r * 0.62)}" stroke="#FFFFFF" stroke-width="${n(r * 0.16)}" stroke-linecap="round" opacity="0.35"/>`;
  };
  const [l, rt] = a.eyes;
  return (
    lens(l, 1) +
    lens(rt, 1) +
    `<path d="M${n(l[0] + r * 1.45)} ${n(l[1] - r * 0.5)}Q${n((l[0] + rt[0]) / 2)} ${n(l[1] - r * 0.9)} ${n(rt[0] - r * 1.45)} ${n(rt[1] - r * 0.5)}" stroke="#16161C" stroke-width="${n(r * 0.18)}" fill="none"/>`
  );
}

function angerMark([x, y]: Point, s: number): string {
  return `<path d="M${n(x - s)} ${n(y - s * 0.3)}Q${n(x - s * 0.3)} ${n(y - s * 0.3)} ${n(x - s * 0.3)} ${n(y - s)}M${n(x + s * 0.3)} ${n(y - s)}Q${n(x + s * 0.3)} ${n(y - s * 0.3)} ${n(x + s)} ${n(y - s * 0.3)}M${n(x + s)} ${n(y + s * 0.3)}Q${n(x + s * 0.3)} ${n(y + s * 0.3)} ${n(x + s * 0.3)} ${n(y + s)}M${n(x - s * 0.3)} ${n(y + s)}Q${n(x - s * 0.3)} ${n(y + s * 0.3)} ${n(x - s)} ${n(y + s * 0.3)}" stroke="#E5304B" stroke-width="${n(s * 0.34)}" stroke-linecap="round" fill="none"/>`;
}

function questionMark([x, y]: Point, s: number): string {
  const d = `M${n(x - s * 0.45)} ${n(y - s * 0.45)}C${n(x - s * 0.45)} ${n(y - s * 1.15)} ${n(x + s * 0.6)} ${n(y - s * 1.2)} ${n(x + s * 0.6)} ${n(y - s * 0.5)}C${n(x + s * 0.6)} ${n(y - s * 0.05)} ${x} ${n(y + s * 0.02)} ${x} ${n(y + s * 0.42)}`;
  return (
    `<path d="${d}" stroke="#7A4A00" stroke-width="${n(s * 0.42)}" stroke-linecap="round" fill="none"/>` +
    `<path d="${d}" stroke="#FFC233" stroke-width="${n(s * 0.28)}" stroke-linecap="round" fill="none"/>` +
    `<circle cx="${x}" cy="${n(y + s * 0.88)}" r="${n(s * 0.2)}" fill="#FFC233" stroke="#7A4A00" stroke-width="${n(s * 0.07)}"/>`
  );
}

function zz([x, y]: Point, s: number): string {
  const z = (zx: number, zy: number, k: number) => `M${n(zx)} ${n(zy)}h${n(22 * k)}l${n(-22 * k)} ${n(26 * k)}h${n(22 * k)}`;
  return `<path d="${z(x, y, s)}${z(x + 34 * s, y - 40 * s, s * 0.75)}${z(x + 62 * s, y - 72 * s, s * 0.55)}" stroke="#8FA6FF" stroke-width="${n(7 * s)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

function sweat(id: Id, at: Point, s: number): string {
  return `<path d="${dropPath(at, s)}" fill="url(#${id("tear")})" opacity="0.9"/>`;
}

function waveLines([x, y]: Point, s = 1): string {
  return `<path d="M${n(x)} ${n(y)}q${n(10 * s)} ${n(-10 * s)} ${n(6 * s)} ${n(-26 * s)}M${n(x + 18 * s)} ${n(y + 10 * s)}q${n(14 * s)} ${n(-10 * s)} ${n(12 * s)} ${n(-32 * s)}" stroke="#FFC24B" stroke-width="${n(6 * s)}" stroke-linecap="round" fill="none"/>`;
}

function diya(id: Id, [x, y]: Point, s: number): string {
  const v = (value: number) => n(value * s);
  const fx = x + v(4);
  const fy = y - v(14);
  return (
    `<circle data-part="glow" cx="${n(fx)}" cy="${n(fy - v(18))}" r="${v(70)}" fill="url(#${id("warm")})"/>` +
    `<path d="M${n(x - v(46))} ${n(y - v(6))}C${n(x - v(42))} ${n(y + v(26))} ${n(x - v(20))} ${n(y + v(36))} ${x} ${n(y + v(36))}C${n(x + v(20))} ${n(y + v(36))} ${n(x + v(42))} ${n(y + v(26))} ${n(x + v(46))} ${n(y - v(6))}Z" fill="url(#${id("clay")})" stroke="#7C3410" stroke-width="${v(3)}" stroke-linejoin="round"/>` +
    `<ellipse cx="${x}" cy="${n(y - v(6))}" rx="${v(46)}" ry="${v(10)}" fill="#8E3C14"/>` +
    `<ellipse cx="${x}" cy="${n(y - v(7))}" rx="${v(38)}" ry="${v(6)}" fill="#E8A13A"/>` +
    `<path d="M${n(x - v(34))} ${n(y + v(12))}q${v(8.5)} ${v(8)} ${v(17)} 0t${v(17)} 0t${v(17)} 0t${v(17)} 0" stroke="#FFD36B" stroke-width="${v(3.2)}" fill="none" stroke-linecap="round"/>` +
    `<circle cx="${n(x - v(20))}" cy="${n(y + v(24))}" r="${v(3)}" fill="#FFD36B"/><circle cx="${x}" cy="${n(y + v(28))}" r="${v(3)}" fill="#FFD36B"/><circle cx="${n(x + v(20))}" cy="${n(y + v(24))}" r="${v(3)}" fill="#FFD36B"/>` +
    `<path d="M${n(fx)} ${n(fy - v(40))}C${n(fx + v(14))} ${n(fy - v(20))} ${n(fx + v(15))} ${n(fy - v(4))} ${n(fx)} ${n(fy)}C${n(fx - v(15))} ${n(fy - v(4))} ${n(fx - v(14))} ${n(fy - v(20))} ${n(fx)} ${n(fy - v(40))}Z" fill="url(#${id("flame")})"/>` +
    `<path d="M${n(fx)} ${n(fy - v(20))}C${n(fx + v(5))} ${n(fy - v(12))} ${n(fx + v(5))} ${n(fy - v(5))} ${n(fx)} ${n(fy - v(3))}C${n(fx - v(5))} ${n(fy - v(5))} ${n(fx - v(5))} ${n(fy - v(12))} ${n(fx)} ${n(fy - v(20))}Z" fill="#FFFFFF" opacity="0.9"/>`
  );
}

function sparkler(id: Id, from: Point, to: Point, s: number): string {
  const [x, y] = to;
  const rays = Array.from({ length: 18 }, (_, index) => {
    const angle = (index / 18) * Math.PI * 2 + 0.2;
    const length = (index % 3 === 0 ? 46 : index % 3 === 1 ? 32 : 24) * s;
    const inner = 8 * s;
    return `M${n(x + Math.cos(angle) * inner)} ${n(y + Math.sin(angle) * inner)}L${n(x + Math.cos(angle) * length)} ${n(y + Math.sin(angle) * length)}`;
  }).join("");
  const dots = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2 + 0.5;
    const distance = (index % 2 ? 52 : 40) * s;
    return `<circle cx="${n(x + Math.cos(angle) * distance)}" cy="${n(y + Math.sin(angle) * distance)}" r="${n(2.6 * s)}" fill="#FFF3B0"/>`;
  }).join("");
  return (
    `<path d="M${pt(from)}L${pt(to)}" stroke="#8F959E" stroke-width="${n(5 * s)}" stroke-linecap="round"/>` +
    `<g data-part="decor">` +
    `<circle cx="${x}" cy="${y}" r="${n(70 * s)}" fill="url(#${id("warm")})"/>` +
    `<path d="${rays}" stroke="#FFD34D" stroke-width="${n(3.4 * s)}" stroke-linecap="round"/>` +
    `<path d="${rays}" stroke="#FFFFFF" stroke-width="${n(1.4 * s)}" stroke-linecap="round" opacity="0.9"/>` +
    dots +
    `<circle cx="${x}" cy="${y}" r="${n(9 * s)}" fill="#FFFBE6"/>` +
    `</g>`
  );
}

/** Diwali string lights across the top of the sticker. */
function lights(): string {
  const segments: [Point, Point, Point][] = [
    [
      [-10, 30],
      [128, 92],
      [256, 40],
    ],
    [
      [256, 40],
      [384, 92],
      [522, 30],
    ],
  ];
  const colors = ["#FFD54A", "#FF9F1C", "#FF5D8F", "#FFF1B8"];
  let wire = "";
  let bulbs = "";
  let index = 0;
  for (const [a, b, c] of segments) {
    wire += `M${pt(a)}Q${pt(b)} ${pt(c)}`;
    for (const t of [0.18, 0.42, 0.66, 0.9]) {
      const x = (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t ** 2 * c[0];
      const y = (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t ** 2 * c[1];
      const color = colors[index % colors.length]!;
      bulbs +=
        `<circle cx="${n(x)}" cy="${n(y + 12)}" r="20" fill="${color}" opacity="0.35"/>` +
        `<rect x="${n(x - 3)}" y="${n(y - 2)}" width="6" height="7" rx="1.5" fill="#6B5A44"/>` +
        `<ellipse cx="${n(x)}" cy="${n(y + 12)}" rx="7" ry="10" fill="${color}"/>` +
        `<ellipse cx="${n(x - 2)}" cy="${n(y + 9)}" rx="2" ry="3.4" fill="#FFFFFF" opacity="0.8"/>`;
      index += 1;
    }
  }
  return `<g data-part="decor"><path d="${wire}" stroke="#5A4632" stroke-width="3" fill="none"/>${bulbs}</g>`;
}

function marigold([x, y]: Point, s: number): string {
  const petals = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    return `<circle cx="${n(x + Math.cos(angle) * 9 * s)}" cy="${n(y + Math.sin(angle) * 9 * s)}" r="${n(8 * s)}" fill="${index % 2 ? "#FF9F1C" : "#FFB627"}"/>`;
  }).join("");
  return petals + `<circle cx="${x}" cy="${y}" r="${n(8 * s)}" fill="#F07C0B"/><circle cx="${x}" cy="${y}" r="${n(3.4 * s)}" fill="#C25700"/>`;
}

/* Characters ------------------------------------------------------------- */

type Pose = "rest" | "wave" | "hold" | "together" | "chin" | "cheeks" | "kiss" | "sparkler" | "sparklerLeft" | "crossed" | "up" | "none";
type Outfit = "kurta" | "saree" | undefined;

interface CharacterOptions {
  species: Species;
  look: Look;
  face: Face;
  pose: Pose;
  outfit: Outfit;
  outfitColor: string;
  glass: boolean;
  blush: boolean;
  stripes: boolean;
  whiskers: boolean;
  portable: boolean;
  /** Head rotation in degrees around the neck. */
  headTilt?: number;
  /** Markup drawn between the body and the arms (held props). */
  held?: string;
  /** Markup drawn with the head (follows the tilt). */
  headwear?: string;
  /** Markup drawn on top of everything. */
  front?: string;
  /** Hide the tail (e.g. in bed). */
  noTail?: boolean;
  /** Hide body and paws (e.g. under a blanket). */
  headOnly?: boolean;
}

const CAT_HEAD =
  "M256 102C328 102 386 122 406 174C414 194 418 214 420 232L438 246L420 254L432 270L412 274C398 314 338 336 256 338C174 336 114 314 100 274L80 270L92 254L74 246L92 232C94 214 98 194 106 174C126 122 184 102 256 102Z";
const CAT_EAR_L = "M108 198C98 148 102 94 120 56C126 44 138 42 148 50C176 74 200 102 220 128Z";
const CAT_EAR_R = "M404 198C414 148 410 94 392 56C386 44 374 42 364 50C336 74 312 102 292 128Z";
const CAT_EAR_IN_L = "M126 174C120 136 124 100 136 74C139 68 145 67 150 72C168 92 184 110 196 130Z";
const CAT_EAR_IN_R = "M386 174C392 136 388 100 376 74C373 68 367 67 362 72C344 92 328 110 316 130Z";
const CAT_BODY = "M180 318C152 360 146 430 158 472C166 498 198 506 256 506C314 506 346 498 354 472C366 430 360 360 332 318Z";
const CAT_TAIL = "M334 474C398 494 452 458 452 404C452 366 424 352 412 370C402 386 422 394 424 414C426 448 392 462 344 454Z";
const CAT_FACE: FaceAnchors = {
  eyes: [
    [203, 220],
    [309, 220],
  ],
  r: 36,
  mouth: [256, 274],
  cheeks: [
    [158, 268],
    [354, 268],
  ],
  lid: "",
  scale: 1,
};

const GHOST_BODY =
  "M118 470V232C118 148 180 84 256 84C332 84 394 148 394 232V470Q381 496 366 470Q353 496 339 470Q326 496 311 470Q297 496 283 470Q270 496 256 470Q242 496 229 470Q215 496 201 470Q187 496 174 470Q160 496 146 470Q132 496 118 470Z";
const GHOST_FACE: FaceAnchors = {
  eyes: [
    [214, 226],
    [298, 226],
  ],
  r: 30,
  mouth: [256, 262],
  cheeks: [
    [176, 266],
    [336, 266],
  ],
  lid: "",
  scale: 0.9,
};

const SHOULDERS = { cat: [[192, 352], [320, 352]] as const, ghost: [[150, 318], [362, 318]] as const };

function poseArms(o: CharacterOptions, limb: LimbStyle): { arms: string; restPaws: boolean[] } {
  const [ls, rs] = SHOULDERS[o.species];
  const ghost = o.species === "ghost";
  const hold = ghost ? ([[218, 386], [294, 386]] as const) : ([[216, 418], [296, 418]] as const);
  switch (o.pose) {
    case "wave":
      return { arms: arm(limb, rs, ghost ? [404, 214] : [404, 236], -30, { pads: !ghost }), restPaws: [true, false] };
    case "hold":
      return { arms: arm(limb, ls, hold[0], 22) + arm(limb, rs, hold[1], -22), restPaws: [false, false] };
    case "together":
      return { arms: arm(limb, ls, [242, 382], 26) + arm(limb, rs, [270, 382], -26), restPaws: [false, false] };
    case "chin":
      return { arms: arm(limb, rs, ghost ? [290, 300] : [292, 318], -28), restPaws: [true, false] };
    case "cheeks":
      return {
        arms: arm(limb, ls, ghost ? [168, 276] : [154, 286], 30) + arm(limb, rs, ghost ? [344, 276] : [358, 286], -30),
        restPaws: [false, false],
      };
    case "kiss":
      return { arms: arm(limb, rs, ghost ? [300, 288] : [314, 300], -26, { pads: !ghost }), restPaws: [true, false] };
    case "sparkler":
      return { arms: arm(limb, rs, ghost ? [392, 270] : [388, 300], -20), restPaws: [true, false] };
    case "sparklerLeft":
      return { arms: arm(limb, ls, ghost ? [120, 270] : [124, 300], 20), restPaws: [false, true] };
    case "crossed":
      return { arms: arm(limb, ls, [300, 404], 30) + arm(limb, rs, [214, 404], -30), restPaws: [false, false] };
    case "up":
      return { arms: arm(limb, ls, [112, 176], 10) + arm(limb, rs, [400, 176], -10), restPaws: [false, false] };
    case "none":
      return { arms: "", restPaws: [false, false] };
    default:
      return { arms: "", restPaws: [true, true] };
  }
}

function outfitLayer(id: Id, kind: Outfit, species: Species): string {
  if (!kind || species !== "cat") return "";
  const gold = `url(#${id("gold")})`;
  const base = `<path d="${CAT_BODY}" fill="url(#${id("outfit")})" stroke="rgba(0,0,0,0.25)" stroke-width="4"/>`;
  const hem = `<path d="M162 470C200 482 312 482 350 470" stroke="${gold}" stroke-width="12" fill="none"/><path d="M174 476h164" stroke="#FFF1C1" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>`;
  if (kind === "kurta") {
    return (
      base +
      hem +
      `<path d="M212 330C230 346 282 346 300 330L300 348C282 364 230 364 212 348Z" fill="rgba(0,0,0,0.22)"/>` +
      `<path d="M212 330C230 346 282 346 300 330" stroke="${gold}" stroke-width="6" fill="none"/>` +
      `<path d="M256 350V446" stroke="${gold}" stroke-width="5"/>` +
      `<circle cx="256" cy="372" r="6" fill="${gold}"/><circle cx="256" cy="398" r="6" fill="${gold}"/><circle cx="256" cy="424" r="6" fill="${gold}"/>`
    );
  }
  return (
    base +
    hem +
    `<path d="M178 336C214 330 246 354 272 396C292 428 320 458 352 478L338 500C304 478 272 446 250 414C226 378 204 360 168 362Z" fill="rgba(0,0,0,0.18)"/>` +
    `<path d="M178 336C214 330 246 354 272 396C292 428 320 458 352 478" stroke="${gold}" stroke-width="7" fill="none"/>` +
    `<path d="M168 362C204 360 226 378 250 414C272 446 304 478 338 500" stroke="${gold}" stroke-width="7" fill="none"/>` +
    `<path d="M196 352l6 6m22 6l6 6m14 14l6 6m12 16l6 6m10 14l6 6" stroke="#FFE7A3" stroke-width="4" stroke-linecap="round"/>`
  );
}

function catHead(id: Id, p: Palette, o: CharacterOptions, face: FaceAnchors): string {
  const portable = o.portable;
  const outline = `stroke="${p.outline}" stroke-width="5" stroke-linejoin="round"`;
  const ears = o.glass
    ? `<path d="${CAT_EAR_L}" fill="url(#${id("glass")})" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/><path d="${CAT_EAR_R}" fill="url(#${id("glass")})" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>`
    : `<path d="${CAT_EAR_L}" fill="url(#${id("fur")})" ${outline}/><path d="${CAT_EAR_R}" fill="url(#${id("fur")})" ${outline}/>`;
  const earInner =
    `<path d="${CAT_EAR_IN_L}" fill="url(#${id("ear")})"/><path d="${CAT_EAR_IN_R}" fill="url(#${id("ear")})"/>` +
    `<path d="M142 156C144 132 150 114 158 102M154 166C160 146 168 132 178 122M370 156C368 132 362 114 354 102M358 166C352 146 344 132 334 122" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.75"/>` +
    (o.glass
      ? `<path d="M118 182C108 140 112 98 126 70M394 182C404 140 400 98 386 70" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.9"/>`
      : "");
  const stripes = o.stripes
    ? `<g ${portable ? 'opacity="0.5"' : `filter="url(#${id("soft")})" opacity="0.75"`}>` +
      `<path d="M256 108V150M226 114C230 126 232 138 230 150M286 114C282 126 280 138 282 150" stroke="${p.stripe}" stroke-width="11" stroke-linecap="round"/>` +
      `<path d="M98 214C108 216 118 220 126 226M414 214C404 216 394 220 386 226M96 236C104 238 112 241 118 246M416 236C408 238 400 241 394 246" stroke="${p.stripe}" stroke-width="8" stroke-linecap="round"/>` +
      `</g>`
    : "";
  const whiskers = o.whiskers
    ? `<g data-part="whiskers" stroke-linecap="round" fill="none">` +
      `<path d="M220 282C188 274 152 270 112 272M218 292C186 292 150 296 110 306M220 302C190 310 160 322 128 340M292 282C324 274 360 270 400 272M294 292C326 292 362 296 402 306M292 302C322 310 352 322 384 340" stroke="#000000" stroke-opacity="0.12" stroke-width="4.2"/>` +
      `<path d="M220 282C188 274 152 270 112 272M218 292C186 292 150 296 110 306M220 302C190 310 160 322 128 340M292 282C324 274 360 270 400 272M294 292C326 292 362 296 402 306M292 302C322 310 352 322 384 340" stroke="#FFFFFF" stroke-width="2.4"/>` +
      `</g>`
    : "";
  return [
    ears,
    earInner,
    `<path d="${CAT_HEAD}" fill="url(#${id("fur")})" ${outline}/>`,
    portable ? "" : `<path d="${CAT_HEAD}" fill="#000000" filter="url(#${id("noise")})" opacity="0.06"/>`,
    stripes,
    `<ellipse cx="256" cy="226" rx="138" ry="96" fill="url(#${id("glow")})"/>`,
    `<ellipse cx="200" cy="142" rx="54" ry="16" fill="#FFFFFF" opacity="0.28" transform="rotate(-12 200 142)"/>`,
    `<ellipse cx="256" cy="288" rx="66" ry="40" fill="url(#${id("muzzle")})"/>`,
    `<ellipse cx="236" cy="286" rx="26" ry="19" fill="${p.muzzle}" opacity="0.8"/><ellipse cx="276" cy="286" rx="26" ry="19" fill="${p.muzzle}" opacity="0.8"/>`,
    cheeks(id, o.face, face, o.blush),
    eyes(id, p, o.face, face),
    brows(p, o.face, face),
    `<path d="M243 260C243 252 269 252 269 260C269 268 261 274 256 275C251 274 243 268 243 260Z" fill="url(#${id("nose")})"/>`,
    `<ellipse cx="251" cy="258" rx="5" ry="2.4" fill="#FFFFFF" opacity="0.8"/>`,
    mouth(p, o.face, face),
    `<g fill="${p.line}" opacity="0.3"><circle cx="226" cy="284" r="2"/><circle cx="218" cy="292" r="2"/><circle cx="230" cy="296" r="2"/><circle cx="286" cy="284" r="2"/><circle cx="294" cy="292" r="2"/><circle cx="282" cy="296" r="2"/></g>`,
    tears(id, o.face, face),
    whiskers,
  ].join("");
}

function ghostBody(id: Id, p: Palette, o: CharacterOptions, face: FaceAnchors): string {
  const fill = o.glass ? `url(#${id("ghostGlass")})` : `url(#${id("fur")})`;
  return [
    o.glass
      ? `<linearGradient id="${id("ghostGlass")}" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${lighten(p.fur, 0.8)}" stop-opacity="0.92"/><stop offset="0.6" stop-color="${p.fur}" stop-opacity="0.6"/><stop offset="1" stop-color="${p.furShade}" stop-opacity="0.78"/></linearGradient>`
      : "",
    `<path d="${GHOST_BODY}" fill="${fill}" stroke="${o.glass ? "#FFFFFF" : p.outline}" stroke-opacity="${o.glass ? 0.9 : 0.6}" stroke-width="5" stroke-linejoin="round"/>`,
    o.portable || o.glass ? "" : `<path d="${GHOST_BODY}" fill="#000000" filter="url(#${id("noise")})" opacity="0.04"/>`,
    `<ellipse cx="256" cy="232" rx="118" ry="96" fill="url(#${id("glow")})"/>`,
    `<ellipse cx="196" cy="150" rx="56" ry="22" fill="#FFFFFF" opacity="${o.glass ? 0.8 : 0.5}" transform="rotate(-24 196 150)"/>`,
    o.glass ? `<path d="M140 250C140 196 160 156 196 132" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.85"/>` : "",
    cheeks(id, o.face, face, o.blush),
    eyes(id, p, o.face, face),
    brows(p, o.face, face),
    mouth(p, o.face, face),
    tears(id, o.face, face),
  ].join("");
}

/** One character in its own 512 × 512 space. */
function character(id: Id, o: CharacterOptions): string {
  const p = palette(o.look);
  const ghost = o.species === "ghost";
  const face: FaceAnchors = { ...(ghost ? GHOST_FACE : CAT_FACE), lid: o.look.fur };
  const sleeve = Boolean(o.outfit) && !ghost;
  const limb: LimbStyle = {
    fill: sleeve ? lighten(o.outfitColor, 0.05) : o.look.fur,
    outline: sleeve ? darken(o.outfitColor, 0.35) : p.outline,
    paw: o.look.fur,
    sleeve,
    width: ghost ? 40 : 46,
  };
  const { arms, restPaws } = poseArms(o, limb);
  const pawStroke = `stroke="${p.outline}" stroke-width="5"`;
  const rest = (x: number) =>
    `<ellipse cx="${x}" cy="490" rx="34" ry="20" fill="url(#${id("fur")})" ${pawStroke}/>` +
    `<path d="M${x - 10} 482v12M${x + 10} 482v12" stroke="${p.outline}" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round"/>`;
  const ghostArmRest = (side: -1 | 1) =>
    `<path d="M${256 + side * 136} 300C${256 + side * 176} 304 ${256 + side * 194} 330 ${256 + side * 184} 350C${256 + side * 174} 366 ${256 + side * 150} 356 ${256 + side * 136} 336Z" fill="url(#${id("fur")})" stroke="${o.glass ? "#FFFFFF" : p.outline}" stroke-opacity="0.6" stroke-width="5"/>`;

  const tilt = o.headTilt ?? 0;
  const pivot = ghost ? "256 300" : "256 330";
  const head = ghost ? ghostBody(id, p, o, face) : catHead(id, p, o, face);
  const headGroup = `<g transform="rotate(${tilt} ${pivot})">${head}${o.headwear ?? ""}</g>`;

  const fluff = `<ellipse cx="256" cy="404" rx="58" ry="74" fill="url(#${id("muzzle")})"/><path d="M212 334L224 350L236 338L248 354L260 338L272 354L284 338L296 350L304 334" fill="${p.muzzle}" opacity="0.9"/>`;

  if (ghost) {
    return [
      o.pose === "rest" || o.pose === "chin" || o.pose === "kiss" || o.pose === "wave" || o.pose === "sparkler"
        ? ghostArmRest(-1) + (o.pose === "rest" ? ghostArmRest(1) : "")
        : o.pose === "sparklerLeft"
          ? ghostArmRest(1)
          : "",
      headGroup,
      o.held ?? "",
      arms.replace(/url\(#__gold__\)/g, `url(#${id("gold")})`),
      o.front ?? "",
    ].join("");
  }

  if (o.headOnly) {
    return headGroup + (o.held ?? "") + (o.front ?? "");
  }

  return [
    o.noTail ? "" : `<path d="${CAT_TAIL}" fill="url(#${id("fur")})" ${pawStroke}/>` + (o.stripes ? `<path d="M430 392c8 6 14 14 16 24M410 446c10 0 20-4 26-10" stroke="${p.stripe}" stroke-width="8" stroke-linecap="round" opacity="0.6" fill="none"/>` : ""),
    `<path d="${CAT_BODY}" fill="url(#${id("fur")})" ${pawStroke}/>`,
    o.outfit ? outfitLayer(id, o.outfit, o.species) : fluff,
    restPaws[0] ? rest(214) : "",
    restPaws[1] ? rest(298) : "",
    headGroup,
    o.held ?? "",
    arms.replace(/url\(#__gold__\)/g, `url(#${id("gold")})`),
    o.front ?? "",
  ].join("");
}

/* Reactions ---------------------------------------------------------------- */

interface Scene {
  defs: string;
  body: string;
}

const FACES: Partial<Record<ReactionId, Face>> = {
  hi: { eyes: "open", mouth: "grin", blush: 1 },
  morning: { eyes: "droopy", mouth: "smile", blush: 1 },
  night: { eyes: "closed", mouth: "smile", blush: 1 },
  thanks: { eyes: "happy", mouth: "grin", blush: 2 },
  huh: { eyes: "up", mouth: "o", brows: "raised", blush: 0 },
  smile: { eyes: "open", mouth: "smile", blush: 1 },
  naughty: { eyes: "wink", mouth: "tongue", brows: "raised", blush: 1 },
  lol: { eyes: "laugh", mouth: "open", blush: 2, tears: "joy" },
  tear: { eyes: "teary", mouth: "wobble", brows: "sad", blush: 1, tears: "single" },
  crying: { eyes: "squeeze", mouth: "wail", brows: "sad", blush: 1, tears: "streams" },
  shy: { eyes: "side", mouth: "smile", blush: 2 },
  shocked: { eyes: "wide", mouth: "o", brows: "raised", blush: 0 },
  grumpy: { eyes: "angry", mouth: "frown", brows: "angry", blush: 0 },
  cool: { eyes: "open", mouth: "smirk", blush: 0 },
  fever: { eyes: "droopy", mouth: "pout", brows: "sad", blush: 2 },
  boo: { eyes: "wink", mouth: "open", blush: 1 },
  love: { eyes: "happy", mouth: "smile", blush: 2 },
  kiss: { eyes: "wink", mouth: "kiss", blush: 2 },
  missyou: { eyes: "teary", mouth: "pout", brows: "sad", blush: 1, tears: "single" },
};

interface Base {
  species: Species;
  glass: boolean;
  blush: boolean;
  stripes: boolean;
  whiskers: boolean;
  portable: boolean;
  outfitColor: string;
}

function single(id: Id, sid: Id, spec: StickerSpec, base: Base): string {
  const ghost = spec.species === "ghost";
  const face = FACES[spec.reaction] ?? FACES.smile!;
  const o: CharacterOptions = { ...base, look: spec.look, face, pose: "rest", outfit: undefined };
  const holdAt: Point = ghost ? [256, 380] : [256, 412];
  const faceA = ghost ? GHOST_FACE : CAT_FACE;

  switch (spec.reaction) {
    case "hi":
      return character(id, { ...o, pose: "wave", front: waveLines(ghost ? [438, 196] : [442, 214]) + sparkle([96, 120], 14) });
    case "morning":
      return character(id, { ...o, pose: "hold", held: mug(sid, holdAt) });
    case "night":
      return character(id, {
        ...o,
        headwear: nightcap(sid, ghost ? 0.82 : 1, ghost ? [252, 96] : [262, 112]),
        front: zz(ghost ? [380, 150] : [392, 150], 1) + (ghost ? "" : `<circle cx="282" cy="262" r="12" fill="#CFEAFF" opacity="0.75" stroke="#9CCBF2" stroke-width="2"/>`),
      });
    case "thanks":
      return character(id, { ...o, pose: "together", front: sparkle([110, 150], 16) + sparkle([406, 140], 12, "#FFB8CC") + sparkle([420, 210], 8) });
    case "huh":
      return character(id, { ...o, pose: "chin", headTilt: -6, front: questionMark(ghost ? [404, 112] : [414, 120], 46) + sweat(sid, ghost ? [118, 190] : [102, 180], 12) });
    case "smile":
      return character(id, { ...o, front: sparkle([420, 116], 14) + sparkle([96, 140], 9, "#FFB8CC") });
    case "naughty":
      return character(id, { ...o, headTilt: -4, front: sparkle([424, 110], 15) });
    case "lol":
      return character(id, { ...o, headTilt: 6 });
    case "tear":
      return character(id, o);
    case "crying":
      return character(id, o);
    case "shy":
      return character(id, { ...o, pose: "cheeks", headTilt: -5, front: sparkle([420, 120], 12, "#FFB8CC") });
    case "shocked":
      return character(id, {
        ...o,
        front: `<path d="M406 70l-8 44M432 82l-18 38M386 64l2 44" stroke="#FFB020" stroke-width="8" stroke-linecap="round"/>` + sweat(sid, ghost ? [122, 196] : [104, 186], 13),
      });
    case "grumpy":
      return character(id, { ...o, pose: "crossed", front: angerMark(ghost ? [372, 118] : [384, 128], 22) });
    case "cool":
      return character(id, { ...o, headwear: sunglasses(sid, faceA), front: sparkle([424, 112], 16) + sparkle([96, 130], 10) });
    case "boo":
      return character(id, { ...o, pose: "up", front: sparkle([440, 120], 12, "#BDA8FF") });
    case "love":
      return character(id, { ...o, pose: "hold", held: classicHeart(sid, ghost ? [256, 378] : [256, 404], 58) });
    case "kiss":
      return character(id, { ...o, pose: "kiss", front: classicHeart(sid, ghost ? [376, 232] : [388, 244], 22, 14) });
    case "missyou":
      return character(id, { ...o, pose: "hold", held: classicHeart(sid, ghost ? [256, 380] : [256, 408], 44, -8) });
    case "fever": {
      const pillow = `<rect x="70" y="122" width="372" height="210" rx="96" fill="url(#${sid("pillow")})" stroke="#C9C4D8" stroke-width="4"/><path d="M120 170c20 10 30 26 34 48M392 170c-20 10-30 26-34 48" stroke="#D9D5E5" stroke-width="5" stroke-linecap="round" fill="none"/>`;
      const blanket =
        `<path d="M24 372C120 344 392 344 488 372L500 512H12Z" fill="url(#${sid("blanket")})" stroke="#7E69C4" stroke-width="5" stroke-linejoin="round"/>` +
        `<path d="M24 372C120 344 392 344 488 372L490 396C392 368 120 368 22 396Z" fill="#FFFFFF" opacity="0.55"/>` +
        `<g fill="#FFFFFF" opacity="0.35"><circle cx="90" cy="420" r="9"/><circle cx="170" cy="460" r="9"/><circle cx="250" cy="410" r="9"/><circle cx="330" cy="462" r="9"/><circle cx="420" cy="418" r="9"/><circle cx="460" cy="480" r="9"/><circle cx="60" cy="490" r="9"/></g>` +
        `<path d="M150 400c30 24 40 60 34 100M362 400c-30 24-40 60-34 100" stroke="#7E69C4" stroke-width="4" stroke-linecap="round" opacity="0.5" fill="none"/>`;
      const paws =
        `<ellipse cx="200" cy="362" rx="30" ry="18" fill="url(#${id("fur")})" stroke="${palette(spec.look).outline}" stroke-width="5"/>` +
        `<ellipse cx="312" cy="362" rx="30" ry="18" fill="url(#${id("fur")})" stroke="${palette(spec.look).outline}" stroke-width="5"/>`;
      const mouthAt = faceA.mouth;
      return (
        pillow +
        `<g transform="translate(0 ${ghost ? 4 : 0})">` +
        character(id, {
          ...o,
          pose: "none",
          headOnly: !ghost,
          noTail: true,
          headTilt: -8,
          headwear: icePack(sid, ghost ? [300, 108] : [300, 124], 1) + thermometer([mouthAt[0] + 2, mouthAt[1] + 12], 22),
          front: sweat(sid, ghost ? [128, 200] : [104, 196], 12),
        }) +
        `</g>` +
        blanket +
        (ghost ? "" : paws) +
        `<path d="M400 60c10 10 10 20 0 30s-10 20 0 30M432 70c10 10 10 20 0 30s-10 20 0 30" stroke="#FF7A59" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.8"/>`
      );
    }
    case "diya":
      return lights() + character(id, { ...o, outfit: ghost ? undefined : "kurta", pose: "hold", face: { eyes: "happy", mouth: "grin", blush: 1 }, held: diya(sid, ghost ? [256, 392] : [256, 420], 1.1) });
    case "sparkler":
      return (
        lights() +
        character(id, {
          ...o,
          outfit: ghost ? undefined : "kurta",
          pose: "sparkler",
          face: { eyes: "open", mouth: "grin", blush: 1 },
          front: sparkler(sid, ghost ? [392, 270] : [388, 300], [448, 168], 1),
        })
      );
    default:
      return character(id, o);
  }
}

/* Pairs -------------------------------------------------------------------- */

const place = (markup: string, [x, y]: Point, scale: number, rotate = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-256 -290)">${markup}</g>`;

function local([x, y]: Point, at: Point, scale: number, rotate = 0): Point {
  const lx = (x - 256) * scale;
  const ly = (y - 290) * scale;
  const rad = (rotate * Math.PI) / 180;
  return [at[0] + lx * Math.cos(rad) - ly * Math.sin(rad), at[1] + lx * Math.sin(rad) + ly * Math.cos(rad)];
}

function pair(spec: StickerSpec, base: Base, ids: { a: Id; b: Id; s: Id }): string {
  const a = (face: Face, pose: Pose, extra: Partial<CharacterOptions> = {}) =>
    character(ids.a, { ...base, species: "cat", look: spec.look, face, pose, outfit: undefined, ...extra });
  const b = (face: Face, pose: Pose, extra: Partial<CharacterOptions> = {}) =>
    character(ids.b, { ...base, species: "cat", look: spec.partner, face, pose, outfit: undefined, ...extra });
  const content: Face = { eyes: "happy", mouth: "smile", blush: 2 };
  const heart = (at: Point, s = 46) => classicHeart(ids.s, at, s);
  const hugArm = (id: Id, look: Look, from: Point, to: Point, bend: number, sleeve?: string) => {
    const p = palette(look);
    return arm(
      { fill: sleeve ? lighten(sleeve, 0.05) : look.fur, outline: sleeve ? darken(sleeve, 0.35) : p.outline, paw: look.fur, sleeve: Boolean(sleeve), width: 46 * 0.6 },
      from,
      to,
      bend,
    ).replace(/url\(#__gold__\)/g, `url(#${id("gold")})`);
  };

  switch (spec.reaction) {
    case "hug":
    case "diwali-hug": {
      const festive = spec.reaction === "diwali-hug";
      const A: Point = [182, 300];
      const B: Point = [330, 300];
      const s = 0.6;
      const armA = hugArm(ids.a, spec.look, local([320, 352], A, s, 6), local([206, 352], B, s, -6), -30, festive ? spec.outfit : undefined);
      const armB = hugArm(ids.b, spec.partner, local([192, 352], B, s, -6), local([306, 352], A, s, 6), 30, festive ? spec.outfit : undefined);
      const bodyA = a(content, "none", { outfit: festive ? "saree" : undefined, headTilt: 10 });
      const bodyB = b(content, "none", { outfit: festive ? "kurta" : undefined, headTilt: -10 });
      return (
        (festive ? lights() : "") +
        place(bodyA, A, s, 6) +
        place(bodyB, B, s, -6) +
        armA +
        armB +
        heart([256, festive ? 104 : 80], 40) +
        (festive ? marigold([92, 118], 1) + marigold([420, 118], 1) : "")
      );
    }
    case "shoulder": {
      const A: Point = [196, 300];
      const B: Point = [336, 330];
      return (
        place(a({ eyes: "happy", mouth: "smile", blush: 2 }, "rest", { headTilt: 6 }), A, 0.62, 2) +
        place(b({ eyes: "closed", mouth: "smile", blush: 2 }, "rest", { headTilt: -26 }), B, 0.56, -4) +
        heart([300, 78])
      );
    }
    case "cheek": {
      const A: Point = [184, 300];
      const B: Point = [328, 300];
      return (
        place(a({ eyes: "happy", mouth: "grin", blush: 2 }, "rest", { headTilt: 14 }), A, 0.6, 3) +
        place(b({ eyes: "wink", mouth: "smile", blush: 2 }, "rest", { headTilt: -14 }), B, 0.6, -3) +
        heart([256, 76])
      );
    }
    case "diwali-sparklers": {
      const A: Point = [178, 316];
      const B: Point = [336, 316];
      const s = 0.58;
      return (
        lights() +
        place(a({ eyes: "happy", mouth: "grin", blush: 2 }, "sparklerLeft", { outfit: "saree", headTilt: 6 }), A, s) +
        place(b({ eyes: "open", mouth: "grin", blush: 1 }, "sparkler", { outfit: "kurta", headTilt: -6 }), B, s) +
        sparkler(ids.s, local([124, 300], A, s), [54, 176], 0.8) +
        sparkler(ids.s, local([388, 300], B, s), [458, 176], 0.8)
      );
    }
    default: {
      // diwali-diya: she holds the diya, he stands in front.
      const A: Point = [178, 286];
      const B: Point = [352, 342];
      return (
        lights() +
        place(
          a({ eyes: "happy", mouth: "smile", blush: 2 }, "hold", {
            outfit: "saree",
            headTilt: 6,
            held: diya(ids.s, [256, 420], 1.2),
            headwear: `<circle cx="256" cy="168" r="7" fill="#E01E4A"/>` + marigold([132, 128], 1.1),
          }),
          A,
          0.56,
        ) +
        place(b({ eyes: "open", mouth: "grin", blush: 1 }, "wave", { outfit: "kurta", headTilt: -6 }), B, 0.6) +
        sparkle([440, 170], 12) +
        sparkle([60, 250], 10)
      );
    }
  }
}

/* Public API ---------------------------------------------------------------- */

const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">`;

export function stickerKey(spec: StickerSpec): string {
  return hash(JSON.stringify(spec));
}

/** Draws a sticker (single or pair, by reaction) as a complete SVG. */
export function drawSticker(spec: StickerSpec): string {
  const reaction = findReaction(spec.reaction);
  const key = `cb${stickerKey(spec)}`;
  const ids = {
    a: (name: string) => `${key}a-${name}`,
    b: (name: string) => `${key}b-${name}`,
    s: (name: string) => `${key}s-${name}`,
  };
  const portable = Boolean(spec.portable);
  const species: Species = reaction.species.includes(spec.species) ? spec.species : "cat";
  const base: Base = {
    species,
    glass: spec.glass,
    blush: spec.blush,
    stripes: spec.stripes,
    whiskers: spec.whiskers,
    portable,
    outfitColor: spec.outfit,
  };
  const defs =
    characterDefs(ids.a, palette(spec.look), portable) +
    (reaction.pair ? characterDefs(ids.b, palette(spec.partner), portable) : "") +
    sceneDefs(ids.s, spec.outfit) +
    // Outfit + gold gradients for each character namespace.
    sceneDefs(ids.a, spec.outfit).match(/<linearGradient id="[^"]+-(outfit|gold)"[\s\S]*?<\/linearGradient>/g)?.join("") +
    (reaction.pair ? (sceneDefs(ids.b, spec.outfit).match(/<linearGradient id="[^"]+-(outfit|gold)"[\s\S]*?<\/linearGradient>/g)?.join("") ?? "") : "");
  const body = reaction.pair ? pair({ ...spec, species: "cat" }, base, ids) : single(ids.a, ids.s, { ...spec, species }, base);
  return `${svgOpen}<defs>${defs}</defs>${body}</svg>`;
}

/**
 * SVG without parts that shouldn't shape a sticker's outline: whiskers, soft
 * glows, string lights, and sparkler sparks.
 */
export function silhouetteOf(svg: string): string {
  return svg
    .replace(/<g data-part="(?:whiskers|decor)"[\s\S]*?<\/g>/g, "")
    .replace(/<circle data-part="glow"[^>]*\/>/g, "");
}

export type { Scene };
