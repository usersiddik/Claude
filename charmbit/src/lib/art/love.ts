/**
 * Love & Valentine's: hearts, flowers, and letters. Hearts take the heart
 * colour and flowers take the flower colour, so a whole set can be recoloured.
 */
import { darken, hash, lighten } from "./color.ts";
import { characterDefs, cheeks, eyes, mouth, palette, type Face, type FaceAnchors } from "./face.ts";
import { heartPath, n, namespace, sparkle, sparklePath, svgDocument, type Id, type Point } from "./kit.ts";

export interface LovePaint {
  heart: string;
  flower: string;
  portable?: boolean;
}

export const DEFAULT_LOVE: LovePaint = { heart: "#E4183F", flower: "#E8264F" };

function loveDefs(id: Id, paint: LovePaint): string {
  const h = paint.heart;
  const f = paint.flower;
  return (
    `<linearGradient id="${id("heart")}" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${lighten(h, 0.42)}"/><stop offset="0.5" stop-color="${h}"/><stop offset="1" stop-color="${darken(h, 0.32)}"/></linearGradient>` +
    `<radialGradient id="${id("heartGlow")}" cx="0.5" cy="0.5" r="0.5"><stop offset="0.3" stop-color="${lighten(h, 0.25)}" stop-opacity="0.5"/><stop offset="1" stop-color="${h}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${id("heart2")}" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${lighten(h, 0.62)}"/><stop offset="1" stop-color="${lighten(h, 0.18)}"/></linearGradient>` +
    `<linearGradient id="${id("petal")}" x1="0.3" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="${lighten(f, 0.24)}"/><stop offset="0.55" stop-color="${f}"/><stop offset="1" stop-color="${darken(f, 0.28)}"/></linearGradient>` +
    `<linearGradient id="${id("petalDeep")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${darken(f, 0.08)}"/><stop offset="1" stop-color="${darken(f, 0.38)}"/></linearGradient>` +
    `<linearGradient id="${id("leaf")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6CCB72"/><stop offset="1" stop-color="#2E8B4A"/></linearGradient>` +
    `<linearGradient id="${id("paper")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3E3C8"/><stop offset="1" stop-color="#D9BE92"/></linearGradient>` +
    `<linearGradient id="${id("gold")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#D9A228"/></linearGradient>`
  );
}

/* Hearts --------------------------------------------------------------------- */

