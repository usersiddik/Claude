/**
 * Creature stickers: one reaction (a face, a pose, and props) drawn for any
 * species on the shared rig, plus cat couples.
 */
import { darken, hash, lighten } from "./color.ts";
import { characterDefs, type Face, type Look } from "./face.ts";
import { classicHeart, limb, local, namespace, place, sceneDefs, sparkle, svgDocument, type Id, type Point, type ScenePaint } from "./kit.ts";
import { angerMark, diya, icePack, lights, marigold, mug, nightcap, questionMark, sparkler, sunglasses, sweat, thermometer, waveLines, zz } from "./props.ts";
import { character, paletteFor, rigOf, type CharacterOptions, type Pose, type Species, type Stance } from "./species.ts";

export type { Species, Stance } from "./species.ts";
export type { Look } from "./face.ts";

export type ReactionId =
  | "hi"
  | "morning"
  | "night"
  | "thanks"
  | "huh"
  | "smile"
  | "yay"
  | "naughty"
  | "lol"
  | "tear"
  | "crying"
  | "shy"
  | "shocked"
  | "grumpy"
  | "cool"
  | "fever"
  | "boo"
  | "love"
  | "kiss"
  | "missyou"
  | "smitten"
  | "hug"
  | "shoulder"
  | "cheek"
  | "diya"
  | "sparkler"
  | "diwali-sparklers"
  | "diwali-diya"
  | "diwali-hug";

export type ReactionGroup = "everyday" | "feelings" | "love" | "together" | "festive";

export interface Reaction {
  id: ReactionId;
  name: string;
  caption: string;
  group: ReactionGroup;
  /** Two characters (cats). */
  pair?: boolean;
  /** Uses the festive outfit colour. */
  outfit?: boolean;
  species: readonly Species[];
  /** Has a standing version (cats). */
  stands?: boolean;
}

const ALL: readonly Species[] = ["cat", "ghost", "frog", "rabbit", "giraffe"];
const BODIED: readonly Species[] = ["cat", "frog", "rabbit", "giraffe"];
const CAT: readonly Species[] = ["cat"];

export const REACTIONS: readonly Reaction[] = [
  { id: "hi", name: "Hi", caption: "Hiii!", group: "everyday", species: ALL, stands: true },
  { id: "morning", name: "Morning", caption: "Coffee first", group: "everyday", species: ALL, stands: true },
  { id: "night", name: "Good night", caption: "Night night", group: "everyday", species: ALL },
  { id: "thanks", name: "Thank you", caption: "Thank you!", group: "everyday", species: ALL, stands: true },
  { id: "huh", name: "Huh?", caption: "Huh?", group: "everyday", species: ALL, stands: true },
  { id: "smile", name: "Smile", caption: "Hehe", group: "feelings", species: ALL, stands: true },
  { id: "yay", name: "Yay", caption: "Yay!", group: "feelings", species: BODIED, stands: true },
  { id: "naughty", name: "Naughty", caption: "Oops, not sorry", group: "feelings", species: ALL, stands: true },
  { id: "lol", name: "LOL", caption: "I can't!", group: "feelings", species: ALL, stands: true },
  { id: "tear", name: "Single tear", caption: "It's fine…", group: "feelings", species: ALL },
  { id: "crying", name: "Crying", caption: "Waaah", group: "feelings", species: ALL },
  { id: "shy", name: "Shy", caption: "Stop it, you", group: "feelings", species: ALL, stands: true },
  { id: "shocked", name: "Shocked", caption: "No way!", group: "feelings", species: ALL, stands: true },
  { id: "grumpy", name: "Grumpy", caption: "Hmph.", group: "feelings", species: ALL, stands: true },
  { id: "cool", name: "Cool", caption: "Too cool", group: "feelings", species: ALL, stands: true },
  { id: "fever", name: "Fever", caption: "Sick day…", group: "feelings", species: ALL },
  { id: "boo", name: "Boo!", caption: "Boo!", group: "feelings", species: ["ghost"] },
  { id: "love", name: "Love", caption: "Love you", group: "love", species: ALL, stands: true },
  { id: "kiss", name: "Kiss", caption: "Mwah", group: "love", species: ALL, stands: true },
  { id: "missyou", name: "Miss you", caption: "Miss you…", group: "love", species: ALL },
  { id: "smitten", name: "Heart eyes", caption: "Smitten", group: "love", species: ALL, stands: true },
  { id: "hug", name: "Hug", caption: "Hugs", group: "together", pair: true, species: CAT },
  { id: "shoulder", name: "Head on shoulder", caption: "My person", group: "together", pair: true, species: CAT },
  { id: "cheek", name: "Cheek to cheek", caption: "Us", group: "together", pair: true, species: CAT },
  { id: "diya", name: "Diya", caption: "Happy Diwali", group: "festive", outfit: true, species: ["cat", "ghost"] },
  { id: "sparkler", name: "Sparkler", caption: "Happy Diwali", group: "festive", outfit: true, species: ["cat", "ghost"] },
  { id: "diwali-sparklers", name: "Sparklers together", caption: "Happy Diwali", group: "festive", pair: true, outfit: true, species: CAT },
  { id: "diwali-diya", name: "Diya for two", caption: "Shubh Deepavali", group: "festive", pair: true, outfit: true, species: CAT },
  { id: "diwali-hug", name: "Diwali hug", caption: "Light & love", group: "festive", pair: true, outfit: true, species: CAT },
];

