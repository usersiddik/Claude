import { DEFAULT_CREATURE, DEFAULT_LOOKS, drawCreature, REACTIONS, type Reaction, type ReactionId, type Species, type Stance } from "../../art/creatures.ts";
import { CAT_FUR, EYES, FROG_SKIN, GHOST_BODY, GIRAFFE_COAT, HEARTS, OUTFITS, RABBIT_FUR } from "../swatches.ts";
import { colorOf, flagOf, type LiveCollection, type Property, type StickerItem, type Swatch, type Values } from "../types.ts";

const HEARTY: readonly ReactionId[] = ["love", "kiss", "missyou", "smitten", "hug", "shoulder", "cheek", "diwali-hug"];

interface CreatureConfig {
  id: string;
  species: Species;
  title: string;
  noun: string;
  tagline: string;
  description: string;
  accent: string;
  colorLabel: string;
  swatches: readonly Swatch[];
  /** Label for the pattern toggle, or false to hide it. */
  pattern: string | false;
  whiskers: boolean;
  cover: readonly string[];
}

const GROUP_NAMES: Record<Reaction["group"], string> = {
  everyday: "Everyday",
  feelings: "Feelings",
  love: "Love",
  together: "Couples",
  festive: "Festive",
};

/** Item id for a reaction and stance: `hi`, `hi-standing`. */
const itemId = (reaction: ReactionId, stance: Stance) => (stance === "stand" ? `${reaction}-standing` : reaction);

export function creatureCollection(config: CreatureConfig): LiveCollection {
  // Cats and bunnies stand as well as sit, and come in couples.
  const cat = config.species === "cat" || config.species === "rabbit";
  const toggles = ["blush", ...(config.pattern ? ["pattern"] : []), ...(config.whiskers ? ["whiskers"] : [])];
  const usesFor = (reaction: Reaction) => [
    "fur",
    "eyes",
    ...(reaction.pair ? ["partner"] : []),
    ...(reaction.outfit && config.species !== "ghost" ? ["outfit"] : []),
    ...(HEARTY.includes(reaction.id) ? ["heart"] : []),
    ...toggles,
  ];

  const reactions = REACTIONS.filter((reaction) => reaction.species.includes(config.species));
  const items: StickerItem[] = [];
  const meta = new Map<string, { reaction: ReactionId; stance: Stance }>();
  const add = (reaction: Reaction, stance: Stance, group: string) => {
    const id = itemId(reaction.id, stance);
    items.push({ id, name: stance === "stand" ? `${reaction.name}, standing` : reaction.name, caption: reaction.caption, group, uses: usesFor(reaction) });
    meta.set(id, { reaction: reaction.id, stance });
  };

  if (cat) {
    for (const reaction of reactions.filter((r) => !r.pair && r.group !== "festive")) add(reaction, "sit", "sitting");
    for (const reaction of reactions.filter((r) => r.stands)) add(reaction, "stand", "standing");
    for (const reaction of reactions.filter((r) => r.group === "together")) add(reaction, "sit", "couples");
    for (const reaction of reactions.filter((r) => r.group === "festive")) add(reaction, "sit", "festive");
  } else {
    for (const reaction of reactions) add(reaction, "sit", reaction.group);
  }

  const groups = cat
    ? [
        { id: "sitting", name: "Sitting" },
        { id: "standing", name: "Standing" },
        { id: "couples", name: "Couples" },
        { id: "festive", name: "Festive" },
      ].filter((group) => items.some((item) => item.group === group.id))
    : (["everyday", "feelings", "love", "festive"] as const).filter((group) => items.some((item) => item.group === group)).map((group) => ({ id: group, name: GROUP_NAMES[group] }));

  const look = DEFAULT_LOOKS[config.species];
  const properties: Property[] = [
    { id: "fur", kind: "color", label: config.colorLabel, swatches: config.swatches, default: look.fur, custom: true },
    { id: "eyes", kind: "color", label: "Eyes", swatches: EYES, default: look.eyes },
    ...(cat ? [{ id: "partner", kind: "color", label: "Partner", swatches: config.swatches, default: DEFAULT_CREATURE.partner.fur, custom: true } as const] : []),
    ...(items.some((item) => item.uses.includes("outfit")) ? [{ id: "outfit", kind: "color", label: "Outfit", swatches: OUTFITS, default: DEFAULT_CREATURE.outfit } as const] : []),
    { id: "heart", kind: "color", label: "Heart", swatches: HEARTS, default: "#E4183F" },
    { id: "blush", kind: "toggle", label: "Blush", default: true },
    ...(config.pattern ? [{ id: "pattern", kind: "toggle", label: config.pattern, default: true } as const] : []),
    ...(config.whiskers ? [{ id: "whiskers", kind: "toggle", label: "Whiskers", default: true } as const] : []),
  ];

  return {
    status: "live",
    id: config.id,
    title: config.title,
    noun: config.noun,
    tagline: config.tagline,
    description: config.description,
    families: ["characters"],
    accent: config.accent,
    groups,
    properties,
    items,
    cover: config.cover,
    render: (item, values: Values, options = {}) => {
      const { reaction, stance } = meta.get(item.id) ?? { reaction: "hi", stance: "sit" };
      return drawCreature({
        species: config.species,
        reaction,
        stance,
        look: { fur: colorOf(values, "fur", look.fur), eyes: colorOf(values, "eyes", look.eyes) },
        // Mimi, the partner bunny, shares Lumi's eye colour; the partner cat keeps its own.
        partner: { fur: colorOf(values, "partner", DEFAULT_CREATURE.partner.fur), eyes: config.species === "rabbit" ? colorOf(values, "eyes", look.eyes) : DEFAULT_CREATURE.partner.eyes },
        outfit: colorOf(values, "outfit", DEFAULT_CREATURE.outfit),
        heart: colorOf(values, "heart", "#E4183F"),
        glass: false,
        blush: flagOf(values, "blush", true),
        pattern: config.pattern ? flagOf(values, "pattern", true) : false,
        whiskers: flagOf(values, "whiskers", true),
        portable: options.portable,
      });
    },
  };
}

