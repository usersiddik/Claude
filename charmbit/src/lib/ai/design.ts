/**
 * What the AI designer can make. Claude never draws: it fills in a design
 * from this vocabulary, and the same engines that draw the library draw it.
 * That keeps every AI sticker on-brand, recolourable, and exportable.
 */
import { normalizeHex } from "../art/color.ts";
import { DEFAULT_CREATURE, DEFAULT_LOOKS, drawCreature, findReaction, REACTIONS, type ReactionId, type Species } from "../art/creatures.ts";
import { DEFAULT_DIWALI, DIWALI_IDS, drawDiwali } from "../art/kids.ts";
import { withCaption, type Lettering } from "../art/lettering.ts";
import { DEFAULT_LOVE, drawLove, LOVE_IDS } from "../art/love.ts";

export const SPECIES_IDS = ["cat", "ghost", "frog", "rabbit", "giraffe"] as const satisfies readonly Species[];
export const REACTION_IDS = REACTIONS.map((reaction) => reaction.id);
export const CAPTION_LIMIT = 24;

interface Common {
  /** Two to four words, shown under the sticker. */
  title: string;
  /** Lettering under the art; empty for none. */
  caption: string;
  captionColor: string;
}

export interface CreatureDesign extends Common {
  kind: "creature";
  species: Species;
  reaction: ReactionId;
  stance: "sit" | "stand";
  fur: string;
  eyes: string;
  heart: string;
  outfit: string;
  partner: string;
  blush: boolean;
  pattern: boolean;
  whiskers: boolean;
  glass: boolean;
}

export interface KidsDesign extends Common {
  kind: "kids";
  scene: string;
  outfit: string;
  skin: string;
  lights: boolean;
}

export interface LoveDesign extends Common {
  kind: "love";
  scene: string;
  heart: string;
  flower: string;
}

export type Design = CreatureDesign | KidsDesign | LoveDesign;

/** A design plus its traced caption, as the API returns it. */
export type ReadyDesign = Design & { lettering: Lettering | null };

export interface DesignReply {
  reply: string;
  designs: Design[];
}

/* Schema for Claude's structured output --------------------------------------------- */

const text = { type: "string" } as const;
const flag = { type: "boolean" } as const;
const hex = { type: "string", description: "A colour as #RRGGBB." } as const;
const common = {
  title: { type: "string", description: "Two to four words naming the sticker." },
  caption: { type: "string", description: `Lettering under the art, at most ${CAPTION_LIMIT} characters, Latin letters only. Empty string for none.` },
  captionColor: hex,
};

const creature = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "title", "species", "reaction", "stance", "fur", "eyes", "heart", "outfit", "partner", "blush", "pattern", "whiskers", "glass", "caption", "captionColor"],
  properties: {
    kind: { type: "string", enum: ["creature"] },
    ...common,
    species: { type: "string", enum: [...SPECIES_IDS] },
    reaction: { type: "string", enum: REACTION_IDS },
    stance: { type: "string", enum: ["sit", "stand"] },
    fur: hex,
    eyes: hex,
    heart: hex,
    outfit: hex,
    partner: hex,
    blush: flag,
    pattern: flag,
    whiskers: flag,
    glass: flag,
  },
};

const kids = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "title", "scene", "outfit", "skin", "lights", "caption", "captionColor"],
  properties: {
    kind: { type: "string", enum: ["kids"] },
    ...common,
    scene: { type: "string", enum: DIWALI_IDS },
    outfit: hex,
    skin: hex,
    lights: flag,
  },
};

const love = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "title", "scene", "heart", "flower", "caption", "captionColor"],
  properties: {
    kind: { type: "string", enum: ["love"] },
    ...common,
    scene: { type: "string", enum: LOVE_IDS },
    heart: hex,
    flower: hex,
  },
};

/** JSON schema for `output_config.format`. */
export const REPLY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "designs"],
  properties: {
    reply: { ...text, description: "One or two short, warm sentences to the person." },
    designs: { type: "array", description: "Usually three distinct designs; one to three when refining.", items: { anyOf: [creature, kids, love] } },
  },
} as const;

/* Validation ---------------------------------------------------------------------- */

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const bool = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);
const color = (value: unknown, fallback: string) => normalizeHex(str(value)) ?? fallback;
const oneOf = <T extends string>(value: unknown, options: readonly T[], fallback: T): T => (options.includes(value as T) ? (value as T) : fallback);