export function findReaction(id: string): Reaction {
  return REACTIONS.find((reaction) => reaction.id === id) ?? REACTIONS[0]!;
}

export interface CreatureSpec {
  species: Species;
  reaction: ReactionId;
  stance?: Stance;
  look: Look;
  /** Second character in couples. */
  partner: Look;
  /** Festive outfit colour, shared by couples so outfits match. */
  outfit: string;
  /** Heart colour. */
  heart?: string;
  glass: boolean;
  blush: boolean;
  /** Stripes on cats, spots on frogs and giraffes, a fur tuft on rabbits. */
  pattern: boolean;
  whiskers: boolean;
  /** Filter-free output (no blur or texture) for renderers like flutter_svg. */
  portable?: boolean;
}

export const DEFAULT_LOOKS: Record<Species, Look> = {
  cat: { fur: "#F4A24C", eyes: "#2E9E6A" },
  ghost: { fur: "#F7F5F2", eyes: "#3A2C26" },
  frog: { fur: "#86C25A", eyes: "#8E6B2E" },
  rabbit: { fur: "#EADCCB", eyes: "#8E6B2E" },
  giraffe: { fur: "#F2B84B", eyes: "#3A2C26" },
};

export const DEFAULT_CREATURE: CreatureSpec = {
  species: "cat",
  reaction: "hi",
  stance: "sit",
  look: DEFAULT_LOOKS.cat,
  partner: { fur: "#F7F5F2", eyes: "#3E8FDE" },
  outfit: "#D61F6E",
  heart: "#E4183F",
  glass: false,
  blush: true,
  pattern: true,
  whiskers: true,
};

const FACES: Partial<Record<ReactionId, Face>> = {
  hi: { eyes: "open", mouth: "grin", blush: 1 },
  morning: { eyes: "droopy", mouth: "smile", blush: 1 },
  night: { eyes: "closed", mouth: "smile", blush: 1 },
  thanks: { eyes: "happy", mouth: "grin", blush: 2 },
  huh: { eyes: "up", mouth: "o", brows: "raised", blush: 0 },
  smile: { eyes: "open", mouth: "smile", blush: 1 },
  yay: { eyes: "happy", mouth: "grin", blush: 2 },
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
  smitten: { eyes: "hearts", mouth: "grin", blush: 2 },
};

type Base = Omit<CharacterOptions, "look" | "face" | "pose">;

const add = ([x, y]: Point, dx: number, dy: number): Point => [x + dx, y + dy];

