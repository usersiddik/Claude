/**
 * Characters built on one shared rig: every species is drawn in the same
 * 512 × 512 space with its face, shoulders, and prop anchors in known places,
 * so one set of reactions (faces, poses, props) works for all of them.
 */
import { darken, lighten, mix } from "./color.ts";
import { brows, cheeks, eyes, mouth, palette, tears, type Face, type FaceAnchors, type Look, type Palette } from "./face.ts";
import { blob, limb, type Id, type LimbStyle, type Point } from "./kit.ts";

export type Species = "cat" | "ghost" | "frog" | "rabbit" | "giraffe";
export type Stance = "sit" | "stand";
export type Pose = "rest" | "wave" | "hold" | "together" | "chin" | "cheeks" | "kiss" | "raise" | "raiseLeft" | "crossed" | "up" | "none";
export type Outfit = "kurta" | "saree" | undefined;

export interface Rig {
  face: Omit<FaceAnchors, "lid">;
  /** Head tilt pivot. */
  pivot: Point;
  shoulders: readonly [Point, Point];
  /** Arm width at the shoulder. */
  arm: number;
  end: LimbStyle["end"];
  hold: readonly [Point, Point];
  /** Centre of a held prop. */
  holdAt: Point;
  wave: Point;
  chin: Point;
  cheeks: readonly [Point, Point];
  kiss: Point;
  raise: Point;
  raiseLeft: Point;
  up: readonly [Point, Point];
  crossed: readonly [Point, Point];
  /** Arms hanging at the sides (standing). */
  down: readonly [Point, Point];
  /** Night cap: anchor and scale. */
  cap: { at: Point; scale: number; rotate?: number };
  /** Above-right of the head, for marks like "?" and "z z". */
  corner: Point;
  /** Left temple, for sweat drops. */
  temple: Point;
  /** Nose tip, for the sleepy bubble (none for ghosts). */
  nose?: Point;
  /** Front paws on the ground when sitting. */
  feet: readonly [number, number];
  feetY: number;
}

export interface CharacterOptions {
  species: Species;
  look: Look;
  face: Face;
  pose: Pose;
  stance?: Stance;
  outfit?: Outfit;
  outfitColor?: string;
  glass: boolean;
  blush: boolean;
  /** Stripes (cats), spots (giraffes, frogs). */
  pattern: boolean;
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
  /** Only the head (e.g. under a blanket). */
  headOnly?: boolean;
  /** Paint ids for the `gold` gradient of festive outfits. */
  gold?: string;
}

interface SpeciesArt {
  rig: Rig;
  /** Behind the body: tails. */
  back?: (id: Id, p: Palette, o: CharacterOptions) => string;
  body: (id: Id, p: Palette, o: CharacterOptions) => string;
  head: (id: Id, p: Palette, o: CharacterOptions, face: FaceAnchors) => string;
  feet?: (id: Id, p: Palette, x: number, y: number) => string;
}

const outlineOf = (p: Palette) => `stroke="${p.outline}" stroke-width="5" stroke-linejoin="round"`;
const shine = (cx: number, cy: number, rx: number, ry: number, rotate: number, opacity = 0.28) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#FFFFFF" opacity="${opacity}" transform="rotate(${rotate} ${cx} ${cy})"/>`;
const facePaint = (id: Id, p: Palette, o: CharacterOptions, a: FaceAnchors) =>
  cheeks(id, o.face, a, o.blush) + eyes(id, p, o.face, a) + brows(p, o.face, a);
const texture = (id: Id, o: CharacterOptions, d: string, opacity = 0.06) =>
  o.portable ? "" : `<path d="${d}" fill="#000000" filter="url(#${id("noise")})" opacity="${opacity}"/>`;

/* Cat ------------------------------------------------------------------------ */

const CAT_HEAD =
  "M256 102C328 102 386 122 406 174C414 194 418 214 420 232L438 246L420 254L432 270L412 274C398 314 338 336 256 338C174 336 114 314 100 274L80 270L92 254L74 246L92 232C94 214 98 194 106 174C126 122 184 102 256 102Z";
const CAT_EAR_L = "M108 198C98 148 102 94 120 56C126 44 138 42 148 50C176 74 200 102 220 128Z";
const CAT_EAR_R = "M404 198C414 148 410 94 392 56C386 44 374 42 364 50C336 74 312 102 292 128Z";
const CAT_EAR_IN_L = "M126 174C120 136 124 100 136 74C139 68 145 67 150 72C168 92 184 110 196 130Z";
const CAT_EAR_IN_R = "M386 174C392 136 388 100 376 74C373 68 367 67 362 72C344 92 328 110 316 130Z";
const CAT_BODY = "M180 318C152 360 146 430 158 472C166 498 198 506 256 506C314 506 346 498 354 472C366 430 360 360 332 318Z";
const CAT_TAIL = "M334 474C398 494 452 458 452 404C452 366 424 352 412 370C402 386 422 394 424 414C426 448 392 462 344 454Z";
const CAT_STAND_BODY = "M188 318C168 352 164 398 172 430C178 452 204 460 256 460C308 460 334 452 340 430C348 398 344 352 324 318Z";
const CAT_STAND_TAIL = "M330 420C376 420 410 392 420 352C428 322 452 306 466 318C478 330 466 344 456 346C446 350 440 362 436 376C424 424 386 448 336 446Z";

