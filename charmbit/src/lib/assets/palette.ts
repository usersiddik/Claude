import type { PaletteKey } from "./types.ts";

export interface Swatch {
  name: string;
  hex: string;
}

/** The shared artwork palette. Keep in sync with tokens in `globals.css`. */
export const PALETTE: Record<PaletteKey, Swatch> = {
  ink: { name: "Ink", hex: "#1C1B22" },
  cream: { name: "Cream", hex: "#FBF4E6" },
  stone: { name: "Stone", hex: "#E6DCCB" },
  butter: { name: "Butter", hex: "#F6D673" },
  lilac: { name: "Lilac", hex: "#BDB0E3" },
  mint: { name: "Mint", hex: "#BFE6D2" },
  coral: { name: "Coral", hex: "#F4A28C" },
  white: { name: "White", hex: "#FFFFFF" },
};
