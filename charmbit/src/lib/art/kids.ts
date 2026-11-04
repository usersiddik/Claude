/**
 * Little people: a chibi kid rig (skin, hair, outfit, pose) and the Diwali
 * scenes built from it. Faces reuse the shared face system, so kids match
 * the creatures' eyes, blush, and expressions.
 */
import { darken, hash, lighten, mix } from "./color.ts";
import { brows, characterDefs, cheeks, eyes, mouth, tears, type Face, type FaceAnchors, type Palette } from "./face.ts";
import { anar, burst, diyaRow, giftBox, glow, kandil, laddooPlate, marigoldBall, rangoli, rocket, taper, thali, toran } from "./festive.ts";
import { limb, local, n, namespace, place, sceneDefs, sparkle, svgDocument, type Id, type LimbStyle, type Point } from "./kit.ts";
import { diya, lights, sparkler } from "./props.ts";

export type Hair = "short" | "curly" | "long" | "bun" | "braid" | "pigtails";
export type Dress = "kurta" | "lehenga" | "saree";
export type KidPose = "rest" | "hold" | "raise" | "raiseLeft" | "both" | "wave" | "namaste" | "ears" | "point" | "hugRight" | "hugLeft" | "hip" | "none";

export interface Kid {
  skin: string;
  hair: Hair;
  dress: Dress;
  /** Outfit colour. */
  color: string;
  /** Dupatta or trim colour. */
  accent?: string;
  face: Face;
  pose: KidPose;
  tilt?: number;
  bindi?: boolean;
  /** Markup drawn between the body and the arms. */
  held?: string;
  /** Markup drawn on top. */
  front?: string;
  /** Custom hand targets (overrides the pose). */
  hands?: { left?: Point; right?: Point; leftBend?: number; rightBend?: number };
}

const HAIR = "#2B1B17";
const FACE_PATH = "M256 80C320 80 362 122 364 182C366 240 326 284 256 286C186 284 146 240 148 182C150 122 192 80 256 80Z";
const SHOULDERS: readonly [Point, Point] = [
  [216, 298],
  [296, 298],
];

const ANCHORS: Omit<FaceAnchors, "lid"> = {
  eyes: [
    [212, 194],
    [300, 194],
  ],
  r: 25,
  mouth: [256, 236],
  cheeks: [
    [180, 232],
    [332, 232],
  ],
  scale: 0.86,
  style: "simple",
};

export const SKIN_TONES = [
  { id: "porcelain", name: "Porcelain", hex: "#F7D9C4" },
  { id: "honey", name: "Honey", hex: "#EDBB8E" },
  { id: "caramel", name: "Caramel", hex: "#D49A6A" },
  { id: "cocoa", name: "Cocoa", hex: "#A86E48" },
  { id: "espresso", name: "Espresso", hex: "#7A4C32" },
] as const;

/** A second outfit colour that sits well next to the first. */
export function companion(color: string): string {
  const pairs: Record<string, string> = {
    "#F29A1E": "#2A4BC2",
    "#D61F6E": "#F29A1E",
    "#2A4BC2": "#F29A1E",
    "#0E8A5C": "#D61F6E",
    "#8E1B3A": "#F2B84B",
    "#0D7C8A": "#D61F6E",
    "#6A3FA6": "#F29A1E",
  };
  return pairs[color.toUpperCase()] ?? mix(color, "#F29A1E", 0.7);
}

function kidPalette(skin: string): Palette {
  return {
    furLight: lighten(skin, 0.32),
    fur: skin,
    furShade: darken(skin, 0.12),
    outline: mix(darken(skin, 0.52), "#3A2018", 0.4),
    stripe: darken(skin, 0.2),
    muzzle: lighten(skin, 0.2),
    irisLight: "#B98A62",
    iris: "#5A3A22",
    irisDark: "#22140C",
    line: "#3A2220",
    nose: darken(skin, 0.25),
    earInner: darken(skin, 0.14),
  };
}

