/**
 * Parametric character renderer. Pure string building, so it runs on the
 * server (static previews, OG image) and in the browser (live Studio).
 *
 * Coordinate space: 512 × 512. A head is drawn around the anchor (256, 300)
 * so couples can place, rotate, and scale heads with one transform.
 */
import { darken, hash, lighten, luminance, mix } from "./color.ts";
import type { CharacterOptions, CoupleOptions, Look, ReactionId } from "./options.ts";

type Point = readonly [number, number];
type Id = (name: string) => string;

const n = (value: number) => Number(value.toFixed(1));

interface Palette {
  furLight: string;
  fur: string;
  furShade: string;
  furDeep: string;
  stripe: string;
  muzzle: string;
  irisLight: string;
  iris: string;
  irisDark: string;
  line: string;
  whisker: string;
  nose: string;
  earInner: string;
  dark: boolean;
}

function palette({ fur, eyes }: Look): Palette {
  const dark = luminance(fur) < 0.18;
  return {
    furLight: lighten(fur, dark ? 0.28 : 0.55),
    fur,
    furShade: darken(fur, 0.2),
    furDeep: darken(fur, 0.42),
    stripe: dark ? lighten(fur, 0.12) : darken(fur, 0.32),
    muzzle: lighten(fur, dark ? 0.35 : 0.72),
    irisLight: lighten(eyes, 0.5),
    iris: eyes,
    irisDark: darken(eyes, 0.58),
    line: dark ? "#F3EDF7" : mix(darken(fur, 0.6), "#3B2321", 0.55),
    whisker: "#FFFFFF",
    nose: "#E8949F",
    earInner: "#F3A9B3",
    dark,
  };
}

/* Shared shapes ------------------------------------------------------- */

function heart([x, y]: Point, s: number): string {
  const k = s / 9;
  const p = (dx: number, dy: number) => `${n(x + dx * k)} ${n(y + dy * k)}`;
  return `M${p(0, 7)}C${p(-1, 6)} ${p(-9, 1.5)} ${p(-9, -3.5)}C${p(-9, -7)} ${p(-6.5, -9)} ${p(-4, -9)}C${p(-2.2, -9)} ${p(-0.8, -8)} ${p(0, -6.5)}C${p(0.8, -8)} ${p(2.2, -9)} ${p(4, -9)}C${p(6.5, -9)} ${p(9, -7)} ${p(9, -3.5)}C${p(9, 1.5)} ${p(1, 6)} ${p(0, 7)}Z`;
}

function sparkle([x, y]: Point, s: number): string {
  const q = s * 0.16;
  return `M${x} ${n(y - s)}Q${n(x + q)} ${n(y - q)} ${n(x + s)} ${y}Q${n(x + q)} ${n(y + q)} ${x} ${n(y + s)}Q${n(x - q)} ${n(y + q)} ${n(x - s)} ${y}Q${n(x - q)} ${n(y - q)} ${x} ${n(y - s)}Z`;
}

function glossyHeart(id: Id, at: Point, s: number, rotate = 0): string {
  const [x, y] = at;
  return (
    `<g transform="rotate(${rotate} ${x} ${y})">` +
    `<path d="${heart(at, s)}" fill="url(#${id("heart")})"/>` +
    `<ellipse cx="${n(x - s * 0.42)}" cy="${n(y - s * 0.5)}" rx="${n(s * 0.24)}" ry="${n(s * 0.14)}" fill="#FFFFFF" opacity="0.85" transform="rotate(-30 ${n(x - s * 0.42)} ${n(y - s * 0.5)})"/>` +
    `</g>`
  );
}

/* Definitions --------------------------------------------------------- */