const catRig: Rig = {
  face: {
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
    scale: 1,
    style: "cat",
  },
  pivot: [256, 330],
  shoulders: [
    [208, 360],
    [304, 360],
  ],
  arm: 36,
  end: "paw",
  hold: [
    [214, 414],
    [298, 414],
  ],
  holdAt: [256, 414],
  wave: [394, 282],
  chin: [292, 318],
  cheeks: [
    [158, 290],
    [354, 290],
  ],
  kiss: [306, 306],
  raise: [380, 296],
  raiseLeft: [132, 296],
  up: [
    [92, 318],
    [420, 318],
  ],
  crossed: [
    [294, 404],
    [218, 404],
  ],
  down: [
    [184, 438],
    [328, 438],
  ],
  cap: { at: [262, 112], scale: 1 },
  corner: [414, 120],
  temple: [102, 180],
  nose: [256, 262],
  feet: [214, 298],
  feetY: 490,
};

function catHead(id: Id, p: Palette, o: CharacterOptions, face: FaceAnchors): string {
  const outline = outlineOf(p);
  const ears = o.glass
    ? `<path d="${CAT_EAR_L}" fill="url(#${id("glass")})" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/><path d="${CAT_EAR_R}" fill="url(#${id("glass")})" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>`
    : `<path d="${CAT_EAR_L}" fill="url(#${id("fur")})" ${outline}/><path d="${CAT_EAR_R}" fill="url(#${id("fur")})" ${outline}/>`;
  const earInner =
    `<path d="${CAT_EAR_IN_L}" fill="url(#${id("ear")})"/><path d="${CAT_EAR_IN_R}" fill="url(#${id("ear")})"/>` +
    `<path d="M142 156C144 132 150 114 158 102M154 166C160 146 168 132 178 122M370 156C368 132 362 114 354 102M358 166C352 146 344 132 334 122" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.75"/>` +
    (o.glass ? `<path d="M118 182C108 140 112 98 126 70M394 182C404 140 400 98 386 70" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.9"/>` : "");
  const stripes = o.pattern
    ? `<g ${o.portable ? 'opacity="0.5"' : `filter="url(#${id("soft")})" opacity="0.75"`}>` +
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
    texture(id, o, CAT_HEAD),
    stripes,
    `<ellipse cx="256" cy="226" rx="138" ry="96" fill="url(#${id("glow")})"/>`,
    shine(200, 142, 54, 16, -12),
    `<ellipse cx="256" cy="288" rx="66" ry="40" fill="url(#${id("muzzle")})"/>`,
    `<ellipse cx="236" cy="286" rx="26" ry="19" fill="${p.muzzle}" opacity="0.8"/><ellipse cx="276" cy="286" rx="26" ry="19" fill="${p.muzzle}" opacity="0.8"/>`,
    facePaint(id, p, o, face),
    `<path d="M243 260C243 252 269 252 269 260C269 268 261 274 256 275C251 274 243 268 243 260Z" fill="url(#${id("nose")})"/>`,
    `<ellipse cx="251" cy="258" rx="5" ry="2.4" fill="#FFFFFF" opacity="0.8"/>`,
    mouth(p, o.face, face),
    `<g fill="${p.line}" opacity="0.3"><circle cx="226" cy="284" r="2"/><circle cx="218" cy="292" r="2"/><circle cx="230" cy="296" r="2"/><circle cx="286" cy="284" r="2"/><circle cx="294" cy="292" r="2"/><circle cx="282" cy="296" r="2"/></g>`,
    tears(id, o.face, face),
    whiskers,
  ].join("");
}

function catBody(id: Id, p: Palette, o: CharacterOptions): string {
  const stand = o.stance === "stand";
  const outline = outlineOf(p);
  if (!stand) {
    const fluff = o.outfit
      ? outfitLayer(id, o.outfit, o.gold ?? "")
      : `<ellipse cx="256" cy="404" rx="58" ry="74" fill="url(#${id("muzzle")})"/><path d="M212 334L224 350L236 338L248 354L260 338L272 354L284 338L296 350L304 334" fill="${p.muzzle}" opacity="0.9"/>`;
    return `<path d="${CAT_BODY}" fill="url(#${id("fur")})" ${outline}/>` + fluff;
  }
  // Standing: shorter torso, two legs with round feet.
  const legs =
    `<path d="M200 436C198 462 198 480 202 494H240C244 480 244 462 242 436Z" fill="url(#${id("fur")})" ${outline}/>` +
    `<path d="M270 436C268 462 268 480 272 494H310C314 480 314 462 312 436Z" fill="url(#${id("fur")})" ${outline}/>` +
    `<ellipse cx="218" cy="494" rx="30" ry="15" fill="url(#${id("fur")})" ${outline}/><ellipse cx="294" cy="494" rx="30" ry="15" fill="url(#${id("fur")})" ${outline}/>` +
    `<path d="M210 488v9M222 488v9M286 488v9M298 488v9" stroke="${p.outline}" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round"/>`;
  const belly = o.outfit ? outfitLayer(id, o.outfit, o.gold ?? "", true) : `<ellipse cx="256" cy="396" rx="48" ry="52" fill="url(#${id("muzzle")})"/>`;
  return legs + `<path d="${CAT_STAND_BODY}" fill="url(#${id("fur")})" ${outline}/>` + belly;
}