/** Gradients for one kid namespace. */
export function kidDefs(id: Id, kid: Pick<Kid, "skin" | "color" | "accent">): string {
  const accent = kid.accent ?? "#F2B84B";
  return (
    characterDefs(id, kidPalette(kid.skin), true) +
    `<linearGradient id="${id("cloth")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(kid.color, 0.16)}"/><stop offset="1" stop-color="${darken(kid.color, 0.2)}"/></linearGradient>` +
    `<linearGradient id="${id("accent")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(accent, 0.2)}" stop-opacity="0.92"/><stop offset="1" stop-color="${darken(accent, 0.12)}" stop-opacity="0.92"/></linearGradient>` +
    `<linearGradient id="${id("hair")}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#4A3028"/><stop offset="1" stop-color="${HAIR}"/></linearGradient>` +
    `<linearGradient id="${id("gold")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#D9A228"/></linearGradient>`
  );
}

/* Hair --------------------------------------------------------------------- */

function hairBack(id: Id, hair: Hair): string {
  const fill = `url(#${id("hair")})`;
  switch (hair) {
    case "long":
    case "braid":
      return `<path d="M150 176C144 112 194 70 256 70C318 70 368 112 362 176C368 230 374 286 360 330C334 344 306 334 300 306H212C206 334 178 344 152 330C138 286 144 230 150 176Z" fill="${fill}"/>`;
    case "bun":
      return `<circle cx="256" cy="72" r="40" fill="${fill}"/>`;
    case "pigtails":
      return (
        `<path d="M146 150C110 150 92 196 104 244C112 272 134 280 146 262C138 230 140 190 160 160Z" fill="${fill}"/>` +
        `<path d="M366 150C402 150 420 196 408 244C400 272 378 280 366 262C374 230 372 190 352 160Z" fill="${fill}"/>`
      );
    default:
      return "";
  }
}

function hairFront(id: Id, hair: Hair, accent: string): string {
  const fill = `url(#${id("hair")})`;
  const shine = `<path d="M196 100C218 88 244 84 266 86" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.28" fill="none"/>`;
  switch (hair) {
    case "short":
      return (
        `<path d="M146 204C136 118 190 64 258 64C326 64 378 114 366 204C358 186 350 170 344 160C334 172 320 176 306 174C312 162 314 150 310 140C296 158 272 166 248 162C256 154 260 144 260 134C238 152 208 160 184 156C176 172 160 188 146 204Z" fill="${fill}"/>` +
        shine
      );
    case "curly": {
      const curls = [
        [158, 160, 28],
        [178, 116, 30],
        [216, 88, 32],
        [258, 80, 34],
        [300, 88, 32],
        [338, 116, 30],
        [356, 160, 28],
        [200, 132, 24],
        [256, 120, 26],
        [312, 132, 24],
      ]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`)
        .join("");
      return `<g fill="${fill}">${curls}</g><path d="M200 102c10-8 24-12 36-10M280 96c12 0 24 4 32 12" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.25" fill="none"/>`;
    }
    case "bun":
      return (
        `<path d="M148 200C138 116 192 66 256 66C320 66 374 116 364 200C352 166 330 130 290 112C276 106 264 102 256 100C248 102 236 106 222 112C182 130 160 166 148 200Z" fill="${fill}"/>` +
        // Gajra: a ring of jasmine around the bun.
        `<g fill="#FFFFFF" stroke="#E6E0D4" stroke-width="1.5">${Array.from({ length: 9 }, (_, index) => {
          const angle = Math.PI * (0.95 + (index / 8) * 1.1);
          return `<circle cx="${n(256 + Math.cos(angle) * 40)}" cy="${n(72 + Math.sin(angle) * 40)}" r="7"/>`;
        }).join("")}</g>` +
        shine
      );
    case "pigtails":
      return (
        `<path d="M148 200C138 116 192 66 256 66C320 66 374 116 364 200C350 170 326 140 290 130C270 152 236 152 216 128C184 140 160 166 148 200Z" fill="${fill}"/>` +
        `<circle cx="146" cy="152" r="12" fill="${accent}"/><circle cx="366" cy="152" r="12" fill="${accent}"/>` +
        shine
      );
    default:
      // long and braid: centre parting.
      return (
        `<path d="M148 200C138 116 192 66 256 66C320 66 374 116 364 200C352 166 330 130 290 112C276 106 264 102 256 98C248 102 236 106 222 112C182 130 160 166 148 200Z" fill="${fill}"/>` +
        shine +
        (hair === "braid"
          ? `<g fill="${fill}">${[0, 1, 2, 3].map((k) => `<ellipse cx="${n(340 + k * 4)}" cy="${n(262 + k * 34)}" rx="22" ry="20"/>`).join("")}</g><path d="M346 368l-4 26l18 0z" fill="${accent}"/><circle cx="350" cy="366" r="8" fill="${accent}"/>`
          : "")
      );
  }
}

