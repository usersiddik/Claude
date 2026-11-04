import { SKIN_TONES } from "../art/kids.ts";
import { LETTER_COLORS } from "../art/lettering.ts";
import { FILL_OPTIONS, INK_OPTIONS } from "../customize.ts";
import type { Swatch } from "./types.ts";

export const CAT_FUR: readonly Swatch[] = [
  { id: "ginger", name: "Ginger", hex: "#F4A24C" },
  { id: "cream", name: "Cream", hex: "#F1DCC0" },
  { id: "snow", name: "Snow", hex: "#F7F5F2" },
  { id: "silver", name: "Silver", hex: "#C2C7D2" },
  { id: "charcoal", name: "Charcoal", hex: "#5A5B66" },
  { id: "midnight", name: "Midnight", hex: "#2B2C38" },
  { id: "gold", name: "Gold", hex: "#F4C14E" },
  { id: "mist", name: "Mist", hex: "#8EA3CF" },
  { id: "rose", name: "Rose", hex: "#F4B6C6" },
  { id: "lavender", name: "Lavender", hex: "#C8B6EF" },
  { id: "mint", name: "Mint", hex: "#A9DEC8" },
];

export const GHOST_BODY: readonly Swatch[] = [
  { id: "snow", name: "Snow", hex: "#F7F5F2" },
  { id: "mist", name: "Mist", hex: "#C9D6F2" },
  { id: "lavender", name: "Lavender", hex: "#D9CCF5" },
  { id: "mint", name: "Mint", hex: "#C6EBDD" },
  { id: "rose", name: "Rose", hex: "#F8CCD8" },
  { id: "butter", name: "Butter", hex: "#FBE7A6" },
  { id: "charcoal", name: "Charcoal", hex: "#5A5B66" },
];

export const FROG_SKIN: readonly Swatch[] = [
  { id: "leaf", name: "Leaf", hex: "#86C25A" },
  { id: "lime", name: "Lime", hex: "#B9D94A" },
  { id: "teal", name: "Teal", hex: "#45B8A6" },
  { id: "sky", name: "Sky", hex: "#7BB2EC" },
  { id: "pink", name: "Pink", hex: "#F49AC1" },
  { id: "gold", name: "Gold", hex: "#F4C14E" },
  { id: "lavender", name: "Lavender", hex: "#B9A4EC" },
];

export const RABBIT_FUR: readonly Swatch[] = [
  { id: "oat", name: "Oat", hex: "#EADCCB" },
  { id: "snow", name: "Snow", hex: "#F7F5F2" },
  { id: "cocoa", name: "Cocoa", hex: "#B08462" },
  { id: "grey", name: "Grey", hex: "#B9BAC6" },
  { id: "peach", name: "Peach", hex: "#F6C7A8" },
  { id: "lavender", name: "Lavender", hex: "#D3C4F2" },
  { id: "charcoal", name: "Charcoal", hex: "#5A5B66" },
];

export const GIRAFFE_COAT: readonly Swatch[] = [
  { id: "gold", name: "Gold", hex: "#F2B84B" },
  { id: "honey", name: "Honey", hex: "#E79B47" },
  { id: "pink", name: "Pink", hex: "#F4B6C6" },
  { id: "mint", name: "Mint", hex: "#A9DEC8" },
  { id: "lavender", name: "Lavender", hex: "#C8B6EF" },
  { id: "sky", name: "Sky", hex: "#9CC8F2" },
];

export const EYES: readonly Swatch[] = [
  { id: "emerald", name: "Emerald", hex: "#2E9E6A" },
  { id: "amber", name: "Amber", hex: "#C27A22" },
  { id: "sky", name: "Sky", hex: "#3E8FDE" },
  { id: "hazel", name: "Hazel", hex: "#8E6B2E" },
  { id: "violet", name: "Violet", hex: "#8A5FD6" },
  { id: "onyx", name: "Onyx", hex: "#3A2C26" },
];

export const OUTFITS: readonly Swatch[] = [
  { id: "rani", name: "Rani pink", hex: "#D61F6E" },
  { id: "marigold", name: "Marigold", hex: "#F29A1E" },
  { id: "royal", name: "Royal blue", hex: "#2A4BC2" },
  { id: "emerald", name: "Emerald", hex: "#0E8A5C" },
  { id: "maroon", name: "Maroon", hex: "#8E1B3A" },
  { id: "peacock", name: "Peacock", hex: "#0D7C8A" },
  { id: "purple", name: "Purple", hex: "#6A3FA6" },
];

export const HEARTS: readonly Swatch[] = [
  { id: "red", name: "Red", hex: "#E4183F" },
  { id: "pink", name: "Pink", hex: "#F06CA8" },
  { id: "coral", name: "Coral", hex: "#FF6B5B" },
  { id: "berry", name: "Berry", hex: "#B0124F" },
  { id: "violet", name: "Violet", hex: "#8A5FD6" },
  { id: "gold", name: "Gold", hex: "#E8A61C" },
];

export const FLOWERS: readonly Swatch[] = [
  { id: "red", name: "Red", hex: "#E8264F" },
  { id: "pink", name: "Pink", hex: "#F48FB1" },
  { id: "peach", name: "Peach", hex: "#FF9E7A" },
  { id: "sun", name: "Sunflower", hex: "#FFC93C" },
  { id: "white", name: "White", hex: "#F2EEE6" },
  { id: "lilac", name: "Lilac", hex: "#B79CEB" },
];

export const SKIN: readonly Swatch[] = SKIN_TONES;
export const LETTERS: readonly Swatch[] = LETTER_COLORS;
export const FILLS: readonly Swatch[] = FILL_OPTIONS;
export const INKS: readonly Swatch[] = INK_OPTIONS;
