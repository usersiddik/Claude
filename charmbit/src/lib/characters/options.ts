/** Everything a person can customise in the Studio. */

export type Species = "cat" | "ghost";
export type ReactionId = "happy" | "love" | "sad" | "blush" | "wow" | "sleepy";
export type Pose = "snuggle" | "cheek";

export interface Look {
  /** Main fur/body colour. Shading is derived from it. */
  fur: string;
  eyes: string;
}

export interface CharacterOptions extends Look {
  species: Species;
  reaction: ReactionId;
  glass: boolean;
  blush: boolean;
  stripes: boolean;
  whiskers: boolean;
  /** Filter-free output (no blur or texture) for renderers like flutter_svg. */
  portable?: boolean;
}

export interface CoupleOptions {
  a: Look;
  b: Look;
  pose: Pose;
  reaction: ReactionId;
  glass: boolean;
  blush: boolean;
  stripes: boolean;
  whiskers: boolean;
  heart: boolean;
  portable?: boolean;
}

export interface Swatch {
  id: string;
  name: string;
  hex: string;
}

export const FUR_SWATCHES: readonly Swatch[] = [
  { id: "cream", name: "Cream", hex: "#EED6B8" },
  { id: "ginger", name: "Ginger", hex: "#F2A04A" },
  { id: "snow", name: "Snow", hex: "#F6F3EF" },
  { id: "silver", name: "Silver", hex: "#C3C8D3" },
  { id: "charcoal", name: "Charcoal", hex: "#55555F" },
  { id: "gold", name: "Gold", hex: "#F3C04B" },
  { id: "mist", name: "Mist", hex: "#7F96C6" },
  { id: "rose", name: "Rose", hex: "#F3B2C3" },
  { id: "lavender", name: "Lavender", hex: "#C6B3EE" },
  { id: "mint", name: "Mint", hex: "#A6DCC5" },
  { id: "midnight", name: "Midnight", hex: "#2A2C40" },
];

export const EYE_SWATCHES: readonly Swatch[] = [
  { id: "amber", name: "Amber", hex: "#B9772A" },
  { id: "hazel", name: "Hazel", hex: "#8C6B2F" },
  { id: "emerald", name: "Emerald", hex: "#2F9A68" },
  { id: "sky", name: "Sky", hex: "#3F8DDB" },
  { id: "violet", name: "Violet", hex: "#8A5FD6" },
  { id: "onyx", name: "Onyx", hex: "#3A2C26" },
];

export const REACTIONS: readonly { id: ReactionId; name: string; caption: string }[] = [
  { id: "happy", name: "Happy", caption: "Hiii!" },
  { id: "love", name: "Love", caption: "Love you" },
  { id: "blush", name: "Blush", caption: "Stop it, you" },
  { id: "sad", name: "Sad", caption: "Miss you…" },
  { id: "wow", name: "Wow", caption: "No way!" },
  { id: "sleepy", name: "Sleepy", caption: "Night night" },
];

export const DEFAULT_CHARACTER: CharacterOptions = {
  species: "cat",
  reaction: "love",
  fur: "#EED6B8",
  eyes: "#B9772A",
  glass: true,
  blush: true,
  stripes: true,
  whiskers: true,
};
