/**
 * Covers for festivals that are on the way. Each is a finished sticker built
 * from the existing engines plus a few seasonal props.
 */
import { drawCreature, DEFAULT_CREATURE, DEFAULT_LOOKS } from "./creatures.ts";
import { giftBox } from "./festive.ts";
import { kid, kidDefs } from "./kids.ts";
import { n, namespace, sparkle, sparklePath, svgDocument, type Point } from "./kit.ts";

const addOn = (svg: string, markup: string) => svg.replace(/<\/svg>$/, `${markup}</svg>`);

function santaHat([x, y]: Point): string {
  return (
    `<g transform="rotate(-12 ${x} ${y})">` +
    `<path d="M${x - 118} ${y + 26}C${x - 100} ${y - 40} ${x - 30} ${y - 84} ${x + 40} ${y - 70}C${x + 96} ${y - 58} ${x + 130} ${y - 10} ${x + 150} ${y + 40}L${x + 120} ${y + 40}C${x + 104} ${y + 12} ${x + 80} ${y - 6} ${x + 56} ${y - 6}C${x + 80} ${y + 10} ${x + 100} ${y + 22} ${x + 110} ${y + 34}Z" fill="#D9202F" stroke="#8E0F1E" stroke-width="5" stroke-linejoin="round"/>` +
    `<rect x="${x - 128}" y="${y + 18}" width="${250}" height="38" rx="19" fill="#FFFFFF" stroke="#D5D2E2" stroke-width="3"/>` +
    `<circle cx="${x + 146}" cy="${y + 46}" r="24" fill="#FFFFFF" stroke="#D5D2E2" stroke-width="3"/>` +
    `<path d="M${x - 60} ${y - 34}C${x - 30} ${y - 58} ${x + 10} ${y - 66} ${x + 40} ${y - 60}" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.35" fill="none"/>` +
    `</g>`
  );
}

function snowflake([x, y]: Point, s: number): string {
  const arms = [0, 60, 120]
    .map((angle) => `<path d="M${x} ${n(y - 20 * s)}V${n(y + 20 * s)}M${n(x - 7 * s)} ${n(y - 14 * s)}L${x} ${n(y - 8 * s)}L${n(x + 7 * s)} ${n(y - 14 * s)}M${n(x - 7 * s)} ${n(y + 14 * s)}L${x} ${n(y + 8 * s)}L${n(x + 7 * s)} ${n(y + 14 * s)}" transform="rotate(${angle} ${x} ${y})"/>`)
    .join("");
  return `<g stroke="#9CC8F2" stroke-width="${n(3.4 * s)}" stroke-linecap="round" fill="none">${arms}</g>`;
}

function pumpkin([x, y]: Point, s: number): string {
  const v = (value: number) => n(value * s);
  return (
    `<circle data-part="glow" cx="${x}" cy="${y}" r="${v(110)}" fill="#FFB020" opacity="0.18"/>` +
    `<path d="M${x} ${n(y - v(56))}C${n(x + v(4))} ${n(y - v(80))} ${n(x + v(18))} ${n(y - v(90))} ${n(x + v(30))} ${n(y - v(88))}" stroke="#4E7A2A" stroke-width="${v(12)}" stroke-linecap="round" fill="none"/>` +
    `<g fill="#F98A1B" stroke="#A84A0A" stroke-width="${v(4)}"><ellipse cx="${n(x - v(44))}" cy="${y}" rx="${v(48)}" ry="${v(58)}"/><ellipse cx="${n(x + v(44))}" cy="${y}" rx="${v(48)}" ry="${v(58)}"/><ellipse cx="${x}" cy="${y}" rx="${v(50)}" ry="${v(62)}"/></g>` +
    `<path d="M${n(x - v(40))} ${n(y - v(14))}l${v(16)} ${v(-26)}l${v(16)} ${v(26)}ZM${n(x + v(8))} ${n(y - v(14))}l${v(16)} ${v(-26)}l${v(16)} ${v(26)}Z" fill="#FFD84A" stroke="#7A3606" stroke-width="${v(3)}"/>` +
    `<path d="M${n(x - v(46))} ${n(y + v(14))}L${n(x - v(30))} ${n(y + v(30))}L${n(x - v(16))} ${n(y + v(16))}L${x} ${n(y + v(32))}L${n(x + v(16))} ${n(y + v(16))}L${n(x + v(30))} ${n(y + v(30))}L${n(x + v(46))} ${n(y + v(14))}C${n(x + v(30))} ${n(y + v(48))} ${n(x - v(30))} ${n(y + v(48))} ${n(x - v(46))} ${n(y + v(14))}Z" fill="#FFD84A" stroke="#7A3606" stroke-width="${v(3)}" stroke-linejoin="round"/>` +
    `<ellipse cx="${n(x - v(62))}" cy="${n(y - v(26))}" rx="${v(10)}" ry="${v(18)}" fill="#FFFFFF" opacity="0.3" transform="rotate(20 ${n(x - v(62))} ${n(y - v(26))})"/>`
  );
}