function defs(id: Id, p: Palette, portable: boolean): string {
  return [
    `<radialGradient id="${id("fur")}" cx="0.46" cy="0.32" r="0.78">`,
    `<stop offset="0" stop-color="${p.furLight}"/><stop offset="0.55" stop-color="${p.fur}"/><stop offset="1" stop-color="${p.furShade}"/>`,
    `</radialGradient>`,
    `<linearGradient id="${id("body")}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${p.fur}"/><stop offset="1" stop-color="${p.furShade}"/>`,
    `</linearGradient>`,
    `<radialGradient id="${id("muzzle")}" cx="0.5" cy="0.4" r="0.6">`,
    `<stop offset="0" stop-color="${p.muzzle}"/><stop offset="0.65" stop-color="${p.muzzle}" stop-opacity="0.9"/><stop offset="1" stop-color="${p.muzzle}" stop-opacity="0"/>`,
    `</radialGradient>`,
    `<radialGradient id="${id("socket")}" cx="0.5" cy="0.5" r="0.5">`,
    `<stop offset="0.55" stop-color="${p.furDeep}" stop-opacity="0.35"/><stop offset="1" stop-color="${p.furDeep}" stop-opacity="0"/>`,
    `</radialGradient>`,
    `<radialGradient id="${id("iris")}" cx="0.5" cy="0.58" r="0.52">`,
    `<stop offset="0" stop-color="${p.irisLight}"/><stop offset="0.5" stop-color="${p.iris}"/><stop offset="0.86" stop-color="${p.irisDark}"/><stop offset="1" stop-color="#140B07"/>`,
    `</radialGradient>`,
    `<linearGradient id="${id("nose")}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="${lighten(p.nose, 0.35)}"/><stop offset="0.55" stop-color="${p.nose}"/><stop offset="1" stop-color="${darken(p.nose, 0.18)}"/>`,
    `</linearGradient>`,
    `<radialGradient id="${id("earInner")}" cx="0.5" cy="0.7" r="0.7">`,
    `<stop offset="0" stop-color="${lighten(p.earInner, 0.35)}"/><stop offset="0.6" stop-color="${p.earInner}"/><stop offset="1" stop-color="${darken(p.earInner, 0.12)}"/>`,
    `</radialGradient>`,
    `<linearGradient id="${id("glass")}" x1="0.1" y1="0" x2="0.9" y2="1">`,
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.75"/><stop offset="0.45" stop-color="#EAF4FF" stop-opacity="0.18"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0.5"/>`,
    `</linearGradient>`,
    `<radialGradient id="${id("blush")}" cx="0.5" cy="0.5" r="0.5">`,
    `<stop offset="0" stop-color="#FF7287" stop-opacity="0.7"/><stop offset="0.6" stop-color="#FF8A9B" stop-opacity="0.3"/><stop offset="1" stop-color="#FF8A9B" stop-opacity="0"/>`,
    `</radialGradient>`,
    `<linearGradient id="${id("heart")}" x1="0.2" y1="0" x2="0.8" y2="1">`,
    `<stop offset="0" stop-color="#FF9BBA"/><stop offset="0.55" stop-color="#FF4F7E"/><stop offset="1" stop-color="#D62A57"/>`,
    `</linearGradient>`,
    `<linearGradient id="${id("tear")}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="#EAF7FF"/><stop offset="1" stop-color="#76BCFF"/>`,
    `</linearGradient>`,
    `<radialGradient id="${id("sheen")}" cx="0.5" cy="0.5" r="0.5">`,
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.5"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>`,
    `</radialGradient>`,
    portable
      ? ""
      : `<filter id="${id("soft")}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>` +
        `<filter id="${id("fur-noise")}" x="0" y="0" width="100%" height="100%">` +
        `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>` +
        `<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.35"/>` +
        `<feComposite in2="SourceAlpha" operator="in"/>` +
        `</filter>`,
  ].join("");
}

/* Cat head -------------------------------------------------------------- */

const HEAD = "M256 134C350 134 426 172 444 262C462 352 416 442 330 460C298 468 214 468 182 460C96 442 50 352 68 262C86 172 162 134 256 134Z";
const EARS = {
  left: "M104 246C88 176 88 104 110 64C117 51 132 49 143 57C182 88 214 122 236 160Z",
  right: "M408 246C424 176 424 104 402 64C395 51 380 49 369 57C330 88 298 122 276 160Z",
  leftInner: "M126 214C116 158 118 112 132 84C136 77 143 76 149 81C176 106 197 131 212 158Z",
  rightInner: "M386 214C396 158 394 112 380 84C376 77 369 76 363 81C336 106 315 131 300 158Z",
};
const EYES: readonly [Point, Point] = [
  [182, 272],
  [330, 272],
];
const EYE_R = 56;