function catBack(id: Id, p: Palette, o: CharacterOptions): string {
  if (o.stance === "stand") {
    return (
      `<path d="${CAT_STAND_TAIL}" fill="url(#${id("fur")})" ${outlineOf(p)}/>` +
      (o.pattern ? `<path d="M424 346c10 4 18 10 22 18M404 392c10 2 20 8 26 16" stroke="${p.stripe}" stroke-width="8" stroke-linecap="round" opacity="0.6" fill="none"/>` : "")
    );
  }
  return (
    `<path d="${CAT_TAIL}" fill="url(#${id("fur")})" ${outlineOf(p)}/>` +
    (o.pattern ? `<path d="M430 392c8 6 14 14 16 24M410 446c10 0 20-4 26-10" stroke="${p.stripe}" stroke-width="8" stroke-linecap="round" opacity="0.6" fill="none"/>` : "")
  );
}

function pawFoot(id: Id, p: Palette, x: number, y: number): string {
  return (
    `<ellipse cx="${x}" cy="${y}" rx="32" ry="19" fill="url(#${id("fur")})" ${outlineOf(p)}/>` +
    `<path d="M${x - 10} ${y - 7}v11M${x + 10} ${y - 7}v11" stroke="${p.outline}" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round"/>`
  );
}

/** Festive outfits for the cat body (sitting, or the shorter standing torso). */
function outfitLayer(id: Id, kind: NonNullable<Outfit>, gold: string, stand = false): string {
  const paint = gold || `url(#${id("gold")})`;
  const shape = stand ? CAT_STAND_BODY : CAT_BODY;
  const base = `<path d="${shape}" fill="url(#${id("outfit")})" stroke="rgba(0,0,0,0.25)" stroke-width="4"/>`;
  const hemY = stand ? 446 : 470;
  const hem = `<path d="M${stand ? 176 : 162} ${hemY}C200 ${hemY + 12} 312 ${hemY + 12} ${stand ? 336 : 350} ${hemY}" stroke="${paint}" stroke-width="12" fill="none"/><path d="M${stand ? 186 : 174} ${hemY + 6}h${stand ? 140 : 164}" stroke="#FFF1C1" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>`;
  if (kind === "kurta") {
    return (
      base +
      hem +
      `<path d="M212 330C230 346 282 346 300 330L300 348C282 364 230 364 212 348Z" fill="rgba(0,0,0,0.22)"/>` +
      `<path d="M212 330C230 346 282 346 300 330" stroke="${paint}" stroke-width="6" fill="none"/>` +
      `<path d="M256 350V${stand ? 430 : 446}" stroke="${paint}" stroke-width="5"/>` +
      `<circle cx="256" cy="372" r="6" fill="${paint}"/><circle cx="256" cy="398" r="6" fill="${paint}"/>${stand ? "" : `<circle cx="256" cy="424" r="6" fill="${paint}"/>`}`
    );
  }
  return (
    base +
    hem +
    `<path d="M178 336C214 330 246 354 272 396C292 428 320 458 352 478L338 500C304 478 272 446 250 414C226 378 204 360 168 362Z" fill="rgba(0,0,0,0.18)"/>` +
    `<path d="M178 336C214 330 246 354 272 396C292 428 320 458 352 478" stroke="${paint}" stroke-width="7" fill="none"/>` +
    `<path d="M168 362C204 360 226 378 250 414C272 446 304 478 338 500" stroke="${paint}" stroke-width="7" fill="none"/>` +
    `<path d="M196 352l6 6m22 6l6 6m14 14l6 6m12 16l6 6m10 14l6 6" stroke="#FFE7A3" stroke-width="4" stroke-linecap="round"/>`
  );
}

/* Ghost ---------------------------------------------------------------------- */

const GHOST_BODY =
  "M118 470V232C118 148 180 84 256 84C332 84 394 148 394 232V470Q381 496 366 470Q353 496 339 470Q326 496 311 470Q297 496 283 470Q270 496 256 470Q242 496 229 470Q215 496 201 470Q187 496 174 470Q160 496 146 470Q132 496 118 470Z";

const ghostRig: Rig = {
  face: {
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
    scale: 0.9,
    style: "cat",
  },
  pivot: [256, 300],
  shoulders: [
    [134, 318],
    [378, 318],
  ],
  arm: 52,
  end: "nub",
  hold: [
    [218, 386],
    [294, 386],
  ],
  holdAt: [256, 380],
  wave: [418, 222],
  chin: [292, 300],
  cheeks: [
    [170, 276],
    [342, 276],
  ],
  kiss: [302, 288],
  raise: [404, 270],
  raiseLeft: [108, 270],
  up: [
    [104, 182],
    [408, 182],
  ],
  crossed: [
    [302, 392],
    [210, 392],
  ],
  down: [
    [150, 400],
    [362, 400],
  ],
  cap: { at: [252, 96], scale: 0.82 },
  corner: [404, 112],
  temple: [122, 196],
  feet: [0, 0],
  feetY: 0,
};

function ghostHead(id: Id, p: Palette, o: CharacterOptions, face: FaceAnchors): string {
  const fill = o.glass ? `url(#${id("ghostGlass")})` : `url(#${id("fur")})`;
  return [
    o.glass
      ? `<linearGradient id="${id("ghostGlass")}" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="${lighten(p.fur, 0.8)}" stop-opacity="0.92"/><stop offset="0.6" stop-color="${p.fur}" stop-opacity="0.6"/><stop offset="1" stop-color="${p.furShade}" stop-opacity="0.78"/></linearGradient>`
      : "",
    `<path d="${GHOST_BODY}" fill="${fill}" stroke="${o.glass ? "#FFFFFF" : p.outline}" stroke-opacity="${o.glass ? 0.9 : 0.6}" stroke-width="5" stroke-linejoin="round"/>`,
    o.glass ? "" : texture(id, o, GHOST_BODY, 0.04),
    `<ellipse cx="256" cy="232" rx="118" ry="96" fill="url(#${id("glow")})"/>`,
    shine(196, 150, 56, 22, -24, o.glass ? 0.8 : 0.5),
    o.glass ? `<path d="M140 250C140 196 160 156 196 132" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.85"/>` : "",
    facePaint(id, p, o, face),
    mouth(p, o.face, face),
    tears(id, o.face, face),
  ].join("");
}

