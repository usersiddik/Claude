import { DEFAULT_CREATURE, DEFAULT_LOOKS, drawCreature, type ReactionId, type Species, type Stance } from "../../art/creatures.ts";
import { drawLove, LOVE_IDS, LOVE_SCENES } from "../../art/love.ts";
import { CAT_FUR, FLOWERS, HEARTS } from "../swatches.ts";
import { colorOf, type LiveCollection, type StickerItem } from "../types.ts";

/** Characters in love: drawn by the creature engine with the heart colour. */
/** `eyes` overrides the character's usual eye colour for that sticker. */
const CAST: readonly { id: string; name: string; caption: string; species: Species; reaction: ReactionId; stance?: Stance; eyes?: string }[] = [
  { id: "cat-flowers", name: "Flowers for you", caption: "For you", species: "cat", reaction: "flowers", stance: "stand", eyes: "#3A2C26" },
  { id: "cat-hug", name: "Cat hug", caption: "Hugs", species: "cat", reaction: "hug" },
  { id: "cat-cheek", name: "Cheek to cheek", caption: "Us", species: "cat", reaction: "cheek" },
  { id: "cat-shoulder", name: "Head on shoulder", caption: "My person", species: "cat", reaction: "shoulder" },
  { id: "cat-love", name: "Cat with heart", caption: "Love you", species: "cat", reaction: "love" },
  { id: "cat-smitten", name: "Heart-eyed cat", caption: "Smitten", species: "cat", reaction: "smitten", stance: "stand" },
  { id: "cat-kiss", name: "Blown kiss", caption: "Mwah", species: "cat", reaction: "kiss", stance: "stand" },
  { id: "rabbit-love", name: "Bunny love", caption: "Some bunny loves you", species: "rabbit", reaction: "love" },
  { id: "frog-smitten", name: "Heart-eyed frog", caption: "Hopelessly yours", species: "frog", reaction: "smitten" },
  { id: "giraffe-kiss", name: "Giraffe kiss", caption: "Mwah", species: "giraffe", reaction: "kiss" },
];

const LOVE_FUR = "#F1DCC0";

const scenes: StickerItem[] = LOVE_IDS.map((id) => {
  const scene = LOVE_SCENES[id]!;
  return { id, name: scene.name, caption: scene.caption, group: scene.uses.includes("flower") ? "flowers" : "hearts", uses: scene.uses };
});

const cast: StickerItem[] = CAST.map((entry) => ({
  id: entry.id,
  name: entry.name,
  caption: entry.caption,
  group: "couples",
  uses: entry.species === "cat" ? ["heart", "fur"] : ["heart"],
}));

export const love: LiveCollection = {
  status: "live",
  id: "love",
  title: "Love & Valentine's",
  noun: "Love",
  tagline: "Hearts in every colour.",
  description: "Glossy hearts, roses, love letters, and characters who can't stop blushing. Pick any heart colour.",
  families: ["feelings", "festivals"],
  accent: "#FFE1E7",
  groups: [
    { id: "hearts", name: "Hearts" },
    { id: "flowers", name: "Flowers" },
    { id: "couples", name: "Sweethearts" },
  ],
  properties: [
    { id: "heart", kind: "color", label: "Heart", swatches: HEARTS, default: "#E4183F", custom: true },
    { id: "flower", kind: "color", label: "Flower", swatches: FLOWERS, default: "#E8264F", custom: true },
    // Love's cats are cream by default, so they read as their own set next to the ginger Cats.
    { id: "fur", kind: "color", label: "Cat fur", swatches: CAT_FUR, default: LOVE_FUR, custom: true },
  ],
  items: [...scenes, ...cast],
  cover: ["cat-flowers", "glossy-heart", "rose"],
  render: (item, values, options = {}) => {
    const heart = colorOf(values, "heart", "#E4183F");
    const entry = CAST.find((candidate) => candidate.id === item.id);
    if (!entry) return drawLove(item.id, { heart, flower: colorOf(values, "flower", "#E8264F"), portable: options.portable });
    const base = DEFAULT_LOOKS[entry.species];
    const look = { fur: entry.species === "cat" ? colorOf(values, "fur", LOVE_FUR) : base.fur, eyes: entry.eyes ?? base.eyes };
    return drawCreature({ ...DEFAULT_CREATURE, species: entry.species, reaction: entry.reaction, stance: entry.stance ?? "sit", look, heart, portable: options.portable });
  },
};