function ears(id: Id, p: Palette, glass: boolean): string {
  const outer = glass
    ? `<path d="${EARS.left}" fill="url(#${id("glass")})" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="4" stroke-linejoin="round"/>` +
      `<path d="${EARS.right}" fill="url(#${id("glass")})" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="4" stroke-linejoin="round"/>`
    : `<path d="${EARS.left}" fill="url(#${id("fur")})"/><path d="${EARS.right}" fill="url(#${id("fur")})"/>`;
  const inner =
    `<path d="${EARS.leftInner}" fill="url(#${id("earInner")})" opacity="${glass ? 0.85 : 1}"/>` +
    `<path d="${EARS.rightInner}" fill="url(#${id("earInner")})" opacity="${glass ? 0.85 : 1}"/>`;
  const shine = glass
    ? `<path d="M116 210C106 160 108 112 122 80" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.9"/>` +
      `<path d="M396 210C406 160 404 112 390 80" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.9"/>` +
      `<path d="M150 70C170 86 190 104 204 122" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6"/>` +
      `<path d="M362 70C342 86 322 104 308 122" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`
    : "";
  void p;
  return outer + inner + shine;
}

function openEye(id: Id, [x, y]: Point, r: number, pupil: number, wet: boolean): string {
  return [
    `<circle cx="${x}" cy="${y}" r="${n(r + 4)}" fill="#1A100B"/>`,
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id("iris")})"/>`,
    // Iris fibres: a dashed ring reads as radial striations.
    `<circle cx="${x}" cy="${y}" r="${n(r * 0.68)}" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="${n(r * 0.56)}" stroke-dasharray="1.4 3.4"/>`,
    `<circle cx="${x}" cy="${y}" r="${n(r * 0.97)}" stroke="#000000" stroke-opacity="0.35" stroke-width="${n(r * 0.08)}"/>`,
    `<circle cx="${x}" cy="${y}" r="${n(pupil)}" fill="#0A0605"/>`,
    // Specular highlights and a soft reflection.
    `<rect x="${n(x + r * 0.08)}" y="${n(y - r * 0.66)}" width="${n(r * 0.46)}" height="${n(r * 0.4)}" rx="${n(r * 0.13)}" fill="#FFFFFF" transform="rotate(-8 ${x} ${y})"/>`,
    `<circle cx="${n(x - r * 0.42)}" cy="${n(y + r * 0.36)}" r="${n(r * 0.1)}" fill="#FFFFFF" opacity="0.85"/>`,
    `<path d="M${n(x - r * 0.72)} ${n(y + r * 0.5)}A${r * 0.86} ${r * 0.86} 0 0 0 ${n(x + r * 0.62)} ${n(y + r * 0.58)}" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="${n(r * 0.07)}" stroke-linecap="round"/>`,
    `<ellipse cx="${x}" cy="${n(y - r * 0.55)}" rx="${n(r * 0.62)}" ry="${n(r * 0.28)}" fill="url(#${id("sheen")})"/>`,
    wet ? `<ellipse cx="${x}" cy="${n(y + r * 0.8)}" rx="${n(r * 0.7)}" ry="${n(r * 0.16)}" fill="#BFE6FF" opacity="0.75"/>` : "",
  ].join("");
}