/* Body --------------------------------------------------------------------- */

function body(id: Id, kid: Kid): string {
  const cloth = `url(#${id("cloth")})`;
  const gold = `url(#${id("gold")})`;
  const outline = `stroke="${darken(kid.color, 0.4)}" stroke-width="4" stroke-linejoin="round"`;
  const neck = `<path d="M238 266H274V300H238Z" fill="${darken(kid.skin, 0.08)}"/>`;
  if (kid.dress === "kurta") {
    return (
      `<path d="M212 404L216 470H248L252 404Z" fill="#F6EEDF" stroke="#C9BBA4" stroke-width="4"/><path d="M260 404L264 470H296L300 404Z" fill="#F6EEDF" stroke="#C9BBA4" stroke-width="4"/>` +
      `<path d="M204 476C204 464 222 460 238 464C246 466 252 472 254 478C238 486 212 488 204 476Z" fill="#C8902E" stroke="#7E5414" stroke-width="3.5"/>` +
      `<path d="M308 476C308 464 290 460 274 464C266 466 260 472 258 478C274 486 300 488 308 476Z" fill="#C8902E" stroke="#7E5414" stroke-width="3.5"/>` +
      neck +
      `<path d="M206 290C192 306 186 346 184 412C210 424 302 424 328 412C326 346 320 306 306 290C290 282 222 282 206 290Z" fill="${cloth}" ${outline}/>` +
      `<path d="M188 400C214 410 298 410 324 400" stroke="${gold}" stroke-width="8" fill="none"/>` +
      `<path d="M234 286C244 296 268 296 278 286" stroke="${gold}" stroke-width="6" fill="none" stroke-linecap="round"/>` +
      `<path d="M256 294V354" stroke="${gold}" stroke-width="4"/>` +
      `<circle cx="256" cy="312" r="4.5" fill="${gold}"/><circle cx="256" cy="330" r="4.5" fill="${gold}"/><circle cx="256" cy="348" r="4.5" fill="${gold}"/>` +
      `<path d="M206 300C200 330 198 370 198 404" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.18" fill="none"/>`
    );
  }
  const skirtTop = kid.dress === "saree" ? 340 : 344;
  const skirt = `<path d="M204 ${skirtTop}C180 380 162 432 152 478C190 496 322 496 360 478C350 432 332 380 308 ${skirtTop}Z" fill="${cloth}" ${outline}/>`;
  const border = `<path d="M156 466C194 484 318 484 356 466" stroke="${gold}" stroke-width="12" fill="none"/><path d="M160 476C196 490 316 490 352 476" stroke="#FFF1C1" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" fill="none"/>`;
  const pleats = `<path d="M226 356L206 470M256 356V476M286 356L306 470" stroke="#FFFFFF" stroke-width="4" opacity="0.18"/>`;
  const motifs = `<g fill="${gold}">${[
    [210, 404],
    [256, 420],
    [302, 404],
    [232, 444],
    [280, 444],
    [184, 450],
    [328, 450],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6"/>`)
    .join("")}</g>`;
  const feet = `<ellipse cx="232" cy="490" rx="16" ry="8" fill="#C8902E" stroke="#7E5414" stroke-width="3"/><ellipse cx="280" cy="490" rx="16" ry="8" fill="#C8902E" stroke="#7E5414" stroke-width="3"/>`;
  const choli = `<path d="M210 290C198 304 196 324 198 346H314C316 324 314 304 302 290C288 282 224 282 210 290Z" fill="${cloth}" ${outline}/><path d="M234 286C244 296 268 296 278 286" stroke="${gold}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const waist = `<path d="M202 344H310" stroke="${gold}" stroke-width="8"/>`;
  const dupatta =
    kid.dress === "saree"
      ? `<path d="M296 286C320 300 330 340 328 380C326 420 336 452 352 474L330 482C312 450 304 420 304 380C304 344 294 310 276 292Z" fill="url(#${id("accent")})" stroke="${darken(kid.accent ?? "#F2B84B", 0.3)}" stroke-width="3"/><path d="M216 292C246 320 286 334 316 340" stroke="url(#${id("accent")})" stroke-width="22" fill="none" opacity="0.95"/>`
      : `<path d="M214 292C244 322 284 348 320 360L314 376C276 362 238 336 206 304Z" fill="url(#${id("accent")})" stroke="${darken(kid.accent ?? "#F2B84B", 0.3)}" stroke-width="3"/><path d="M212 300C242 328 280 352 316 366" stroke="${gold}" stroke-width="3" stroke-dasharray="3 7" fill="none"/>`;
  return feet + neck + skirt + pleats + motifs + border + choli + waist + dupatta;
}

