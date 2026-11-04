/** Everything a person can customise in the Sticker Studio. */

export type Species = "cat" | "ghost";
export type Category = "everyday" | "feelings" | "love" | "together" | "diwali";

export type ReactionId =
  | "hi"
  | "morning"
  | "night"
  | "thanks"
  | "huh"
  | "smile"
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
  | "hug"
  | "shoulder"
  | "cheek"
  | "diya"
  | "sparkler"
  | "diwali-sparklers"
  | "diwali-diya"
  | "diwali-hug";

export interface Reaction {
  id: ReactionId;
  name: string;
  /** Speech-bubble line shown in the Studio. */
  caption: string;
  category: Category;
  /** Two characters. */
  pair?: boolean;
  /** Uses the festive outfit colour. */
  outfit?: boolean;
  species: readonly Species[];
}

const BOTH: readonly Species[] = ["cat", "ghost"];
const CAT: readonly Species[] = ["cat"];

export const REACTIONS: readonly Reaction[] = [
  { id: "hi", name: "Hi", caption: "Hiii!", category: "everyday", species: BOTH },
  { id: "morning", name: "Morning", caption: "Coffee first", category: "everyday", species: BOTH },
  { id: "night", name: "Good night", caption: "Night night", category: "everyday", species: BOTH },
  { id: "thanks", name: "Thank you", caption: "Thank you!", category: "everyday", species: BOTH },
  { id: "huh", name: "Huh?", caption: "Huh?", category: "everyday", species: BOTH },
  { id: "smile", name: "Smile", caption: "Hehe", category: "feelings", species: BOTH },
  { id: "naughty", name: "Naughty", caption: "Oops, not sorry", category: "feelings", species: BOTH },
  { id: "lol", name: "LOL", caption: "I can't!", category: "feelings", species: BOTH },
  { id: "tear", name: "Single tear", caption: "It's fine…", category: "feelings", species: BOTH },
  { id: "crying", name: "Crying", caption: "Waaah", category: "feelings", species: BOTH },
  { id: "shy", name: "Shy", caption: "Stop it, you", category: "feelings", species: BOTH },
  { id: "shocked", name: "Shocked", caption: "No way!", category: "feelings", species: BOTH },
  { id: "grumpy", name: "Grumpy", caption: "Hmph.", category: "feelings", species: BOTH },
  { id: "cool", name: "Cool", caption: "Too cool", category: "feelings", species: BOTH },
  { id: "fever", name: "Fever", caption: "Sick day…", category: "feelings", species: BOTH },
  { id: "boo", name: "Boo!", caption: "Boo!", category: "feelings", species: ["ghost"] },
  { id: "love", name: "Love", caption: "Love you", category: "love", species: BOTH },
  { id: "kiss", name: "Kiss", caption: "Mwah", category: "love", species: BOTH },
  { id: "missyou", name: "Miss you", caption: "Miss you…", category: "love", species: BOTH },
  { id: "hug", name: "Hug", caption: "Hugs", category: "together", pair: true, species: CAT },
  { id: "shoulder", name: "Head on shoulder", caption: "My person", category: "together", pair: true, species: CAT },
  { id: "cheek", name: "Cheek to cheek", caption: "Us", category: "together", pair: true, species: CAT },
  { id: "diya", name: "Diya", caption: "Happy Diwali", category: "diwali", outfit: true, species: BOTH },
  { id: "sparkler", name: "Sparkler", caption: "Happy Diwali", category: "diwali", outfit: true, species: BOTH },
  { id: "diwali-sparklers", name: "Sparklers together", caption: "Happy Diwali", category: "diwali", pair: true, outfit: true, species: CAT },
  { id: "diwali-diya", name: "Diya for two", caption: "Shubh Deepavali", category: "diwali", pair: true, outfit: true, species: CAT },
  { id: "diwali-hug", name: "Diwali hug", caption: "Light & love", category: "diwali", pair: true, outfit: true, species: CAT },
];

export const CATEGORIES: readonly { id: Category; name: string }[] = [
  { id: "everyday", name: "Everyday" },
  { id: "feelings", name: "Feelings" },
  { id: "love", name: "Love" },
  { id: "together", name: "Together" },
  { id: "diwali", name: "Diwali" },
];

export function findReaction(id: string): Reaction {
  return REACTIONS.find((reaction) => reaction.id === id) ?? REACTIONS[0]!;
}

export interface Look {
  /** Main fur/body colour. Shading is derived from it. */
  fur: string;
  eyes: string;
}

export interface StickerSpec {
  species: Species;
  reaction: ReactionId;
  look: Look;
  /** Second character for pair reactions. */
  partner: Look;
  /** Festive outfit colour, shared by both characters so outfits match. */
  outfit: string;
  glass: boolean;
  blush: boolean;
  stripes: boolean;
  whiskers: boolean;
  /** Filter-free output (no blur or texture) for renderers like flutter_svg. */
  portable?: boolean;
}

export interface Swatch {
  id: string;
  name: string;
  hex: string;
}

export const FUR_SWATCHES: readonly Swatch[] = [
  { id: "ginger", name: "Ginger", hex: "#F4A24C" },
  { id: "cream", name: "Cream", hex: "#F1DCC0" },
  { id: "snow", name: "Snow", hex: "#F7F5F2" },
  { id: "silver", name: "Silver", hex: "#C2C7D2" },
  { id: "charcoal", name: "Charcoal", hex: "#5A5B66" },
  { id: "black", name: "Midnight", hex: "#2B2C38" },
  { id: "gold", name: "Gold", hex: "#F4C14E" },
  { id: "mist", name: "Mist", hex: "#8EA3CF" },
  { id: "rose", name: "Rose", hex: "#F4B6C6" },
  { id: "lavender", name: "Lavender", hex: "#C8B6EF" },
  { id: "mint", name: "Mint", hex: "#A9DEC8" },
];

export const EYE_SWATCHES: readonly Swatch[] = [
  { id: "emerald", name: "Emerald", hex: "#2E9E6A" },
  { id: "amber", name: "Amber", hex: "#C27A22" },
  { id: "sky", name: "Sky", hex: "#3E8FDE" },
  { id: "hazel", name: "Hazel", hex: "#8E6B2E" },
  { id: "violet", name: "Violet", hex: "#8A5FD6" },
  { id: "onyx", name: "Onyx", hex: "#3A2C26" },
];

export const OUTFIT_SWATCHES: readonly Swatch[] = [
  { id: "marigold", name: "Marigold", hex: "#F29A1E" },
  { id: "rani", name: "Rani pink", hex: "#D61F6E" },
  { id: "royal", name: "Royal blue", hex: "#2A4BC2" },
  { id: "emerald", name: "Emerald", hex: "#0E8A5C" },
  { id: "maroon", name: "Maroon", hex: "#8E1B3A" },
  { id: "peacock", name: "Peacock", hex: "#0D7C8A" },
  { id: "purple", name: "Purple", hex: "#6A3FA6" },
];

export const DEFAULT_SPEC: StickerSpec = {
  species: "cat",
  reaction: "hi",
  look: { fur: "#F4A24C", eyes: "#2E9E6A" },
  partner: { fur: "#F7F5F2", eyes: "#3E8FDE" },
  outfit: "#D61F6E",
  glass: false,
  blush: true,
  stripes: true,
  whiskers: true,
};