/** A glossy heart: glow, gradient body, soft and crisp highlights. */
function glossyHeart(id: Id, paint: LovePaint, at: Point, s: number, rotate = 0, opts: { glow?: boolean; fill?: string } = {}): string {
  const [x, y] = at;
  const edge = darken(paint.heart, 0.42);
  return (
    `<g transform="rotate(${rotate} ${x} ${y})">` +
    (opts.glow === false ? "" : `<circle data-part="glow" cx="${x}" cy="${y}" r="${n(s * 1.32)}" fill="url(#${id("heartGlow")})"/>`) +
    `<path d="${heartPath(at, s)}" fill="${opts.fill ?? `url(#${id("heart")})`}" stroke="${edge}" stroke-opacity="0.55" stroke-width="${n(Math.max(3, s * 0.035))}" stroke-linejoin="round"/>` +
    `<ellipse cx="${n(x - s * 0.46)}" cy="${n(y - s * 0.5)}" rx="${n(s * 0.26)}" ry="${n(s * 0.16)}" fill="#FFFFFF" opacity="0.35" transform="rotate(-38 ${n(x - s * 0.46)} ${n(y - s * 0.5)})"/>` +
    `<path d="M${n(x - s * 0.7)} ${n(y - s * 0.32)}C${n(x - s * 0.72)} ${n(y - s * 0.62)} ${n(x - s * 0.52)} ${n(y - s * 0.82)} ${n(x - s * 0.28)} ${n(y - s * 0.8)}" stroke="#FFFFFF" stroke-width="${n(s * 0.075)}" stroke-linecap="round" opacity="0.9"/>` +
    `<circle cx="${n(x + s * 0.5)}" cy="${n(y - s * 0.58)}" r="${n(s * 0.06)}" fill="#FFFFFF" opacity="0.8"/>` +
    `<path d="M${n(x + s * 0.78)} ${n(y - s * 0.04)}C${n(x + s * 0.66)} ${n(y + s * 0.3)} ${n(x + s * 0.36)} ${n(y + s * 0.56)} ${n(x + s * 0.12)} ${n(y + s * 0.72)}" stroke="#FFFFFF" stroke-width="${n(s * 0.04)}" stroke-linecap="round" opacity="0.25"/>` +
    `</g>`
  );
}

const sparkles = (items: readonly [number, number, number, string?][]) => items.map(([x, y, s, c]) => sparkle([x, y], s, c ?? "#FFD45C")).join("");

function heartFace(id: Id, paint: LovePaint, at: Point, s: number, face: Face): string {
  const [x, y] = at;
  const p = { ...palette({ fur: paint.heart, eyes: "#3A2C26" }), line: "#3A1018" };
  const anchors: FaceAnchors = {
    eyes: [
      [x - s * 0.3, y - s * 0.06],
      [x + s * 0.3, y - s * 0.06],
    ],
    r: s * 0.15,
    mouth: [x, y + s * 0.12],
    cheeks: [
      [x - s * 0.5, y + s * 0.16],
      [x + s * 0.5, y + s * 0.16],
    ],
    scale: s / 150,
    style: "simple",
    lid: paint.heart,
  };
  return cheeks(id, face, anchors, true) + eyes(id, p, face, anchors) + mouth(p, face, anchors);
}

function wing(x: number, y: number, side: -1 | 1): string {
  const feathers = [
    [0, 0, 74, 30, -22],
    [-10, 34, 66, 26, -6],
    [-4, 64, 52, 22, 10],
  ]
    .map(([dx, dy, rx, ry, rot]) => {
      const cx = x + side * (dx! + rx! * 0.8);
      const cy = y + dy!;
      return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${rx}" ry="${ry}" transform="rotate(${side * rot!} ${n(cx)} ${n(cy)})"/>`;
    })
    .join("");
  return `<g fill="#FFFFFF" stroke="#C9CCD8" stroke-width="5">${feathers}</g><g fill="#EEF1F8">${feathers.replace(/rx="(\d+)" ry="(\d+)"/g, (_, rx, ry) => `rx="${Number(rx) * 0.7}" ry="${Number(ry) * 0.5}"`)}</g>`;
}

/* Flowers -------------------------------------------------------------------- */

function rose(id: Id, [x, y]: Point, s: number, rotate = 0): string {
  const p = (dx: number, dy: number) => `${n(x + dx * s)} ${n(y + dy * s)}`;
  const deep = `url(#${id("petalDeep")})`;
  const petal = `url(#${id("petal")})`;
  return (
    `<g transform="rotate(${rotate} ${x} ${y})" stroke="#000000" stroke-opacity="0.2" stroke-width="${n(3 * s)}" stroke-linejoin="round">` +
    `<path d="M${p(-78, -4)}C${p(-84, -66)} ${p(-30, -92)} ${p(0, -88)}C${p(30, -92)} ${p(84, -66)} ${p(78, -4)}C${p(70, 40)} ${p(-70, 40)} ${p(-78, -4)}Z" fill="${deep}"/>` +
    `<path d="M${p(-46, -26)}C${p(-44, -70)} ${p(40, -76)} ${p(46, -26)}C${p(48, 4)} ${p(-48, 4)} ${p(-46, -26)}Z" fill="${petal}"/>` +
    `<path d="M${p(-26, -30)}C${p(-22, -56)} ${p(26, -58)} ${p(28, -30)}C${p(30, -10)} ${p(-10, -4)} ${p(-12, -24)}C${p(-12, -38)} ${p(12, -40)} ${p(12, -26)}" fill="none" stroke="#000000" stroke-opacity="0.28" stroke-width="${n(6 * s)}" stroke-linecap="round"/>` +
    `<path d="M${p(-88, -14)}C${p(-74, -40)} ${p(-34, -36)} ${p(-12, 6)}C${p(-40, 30)} ${p(-80, 22)} ${p(-88, -14)}Z" fill="${petal}"/>` +
    `<path d="M${p(88, -14)}C${p(74, -40)} ${p(34, -36)} ${p(12, 6)}C${p(40, 30)} ${p(80, 22)} ${p(88, -14)}Z" fill="${petal}"/>` +
    `<path d="M${p(-80, 0)}C${p(-82, 54)} ${p(-34, 86)} ${p(0, 86)}C${p(34, 86)} ${p(82, 54)} ${p(80, 0)}C${p(52, 26)} ${p(28, 30)} ${p(0, 24)}C${p(-28, 30)} ${p(-52, 26)} ${p(-80, 0)}Z" fill="${deep}"/>` +
    `<path d="M${p(-62, 22)}C${p(-50, 56)} ${p(-20, 72)} ${p(0, 74)}" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="${n(6 * s)}" stroke-linecap="round" fill="none"/>` +
    `<path d="M${p(-30, -66)}C${p(-14, -76)} ${p(10, -78)} ${p(26, -70)}" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="${n(5 * s)}" stroke-linecap="round" fill="none"/>` +
    `</g>`
  );
}

function leaf(id: Id, [x, y]: Point, s: number, rotate: number): string {
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${s})"><path d="M0 0C24 -26 70 -30 96 -8C70 18 26 20 0 0Z" fill="url(#${id("leaf")})" stroke="#1E6E3E" stroke-width="4" stroke-linejoin="round"/><path d="M6 -1C34 -8 62 -10 88 -8" stroke="#1E6E3E" stroke-width="3" opacity="0.5" fill="none"/></g>`;
}

const stem = (d: string) => `<path d="${d}" stroke="#1E6E3E" stroke-width="16" stroke-linecap="round" fill="none"/><path d="${d}" stroke="#4CAF5A" stroke-width="9" stroke-linecap="round" fill="none"/>`;

function tulip(id: Id, [x, y]: Point, s: number): string {
  const p = (dx: number, dy: number) => `${n(x + dx * s)} ${n(y + dy * s)}`;
  return (
    `<g stroke="#000000" stroke-opacity="0.2" stroke-width="${n(3 * s)}" stroke-linejoin="round">` +
    `<path d="M${p(-30, 40)}C${p(-46, 0)} ${p(-24, -70)} ${p(0, -92)}C${p(24, -70)} ${p(46, 0)} ${p(30, 40)}Z" fill="url(#${id("petalDeep")})"/>` +
    `<path d="M${p(-62, -40)}C${p(-30, -40)} ${p(-6, -10)} ${p(4, 40)}C${p(-20, 66)} ${p(-60, 60)} ${p(-68, 20)}C${p(-72, -4)} ${p(-68, -24)} ${p(-62, -40)}Z" fill="url(#${id("petal")})"/>` +
    `<path d="M${p(62, -40)}C${p(30, -40)} ${p(6, -10)} ${p(-4, 40)}C${p(20, 66)} ${p(60, 60)} ${p(68, 20)}C${p(72, -4)} ${p(68, -24)} ${p(62, -40)}Z" fill="url(#${id("petal")})"/>` +
    `<path d="M${p(-50, -20)}C${p(-50, 4)} ${p(-40, 28)} ${p(-22, 42)}" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="${n(6 * s)}" stroke-linecap="round" fill="none"/>` +
    `</g>`
  );
}

function daisy(id: Id, [x, y]: Point, s: number): string {
  const petals = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * 360;
    return `<ellipse cx="${x}" cy="${n(y - 70 * s)}" rx="${n(26 * s)}" ry="${n(54 * s)}" transform="rotate(${angle} ${x} ${y})"/>`;
  }).join("");
  const face: Face = { eyes: "happy", mouth: "grin", blush: 2 };
  const p = { ...palette({ fur: "#FFC93C", eyes: "#3A2C26" }), line: "#5A3410" };
  const anchors: FaceAnchors = {
    eyes: [
      [x - 18 * s, y - 6 * s],
      [x + 18 * s, y - 6 * s],
    ],
    r: 11 * s,
    mouth: [x, y + 6 * s],
    cheeks: [
      [x - 30 * s, y + 10 * s],
      [x + 30 * s, y + 10 * s],
    ],
    scale: 0.7 * s,
    style: "simple",
    lid: "#FFC93C",
  };
  return (
    `<g fill="url(#${id("petal")})" stroke="#000000" stroke-opacity="0.18" stroke-width="${n(3 * s)}">${petals}</g>` +
    `<circle cx="${x}" cy="${y}" r="${n(46 * s)}" fill="#FFC93C" stroke="#D99A12" stroke-width="${n(4 * s)}"/>` +
    `<circle cx="${n(x - 14 * s)}" cy="${n(y - 18 * s)}" r="${n(10 * s)}" fill="#FFFFFF" opacity="0.45"/>` +
    cheeks(id, face, anchors, true) +
    eyes(id, p, face, anchors) +
    mouth(p, face, anchors)
  );
}