/* Arms --------------------------------------------------------------------- */

function arms(id: Id, p: Palette, kid: Kid): string {
  const [ls, rs] = SHOULDERS;
  const sleeve = kid.dress === "kurta";
  const style: LimbStyle = {
    fill: sleeve ? lighten(kid.color, 0.04) : `url(#${id("fur")})`,
    outline: sleeve ? darken(kid.color, 0.4) : p.outline,
    paw: `url(#${id("fur")})`,
    width: 27,
    taper: 0.82,
    cuff: `url(#${id("gold")})`,
    end: "hand",
  };
  const targets: Record<KidPose, [Point | null, Point | null, number, number]> = {
    rest: [[198, 392], [314, 392], 8, -8],
    hold: [[232, 352], [280, 352], 14, -14],
    both: [[232, 352], [280, 352], 14, -14],
    raise: [[198, 392], [358, 226], 8, -16],
    raiseLeft: [[154, 226], [314, 392], 16, -8],
    wave: [[198, 392], [362, 222], 8, -20],
    namaste: [[250, 322], [262, 322], 30, -30],
    ears: [[154, 204], [358, 204], 34, -34],
    point: [[198, 392], [356, 146], 8, -10],
    hugRight: [[198, 392], [404, 330], 8, -10],
    hugLeft: [[108, 330], [314, 392], 10, -8],
    hip: [[198, 392], [334, 352], 8, 40],
    none: [null, null, 0, 0],
  };
  const [left, right, lb, rb] = targets[kid.pose];
  const l = kid.hands?.left ?? left;
  const r = kid.hands?.right ?? right;
  const sleeveCap = (at: Point) => (sleeve ? "" : `<ellipse cx="${at[0]}" cy="${at[1] + 4}" rx="20" ry="16" fill="url(#${id("cloth")})" stroke="${darken(kid.color, 0.4)}" stroke-width="3.5"/>`);
  const joined =
    kid.pose === "namaste"
      ? `<path d="M256 268C266 280 270 300 268 330C264 338 248 338 244 330C242 300 246 280 256 268Z" fill="url(#${id("fur")})" stroke="${p.outline}" stroke-width="4" stroke-linejoin="round"/><path d="M256 276V332" stroke="${p.outline}" stroke-width="2.4" opacity="0.6"/>`
      : "";
  return (
    (l ? limb(style, ls, l, kid.hands?.leftBend ?? lb) + sleeveCap(ls) : "") +
    (r ? limb(style, rs, r, kid.hands?.rightBend ?? rb) + sleeveCap(rs) : "") +
    joined
  );
}

/* Kid ------------------------------------------------------------------------ */