function confetti(): string {
  const bits: [number, number, string, number][] = [
    [96, 150, "#FF5D8F", 20],
    [420, 136, "#3E8FDE", -30],
    [70, 260, "#FFC233", 50],
    [446, 250, "#2EBF7A", 10],
    [130, 84, "#8A5FD6", -15],
    [384, 70, "#FF9F1C", 35],
  ];
  return (
    `<g data-part="decor">` +
    bits.map(([x, y, color, rotate]) => `<rect x="${x - 9}" y="${y - 4}" width="18" height="8" rx="3" fill="${color}" transform="rotate(${rotate} ${x} ${y})"/>`).join("") +
    `</g>` +
    sparkle([256, 52], 14) +
    sparkle([462, 186], 9, "#FFB8CC")
  );
}

function single(id: Id, sid: Id, spec: CreatureSpec, base: Base): string {
  const species = spec.species;
  const ghost = species === "ghost";
  const rig = rigOf(species);
  const face = FACES[spec.reaction] ?? FACES.smile!;
  const o: CharacterOptions = { ...base, look: spec.look, face, pose: "rest" };
  const corner = rig.corner;
  const with_ = (pose: Pose, extra: Partial<CharacterOptions> = {}) => character(id, { ...o, pose, ...extra });

  switch (spec.reaction) {
    case "hi":
      return with_("wave", { front: waveLines(add(rig.wave, 36, -30)) + sparkle([96, 120], 14) });
    case "morning":
      return with_("hold", { held: mug(sid, rig.holdAt) });
    case "night": {
      const { at, scale, rotate = 0 } = rig.cap;
      return with_("rest", {
        headwear: `<g transform="rotate(${rotate} ${at[0]} ${at[1]})">${nightcap(sid, scale, at)}</g>`,
        front: zz(add(corner, -22, 30), 1) + (rig.nose ? `<circle cx="${rig.nose[0] + 28}" cy="${rig.nose[1]}" r="12" fill="#CFEAFF" opacity="0.75" stroke="#9CCBF2" stroke-width="2"/>` : ""),
      });
    }
    case "thanks":
      return with_("together", { front: sparkle([110, 150], 16) + sparkle([406, 140], 12, "#FFB8CC") + sparkle([420, 210], 8) });
    case "huh":
      return with_("chin", { headTilt: -6, front: questionMark(corner, 46) + sweat(sid, rig.temple, 12) });
    case "smile":
      return with_("rest", { front: sparkle([420, 116], 14) + sparkle([96, 140], 9, "#FFB8CC") });
    case "yay":
      return with_("up", { front: confetti() });
    case "naughty":
      return with_("rest", { headTilt: -4, front: sparkle([424, 110], 15) });
    case "lol":
      return with_("rest", { headTilt: 6 });
    case "shy":
      return with_("cheeks", { headTilt: -5, front: sparkle([420, 120], 12, "#FFB8CC") });
    case "shocked":
      return with_("rest", {
        front:
          `<path d="M${corner[0] - 8} ${corner[1] - 50}l-8 44M${corner[0] + 18} ${corner[1] - 38}l-18 38M${corner[0] - 28} ${corner[1] - 56}l2 44" stroke="#FFB020" stroke-width="8" stroke-linecap="round"/>` +
          sweat(sid, rig.temple, 13),
      });
    case "grumpy":
      return with_("crossed", { front: angerMark(add(corner, -30, 8), 22) });
    case "cool":
      return with_("rest", { headwear: sunglasses(sid, { ...rig.face, lid: spec.look.fur }), front: sparkle([424, 112], 16) + sparkle([96, 130], 10) });
    case "boo":
      return with_("up", { front: sparkle([440, 120], 12, "#BDA8FF") });
    case "love":
      return with_("hold", { held: classicHeart(sid, add(rig.holdAt, 0, -8), 58) });
    case "kiss":
      return with_("kiss", { front: classicHeart(sid, add(rig.kiss, 82, -62), 22, 14) });
    case "missyou":
      return with_("hold", { held: classicHeart(sid, add(rig.holdAt, 0, -6), 44, -8) });
    case "smitten":
      return with_("together", { front: classicHeart(sid, add(corner, -8, -4), 24, 12) + classicHeart(sid, [92, 150], 18, -14) + classicHeart(sid, add(corner, 20, 70), 14, 20) });
    case "fever":
      return fever(id, sid, spec, o);
    case "diya":
      return lights() + with_("hold", { outfit: ghost ? undefined : "kurta", face: { eyes: "happy", mouth: "grin", blush: 1 }, held: diya(sid, add(rig.holdAt, 0, 8), 1.1) });
    case "sparkler":
      return (
        lights() +
        with_("raise", {
          outfit: ghost ? undefined : "kurta",
          face: { eyes: "open", mouth: "grin", blush: 1 },
          front: sparkler(sid, rig.raise, [448, 168], 1),
        })
      );
    default:
      return with_("rest");
  }
}