/* Scenes ---------------------------------------------------------------------- */

interface LoveScene {
  name: string;
  caption: string;
  /** Which colours this sticker uses. */
  uses: readonly ("heart" | "flower")[];
  draw: (id: Id, paint: LovePaint) => string;
}

const H = ["heart"] as const;
const F = ["flower"] as const;

export const LOVE_SCENES: Record<string, LoveScene> = {
  "glossy-heart": {
    name: "Glossy heart",
    caption: "Love you",
    uses: H,
    draw: (id, paint) => glossyHeart(id, paint, [256, 276], 176, -6) + sparkles([[424, 110, 20], [92, 130, 12, "#FFB8CC"], [430, 420, 10]]),
  },
  "sparkle-heart": {
    name: "Sparkle heart",
    caption: "You shine",
    uses: H,
    draw: (id, paint) =>
      `<g data-part="decor">${Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const r = index % 2 ? 200 : 214;
        return `<path d="${sparklePath([256 + Math.cos(angle) * r, 270 + Math.sin(angle) * r * 0.92], index % 2 ? 10 : 16)}" fill="${index % 3 ? "#FFD45C" : "#FFB8CC"}"/>`;
      }).join("")}</g>` + glossyHeart(id, paint, [256, 276], 150, 4),
  },
  balloon: {
    name: "Heart balloon",
    caption: "Up, up & away",
    uses: H,
    draw: (id, paint) =>
      `<path d="M262 352C246 386 282 406 262 438C246 462 270 482 258 504" stroke="#9AA0AE" stroke-width="5" stroke-linecap="round" fill="none"/>` +
      `<path d="M250 342L262 362L274 342Z" fill="${darken(paint.heart, 0.2)}"/>` +
      glossyHeart(id, paint, [262, 210], 150, -8) +
      `<path d="M218 444C200 430 186 440 192 454C198 466 214 460 222 450M222 450C242 436 256 448 248 462C242 472 228 466 222 450Z" fill="${lighten(paint.heart, 0.4)}" stroke="${darken(paint.heart, 0.2)}" stroke-width="4"/>` +
      sparkles([[100, 120, 14], [420, 330, 12, "#FFB8CC"]]),
  },
  winged: {
    name: "Winged heart",
    caption: "Angel",
    uses: H,
    draw: (id, paint) => wing(166, 214, -1) + wing(346, 214, 1) + glossyHeart(id, paint, [256, 270], 124) + `<ellipse cx="256" cy="94" rx="70" ry="18" fill="none" stroke="url(#${id("gold")})" stroke-width="12"/>`,
  },
  arrow: {
    name: "Cupid's arrow",
    caption: "Struck",
    uses: H,
    draw: (id, paint) =>
      `<path d="M70 410L250 280" stroke="#8B6A3E" stroke-width="12" stroke-linecap="round"/>` +
      `<path d="M62 382L86 408L54 420Z" fill="#FFFFFF" stroke="#C9CCD8" stroke-width="4"/><path d="M92 360L112 390L74 398Z" fill="#FFFFFF" stroke="#C9CCD8" stroke-width="4"/>` +
      glossyHeart(id, paint, [256, 264], 150, -10) +
      `<path d="M300 232L440 132" stroke="#8B6A3E" stroke-width="12" stroke-linecap="round"/>` +
      `<path d="M452 110L414 130L436 160Z" fill="url(#${id("gold")})" stroke="#9A6A12" stroke-width="4" stroke-linejoin="round"/>`,
  },
  "mended-heart": {
    name: "Mended heart",
    caption: "All better",
    uses: H,
    draw: (id, paint) =>
      glossyHeart(id, paint, [256, 272], 170, 0) +
      heartFace(id, paint, [256, 262], 170, { eyes: "happy", mouth: "smile", blush: 2 }) +
      `<g transform="rotate(-30 352 170)"><rect x="300" y="150" width="104" height="40" rx="20" fill="#F6DCC0" stroke="#C9A27A" stroke-width="4"/><rect x="336" y="150" width="32" height="40" fill="#EAC9A6"/><g fill="#C9A27A"><circle cx="314" cy="164" r="2.6"/><circle cx="320" cy="176" r="2.6"/><circle cx="390" cy="164" r="2.6"/><circle cx="384" cy="176" r="2.6"/></g></g>`,
  },
  "heart-face": {
    name: "Happy heart",
    caption: "Hehe",
    uses: H,
    draw: (id, paint) => glossyHeart(id, paint, [256, 272], 176, -4) + heartFace(id, paint, [256, 262], 176, { eyes: "open", mouth: "grin", blush: 2 }) + sparkles([[430, 100, 16], [86, 120, 10, "#FFB8CC"]]),
  },
  "shy-heart": {
    name: "Shy heart",
    caption: "Stop it",
    uses: H,
    draw: (id, paint) =>
      glossyHeart(id, paint, [256, 272], 170, 6) +
      heartFace(id, paint, [256, 262], 170, { eyes: "side", mouth: "smile", blush: 2 }) + sparkles([[424, 110, 14, "#FFB8CC"]]),
  },
  "two-hearts": {
    name: "Two hearts",
    caption: "You & me",
    uses: H,
    draw: (id, paint) => glossyHeart(id, paint, [338, 188], 92, 16, { fill: `url(#${id("heart2")})` }) + glossyHeart(id, paint, [214, 300], 136, -12) + sparkles([[100, 110, 14], [440, 360, 12, "#FFB8CC"]]),
  },
  "love-letter": {
    name: "Love letter",
    caption: "For you",
    uses: H,
    draw: (id, paint) =>
      glossyHeart(id, paint, [176, 104], 34, -14, { glow: false }) +
      glossyHeart(id, paint, [336, 74], 26, 12, { glow: false, fill: `url(#${id("heart2")})` }) +
      `<rect x="84" y="186" width="344" height="236" rx="16" fill="#FFF7EE" stroke="#D9C2A2" stroke-width="5"/>` +
      `<path d="M90 410L222 300M422 410L290 300" stroke="#E4D0B4" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M88 192L256 322L424 192" fill="#FFFBF6" stroke="#D9C2A2" stroke-width="5" stroke-linejoin="round"/>` +
      glossyHeart(id, paint, [256, 318], 46, 0, { glow: false }) +
      sparkles([[438, 150, 14], [70, 160, 10, "#FFB8CC"]]),
  },
  lollipop: {
    name: "Heart lollipop",
    caption: "Sweet on you",
    uses: H,
    draw: (id, paint) =>
      `<path d="M256 340V494" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/><path d="M256 340V494" stroke="${lighten(paint.heart, 0.4)}" stroke-width="18" stroke-dasharray="10 14" stroke-linecap="butt"/><path d="M256 340V494" stroke="#00000022" stroke-width="22" stroke-linecap="round" fill="none" opacity="0.4"/>` +
      `<path d="M256 352C226 336 204 344 208 360C212 376 236 370 256 352ZM256 352C286 336 308 344 304 360C300 376 276 370 256 352Z" fill="${lighten(paint.heart, 0.2)}" stroke="${darken(paint.heart, 0.3)}" stroke-width="4"/>` +
      `<clipPath id="${id("candy")}"><path d="${heartPath([256, 214], 150)}"/></clipPath>` +
      glossyHeart(id, paint, [256, 214], 150) +
      `<g clip-path="url(#${id("candy")})" stroke="#FFFFFF" stroke-width="16" opacity="0.55" fill="none"><path d="M256 214m-30 0a30 30 0 1 1 60 0a60 60 0 1 1-120 0a90 90 0 1 1 180 0a120 120 0 1 1-240 0"/></g>`,
  },
  chocolates: {
    name: "Chocolates",
    caption: "Treat yourself",
    uses: H,
    draw: (id, paint) => {
      const choc = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="30" fill="#5A2E1A" stroke="#2E160C" stroke-width="4"/><path d="M${x - 18} ${y - 6}q9 -10 18 0t18 0" stroke="#E8C9A0" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="${x - 10}" cy="${y - 14}" r="5" fill="#FFFFFF" opacity="0.25"/>`;
      return (
        glossyHeart(id, paint, [256, 266], 190, 0) +
        `<path d="${heartPath([256, 270], 150)}" fill="${darken(paint.heart, 0.4)}" opacity="0.55"/>` +
        choc(196, 226) +
        choc(316, 226) +
        choc(256, 290) +
        choc(196, 300) +
        choc(316, 300) +
        choc(256, 364)
      );
    },
  },
  rose: {
    name: "Rose",
    caption: "For you",
    uses: F,
    draw: (id) => stem("M256 270C250 340 262 420 250 500") + leaf(id, [254, 372], 1, -150) + leaf(id, [256, 430], 0.9, -20) + rose(id, [256, 190], 1.35, -4) + sparkles([[420, 110, 16], [96, 140, 10, "#FFB8CC"]]),
  },
  tulip: {
    name: "Tulip",
    caption: "Thinking of you",
    uses: F,
    draw: (id) =>
      stem("M256 300C254 380 262 440 256 500") +
      `<path d="M252 500C210 456 186 386 196 318C226 352 248 420 252 500Z" fill="url(#${id("leaf")})" stroke="#1E6E3E" stroke-width="4"/>` +
      `<path d="M262 500C304 450 330 380 318 330C290 366 268 420 262 500Z" fill="url(#${id("leaf")})" stroke="#1E6E3E" stroke-width="4"/>` +
      tulip(id, [256, 216], 1.55) +
      sparkles([[410, 120, 14], [100, 150, 10, "#FFB8CC"]]),
  },
  bouquet: {
    name: "Bouquet",
    caption: "Just because",
    uses: F,
    draw: (id) =>
      leaf(id, [186, 236], 0.9, -150) +
      leaf(id, [330, 226], 0.9, -30) +
      leaf(id, [256, 150], 0.8, -100) +
      rose(id, [176, 196], 0.78, -16) +
      rose(id, [336, 196], 0.78, 16) +
      rose(id, [256, 150], 0.86) +
      `<path d="M150 236L256 500L362 236C320 268 290 258 256 270C222 258 192 268 150 236Z" fill="url(#${id("paper")})" stroke="#B89A6A" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M214 300L256 500M298 300L256 500" stroke="#B89A6A" stroke-width="3" opacity="0.5"/>` +
      `<path d="M256 372C226 344 198 352 204 372C210 392 240 386 256 372ZM256 372C286 344 314 352 308 372C302 392 272 386 256 372Z" fill="#E4183F" stroke="#8E0A28" stroke-width="4"/><path d="M248 376L230 418M264 376L282 418" stroke="#E4183F" stroke-width="10" stroke-linecap="round"/><circle cx="256" cy="372" r="10" fill="#B0102E"/>`,
  },
  daisy: {
    name: "Happy daisy",
    caption: "Hi sunshine",
    uses: F,
    draw: (id) => stem("M256 300C246 380 268 440 256 500") + leaf(id, [254, 410], 0.9, -150) + daisy(id, [256, 200], 1.25) + sparkles([[430, 90, 14], [84, 120, 10, "#FFB8CC"]]),
  },
};

export const LOVE_IDS = Object.keys(LOVE_SCENES);

/** Draws a Love sticker by scene id. */
export function drawLove(sceneId: string, paint: LovePaint): string {
  const scene = LOVE_SCENES[sceneId] ?? LOVE_SCENES["glossy-heart"]!;
  const ns = namespace(`lv${hash(sceneId + JSON.stringify(paint))}`);
  const id = ns("s");
  const defs = loveDefs(id, paint) + characterDefs(id, palette({ fur: paint.heart, eyes: "#3A2C26" }), true);
  return svgDocument(defs, scene.draw(id, paint));
}