/** One kid in its own 512 × 512 space. */
export function kid(id: Id, k: Kid): string {
  const p = kidPalette(k.skin);
  const face: FaceAnchors = { ...ANCHORS, lid: k.skin, lashes: k.hair !== "short" && k.hair !== "curly" };
  const accent = k.accent ?? "#F2B84B";
  const head =
    `<circle cx="150" cy="196" r="20" fill="url(#${id("fur")})" stroke="${p.outline}" stroke-width="4"/><circle cx="362" cy="196" r="20" fill="url(#${id("fur")})" stroke="${p.outline}" stroke-width="4"/>` +
    `<path d="M150 188a8 8 0 0 1 0 16M362 188a8 8 0 0 0 0 16" stroke="${p.outline}" stroke-width="2.4" opacity="0.5" fill="none"/>` +
    (k.hair === "long" || k.hair === "braid" || k.hair === "bun" || k.hair === "pigtails"
      ? `<circle cx="150" cy="222" r="5" fill="url(#${id("gold")})"/><circle cx="362" cy="222" r="5" fill="url(#${id("gold")})"/>`
      : "") +
    `<path d="${FACE_PATH}" fill="url(#${id("fur")})" stroke="${p.outline}" stroke-width="4"/>` +
    `<ellipse cx="256" cy="196" rx="86" ry="70" fill="url(#${id("glow")})"/>` +
    cheeks(id, k.face, face, true) +
    eyes(id, p, k.face, face) +
    brows(p, k.face, face) +
    `<path d="M250 216q6 6 12 0" stroke="${p.nose}" stroke-width="3" stroke-linecap="round" fill="none"/>` +
    mouth(p, k.face, face) +
    tears(id, k.face, face) +
    hairFront(id, k.hair, accent) +
    (k.bindi ? `<circle cx="256" cy="140" r="5" fill="#D61F3A"/>` : "");
  const tilt = k.tilt ?? 0;
  return (
    hairBack(id, k.hair) +
    body(id, k) +
    `<g transform="rotate(${tilt} 256 286)">${head}</g>` +
    (k.held ?? "") +
    arms(id, p, k) +
    (k.front ?? "")
  );
}

/* Diwali scenes ---------------------------------------------------------------- */

export interface DiwaliPaint {
  /** Main outfit colour. */
  outfit: string;
  skin: string;
  /** String lights and toran. */
  lights: boolean;
  portable?: boolean;
}

export const DEFAULT_DIWALI: DiwaliPaint = { outfit: "#D61F6E", skin: "#D49A6A", lights: true };

interface Scene {
  name: string;
  caption: string;
  /** Has people (vs. pure decor). */
  people: boolean;
  draw: (ctx: SceneContext) => string;
  /** Kid namespaces used (a, b, c). */
  cast?: number;
}

interface SceneContext {
  ids: { a: Id; b: Id; c: Id; s: Id };
  paint: DiwaliPaint;
  /** Kid presets with paint applied. */
  girl: (extra: Partial<Kid>) => Kid;
  boy: (extra: Partial<Kid>) => Kid;
  second: (k: Kid) => Kid;
}

const happy: Face = { eyes: "happy", mouth: "grin", blush: 2 };
const smile: Face = { eyes: "open", mouth: "smile", blush: 1 };
const grin: Face = { eyes: "open", mouth: "grin", blush: 1 };

const top = (paint: DiwaliPaint) => (paint.lights ? lights() : "");