/** The little arm nubs ghosts rest at their sides. */
function ghostNub(id: Id, p: Palette, o: CharacterOptions, side: -1 | 1): string {
  return `<path d="M${256 + side * 136} 300C${256 + side * 176} 304 ${256 + side * 194} 330 ${256 + side * 184} 350C${256 + side * 174} 366 ${256 + side * 150} 356 ${256 + side * 136} 336Z" fill="url(#${id("fur")})" stroke="${o.glass ? "#FFFFFF" : p.outline}" stroke-opacity="0.6" stroke-width="5"/>`;
}

/* Frog ----------------------------------------------------------------------- */

const FROG_HEAD_SHAPES = `<ellipse cx="256" cy="254" rx="170" ry="102"/><circle cx="182" cy="160" r="64"/><circle cx="330" cy="160" r="64"/>`;

const frogRig: Rig = {
  face: {
    eyes: [
      [182, 162],
      [330, 162],
    ],
    r: 40,
    mouth: [256, 262],
    cheeks: [
      [146, 266],
      [366, 266],
    ],
    scale: 1.05,
    style: "wide",
  },
  pivot: [256, 350],
  shoulders: [
    [206, 382],
    [306, 382],
  ],
  arm: 34,
  end: "paw",
  hold: [
    [214, 428],
    [298, 428],
  ],
  holdAt: [256, 428],
  wave: [398, 306],
  chin: [296, 336],
  cheeks: [
    [150, 300],
    [362, 300],
  ],
  kiss: [306, 318],
  raise: [392, 314],
  raiseLeft: [120, 314],
  up: [
    [96, 362],
    [416, 362],
  ],
  crossed: [
    [292, 432],
    [220, 432],
  ],
  down: [
    [188, 450],
    [324, 450],
  ],
  cap: { at: [330, 92], scale: 0.62, rotate: 14 },
  corner: [436, 96],
  temple: [86, 214],
  nose: [272, 236],
  feet: [214, 298],
  feetY: 492,
};

function frogHead(id: Id, p: Palette, o: CharacterOptions, face: FaceAnchors): string {
  const spots = o.pattern
    ? `<g fill="${p.stripe}" opacity="0.55"><ellipse cx="146" cy="214" rx="14" ry="10"/><ellipse cx="122" cy="246" rx="9" ry="7"/><ellipse cx="370" cy="214" rx="14" ry="10"/><ellipse cx="392" cy="246" rx="9" ry="7"/><ellipse cx="256" cy="186" rx="12" ry="8"/></g>`
    : "";
  return [
    o.glass
      ? `<g fill="url(#${id("glass")})" stroke="#FFFFFF" stroke-width="5"><circle cx="182" cy="160" r="66"/><circle cx="330" cy="160" r="66"/></g>` + blob(`<ellipse cx="256" cy="254" rx="170" ry="102"/>`, `url(#${id("fur")})`, p.outline, 2.5)
      : blob(FROG_HEAD_SHAPES, `url(#${id("fur")})`, p.outline, 2.5),
    o.glass ? `<g fill="url(#${id("fur")})" opacity="0.55"><circle cx="182" cy="160" r="48"/><circle cx="330" cy="160" r="48"/></g>` : "",
    spots,
    `<ellipse cx="256" cy="246" rx="140" ry="74" fill="url(#${id("glow")})"/>`,
    shine(160, 120, 30, 12, -30, 0.45),
    shine(308, 116, 30, 12, -20, 0.45),
    `<ellipse cx="256" cy="300" rx="96" ry="40" fill="url(#${id("muzzle")})" opacity="0.7"/>`,
    facePaint(id, p, o, face),
    `<ellipse cx="240" cy="234" rx="5" ry="3.4" fill="${p.line}" opacity="0.55"/><ellipse cx="272" cy="234" rx="5" ry="3.4" fill="${p.line}" opacity="0.55"/>`,
    mouth(p, o.face, face),
    tears(id, o.face, face),
  ].join("");
}

function frogBody(id: Id, p: Palette): string {
  const legs = `<ellipse cx="160" cy="458" rx="64" ry="46"/><ellipse cx="352" cy="458" rx="64" ry="46"/>`;
  const feet = (x: number, flip: 1 | -1) =>
    `<path d="M${x} 482C${x - flip * 30} 484 ${x - flip * 46} 494 ${x - flip * 50} 504C${x - flip * 30} 508 ${x - flip * 6} 506 ${x + flip * 14} 500C${x + flip * 10} 490 ${x + flip * 6} 484 ${x} 482Z"/>`;
  return (
    blob(legs + feet(150, 1) + feet(362, -1) + `<ellipse cx="256" cy="430" rx="116" ry="80"/>`, `url(#${id("fur")})`, p.outline, 2.5) +
    `<path d="M128 448C140 430 160 424 178 428M384 448C372 430 352 424 334 428" stroke="${p.outline}" stroke-opacity="0.4" stroke-width="4" stroke-linecap="round" fill="none"/>` +
    `<ellipse cx="256" cy="440" rx="74" ry="56" fill="${p.muzzle}" opacity="0.92"/>` +
    `<path d="M212 432h88M206 452h100M214 472h84" stroke="${darken(p.muzzle, 0.08)}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`
  );
}