function bat([x, y]: Point, s: number): string {
  const v = (value: number) => n(value * s);
  return `<path d="M${x} ${n(y - v(8))}C${n(x - v(12))} ${n(y - v(26))} ${n(x - v(44))} ${n(y - v(26))} ${n(x - v(58))} ${n(y - v(8))}C${n(x - v(46))} ${n(y - v(8))} ${n(x - v(40))} ${n(y + v(2))} ${n(x - v(38))} ${n(y + v(12))}C${n(x - v(28))} ${n(y + v(2))} ${n(x - v(16))} ${n(y + v(4))} ${x} ${n(y + v(14))}C${n(x + v(16))} ${n(y + v(4))} ${n(x + v(28))} ${n(y + v(2))} ${n(x + v(38))} ${n(y + v(12))}C${n(x + v(40))} ${n(y + v(2))} ${n(x + v(46))} ${n(y - v(8))} ${n(x + v(58))} ${n(y - v(8))}C${n(x + v(44))} ${n(y - v(26))} ${n(x + v(12))} ${n(y - v(26))} ${x} ${n(y - v(8))}Z" fill="#3A2D4F"/><circle cx="${n(x - v(5))}" cy="${n(y - v(2))}" r="${v(2.4)}" fill="#FFD84A"/><circle cx="${n(x + v(5))}" cy="${n(y - v(2))}" r="${v(2.4)}" fill="#FFD84A"/>`;
}

function fanoos(id: (name: string) => string, [x, y]: Point, s: number): string {
  const v = (value: number) => n(value * s);
  return (
    `<circle data-part="glow" cx="${x}" cy="${y}" r="${v(90)}" fill="url(#${id("gold")})" opacity="0.25"/>` +
    `<path d="M${x} ${n(y - v(96))}V${n(y - v(70))}" stroke="#9A6A12" stroke-width="${v(5)}"/>` +
    `<path d="M${n(x - v(26))} ${n(y - v(58))}C${n(x - v(20))} ${n(y - v(76))} ${n(x + v(20))} ${n(y - v(76))} ${n(x + v(26))} ${n(y - v(58))}Z" fill="url(#${id("gold")})" stroke="#9A6A12" stroke-width="${v(4)}"/>` +
    `<path d="M${n(x - v(34))} ${n(y - v(56))}H${n(x + v(34))}L${n(x + v(46))} ${n(y + v(30))}L${n(x + v(24))} ${n(y + v(58))}H${n(x - v(24))}L${n(x - v(46))} ${n(y + v(30))}Z" fill="#3E9BD4" stroke="#9A6A12" stroke-width="${v(5)}" stroke-linejoin="round"/>` +
    `<path d="M${x} ${n(y - v(56))}V${n(y + v(58))}M${n(x - v(40))} ${n(y)}H${n(x + v(40))}" stroke="url(#${id("gold")})" stroke-width="${v(5)}"/>` +
    `<path d="M${n(x - v(28))} ${n(y - v(48))}L${n(x - v(36))} ${n(y + v(24))}" stroke="#FFFFFF" stroke-width="${v(5)}" opacity="0.4" stroke-linecap="round"/>` +
    `<circle cx="${x}" cy="${n(y + v(4))}" r="${v(12)}" fill="#FFE27A"/>` +
    `<path d="M${n(x - v(20))} ${n(y + v(58))}H${n(x + v(20))}L${x} ${n(y + v(80))}Z" fill="url(#${id("gold")})" stroke="#9A6A12" stroke-width="${v(4)}"/>`
  );
}

function crescent([x, y]: Point, r: number): string {
  return (
    `<path d="M${x} ${n(y - r)}A${r} ${r} 0 1 0 ${n(x + r * 0.86)} ${n(y + r * 0.5)}A${n(r * 0.78)} ${n(r * 0.78)} 0 1 1 ${x} ${n(y - r)}Z" fill="#FFD84A" stroke="#C99A12" stroke-width="4" stroke-linejoin="round"/>` +
    `<path d="${sparklePath([x + r * 0.9, y - r * 0.4], r * 0.32)}" fill="#FFD84A"/>`
  );
}

export const SEASON_COVERS = {
  christmas: (): string => {
    const cat = drawCreature({ ...DEFAULT_CREATURE, reaction: "smile", look: { fur: "#F7F5F2", eyes: "#3E8FDE" }, portable: true });
    return addOn(cat, santaHat([262, 108]) + giftBox([400, 440], 0.72, "#2E9E5A", "#D9202F") + snowflake([80, 120], 1.2) + snowflake([440, 200], 0.9) + snowflake([70, 380], 0.8));
  },
  eid: (): string => {
    const ns = namespace("seid");
    const a = ns("a");
    const body = kid(a, {
      skin: "#D49A6A",
      hair: "short",
      dress: "kurta",
      color: "#F4F1EA",
      face: { eyes: "happy", mouth: "grin", blush: 2 },
      pose: "raise",
      front: `<path d="M176 128C186 70 326 70 336 128Z" fill="#FFFFFF" stroke="#C9C4B8" stroke-width="4"/><path d="M186 116H326" stroke="#2E9E5A" stroke-width="6"/><g fill="#2E9E5A">${[200, 228, 256, 284, 312].map((x) => `<circle cx="${x}" cy="102" r="4"/>`).join("")}</g>` + `<path d="M356 226L394 150" stroke="#9A6A12" stroke-width="6" stroke-linecap="round"/>` + fanoos(a, [400, 190], 0.7),
    });
    return svgDocument(kidDefs(a, { skin: "#D49A6A", color: "#E9E4D8" }), crescent([96, 110], 52) + sparkle([440, 80], 14) + body);
  },
  halloween: (): string => {
    const ghost = drawCreature({ ...DEFAULT_CREATURE, species: "ghost", reaction: "boo", look: DEFAULT_LOOKS.ghost, portable: true });
    return addOn(ghost, pumpkin([118, 430], 0.86) + bat([420, 92], 1) + bat([80, 150], 0.6));
  },
} as const;

export type Season = keyof typeof SEASON_COVERS;

export function seasonCover(season: Season): string {
  return SEASON_COVERS[season]();
}