/** Letters, digits, spaces, and light punctuation; trimmed to the caption limit. */
export function cleanCaption(value: unknown): string {
  return str(value)
    .replace(/[^\p{L}\p{N} !?.,'&♥:-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CAPTION_LIMIT)
    .trim();
}

function cleanTitle(value: unknown, fallback: string): string {
  const title = str(value).replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
  return title || fallback;
}

/** Turns untrusted JSON (from the model or a client) into a design we can draw, or null. */
export function sanitizeDesign(raw: unknown): Design | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const caption = cleanCaption(value.caption);
  const captionColor = color(value.captionColor, "#E8175D");
  switch (value.kind) {
    case "creature": {
      const reaction = findReaction(oneOf(value.reaction, REACTION_IDS, "hi"));
      // Couples are cats; a reaction a species can't do falls back to cats.
      const requested = oneOf(value.species, SPECIES_IDS, "cat");
      const species: Species = reaction.pair || !reaction.species.includes(requested) ? "cat" : requested;
      const look = DEFAULT_LOOKS[species];
      return {
        kind: "creature",
        title: cleanTitle(value.title, `${species} ${reaction.name}`),
        species,
        reaction: reaction.id,
        stance: species === "cat" && reaction.stands && value.stance === "stand" ? "stand" : "sit",
        fur: color(value.fur, look.fur),
        eyes: color(value.eyes, look.eyes),
        heart: color(value.heart, "#E4183F"),
        outfit: color(value.outfit, DEFAULT_CREATURE.outfit),
        partner: color(value.partner, DEFAULT_CREATURE.partner.fur),
        blush: bool(value.blush, true),
        pattern: bool(value.pattern, true),
        whiskers: bool(value.whiskers, true),
        glass: bool(value.glass, false),
        caption,
        captionColor,
      };
    }
    case "kids":
      if (!DIWALI_IDS.includes(str(value.scene))) return null;
      return {
        kind: "kids",
        title: cleanTitle(value.title, "Diwali sticker"),
        scene: str(value.scene),
        outfit: color(value.outfit, DEFAULT_DIWALI.outfit),
        skin: color(value.skin, DEFAULT_DIWALI.skin),
        lights: bool(value.lights, true),
        caption,
        captionColor,
      };
    case "love":
      if (!LOVE_IDS.includes(str(value.scene))) return null;
      return {
        kind: "love",
        title: cleanTitle(value.title, "Love sticker"),
        scene: str(value.scene),
        heart: color(value.heart, DEFAULT_LOVE.heart),
        flower: color(value.flower, DEFAULT_LOVE.flower),
        caption,
        captionColor,
      };
    default:
      return null;
  }
}

/** Parses a reply object, keeping up to `limit` drawable designs. */
export function sanitizeReply(raw: unknown, limit = 4): DesignReply | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const designs = Array.isArray(value.designs) ? value.designs.map(sanitizeDesign).filter((design): design is Design => design !== null).slice(0, limit) : [];
  const reply = str(value.reply).trim().slice(0, 400);
  if (!reply && designs.length === 0) return null;
  return { reply, designs };
}

/* Rendering ------------------------------------------------------------------------- */

/** Draws a design as SVG. Captions need traced lettering (made on the server). */
export function renderDesign(design: Design, lettering: Lettering | null, portable = false): string {
  let svg: string;
  switch (design.kind) {
    case "creature":
      svg = drawCreature({
        species: design.species,
        reaction: design.reaction,
        stance: design.stance,
        look: { fur: design.fur, eyes: design.eyes },
        partner: { fur: design.partner, eyes: DEFAULT_CREATURE.partner.eyes },
        outfit: design.outfit,
        heart: design.heart,
        glass: design.glass,
        blush: design.blush,
        pattern: design.pattern,
        whiskers: design.whiskers,
        portable,
      });
      break;
    case "kids":
      svg = drawDiwali(design.scene, { outfit: design.outfit, skin: design.skin, lights: design.lights, portable });
      break;
    case "love":
      svg = drawLove(design.scene, { heart: design.heart, flower: design.flower, portable });
      break;
  }
  return design.caption && lettering ? withCaption(svg, lettering, design.captionColor) : svg;
}

/** File-name friendly slug, e.g. `ai-frog-good-morning`. */
export function designSlug(design: Design): string {
  const base = `${design.title} ${design.caption}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return `ai-${base || design.kind}`;
}