function eyes(id: Id, p: Palette, reaction: ReactionId, centers: readonly [Point, Point], r: number): string {
  const [l, rt] = centers;
  switch (reaction) {
    case "love":
      return [l, rt]
        .map(
          ([x, y]) =>
            `<circle cx="${x}" cy="${y}" r="${n(r * 0.92)}" fill="url(#${id("socket")})"/>` + glossyHeart(id, [x, y + r * 0.05], r * 0.95),
        )
        .join("");
    case "blush":
    case "sleepy": {
      const arc = ([x, y]: Point) =>
        reaction === "blush"
          ? `M${n(x - r * 0.8)} ${n(y + r * 0.15)}C${n(x - r * 0.45)} ${n(y - r * 0.55)} ${n(x + r * 0.45)} ${n(y - r * 0.55)} ${n(x + r * 0.8)} ${n(y + r * 0.15)}`
          : `M${n(x - r * 0.8)} ${n(y)}C${n(x - r * 0.45)} ${n(y + r * 0.45)} ${n(x + r * 0.45)} ${n(y + r * 0.45)} ${n(x + r * 0.8)} ${n(y)}`;
      const lashes = ([x, y]: Point, side: number) =>
        reaction === "sleepy"
          ? `M${n(x + side * r * 0.78)} ${n(y + r * 0.02)}l${n(side * r * 0.16)} ${n(r * 0.1)}`
          : `M${n(x + side * r * 0.8)} ${n(y + r * 0.12)}l${n(side * r * 0.18)} ${n(-r * 0.08)}`;
      return `<path d="${arc(l)}${arc(rt)}${lashes(l, -1)}${lashes(rt, 1)}" stroke="${p.line}" stroke-width="${n(r * 0.13)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    case "wow":
      return openEye(id, l, r * 1.04, r * 0.36, false) + openEye(id, rt, r * 1.04, r * 0.36, false);
    case "sad":
      return (
        openEye(id, l, r, r * 0.66, true) +
        openEye(id, rt, r, r * 0.66, true) +
        `<path d="M${n(l[0] - r * 0.9)} ${n(l[1] - r * 1.25)}C${n(l[0] - r * 0.3)} ${n(l[1] - r * 1.35)} ${n(l[0] + r * 0.4)} ${n(l[1] - r * 1.6)} ${n(l[0] + r * 0.7)} ${n(l[1] - r * 1.85)}M${n(rt[0] + r * 0.9)} ${n(rt[1] - r * 1.25)}C${n(rt[0] + r * 0.3)} ${n(rt[1] - r * 1.35)} ${n(rt[0] - r * 0.4)} ${n(rt[1] - r * 1.6)} ${n(rt[0] - r * 0.7)} ${n(rt[1] - r * 1.85)}" stroke="${p.line}" stroke-width="${n(r * 0.11)}" stroke-linecap="round" opacity="0.75"/>`
      );
    default:
      return openEye(id, l, r, r * 0.62, false) + openEye(id, rt, r, r * 0.62, false);
  }
}

function mouth(p: Palette, reaction: ReactionId, [x, y]: Point, scale = 1): string {
  const s = (value: number) => n(value * scale);
  const stroke = `stroke="${p.line}" stroke-width="${s(4.2)}" stroke-linecap="round" stroke-linejoin="round"`;
  switch (reaction) {
    case "love":
    case "happy":
      return (
        `<path d="M${x} ${y}V${n(y + s(10))}M${x} ${n(y + s(10))}C${x} ${n(y + s(26))} ${n(x - s(20))} ${n(y + s(32))} ${n(x - s(34))} ${n(y + s(22))}M${x} ${n(y + s(10))}C${x} ${n(y + s(26))} ${n(x + s(20))} ${n(y + s(32))} ${n(x + s(34))} ${n(y + s(22))}" ${stroke}/>` +
        (reaction === "love"
          ? `<path d="M${n(x - s(13))} ${n(y + s(22))}C${n(x - s(10))} ${n(y + s(40))} ${n(x + s(10))} ${n(y + s(40))} ${n(x + s(13))} ${n(y + s(22))}C${n(x + s(6))} ${n(y + s(26))} ${n(x - s(6))} ${n(y + s(26))} ${n(x - s(13))} ${n(y + s(22))}Z" fill="#7A2E3A"/><path d="M${n(x - s(7))} ${n(y + s(32))}C${n(x - s(3))} ${n(y + s(28))} ${n(x + s(3))} ${n(y + s(28))} ${n(x + s(7))} ${n(y + s(32))}C${n(x + s(4))} ${n(y + s(36))} ${n(x - s(4))} ${n(y + s(36))} ${n(x - s(7))} ${n(y + s(32))}Z" fill="#FF8FA3"/>`
          : "")
      );
    case "sad":
      return `<path d="M${x} ${y}V${n(y + s(10))}M${n(x - s(18))} ${n(y + s(30))}C${n(x - s(10))} ${n(y + s(18))} ${n(x + s(10))} ${n(y + s(18))} ${n(x + s(18))} ${n(y + s(30))}" ${stroke}/>`;
    case "wow":
      return `<path d="M${x} ${y}V${n(y + s(8))}" ${stroke}/><ellipse cx="${x}" cy="${n(y + s(26))}" rx="${s(10)}" ry="${s(13)}" fill="#6E2C36"/><ellipse cx="${x}" cy="${n(y + s(31))}" rx="${s(6)}" ry="${s(5)}" fill="#FF8FA3"/>`;
    case "sleepy":
      return `<path d="M${x} ${y}V${n(y + s(10))}M${n(x - s(12))} ${n(y + s(20))}C${n(x - s(6))} ${n(y + s(25))} ${n(x + s(6))} ${n(y + s(25))} ${n(x + s(12))} ${n(y + s(20))}" ${stroke}/>`;
    default:
      return `<path d="M${x} ${y}V${n(y + s(10))}M${n(x - s(20))} ${n(y + s(18))}C${n(x - s(12))} ${n(y + s(26))} ${n(x - s(4))} ${n(y + s(24))} ${x} ${n(y + s(14))}C${n(x + s(4))} ${n(y + s(24))} ${n(x + s(12))} ${n(y + s(26))} ${n(x + s(20))} ${n(y + s(18))}" ${stroke}/>`;
  }
}

function blushLayer(id: Id, reaction: ReactionId, cheeks: readonly [Point, Point], size: number): string {
  const strong = reaction === "blush" || reaction === "love";
  const scale = strong ? 1.15 : 1;
  const opacity = reaction === "sad" ? 0.55 : 1;
  const one = ([x, y]: Point) =>
    `<ellipse cx="${x}" cy="${y}" rx="${n(size * scale)}" ry="${n(size * 0.62 * scale)}" fill="url(#${id("blush")})" opacity="${opacity}"/>` +
    (reaction === "blush"
      ? `<path d="M${n(x - size * 0.42)} ${n(y + size * 0.12)}l${n(size * 0.16)} ${n(-size * 0.28)}M${n(x - size * 0.08)} ${n(y + size * 0.12)}l${n(size * 0.16)} ${n(-size * 0.28)}M${n(x + size * 0.26)} ${n(y + size * 0.12)}l${n(size * 0.16)} ${n(-size * 0.28)}" stroke="#FFFFFF" stroke-width="${n(size * 0.06)}" stroke-linecap="round" opacity="0.8"/>`
      : "");
  return one(cheeks[0]) + one(cheeks[1]);
}

function accents(id: Id, reaction: ReactionId, area: { top: Point; side: Point; tear: Point }, unit: number): string {
  const u = (value: number) => value * unit;
  switch (reaction) {
    case "love":
      return (
        glossyHeart(id, area.top, u(36), 12) +
        glossyHeart(id, [area.top[0] - u(58), area.top[1] + u(42)], u(20), -14) +
        glossyHeart(id, [area.top[0] + u(30), area.top[1] + u(70)], u(13), 18)
      );
    case "sad": {
      const [x, y] = area.tear;
      return `<path d="M${x} ${n(y - u(26))}C${n(x - u(10))} ${n(y - u(9))} ${n(x - u(16))} ${y} ${n(x - u(16))} ${n(y + u(8))}A${u(16)} ${u(16)} 0 0 0 ${n(x + u(16))} ${n(y + u(8))}C${n(x + u(16))} ${y} ${n(x + u(10))} ${n(y - u(9))} ${x} ${n(y - u(26))}Z" fill="url(#${id("tear")})"/><ellipse cx="${n(x - u(5))}" cy="${n(y + u(5))}" rx="${u(4)}" ry="${u(6)}" fill="#FFFFFF" opacity="0.85"/>`;
    }
    case "blush":
      return `<path d="${sparkle(area.top, u(22))}" fill="#FFC2D4"/><path d="${sparkle([area.top[0] - u(44), area.top[1] + u(38)], u(12))}" fill="#FFE08A"/>`;
    case "wow":
      return `<path d="${sparkle(area.top, u(20))}" fill="#FFE08A"/><path d="${sparkle(area.side, u(14))}" fill="#BDE7FF"/>`;
    case "sleepy": {
      const [x, y] = area.top;
      return `<path d="M${x} ${y}h${u(26)}l${u(-26)} ${u(30)}h${u(26)}M${n(x + u(34))} ${n(y - u(34))}h${u(17)}l${u(-17)} ${u(20)}h${u(17)}" stroke="#A9B8E8" stroke-width="${u(6)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    default:
      return `<path d="${sparkle(area.top, u(16))}" fill="#FFE08A"/>`;
  }
}

/** The head group, drawn around (256, 300). Expects `defs(id, …)` in scope. */
function catHead(id: Id, p: Palette, o: Omit<CharacterOptions, "species" | "fur" | "eyes">, extras = true): string {
  const portable = Boolean(o.portable);
  const stripes = o.stripes
    ? `<g ${portable ? 'opacity="0.35"' : `filter="url(#${id("soft")})" opacity="0.55"`}>` +
      `<path d="M256 146V214M218 152C224 172 226 192 224 212M294 152C288 172 286 192 288 212" stroke="${p.stripe}" stroke-width="15" stroke-linecap="round"/>` +
      `</g>`
    : "";
  const sockets =
    `<ellipse cx="${EYES[0][0]}" cy="${EYES[0][1] + 6}" rx="84" ry="80" fill="url(#${id("socket")})"/>` +
    `<ellipse cx="${EYES[1][0]}" cy="${EYES[1][1] + 6}" rx="84" ry="80" fill="url(#${id("socket")})"/>`;
  const muzzle =
    `<ellipse cx="256" cy="414" rx="96" ry="60" fill="url(#${id("muzzle")})"/>` +
    `<ellipse cx="226" cy="414" rx="37" ry="28" fill="${p.muzzle}" opacity="0.75"/>` +
    `<ellipse cx="286" cy="414" rx="37" ry="28" fill="${p.muzzle}" opacity="0.75"/>` +
    `<ellipse cx="256" cy="446" rx="24" ry="12" fill="${p.muzzle}" opacity="0.55"/>`;
  const texture = portable
    ? ""
    : `<path d="${HEAD}" fill="#000000" filter="url(#${id("fur-noise")})" opacity="0.07"/>`;
  const sheen = o.glass
    ? `<ellipse cx="204" cy="184" rx="90" ry="28" fill="url(#${id("sheen")})" transform="rotate(-14 204 184)" opacity="0.8"/>`
    : `<ellipse cx="204" cy="184" rx="80" ry="24" fill="url(#${id("sheen")})" transform="rotate(-14 204 184)" opacity="0.35"/>`;
  const nose =
    `<path d="M232 364C232 352 280 352 280 364C280 377 265 391 256 393C247 391 232 377 232 364Z" fill="url(#${id("nose")})"/>` +
    `<ellipse cx="249" cy="361" rx="10" ry="4.5" fill="#FFFFFF" opacity="0.75"/>`;
  const dots = `<g fill="${p.line}" opacity="0.35"><circle cx="210" cy="408" r="2.6"/><circle cx="198" cy="420" r="2.6"/><circle cx="214" cy="426" r="2.4"/><circle cx="302" cy="408" r="2.6"/><circle cx="314" cy="420" r="2.6"/><circle cx="298" cy="426" r="2.4"/></g>`;
  const whiskers = o.whiskers
    ? `<g data-part="whiskers" stroke-linecap="round">` +
      `<path d="M194 410C150 400 110 396 66 398M192 422C148 422 110 428 72 440M196 434C158 444 126 458 96 478M318 410C362 400 402 396 446 398M320 422C364 422 402 428 440 440M316 434C354 444 386 458 416 478" stroke="#000000" stroke-opacity="0.1" stroke-width="4"/>` +
      `<path d="M194 410C150 400 110 396 66 398M192 422C148 422 110 428 72 440M196 434C158 444 126 458 96 478M318 410C362 400 402 396 446 398M320 422C364 422 402 428 440 440M316 434C354 444 386 458 416 478" stroke="${p.whisker}" stroke-width="2.4"/>` +
      `</g>`
    : "";

  return [
    ears(id, p, o.glass),
    `<path d="${HEAD}" fill="url(#${id("fur")})"/>`,
    texture,
    stripes,
    sockets,
    sheen,
    muzzle,
    o.blush ? blushLayer(id, o.reaction, [[136, 374], [376, 374]], 56) : "",
    eyes(id, p, o.reaction, EYES, EYE_R),
    nose,
    mouth(p, o.reaction, [256, 392]),
    dots,
    whiskers,
    extras ? accents(id, o.reaction, { top: [426, 96], side: [88, 140], tear: [350, 360] }, 1) : "",
  ].join("");
}

/* Ghost --------------------------------------------------------------- */

const GHOST =
  "M110 452V244C110 158 176 92 256 92C336 92 402 158 402 244V452Q384 486 358 462Q332 486 306 462Q280 486 256 462Q232 486 206 462Q180 486 154 462Q128 486 110 452Z";

function ghostBody(id: Id, p: Palette, o: CharacterOptions): string {
  const portable = Boolean(o.portable);
  const fill = o.glass ? `url(#${id("ghostGlass")})` : `url(#${id("fur")})`;
  const arms =
    `<path d="M116 300C80 304 62 330 72 350C82 366 106 356 120 336Z" fill="${fill}"/>` +
    `<path d="M396 300C432 304 450 330 440 350C430 366 406 356 392 336Z" fill="${fill}"/>`;
  return [
    o.glass
      ? `<linearGradient id="${id("ghostGlass")}" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${lighten(p.fur, 0.75)}" stop-opacity="0.9"/><stop offset="0.6" stop-color="${p.fur}" stop-opacity="0.55"/><stop offset="1" stop-color="${p.furShade}" stop-opacity="0.75"/></linearGradient>`
      : "",
    arms,
    `<path d="${GHOST}" fill="${fill}" ${o.glass ? 'stroke="#FFFFFF" stroke-opacity="0.85" stroke-width="5"' : ""}/>`,
    portable || o.glass ? "" : `<path d="${GHOST}" fill="#000000" filter="url(#${id("fur-noise")})" opacity="0.04"/>`,
    `<ellipse cx="200" cy="168" rx="64" ry="28" fill="#FFFFFF" opacity="${o.glass ? 0.75 : 0.5}" transform="rotate(-24 200 168)"/>`,
    o.glass ? `<path d="M140 250C140 200 160 160 196 136" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.85"/>` : "",
    o.blush ? blushLayer(id, o.reaction, [[176, 316], [336, 316]], 44) : "",
    eyes(id, p, o.reaction, [[206, 262], [306, 262]], 40),
    mouth(p, o.reaction, [256, 300], 0.8),
    accents(id, o.reaction, { top: [404, 96], side: [96, 140], tear: [330, 318] }, 0.85),
  ].join("");
}

/* Public API ---------------------------------------------------------- */

const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">`;

export function characterKey(o: CharacterOptions): string {
  return hash(JSON.stringify(o));
}

/** A single character as a complete SVG. */
export function renderCharacter(o: CharacterOptions): string {
  const prefix = `cb${characterKey(o)}`;
  const id: Id = (name) => `${prefix}-${name}`;
  const p = palette(o);
  const body = o.species === "ghost" ? ghostBody(id, p, o) : catHead(id, p, o);
  return `${svgOpen}<defs>${defs(id, p, Boolean(o.portable))}</defs>${body}</svg>`;
}

/** Head group for a couple, with its own palette and defs. */
function placedHead(prefix: string, look: Look, o: CoupleOptions, at: Point, rotate: number, scale: number): { defs: string; markup: string } {
  const id: Id = (name) => `${prefix}-${name}`;
  const p = palette(look);
  const head = catHead(id, p, { ...o, reaction: o.reaction }, false);
  return {
    defs: defs(id, p, Boolean(o.portable)),
    markup: `<g transform="translate(${at[0]} ${at[1]}) rotate(${rotate}) scale(${scale}) translate(-256 -300)">${head}</g>`,
  };
}

function bust(prefix: string, look: Look, cx: number, top: number, width: number): string {
  const id = (name: string) => `${prefix}-${name}`;
  const w = width;
  const bottom = 498;
  const paw = (x: number) =>
    `<ellipse cx="${n(x)}" cy="${bottom - 14}" rx="${n(w * 0.26)}" ry="20" fill="url(#${id("fur")})"/>` +
    `<ellipse cx="${n(x)}" cy="${bottom - 12}" rx="${n(w * 0.18)}" ry="12" fill="url(#${id("muzzle")})"/>` +
    `<path d="M${n(x - w * 0.07)} ${bottom - 22}v9M${n(x + w * 0.07)} ${bottom - 22}v9" stroke="#000000" stroke-opacity="0.18" stroke-width="3" stroke-linecap="round"/>`;
  return (
    `<path d="M${cx - w} ${bottom - 40}C${n(cx - w * 1.04)} ${top + 96} ${n(cx - w * 0.74)} ${top + 8} ${cx} ${top}C${n(cx + w * 0.74)} ${top + 8} ${n(cx + w * 1.04)} ${top + 96} ${cx + w} ${bottom - 40}C${cx + w} ${bottom - 12} ${n(cx + w * 0.72)} ${bottom} ${cx} ${bottom}C${n(cx - w * 0.72)} ${bottom} ${cx - w} ${bottom - 12} ${cx - w} ${bottom - 40}Z" fill="url(#${id("fur")})"/>` +
    `<ellipse cx="${cx}" cy="${top + 128}" rx="${n(w * 0.44)}" ry="${n(w * 0.56)}" fill="url(#${id("muzzle")})" opacity="0.85"/>` +
    paw(cx - w * 0.4) +
    paw(cx + w * 0.4)
  );
}

/** Two cats sharing a moment, with an optional heart above. */
export function renderCouple(o: CoupleOptions): string {
  const key = hash(JSON.stringify(o));
  const a = `cb${key}a`;
  const b = `cb${key}b`;
  const heartId: Id = (name) => `cb${key}h-${name}`;
  const snuggle = o.pose === "snuggle";

  // Snuggle: B rests its head on A's shoulder. Cheek: both lean in until cheeks touch.
  const headA = snuggle ? placedHead(a, o.a, o, [178, 226], 6, 0.6) : placedHead(a, o.a, o, [160, 262], 12, 0.57);
  const headB = snuggle ? placedHead(b, o.b, o, [350, 318], -30, 0.54) : placedHead(b, o.b, o, [352, 262], -12, 0.57);
  const bodyA = snuggle ? bust(a, o.a, 180, 300, 124) : bust(a, o.a, 160, 330, 112);
  const bodyB = snuggle ? bust(b, o.b, 400, 372, 108) : bust(b, o.b, 352, 330, 112);

  const heartDefs = `<linearGradient id="${heartId("heart")}" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#FF9BBA"/><stop offset="0.55" stop-color="#FF4F7E"/><stop offset="1" stop-color="#D62A57"/></linearGradient>`;
  const hearts = o.heart
    ? glossyHeart(heartId, snuggle ? [300, 66] : [256, 62], 46, 6) +
      glossyHeart(heartId, snuggle ? [226, 44] : [178, 52], 18, -16) +
      glossyHeart(heartId, snuggle ? [372, 56] : [334, 52], 14, 16)
    : "";

  return `${svgOpen}<defs>${headA.defs}${headB.defs}${heartDefs}</defs>${bodyB}${bodyA}${headA.markup}${headB.markup}${hearts}</svg>`;
}

/** SVG without parts that shouldn't shape a sticker's die-cut edge (whiskers). */
export function silhouetteOf(svg: string): string {
  return svg.replace(/<g data-part="whiskers"[\s\S]*?<\/g>/g, "");
}