function frogFoot(id: Id, p: Palette, x: number, y: number): string {
  return (
    `<g fill="url(#${id("fur")})" ${outlineOf(p)}><circle cx="${x - 14}" cy="${y + 2}" r="10"/><circle cx="${x + 14}" cy="${y + 2}" r="10"/><circle cx="${x}" cy="${y + 6}" r="10"/><ellipse cx="${x}" cy="${y - 8}" rx="20" ry="14"/></g>` +
    `<ellipse cx="${x}" cy="${y - 4}" rx="18" ry="11" fill="url(#${id("fur")})"/>`
  );
}

/* Rabbit --------------------------------------------------------------------- */

const RABBIT_HEAD = "M256 112C344 112 408 160 408 236C408 304 348 348 256 348C164 348 104 304 104 236C104 160 168 112 256 112Z";
const RABBIT_BODY = "M186 326C158 366 152 432 164 474C172 500 204 506 256 506C308 506 340 500 348 474C360 432 354 366 326 326Z";

const rabbitRig: Rig = {
  face: {
    eyes: [
      [200, 232],
      [312, 232],
    ],
    r: 37,
    mouth: [256, 282],
    cheeks: [
      [156, 282],
      [356, 282],
    ],
    scale: 0.95,
    style: "cat",
  },
  pivot: [256, 340],
  shoulders: [
    [210, 368],
    [302, 368],
  ],
  arm: 34,
  end: "paw",
  hold: [
    [216, 420],
    [296, 420],
  ],
  holdAt: [256, 418],
  wave: [392, 296],
  chin: [292, 330],
  cheeks: [
    [160, 300],
    [352, 300],
  ],
  kiss: [306, 312],
  raise: [384, 304],
  raiseLeft: [128, 304],
  up: [
    [96, 330],
    [416, 330],
  ],
  crossed: [
    [294, 410],
    [218, 410],
  ],
  down: [
    [186, 444],
    [326, 444],
  ],
  cap: { at: [262, 118], scale: 0.86 },
  corner: [432, 150],
  temple: [104, 206],
  nose: [256, 268],
  feet: [214, 298],
  feetY: 490,
};

const RABBIT_STAND_BODY = "M190 326C170 358 166 402 174 432C180 454 206 462 256 462C306 462 332 454 338 432C346 402 342 358 322 326Z";

/** Two tall upright ears with peach insides. They lean out when she is sad and tip in when she is shy. */
function rabbitEar(id: Id, p: Palette, o: CharacterOptions, side: -1 | 1): string {
  const x = 256 + side * 62;
  const sad = o.face.brows === "sad" || o.face.eyes === "squeeze" || o.face.eyes === "teary";
  const angry = o.face.brows === "angry";
  const rotate = side * (sad ? 108 : angry ? 32 : 12);
  const outer = `M${x - 36} 172C${x - 52} 118 ${x - 50} 52 ${x - 22} 20C${x - 10} 6 ${x + 12} 6 ${x + 24} 20C${x + 50} 52 ${x + 52} 118 ${x + 36} 172Z`;
  const inner = `M${x - 19} 160C${x - 30} 118 ${x - 28} 68 ${x - 10} 42C${x - 4} 34 ${x + 6} 34 ${x + 12} 42C${x + 28} 68 ${x + 30} 118 ${x + 19} 160Z`;
  const fill = o.glass ? `url(#${id("glass")})` : `url(#${id("fur")})`;
  return (
    `<g transform="rotate(${rotate} ${x} 172)">` +
    `<path d="${outer}" fill="${fill}" stroke="${o.glass ? "#FFFFFF" : p.outline}" stroke-width="5" stroke-linejoin="round"/>` +
    `<path d="${inner}" fill="url(#${id("ear")})"/>` +
    `</g>`
  );
}

function rabbitHead(id: Id, p: Palette, o: CharacterOptions, face: FaceAnchors): string {
  const whiskers = o.whiskers
    ? `<g data-part="whiskers" stroke-linecap="round" fill="none"><path d="M214 290C190 286 166 286 140 290M214 300C192 302 170 308 148 318M298 290C322 286 346 286 372 290M298 300C320 302 342 308 364 318" stroke="#000000" stroke-opacity="0.12" stroke-width="3.6"/><path d="M214 290C190 286 166 286 140 290M214 300C192 302 170 308 148 318M298 290C322 286 346 286 372 290M298 300C320 302 342 308 364 318" stroke="#FFFFFF" stroke-width="2.2"/></g>`
    : "";
  const fur = o.pattern ? `<path d="M232 118c8 10 10 22 6 34M256 114c4 12 4 24-2 36M280 118c-6 10-8 22-4 34" stroke="${p.stripe}" stroke-width="7" stroke-linecap="round" opacity="0.4" fill="none"/>` : "";
  return [
    rabbitEar(id, p, o, -1),
    rabbitEar(id, p, o, 1),
    `<path d="${RABBIT_HEAD}" fill="url(#${id("fur")})" ${outlineOf(p)}/>`,
    texture(id, o, RABBIT_HEAD, 0.05),
    fur,
    `<ellipse cx="256" cy="236" rx="128" ry="90" fill="url(#${id("glow")})"/>`,
    shine(200, 150, 48, 14, -14),
    `<ellipse cx="256" cy="294" rx="58" ry="36" fill="url(#${id("muzzle")})"/>`,
    // Lumi's big rosy cheeks, under the usual blush marks.
    o.blush && o.face.blush !== 0
      ? `<g data-part="rosy" fill="#F7A1AE"><ellipse cx="150" cy="284" rx="40" ry="26" opacity="0.2"/><ellipse cx="150" cy="284" rx="28" ry="17" opacity="0.26"/><ellipse cx="362" cy="284" rx="40" ry="26" opacity="0.2"/><ellipse cx="362" cy="284" rx="28" ry="17" opacity="0.26"/></g>`
      : "",
    facePaint(id, p, o, face),
    `<path d="M246 266C246 260 266 260 266 266C266 272 260 276 256 277C252 276 246 272 246 266Z" fill="url(#${id("nose")})"/>`,
    mouth(p, o.face, face),
    o.face.mouth === "grin" || o.face.mouth === "open" ? "" : `<path d="M249 296h14v9a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3Z" fill="#FFFFFF" stroke="${p.line}" stroke-width="2.4" stroke-linejoin="round"/><path d="M256 296v12" stroke="${p.line}" stroke-width="1.6" opacity="0.6"/>`,
    tears(id, o.face, face),
    whiskers,
  ].join("");
}

