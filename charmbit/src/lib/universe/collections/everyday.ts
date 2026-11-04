import { DEFAULT_CREATURE, DEFAULT_LOOKS, drawCreature, type ReactionId, type Species, type Stance } from "../../art/creatures.ts";
import { withCaption } from "../../art/lettering.ts";
import { LETTERS } from "../swatches.ts";
import { colorOf, flagOf, type LiveCollection, type StickerItem } from "../types.ts";

interface Expression {
  id: string;
  phrase: string;
  group: "greetings" | "reactions" | "care";
  species: Species;
  reaction: ReactionId;
  stance?: Stance;
}

const EXPRESSIONS: readonly Expression[] = [
  { id: "hi", phrase: "Hi!", group: "greetings", species: "cat", reaction: "hi" },
  { id: "good-morning", phrase: "Good morning", group: "greetings", species: "rabbit", reaction: "morning" },
  { id: "coffee", phrase: "Coffee?", group: "greetings", species: "cat", reaction: "morning", stance: "stand" },
  { id: "good-night", phrase: "Good night", group: "greetings", species: "ghost", reaction: "night" },
  { id: "bye", phrase: "Bye!", group: "greetings", species: "rabbit", reaction: "hi" },
  { id: "lol", phrase: "LOL", group: "reactions", species: "cat", reaction: "lol" },
  { id: "omg", phrase: "OMG", group: "reactions", species: "giraffe", reaction: "shocked" },
  { id: "huh", phrase: "Huh?", group: "reactions", species: "frog", reaction: "huh" },
  { id: "hehe", phrase: "Hehe", group: "reactions", species: "rabbit", reaction: "naughty" },
  { id: "cool", phrase: "Cool", group: "reactions", species: "frog", reaction: "cool" },
  { id: "hmph", phrase: "Hmph", group: "reactions", species: "cat", reaction: "grumpy", stance: "stand" },
  { id: "yay", phrase: "Yay!", group: "reactions", species: "frog", reaction: "yay" },
  { id: "okay", phrase: "Okay!", group: "reactions", species: "giraffe", reaction: "smile" },
  { id: "thank-you", phrase: "Thank you", group: "care", species: "frog", reaction: "thanks" },
  { id: "sorry", phrase: "Sorry", group: "care", species: "rabbit", reaction: "tear" },
  { id: "miss-you", phrase: "Miss you", group: "care", species: "ghost", reaction: "missyou" },
  { id: "love-you", phrase: "Love you", group: "care", species: "cat", reaction: "love" },
  { id: "hugs", phrase: "Hugs", group: "care", species: "cat", reaction: "hug" },
  { id: "get-well", phrase: "Get well soon", group: "care", species: "cat", reaction: "fever" },
  { id: "congrats", phrase: "Congrats!", group: "care", species: "giraffe", reaction: "yay" },
];

const items: StickerItem[] = EXPRESSIONS.map((entry) => ({ id: entry.id, name: entry.phrase, caption: entry.phrase, group: entry.group, uses: ["letters", "blush"] }));

export const everyday: LiveCollection = {
  status: "live",
  id: "everyday",
  title: "Everyday Expressions",
  noun: "Everyday",
  tagline: "Say it with a sticker.",
  description: "Hi, LOL, Sorry, Miss you: the words you send every day, lettered and held up by the whole cast.",
  families: ["feelings"],
  accent: "#DCE9FF",
  groups: [
    { id: "greetings", name: "Greetings" },
    { id: "reactions", name: "Reactions" },
    { id: "care", name: "Care" },
  ],
  properties: [
    { id: "letters", kind: "color", label: "Lettering", swatches: LETTERS, default: "#E8175D" },
    { id: "blush", kind: "toggle", label: "Blush", default: true },
  ],
  items,
  cover: ["lol", "hi", "thank-you"],
  render: (item, values, options = {}) => {
    const entry = EXPRESSIONS.find((candidate) => candidate.id === item.id) ?? EXPRESSIONS[0]!;
    const art = drawCreature({
      ...DEFAULT_CREATURE,
      species: entry.species,
      reaction: entry.reaction,
      stance: entry.stance ?? "sit",
      look: DEFAULT_LOOKS[entry.species],
      blush: flagOf(values, "blush", true),
      portable: options.portable,
    });
    return withCaption(art, entry.phrase, colorOf(values, "letters", "#E8175D"));
  },
};