function fever(id: Id, sid: Id, spec: CreatureSpec, o: CharacterOptions): string {
  const ghost = spec.species === "ghost";
  const rig = rigOf(spec.species);
  const p = paletteFor(spec.species, spec.look);
  const pillow = `<rect x="70" y="122" width="372" height="210" rx="96" fill="url(#${sid("pillow")})" stroke="#C9C4D8" stroke-width="4"/><path d="M120 170c20 10 30 26 34 48M392 170c-20 10-30 26-34 48" stroke="#D9D5E5" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  const blanket =
    `<path d="M24 372C120 344 392 344 488 372L500 512H12Z" fill="url(#${sid("blanket")})" stroke="#7E69C4" stroke-width="5" stroke-linejoin="round"/>` +
    `<path d="M24 372C120 344 392 344 488 372L490 396C392 368 120 368 22 396Z" fill="#FFFFFF" opacity="0.55"/>` +
    `<g fill="#FFFFFF" opacity="0.35"><circle cx="90" cy="420" r="9"/><circle cx="170" cy="460" r="9"/><circle cx="250" cy="410" r="9"/><circle cx="330" cy="462" r="9"/><circle cx="420" cy="418" r="9"/><circle cx="460" cy="480" r="9"/><circle cx="60" cy="490" r="9"/></g>` +
    `<path d="M150 400c30 24 40 60 34 100M362 400c-30 24-40 60-34 100" stroke="#7E69C4" stroke-width="4" stroke-linecap="round" opacity="0.5" fill="none"/>`;
  const paws = ghost
    ? ""
    : `<ellipse cx="200" cy="362" rx="30" ry="18" fill="url(#${id("fur")})" stroke="${p.outline}" stroke-width="5"/>` +
      `<ellipse cx="312" cy="362" rx="30" ry="18" fill="url(#${id("fur")})" stroke="${p.outline}" stroke-width="5"/>`;
  const [mx, my] = rig.face.mouth;
  const iceAt = add(rig.cap.at, 38, 12);
  return (
    pillow +
    character(id, {
      ...o,
      pose: "none",
      headOnly: !ghost,
      noTail: true,
      headTilt: -8,
      headwear: icePack(sid, iceAt, 1) + thermometer([mx + 2, my + 12], 22),
      front: sweat(sid, add(rig.temple, 2, 16), 12),
    }) +
    blanket +
    paws +
    `<path d="M400 60c10 10 10 20 0 30s-10 20 0 30M432 70c10 10 10 20 0 30s-10 20 0 30" stroke="#FF7A59" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.8"/>`
  );
}

/* Couples ------------------------------------------------------------------- */

