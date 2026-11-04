/** Faces shared by every character: eyes, brows, mouths, cheeks, tears. */
import { darken, lighten, luminance, mix } from "./color.ts";
import { dropPath, heartPath, n, pt, type Id, type Point } from "./kit.ts";

/* Palette ----------------------------------------------------------------- */

export interface Palette {
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

export interface Look {
  /** Main fur, skin, or body colour. Shading is derived from it. */
  fur: string;
  eyes: string;
}

export function palette({ fur, eyes }: Look): Palette {
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

export function characterDefs(id: Id, p: Palette, portable: boolean): string {
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

/* Faces ------------------------------------------------------------------- */

export type Eyes = "open" | "happy" | "wink" | "closed" | "teary" | "wide" | "angry" | "droopy" | "up" | "laugh" | "side" | "squeeze" | "hearts" | "plead";
export type Mouth = "smile" | "grin" | "open" | "o" | "frown" | "wobble" | "kiss" | "tongue" | "smirk" | "pout" | "wail";
export type Brows = "sad" | "angry" | "raised";

export interface Face {
  eyes: Eyes;
  mouth: Mouth;
  brows?: Brows;
  blush?: 0 | 1 | 2;
  tears?: "single" | "streams" | "joy";
}

export interface FaceAnchors {
  eyes: readonly [Point, Point];
  r: number;
  mouth: Point;
  cheeks: readonly [Point, Point];
  /** Colour used for eyelids so they blend with the head. */
  lid: string;
  scale: number;
  /** `cat` has the little nose-to-mouth line, `simple` is a plain curve, `wide` is a frog grin. */
  style?: "cat" | "simple" | "wide";
  /** Lashes on the outer corners. */
  lashes?: boolean;
}

/** Two or three lashes off the outer corner of an eye; `dir` is -1 for the left eye. */
export function lashes(p: Palette, [x, y]: Point, r: number, dir: 1 | -1, count = 3): string {
  const stroke = `stroke="${p.line}" stroke-width="${n(r * 0.13)}" stroke-linecap="round"`;
  const lines = [
    `M${n(x + dir * r * 0.98)} ${n(y - r * 0.5)}l${n(dir * r * 0.36)} ${n(-r * 0.22)}`,
    `M${n(x + dir * r * 0.78)} ${n(y - r * 0.82)}l${n(dir * r * 0.28)} ${n(-r * 0.34)}`,
    `M${n(x + dir * r * 0.46)} ${n(y - r * 1.02)}l${n(dir * r * 0.16)} ${n(-r * 0.36)}`,
  ];
  return `<path d="${lines.slice(0, count).join("")}" ${stroke}/>`;
}

export function openEye(id: Id, p: Palette, [x, y]: Point, r: number, opts: { look?: Point; pupil?: number; wet?: boolean; tiny?: boolean; shine?: boolean } = {}): string {
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
    // Big glossy "please?" eyes: a second catchlight and a soft rim of light.
    opts.shine
      ? `<circle cx="${n(x - r * 0.2 + lx * 0.4)}" cy="${n(y - r * 0.5 + ly * 0.4)}" r="${n(r * 0.14)}" fill="#FFFFFF" opacity="0.95"/>` +
        `<path d="M${n(x - r * 0.62)} ${n(y + r * 0.5)}A${n(r * 0.8)} ${n(r * 0.8)} 0 0 0 ${n(x + r * 0.62)} ${n(y + r * 0.5)}" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="${n(r * 0.1)}" stroke-linecap="round"/>`
      : "",
    opts.wet ? `<path d="M${n(x - r * 0.8)} ${n(y + r * 0.62)}Q${x} ${n(y + r * 1.08)} ${n(x + r * 0.8)} ${n(y + r * 0.62)}" stroke="#BDE6FF" stroke-width="${n(r * 0.16)}" stroke-linecap="round"/>` : "",
    // Upper lid line with a little wing: gives the eye shape and attitude.
    `<path d="M${n(x - r * 1.08)} ${n(y - r * 0.1)}C${n(x - r * 0.9)} ${n(y - r * 1.12)} ${n(x + r * 0.9)} ${n(y - r * 1.2)} ${n(x + r * 1.16)} ${n(y - r * 0.32)}" stroke="${p.line}" stroke-width="${n(r * 0.16)}" stroke-linecap="round"/>`,
  ].join("");
}

export function eyes(id: Id, p: Palette, face: Face, a: FaceAnchors, side: "left" | "right" | "both" = "both"): string {
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

  const lash = a.lashes ? [lashes(p, l, r, -1, face.eyes === "open" || face.eyes === "teary" || face.eyes === "side" || face.eyes === "up" || face.eyes === "droopy" ? 3 : 2), lashes(p, rt, r, 1, face.eyes === "wink" || face.eyes === "open" || face.eyes === "teary" || face.eyes === "side" || face.eyes === "up" || face.eyes === "droopy" ? 3 : 2)] : ["", ""];
  const pick = (left: string, right: string) => (side === "left" ? left + lash[0] : side === "right" ? right + lash[1] : left + right + lash[0] + lash[1]);

  switch (face.eyes) {
    case "hearts": {
      const heart = ([x, y]: Point) =>
        `<path d="${heartPath([x, y + r * 0.08], r * 1.12)}" fill="#E8264F" stroke="#8E0A28" stroke-opacity="0.5" stroke-width="${n(r * 0.08)}"/>` +
        `<path d="M${n(x - r * 0.72)} ${n(y - r * 0.28)}C${n(x - r * 0.72)} ${n(y - r * 0.6)} ${n(x - r * 0.48)} ${n(y - r * 0.78)} ${n(x - r * 0.24)} ${n(y - r * 0.74)}" stroke="#FFFFFF" stroke-width="${n(r * 0.16)}" stroke-linecap="round" opacity="0.9"/>`;
      return pick(heart(l), heart(rt));
    }
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
    case "plead":
      return pick(openEye(id, p, l, r * 1.06, { look: [r * 0.04, -r * 0.2], pupil: 0.8, shine: true }), openEye(id, p, rt, r * 1.06, { look: [-r * 0.04, -r * 0.2], pupil: 0.8, shine: true }));
    case "up":
      return pick(openEye(id, p, l, r, { look: [-r * 0.18, -r * 0.3] }), openEye(id, p, rt, r, { look: [-r * 0.18, -r * 0.3] }));
    case "side":
      return pick(openEye(id, p, l, r, { look: [r * 0.24, r * 0.2] }), openEye(id, p, rt, r, { look: [r * 0.24, r * 0.2] }));
    default:
      return pick(openEye(id, p, l, r), openEye(id, p, rt, r));
  }
}

export function brows(p: Palette, face: Face, a: FaceAnchors): string {
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

export function mouth(p: Palette, face: Face, a: FaceAnchors): string {
  const [x, y] = a.mouth;
  const s = a.scale;
  const v = (value: number) => n(value * s);
  const style = a.style ?? "cat";
  const cat = style === "cat";
  const stroke = `stroke="${p.line}" stroke-width="${v(3.4)}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const inside = "#5B2230";
  const tongue = "#FF8DA1";
  // The little line from nose to mouth, cats only.
  const phil = (to: number) => (cat ? `M${x} ${y}V${n(y + v(to))}` : "");
  const omega = `${phil(4)}M${x} ${n(y + v(4))}C${x} ${n(y + v(13))} ${n(x - v(8))} ${n(y + v(16))} ${n(x - v(15))} ${n(y + v(10))}M${x} ${n(y + v(4))}C${x} ${n(y + v(13))} ${n(x + v(8))} ${n(y + v(16))} ${n(x + v(15))} ${n(y + v(10))}`;
  const smileLine =
    style === "wide"
      ? `M${n(x - v(46))} ${n(y + v(2))}Q${x} ${n(y + v(32))} ${n(x + v(46))} ${n(y + v(2))}`
      : style === "simple"
        ? `M${n(x - v(15))} ${n(y + v(4))}Q${x} ${n(y + v(19))} ${n(x + v(15))} ${n(y + v(4))}`
        : omega;
  switch (face.mouth) {
    case "grin":
      if (style === "wide")
        return `<path d="M${n(x - v(46))} ${n(y + v(2))}Q${x} ${n(y + v(56))} ${n(x + v(46))} ${n(y + v(2))}Q${x} ${n(y + v(14))} ${n(x - v(46))} ${n(y + v(2))}Z" fill="${inside}"/><ellipse cx="${x}" cy="${n(y + v(30))}" rx="${v(15)}" ry="${v(7)}" fill="${tongue}"/><path d="M${n(x - v(46))} ${n(y + v(2))}Q${x} ${n(y + v(56))} ${n(x + v(46))} ${n(y + v(2))}Q${x} ${n(y + v(14))} ${n(x - v(46))} ${n(y + v(2))}Z" ${stroke}/>`;
      if (style === "simple")
        return `<path d="M${n(x - v(17))} ${n(y + v(3))}Q${x} ${n(y + v(5))} ${n(x + v(17))} ${n(y + v(3))}Q${n(x + v(14))} ${n(y + v(28))} ${x} ${n(y + v(28))}Q${n(x - v(14))} ${n(y + v(28))} ${n(x - v(17))} ${n(y + v(3))}Z" fill="${inside}"/><ellipse cx="${x}" cy="${n(y + v(21))}" rx="${v(8)}" ry="${v(4.5)}" fill="${tongue}"/><path d="M${n(x - v(13))} ${n(y + v(5))}H${n(x + v(13))}" stroke="#FFFFFF" stroke-width="${v(4)}" stroke-linecap="round"/><path d="M${n(x - v(17))} ${n(y + v(3))}Q${x} ${n(y + v(5))} ${n(x + v(17))} ${n(y + v(3))}Q${n(x + v(14))} ${n(y + v(28))} ${x} ${n(y + v(28))}Q${n(x - v(14))} ${n(y + v(28))} ${n(x - v(17))} ${n(y + v(3))}Z" ${stroke}/>`;
      return `<path d="M${n(x - v(13))} ${n(y + v(9))}Q${x} ${n(y + v(30))} ${n(x + v(13))} ${n(y + v(9))}Z" fill="${inside}"/><ellipse cx="${x}" cy="${n(y + v(19))}" rx="${v(6)}" ry="${v(4)}" fill="${tongue}"/><path d="${omega}" ${stroke}/>`;
    case "open":
      return `<path d="M${n(x - v(20))} ${n(y + v(6))}Q${x} ${n(y + v(46))} ${n(x + v(20))} ${n(y + v(6))}Q${x} ${n(y + v(12))} ${n(x - v(20))} ${n(y + v(6))}Z" fill="${inside}"/><ellipse cx="${x}" cy="${n(y + v(28))}" rx="${v(10)}" ry="${v(6)}" fill="${tongue}"/>${cat ? `<path d="${phil(6)}" ${stroke}/>` : ""}`;
    case "wail":
      return `<path d="M${n(x - v(16))} ${n(y + v(30))}Q${n(x - v(16))} ${n(y + v(6))} ${x} ${n(y + v(6))}Q${n(x + v(16))} ${n(y + v(6))} ${n(x + v(16))} ${n(y + v(30))}Q${x} ${n(y + v(24))} ${n(x - v(16))} ${n(y + v(30))}Z" fill="${inside}"/><ellipse cx="${x}" cy="${n(y + v(25))}" rx="${v(8)}" ry="${v(3.5)}" fill="${tongue}"/>`;
    case "o":
      return `${cat ? `<path d="${phil(4)}" ${stroke}/>` : ""}<ellipse cx="${x}" cy="${n(y + v(15))}" rx="${v(6.5)}" ry="${v(8.5)}" fill="${inside}"/>`;
    case "frown":
      return `<path d="${phil(5)}M${n(x - v(12))} ${n(y + v(17))}Q${x} ${n(y + v(7))} ${n(x + v(12))} ${n(y + v(17))}" ${stroke}/>`;
    case "wobble":
      return `<path d="${phil(5)}M${n(x - v(13))} ${n(y + v(16))}q${v(4.3)} ${v(-5)} ${v(8.6)} 0t${v(8.6)} 0t${v(8.6)} 0" ${stroke}/>`;
    case "kiss":
      return `<path d="M${n(x - v(2))} ${n(y + v(5))}c${v(8)} ${v(-3)} ${v(9)} ${v(5)} ${v(2)} ${v(6)}c${v(7)} ${v(1)} ${v(6)} ${v(9)} ${v(-2)} ${v(7)}" ${stroke}/>`;
    case "tongue": {
      const ty = style === "wide" ? v(14) : style === "simple" ? v(9) : v(10);
      const tx = style === "wide" ? v(6) : v(-2);
      return `<path d="M${n(x + tx)} ${n(y + ty)}h${v(18)}v${v(13)}a${v(9)} ${v(9)} 0 0 1 ${v(-18)} 0Z" fill="${tongue}" stroke="${p.line}" stroke-width="${v(2.8)}" stroke-linejoin="round"/><path d="M${n(x + tx + v(9))} ${n(y + ty + v(3))}v${v(9)}" stroke="#E2607A" stroke-width="${v(2.2)}" stroke-linecap="round"/><path d="${smileLine}" ${stroke}/>`;
    }
    case "smirk":
      return style === "wide"
        ? `<path d="M${n(x - v(36))} ${n(y + v(10))}C${n(x - v(8))} ${n(y + v(22))} ${n(x + v(20))} ${n(y + v(18))} ${n(x + v(38))} ${n(y)}" ${stroke}/>`
        : `<path d="${phil(4)}M${n(x - v(12))} ${n(y + v(13))}C${n(x - v(2))} ${n(y + v(17))} ${n(x + v(8))} ${n(y + v(15))} ${n(x + v(15))} ${n(y + v(5))}" ${stroke}/>`;
    case "pout":
      return `<path d="${phil(4)}M${n(x - v(8))} ${n(y + v(15))}Q${x} ${n(y + v(8))} ${n(x + v(8))} ${n(y + v(15))}" ${stroke}/>`;
    default:
      return `<path d="${smileLine}" ${stroke}/>`;
  }
}

export function cheeks(id: Id, face: Face, a: FaceAnchors, on: boolean): string {
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

export function tears(id: Id, face: Face, a: FaceAnchors): string {
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