function rabbitBody(id: Id, p: Palette, o: CharacterOptions): string {
  const outline = outlineOf(p);
  if (o.stance !== "stand") {
    return `<path d="${RABBIT_BODY}" fill="url(#${id("fur")})" ${outline}/>` + `<ellipse cx="256" cy="414" rx="58" ry="70" fill="url(#${id("muzzle")})"/>`;
  }
  // Standing: shorter torso, two short legs with long bunny feet.
  const legs =
    `<path d="M202 438C200 462 200 480 204 494H240C244 480 244 462 242 438Z" fill="url(#${id("fur")})" ${outline}/>` +
    `<path d="M270 438C268 462 268 480 272 494H308C312 480 312 462 310 438Z" fill="url(#${id("fur")})" ${outline}/>` +
    `<ellipse cx="214" cy="494" rx="36" ry="15" fill="url(#${id("fur")})" ${outline}/><ellipse cx="298" cy="494" rx="36" ry="15" fill="url(#${id("fur")})" ${outline}/>` +
    `<path d="M200 488v9M214 488v9M298 488v9M312 488v9" stroke="${p.outline}" stroke-opacity="0.45" stroke-width="3" stroke-linecap="round"/>`;
  return legs + `<path d="${RABBIT_STAND_BODY}" fill="url(#${id("fur")})" ${outline}/>` + `<ellipse cx="256" cy="400" rx="48" ry="50" fill="url(#${id("muzzle")})"/>`;
}

function rabbitBack(id: Id, p: Palette, o: CharacterOptions): string {
  const [x, y, r] = o.stance === "stand" ? [346, 432, 24] : [364, 470, 30];
  return `<g fill="${p.muzzle}" ${outlineOf(p)}><circle cx="${x}" cy="${y}" r="${r}"/></g><path d="M${x - 12} ${y - 12}c6-6 16-8 24-4" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`;
}

/* Giraffe -------------------------------------------------------------------- */

const GIRAFFE_HEAD_SHAPES = `<ellipse cx="256" cy="204" rx="132" ry="98"/><ellipse cx="256" cy="292" rx="104" ry="58"/>`;
const GIRAFFE_BODY = "M192 336C166 374 158 436 168 474C176 500 206 506 256 506C306 506 336 500 344 474C354 436 346 374 320 336Z";

const giraffeRig: Rig = {
  face: {
    eyes: [
      [204, 206],
      [308, 206],
    ],
    r: 32,
    mouth: [256, 314],
    cheeks: [
      [160, 256],
      [352, 256],
    ],
    scale: 1.05,
    style: "simple",
    lashes: true,
  },
  pivot: [256, 344],
  shoulders: [
    [212, 376],
    [300, 376],
  ],
  arm: 32,
  end: "paw",
  hold: [
    [218, 424],
    [294, 424],
  ],
  holdAt: [256, 422],
  wave: [386, 314],
  chin: [300, 352],
  cheeks: [
    [158, 286],
    [354, 286],
  ],
  kiss: [312, 330],
  raise: [384, 316],
  raiseLeft: [128, 316],
  up: [
    [100, 350],
    [412, 350],
  ],
  crossed: [
    [292, 420],
    [220, 420],
  ],
  down: [
    [186, 448],
    [326, 448],
  ],
  cap: { at: [262, 108], scale: 0.84 },
  corner: [432, 96],
  temple: [112, 168],
  nose: [282, 284],
  feet: [216, 296],
  feetY: 490,
};

function giraffeSpots(p: Palette, spots: readonly (readonly [number, number, number, number])[]): string {
  return `<g fill="${p.stripe}">${spots
    .map(([x, y, r, rot]) => `<path d="M${x - r} ${y}C${x - r} ${y - r * 0.9} ${x + r * 0.7} ${y - r * 1.05} ${x + r} ${y - r * 0.2}C${x + r * 1.2} ${y + r * 0.6} ${x + r * 0.2} ${y + r} ${x - r * 0.5} ${y + r * 0.85}C${x - r * 0.9} ${y + r * 0.7} ${x - r} ${y + r * 0.4} ${x - r} ${y}Z" transform="rotate(${rot} ${x} ${y})"/>`)
    .join("")}</g>`;
}