function pair(spec: CreatureSpec, base: Base, ids: { a: Id; b: Id; s: Id }): string {
  const rig = rigOf("cat");
  const gold = `url(#${ids.s("gold")})`;
  const a = (face: Face, pose: Pose, extra: Partial<CharacterOptions> = {}) =>
    character(ids.a, { ...base, species: "cat", look: spec.look, face, pose, outfit: undefined, gold, ...extra });
  const b = (face: Face, pose: Pose, extra: Partial<CharacterOptions> = {}) =>
    character(ids.b, { ...base, species: "cat", look: spec.partner, face, pose, outfit: undefined, gold, ...extra });
  const content: Face = { eyes: "happy", mouth: "smile", blush: 2 };
  const heart = (at: Point, s = 46) => classicHeart(ids.s, at, s);
  const hugArm = (id: Id, look: Look, from: Point, to: Point, bend: number, sleeve?: string) => {
    const p = paletteFor("cat", look);
    return limb(
      {
        fill: sleeve ? lighten(sleeve, 0.05) : `url(#${id("fur")})`,
        outline: sleeve ? darken(sleeve, 0.35) : p.outline,
        paw: `url(#${id("fur")})`,
        width: rig.arm * 0.6,
        cuff: sleeve ? gold : undefined,
      },
      from,
      to,
      bend,
    );
  };

  switch (spec.reaction) {
    case "hug":
    case "diwali-hug": {
      const festive = spec.reaction === "diwali-hug";
      const A: Point = [182, 300];
      const B: Point = [330, 300];
      const s = 0.6;
      const armA = hugArm(ids.a, spec.look, local([300, 362], A, s, 6), local([214, 352], B, s, -6), -28, festive ? spec.outfit : undefined);
      const armB = hugArm(ids.b, spec.partner, local([212, 362], B, s, -6), local([298, 352], A, s, 6), 28, festive ? spec.outfit : undefined);
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
        place(a({ eyes: "happy", mouth: "grin", blush: 2 }, "raiseLeft", { outfit: "saree", headTilt: 6 }), A, s) +
        place(b({ eyes: "open", mouth: "grin", blush: 1 }, "raise", { outfit: "kurta", headTilt: -6 }), B, s) +
        sparkler(ids.s, local(rig.raiseLeft, A, s), [54, 176], 0.8) +
        sparkler(ids.s, local(rig.raise, B, s), [458, 176], 0.8)
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
            held: diya(ids.s, [256, 422], 1.2),
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

/** Outfit and gold gradients for one character namespace. */
function festiveDefs(id: Id, outfit: string): string {
  return sceneDefs(id, { outfit, heart: "#E4183F" }).match(/<linearGradient id="[^"]+-(outfit|gold)"[\s\S]*?<\/linearGradient>/g)?.join("") ?? "";
}

export function creatureKey(spec: CreatureSpec): string {
  return hash(JSON.stringify(spec));
}

/** Draws a creature sticker (single or couple, by reaction) as a complete SVG. */
export function drawCreature(spec: CreatureSpec): string {
  const reaction = findReaction(spec.reaction);
  const ns = namespace(`cb${creatureKey(spec)}`);
  const ids = { a: ns("a"), b: ns("b"), s: ns("s") };
  const portable = Boolean(spec.portable);
  const species: Species = reaction.pair ? "cat" : reaction.species.includes(spec.species) ? spec.species : "cat";
  const stance: Stance = species === "cat" && reaction.stands && spec.stance === "stand" ? "stand" : "sit";
  const paint: ScenePaint = { outfit: spec.outfit, heart: spec.heart ?? "#E4183F" };
  const base: Base = {
    species,
    stance,
    glass: spec.glass,
    blush: spec.blush,
    pattern: spec.pattern,
    whiskers: spec.whiskers,
    portable,
    outfitColor: spec.outfit,
    gold: `url(#${ids.s("gold")})`,
  };
  const defs =
    characterDefs(ids.a, paletteFor(species, spec.look), portable) +
    festiveDefs(ids.a, spec.outfit) +
    (reaction.pair ? characterDefs(ids.b, paletteFor("cat", spec.partner), portable) + festiveDefs(ids.b, spec.outfit) : "") +
    sceneDefs(ids.s, paint);
  const body = reaction.pair ? pair(spec, base, ids) : single(ids.a, ids.s, { ...spec, species }, base);
  return svgDocument(defs, body);
}