export const DIWALI_SCENES: Record<string, Scene> = {
  "diya-girl": {
    name: "Diya glow",
    caption: "Happy Diwali",
    people: true,
    draw: ({ ids, paint, girl }) => top(paint) + glow(ids.s, [256, 330], 150) + kid(ids.a, girl({ face: happy, pose: "hold", held: diya(ids.s, [256, 352], 1.05) })),
  },
  "sparkler-boy": {
    name: "Sparkler",
    caption: "Phuljhadi time",
    people: true,
    draw: ({ ids, paint, boy }) => top(paint) + kid(ids.a, boy({ face: grin, pose: "raise", front: sparkler(ids.s, [358, 226], [430, 128], 1) })),
  },
  "sparkler-siblings": {
    name: "Sparkler siblings",
    caption: "Happy Diwali",
    people: true,
    cast: 2,
    draw: ({ ids, paint, girl, boy, second }) => {
      const A: Point = [174, 318];
      const B: Point = [338, 318];
      const s = 0.62;
      return (
        top(paint) +
        place(kid(ids.a, girl({ face: happy, pose: "raiseLeft", tilt: 4 })), A, s, -3) +
        place(kid(ids.b, second(boy({ face: grin, pose: "raise", tilt: -4 }))), B, s, 3) +
        sparkler(ids.s, local([154, 226], A, s, -3), [52, 150], 0.8) +
        sparkler(ids.s, local([358, 226], B, s, 3), [462, 150], 0.8)
      );
    },
  },
  "rangoli-girl": {
    name: "Rangoli",
    caption: "Colours of Diwali",
    people: true,
    draw: ({ ids, girl }) =>
      place(kid(ids.a, girl({ face: happy, pose: "hold", hair: "pigtails", held: `<path d="M226 344C226 366 286 366 286 344Z" fill="#FFFFFF" stroke="#C9BBA4" stroke-width="4"/><ellipse cx="256" cy="344" rx="30" ry="8" fill="#E8175D"/><ellipse cx="248" cy="341" rx="10" ry="3" fill="#FF7AA2"/>` })), [256, 258], 0.78) +
      rangoli([256, 440], 0.66, 0.4) +
      sparkle([90, 380], 12, "#FFB8CC") +
      sparkle([430, 360], 14),
  },
  "lantern-girl": {
    name: "Akash kandil",
    caption: "Light the way",
    people: true,
    draw: ({ ids, paint, girl }) =>
      top(paint) +
      kid(ids.a, girl({ face: smile, pose: "raise", hair: "braid", front: `<path d="M352 232L392 120" stroke="#8B6A3E" stroke-width="7" stroke-linecap="round"/>` + kandil(ids.s, [404, 150], 0.62, companion(paint.outfit)) })),
  },
  "laddoo-boy": {
    name: "Laddoo",
    caption: "Just one more",
    people: true,
    draw: ({ ids, boy }) =>
      kid(ids.a, boy({ face: { eyes: "happy", mouth: "tongue", blush: 2 }, pose: "both", hair: "curly", hands: { left: [222, 384], right: [356, 254], rightBend: -14 }, front: laddooPlate([222, 352], 0.8) + `<circle cx="368" cy="244" r="16" fill="#FFA62B" stroke="#C26A12" stroke-width="3"/><circle cx="363" cy="238" r="4" fill="#FFE0A3"/>` })) +
      sparkle([110, 120], 14) +
      sparkle([420, 110], 10, "#FFB8CC"),
  },
  "namaste-girl": {
    name: "Namaste",
    caption: "Shubh Deepavali",
    people: true,
    draw: ({ ids, paint, girl }) =>
      top(paint) +
      glow(ids.s, [256, 300], 170) +
      kid(ids.a, girl({
        face: { eyes: "closed", mouth: "smile", blush: 2 },
        pose: "namaste",
        hair: "bun",
        dress: "saree",
        held: [0, 1, 2, 3, 4, 5, 6].map((k) => marigoldBall([208 + k * 16, 300 + Math.sin((k / 6) * Math.PI) * 30], k % 2 ? "#FF9F1C" : "#FFC21A", 0.5)).join(""),
      })) +
      sparkle([96, 150], 12) +
      sparkle([420, 170], 10, "#FFB8CC"),
  },
  "sibling-hug": {
    name: "Sibling hug",
    caption: "Love & light",
    people: true,
    cast: 2,
    draw: ({ ids, paint, girl, boy, second }) => {
      const A: Point = [186, 312];
      const B: Point = [326, 312];
      const s = 0.62;
      return (
        top(paint) +
        place(kid(ids.a, girl({ face: happy, pose: "hugRight", tilt: 8 })), A, s, 4) +
        place(kid(ids.b, second(boy({ face: happy, pose: "hugLeft", tilt: -8 }))), B, s, -4) +
        sparkle([256, 112], 16) +
        sparkle([86, 150], 10, "#FFB8CC")
      );
    },
  },
  family: {
    name: "Family Diwali",
    caption: "Together this Diwali",
    people: true,
    cast: 3,
    draw: ({ ids, paint, girl, boy, second }) => {
      const dad = second(boy({ face: smile, pose: "hugRight" }));
      const mom = girl({ face: happy, pose: "hugLeft", hair: "bun", dress: "saree", bindi: true });
      return (
        top(paint) +
        glow(ids.s, [256, 380], 160) +
        place(kid(ids.b, dad), [150, 296], 0.66, -2) +
        place(kid(ids.a, mom), [362, 296], 0.66, 2) +
        place(kid(ids.c, boy({ face: grin, pose: "hold", hair: "curly", color: companion(companion(paint.outfit)), held: diya(ids.s, [256, 352], 1.1) })), [256, 372], 0.5)
      );
    },
  },
  "anar-boy": {
    name: "Anar fountain",
    caption: "So loud!",
    people: true,
    draw: ({ ids, boy }) =>
      anar(ids.s, [100, 478], 0.9) + place(kid(ids.a, boy({ face: { eyes: "squeeze", mouth: "grin", blush: 2 }, pose: "ears", tilt: 4 })), [300, 272], 0.92),
  },
  "twirl-girl": {
    name: "Twirl",
    caption: "Diwali vibes",
    people: true,
    draw: ({ ids, paint, girl }) =>
      `<g data-part="decor"><path d="M96 330C120 420 400 430 420 330C430 270 360 240 330 250" stroke="#FFD34D" stroke-width="6" stroke-linecap="round" fill="none" stroke-dasharray="1 14"/><path d="M110 300C150 230 230 210 290 230" stroke="#FFE9A8" stroke-width="4" stroke-linecap="round" fill="none" stroke-dasharray="1 12"/></g>` +
      place(kid(ids.a, girl({ face: happy, pose: "raise", tilt: -6, hair: "pigtails", front: sparkler(ids.s, [358, 226], [420, 150], 0.9) })), [256, 268], 0.94, 6) +
      (paint.lights ? sparkle([80, 120], 14) + sparkle([440, 420], 10, "#FFB8CC") : ""),
  },
  "aarti-girl": {
    name: "Aarti thali",
    caption: "Shubh Deepavali",
    people: true,
    draw: ({ ids, paint, girl }) => top(paint) + glow(ids.s, [256, 320], 150) + kid(ids.a, girl({ face: { eyes: "happy", mouth: "smile", blush: 2 }, pose: "hold", hair: "long", bindi: true, held: thali(ids.s, [256, 352], 0.82) })),
  },
  "lighting-boy": {
    name: "Lighting diyas",
    caption: "Let there be light",
    people: true,
    draw: ({ ids, boy }) =>
      diyaRow(ids.s, 470, [70, 150], 0.72) +
      place(kid(ids.a, boy({ face: { eyes: "open", mouth: "o", blush: 1 }, pose: "point", tilt: 6, hands: { right: [372, 360], rightBend: -20 }, front: taper([376, 364], [424, 474]) })), [270, 262], 0.9) +
      diya(ids.s, [430, 470], 0.72),
  },
  "rocket-kid": {
    name: "Rocket wow",
    caption: "Wow!",
    people: true,
    draw: ({ ids, girl }) =>
      `<g data-part="decor">${burst([400, 110], 0.9, "#FF5D8F", "#FFE27A")}${burst([120, 90], 0.6, "#3E8FDE")}</g>` +
      rocket([452, 262], 0.5, 18) +
      place(kid(ids.a, girl({ face: { eyes: "up", mouth: "o", brows: "raised", blush: 1 }, pose: "point", hair: "pigtails", tilt: -4 })), [236, 300], 0.86),
  },
  "diya-together": {
    name: "Lights together",
    caption: "Light & love",
    people: true,
    cast: 2,
    draw: ({ ids, paint, girl, boy, second }) => {
      const s = 0.7;
      return (
        top(paint) +
        glow(ids.s, [256, 380], 150) +
        place(kid(ids.a, girl({ face: happy, pose: "rest", tilt: 6, hands: { right: [279, 407], rightBend: -4 } })), [190, 300], s) +
        place(kid(ids.b, second(boy({ face: happy, pose: "rest", tilt: -6, hands: { left: [233, 407], leftBend: 4 } }))), [322, 300], s) +
        diya(ids.s, [256, 372], 1)
      );
    },
  },
  "gift-boy": {
    name: "Diwali gift",
    caption: "For you!",
    people: true,
    draw: ({ ids, paint, boy }) => top(paint) + kid(ids.a, boy({ face: { eyes: "happy", mouth: "grin", blush: 2 }, pose: "hold", held: giftBox([256, 356], 0.62, companion(paint.outfit)) })),
  },

  /* Decor --------------------------------------------------------------------- */
  rangoli: {
    name: "Rangoli",
    caption: "Shubh Deepavali",
    people: false,
    draw: ({ ids }) => rangoli([256, 256], 1.42) + diya(ids.s, [256, 70], 0.7) + diya(ids.s, [70, 268], 0.7) + diya(ids.s, [442, 268], 0.7) + diya(ids.s, [256, 470], 0.7),
  },
  "diya-trio": {
    name: "Diya trio",
    caption: "Happy Diwali",
    people: false,
    draw: ({ ids }) => glow(ids.s, [256, 300], 220) + diya(ids.s, [128, 340], 1.15) + diya(ids.s, [384, 340], 1.15) + diya(ids.s, [256, 300], 1.5) + sparkle([256, 110], 18) + sparkle([110, 190], 10) + sparkle([410, 180], 12, "#FFB8CC"),
  },
  kandil: {
    name: "Kandil",
    caption: "Light the way",
    people: false,
    draw: ({ ids, paint }) => kandil(ids.s, [256, 230], 1.7, paint.outfit) + sparkle([86, 120], 16) + sparkle([430, 380], 12, "#FFB8CC"),
  },
  toran: {
    name: "Toran",
    caption: "Welcome home",
    people: false,
    draw: ({ ids }) => toran() + diyaRow(ids.s, 420, [128, 256, 384], 0.9) + sparkle([256, 300], 14),
  },
  mithai: {
    name: "Mithai",
    caption: "Sweet Diwali",
    people: false,
    draw: () =>
      laddooPlate([256, 330], 2) +
      [
        [84, 436, -12],
        [138, 462, 8],
        [420, 450, 14],
      ]
        .map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><path d="M${x} ${y! - 26}L${x! + 34} ${y}L${x} ${y! + 26}L${x! - 34} ${y}Z" fill="#F1E3C6" stroke="#B89A5E" stroke-width="4" stroke-linejoin="round"/><path d="M${x} ${y! - 18}L${x! + 24} ${y}L${x} ${y! + 18}L${x! - 24} ${y}Z" fill="#DADDE2" opacity="0.8"/></g>`)
        .join("") +
      sparkle([420, 140], 16) +
      sparkle([110, 150], 10, "#FFB8CC"),
  },
  fireworks: {
    name: "Fireworks",
    caption: "Light up the sky",
    people: false,
    draw: () => burst([170, 180], 1.5, "#FF5D8F", "#FFE27A") + burst([360, 150], 1.1, "#3E8FDE", "#FFFFFF") + burst([330, 370], 1.25, "#FFB627", "#FFFFFF") + burst([130, 400], 0.8, "#2EBF7A", "#FFE27A"),
  },
};

export const DIWALI_IDS = Object.keys(DIWALI_SCENES);

/** Draws a Diwali sticker by scene id. */
export function drawDiwali(sceneId: string, paint: DiwaliPaint): string {
  const scene = DIWALI_SCENES[sceneId] ?? DIWALI_SCENES["diya-girl"]!;
  const ns = namespace(`dw${hash(sceneId + JSON.stringify(paint))}`);
  const ids = { a: ns("a"), b: ns("b"), c: ns("c"), s: ns("s") };
  const skinB = mix(paint.skin, darken(paint.skin, 0.3), 0.35);
  const girl = (extra: Partial<Kid>): Kid => ({ skin: paint.skin, hair: "long", dress: "lehenga", color: paint.outfit, accent: "#F2B84B", face: smile, pose: "rest", bindi: true, ...extra });
  const boy = (extra: Partial<Kid>): Kid => ({ skin: paint.skin, hair: "short", dress: "kurta", color: paint.outfit, face: smile, pose: "rest", ...extra });
  const second = (k: Kid): Kid => ({ ...k, skin: skinB, color: companion(paint.outfit) });
  const body = scene.draw({ ids, paint, girl, boy, second });
  const castColors = [paint.outfit, companion(paint.outfit), companion(companion(paint.outfit))];
  const defs =
    kidDefs(ids.a, { skin: paint.skin, color: paint.outfit }) +
    kidDefs(ids.b, { skin: scene.cast && scene.cast >= 2 ? skinB : paint.skin, color: castColors[1]! }) +
    (scene.cast === 3 ? kidDefs(ids.c, { skin: paint.skin, color: castColors[2]! }) : "") +
    sceneDefs(ids.s, { outfit: paint.outfit, heart: "#E4183F" });
  return svgDocument(defs, body);
}