function giraffeHead(id: Id, p: Palette, o: CharacterOptions, face: FaceAnchors): string {
  const horn = (x: number, side: -1 | 1) =>
    `<path d="M${x - 9} 124L${x - 6 + side * 4} 56H${x + 8 + side * 4}L${x + 11} 124Z" fill="url(#${id("fur")})" ${outlineOf(p)}/>` +
    `<circle cx="${x + 1 + side * 4}" cy="50" r="19" fill="${p.stripe}" stroke="${p.outline}" stroke-width="5"/>` +
    `<circle cx="${x - 4 + side * 4}" cy="44" r="6" fill="#FFFFFF" opacity="0.35"/>`;
  const ear = (side: -1 | 1) => {
    const x = 256 + side * 128;
    return (
      `<path d="M${x} 150C${x + side * 40} 128 ${x + side * 84} 136 ${x + side * 98} 156C${x + side * 84} 178 ${x + side * 40} 186 ${x} 176Z" fill="url(#${id("fur")})" ${outlineOf(p)}/>` +
      `<path d="M${x + side * 14} 158C${x + side * 40} 148 ${x + side * 68} 150 ${x + side * 80} 158C${x + side * 66} 168 ${x + side * 40} 170 ${x + side * 14} 166Z" fill="url(#${id("ear")})"/>`
    );
  };
  const spots = o.pattern
    ? giraffeSpots(p, [
        [166, 142, 20, 10],
        [210, 118, 13, -20],
        [344, 140, 18, 30],
        [302, 116, 12, 0],
        [140, 214, 14, 40],
        [376, 210, 15, -10],
        [256, 140, 11, 15],
      ])
    : "";
  return [
    horn(214, -1),
    horn(298, 1),
    ear(-1),
    ear(1),
    blob(GIRAFFE_HEAD_SHAPES, `url(#${id("fur")})`, p.outline, 2.5),
    o.glass ? `<g fill="url(#${id("glass")})"><ellipse cx="256" cy="204" rx="132" ry="98"/></g>` : "",
    spots,
    `<ellipse cx="256" cy="200" rx="116" ry="74" fill="url(#${id("glow")})"/>`,
    shine(196, 134, 46, 14, -18),
    `<ellipse cx="256" cy="298" rx="96" ry="50" fill="${p.muzzle}"/>`,
    `<ellipse cx="256" cy="286" rx="70" ry="22" fill="#FFFFFF" opacity="0.3"/>`,
    `<ellipse cx="232" cy="282" rx="7" ry="5" fill="${p.line}" opacity="0.6"/><ellipse cx="280" cy="282" rx="7" ry="5" fill="${p.line}" opacity="0.6"/>`,
    facePaint(id, p, o, face),
    mouth(p, o.face, face),
    tears(id, o.face, face),
  ].join("");
}

function giraffeBody(id: Id, p: Palette, o: CharacterOptions): string {
  return (
    `<path d="M222 320V362H290V320Z" fill="url(#${id("fur")})" ${outlineOf(p)}/>` +
    `<path d="${GIRAFFE_BODY}" fill="url(#${id("fur")})" ${outlineOf(p)}/>` +
    (o.pattern
      ? giraffeSpots(p, [
          [196, 410, 18, 20],
          [318, 404, 16, -30],
          [214, 466, 14, 0],
          [306, 462, 15, 40],
        ])
      : "") +
    `<ellipse cx="256" cy="430" rx="50" ry="62" fill="${p.muzzle}" opacity="0.85"/>`
  );
}

function giraffeBack(id: Id, p: Palette): string {
  return (
    `<path d="M336 462C372 470 396 452 404 424" stroke="${p.outline}" stroke-width="13" stroke-linecap="round" fill="none"/>` +
    `<path d="M336 462C372 470 396 452 404 424" stroke="${p.fur}" stroke-width="7" stroke-linecap="round" fill="none"/>` +
    `<path d="M404 424C396 408 400 392 410 386C420 394 422 412 414 428Z" fill="${p.stripe}" ${outlineOf(p)}/>`
  );
}

function hoof(id: Id, p: Palette, x: number, y: number): string {
  return (
    `<ellipse cx="${x}" cy="${y}" rx="30" ry="18" fill="url(#${id("fur")})" ${outlineOf(p)}/>` +
    `<path d="M${x - 27} ${y + 4}C${x - 20} ${y + 18} ${x + 20} ${y + 18} ${x + 27} ${y + 4}C${x + 14} ${y + 10} ${x - 14} ${y + 10} ${x - 27} ${y + 4}Z" fill="${darken(p.stripe, 0.2)}"/>`
  );
}

/* Registry ------------------------------------------------------------------- */

export const SPECIES: Record<Species, SpeciesArt> = {
  cat: { rig: catRig, back: catBack, body: catBody, head: catHead, feet: pawFoot },
  ghost: { rig: ghostRig, body: () => "", head: ghostHead },
  frog: { rig: frogRig, body: frogBody, head: frogHead, feet: frogFoot },
  rabbit: { rig: rabbitRig, back: rabbitBack, body: rabbitBody, head: rabbitHead, feet: pawFoot },
  giraffe: { rig: giraffeRig, back: giraffeBack, body: giraffeBody, head: giraffeHead, feet: hoof },
};

export const rigOf = (species: Species): Rig => SPECIES[species].rig;