export const cats = creatureCollection({
  id: "cats",
  species: "cat",
  title: "Cats",
  noun: "Cat",
  tagline: "Sitting, standing, smitten.",
  description: "A naughty ginger with a full range of moods, standing and sitting, plus couples and festive outfits.",
  accent: "#FFE7CF",
  colorLabel: "Fur",
  swatches: CAT_FUR,
  pattern: "Stripes",
  whiskers: true,
  cover: ["hi", "smitten-standing", "cool"],
});

export const ghosts = creatureCollection({
  id: "ghosts",
  species: "ghost",
  title: "Ghosts",
  noun: "Ghost",
  tagline: "Soft, sheepish, a little spooky.",
  description: "A gentle sheet ghost that floats through every feeling.",
  accent: "#E8E5F4",
  colorLabel: "Body",
  swatches: GHOST_BODY,
  pattern: false,
  whiskers: false,
  cover: ["boo", "love", "night"],
});

export const frogs = creatureCollection({
  id: "frogs",
  species: "frog",
  title: "Frogs",
  noun: "Frog",
  tagline: "Big eyes, bigger grin.",
  description: "A round little frog with dome eyes and the widest smile in the pond.",
  accent: "#E0F1D6",
  colorLabel: "Skin",
  swatches: FROG_SKIN,
  pattern: "Spots",
  whiskers: false,
  cover: ["yay", "smitten", "cool"],
});

/** Lumi drawn in code: the white bunny from the WhatsApp pack, recolourable. */
export const lumiColour = creatureCollection({
  id: "lumi-colour",
  species: "rabbit",
  title: "Lumi in colour",
  noun: "Bunny",
  tagline: "The bunny, in any colour you like.",
  description: "Lumi the baby white bunny, sitting and standing through every mood, plus hugs with her partner Mimi.",
  accent: "#FBE3E6",
  colorLabel: "Fur",
  swatches: RABBIT_FUR,
  pattern: false,
  whiskers: true,
  cover: ["shy-standing", "love", "hi"],
});

export const giraffes = creatureCollection({
  id: "giraffes",
  species: "giraffe",
  title: "Giraffes",
  noun: "Giraffe",
  tagline: "Long lashes, short neck.",
  description: "A spotty, lash-batting giraffe with velvet horns and a tufted tail.",
  accent: "#FFEFC4",
  colorLabel: "Coat",
  swatches: GIRAFFE_COAT,
  pattern: "Spots",
  whiskers: false,
  cover: ["smile", "yay", "huh"],
});