/** Colours derived for a species (giraffe spots are browner than cat stripes). */
export function paletteFor(species: Species, look: Look): Palette {
  const p = palette(look);
  if (species === "giraffe") return { ...p, stripe: mix(darken(look.fur, 0.38), "#6B3A1E", 0.45), muzzle: lighten(look.fur, 0.62) };
  if (species === "frog") return { ...p, stripe: darken(look.fur, 0.3), muzzle: mix(lighten(look.fur, 0.7), "#FFF6D8", 0.5) };
  if (species === "rabbit") return { ...p, earInner: "#F9B49C", nose: "#F58E8E" };
  return p;
}

function poseArms(rig: Rig, o: CharacterOptions, style: LimbStyle): { arms: string; restPaws: boolean } {
  const [ls, rs] = rig.shoulders;
  const nub = rig.end === "nub";
  const arm = (from: Point, to: Point, bend: number, pads = false) => limb(style, from, to, bend, { pads: pads && !nub });
  switch (o.pose) {
    case "wave":
      return { arms: arm(rs, rig.wave, -26, true), restPaws: true };
    case "hold":
      return { arms: arm(ls, rig.hold[0], 18) + arm(rs, rig.hold[1], -18), restPaws: false };
    case "together":
      return { arms: arm(ls, [rig.holdAt[0] - 14, rig.holdAt[1] - 30], 22) + arm(rs, [rig.holdAt[0] + 14, rig.holdAt[1] - 30], -22), restPaws: false };
    case "chin":
      return { arms: arm(rs, rig.chin, -24), restPaws: true };
    case "cheeks":
      return { arms: arm(ls, rig.cheeks[0], 26) + arm(rs, rig.cheeks[1], -26), restPaws: false };
    case "kiss":
      return { arms: arm(rs, rig.kiss, -22, true), restPaws: true };
    case "raise":
      return { arms: arm(rs, rig.raise, -18), restPaws: true };
    case "raiseLeft":
      return { arms: arm(ls, rig.raiseLeft, 18), restPaws: true };
    case "crossed":
      return { arms: arm(ls, rig.crossed[0], 26) + arm(rs, rig.crossed[1], -26), restPaws: false };
    case "up":
      return { arms: arm(ls, rig.up[0], 12, true) + arm(rs, rig.up[1], -12, true), restPaws: false };
    case "none":
      return { arms: "", restPaws: false };
    default:
      return { arms: "", restPaws: true };
  }
}

/** Arms that hang at the sides when a character stands with nothing to do. */
function hangingArms(rig: Rig, o: CharacterOptions, style: LimbStyle): string {
  const [ls, rs] = rig.shoulders;
  const [ld, rd] = rig.down;
  const left = o.pose === "rest" || o.pose === "wave" || o.pose === "chin" || o.pose === "kiss" || o.pose === "raise";
  const right = o.pose === "rest" || o.pose === "raiseLeft";
  return (left ? limb(style, ls, ld, 10) : "") + (right ? limb(style, rs, rd, -10) : "");
}

/** One character in its own 512 × 512 space. */
export function character(id: Id, o: CharacterOptions): string {
  const art = SPECIES[o.species];
  const rig = art.rig;
  const p = paletteFor(o.species, o.look);
  const face: FaceAnchors = { ...rig.face, lid: o.look.fur };
  const sleeve = Boolean(o.outfit) && o.species === "cat";
  const outfit = o.outfitColor ?? "#D61F6E";
  const style: LimbStyle = {
    fill: sleeve ? lighten(outfit, 0.05) : o.species === "ghost" ? (o.glass ? lighten(p.fur, 0.5) : p.fur) : `url(#${id("fur")})`,
    outline: sleeve ? darken(outfit, 0.35) : o.species === "ghost" && o.glass ? "#FFFFFF" : p.outline,
    outlineOpacity: o.species === "ghost" ? 0.6 : 1,
    paw: `url(#${id("fur")})`,
    width: rig.arm,
    taper: rig.end === "nub" ? 0.62 : 0.74,
    cuff: sleeve ? o.gold || `url(#${id("gold")})` : undefined,
    end: rig.end,
  };
  const { arms, restPaws } = poseArms(rig, o, style);
  const tilt = o.headTilt ?? 0;
  const head = art.head(id, p, o, face);
  const headGroup = `<g transform="rotate(${tilt} ${rig.pivot[0]} ${rig.pivot[1]})">${head}${o.headwear ?? ""}</g>`;

  if (o.species === "ghost") {
    const nubs =
      (o.pose === "rest" || o.pose === "chin" || o.pose === "kiss" || o.pose === "wave" || o.pose === "raise" ? ghostNub(id, p, o, -1) : "") +
      (o.pose === "rest" || o.pose === "raiseLeft" ? ghostNub(id, p, o, 1) : "");
    // Arms reaching outward grow from behind the body; arms across it sit in front.
    const behind = o.pose === "wave" || o.pose === "up" || o.pose === "raise" || o.pose === "raiseLeft";
    return nubs + (behind ? arms : "") + headGroup + (o.held ?? "") + (behind ? "" : arms) + (o.front ?? "");
  }

  if (o.headOnly) return headGroup + (o.held ?? "") + (o.front ?? "");

  const stand = o.stance === "stand";
  const feet = !stand && restPaws && art.feet ? art.feet(id, p, rig.feet[0], rig.feetY) + art.feet(id, p, rig.feet[1], rig.feetY) : "";
  return [
    o.noTail || !art.back ? "" : art.back(id, p, o),
    art.body(id, p, o),
    feet,
    stand ? hangingArms(rig, o, style) : "",
    headGroup,
    o.held ?? "",
    arms,
    o.front ?? "",
  ].join("");
}

export { paletteFor as speciesPalette };
