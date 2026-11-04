import { seasonCover } from "../../art/seasons.ts";
import type { SoonCollection } from "../types.ts";

export const christmas: SoonCollection = {
  status: "soon",
  id: "christmas",
  title: "Christmas",
  noun: "Christmas",
  tagline: "Santa hats for everyone.",
  description: "Snowy cats, wrapped gifts, and a tree full of tiny ornaments.",
  families: ["festivals"],
  accent: "#E1EFE6",
  arrives: "December",
  preview: () => [seasonCover("christmas")],
};

export const eid: SoonCollection = {
  status: "soon",
  id: "eid",
  title: "Eid",
  noun: "Eid",
  tagline: "Moonlight and lanterns.",
  description: "Crescent moons, fanoos lanterns, and kids in their Eid best.",
  families: ["festivals"],
  accent: "#E4ECF8",
  arrives: "Spring",
  preview: () => [seasonCover("eid")],
};

export const halloween: SoonCollection = {
  status: "soon",
  id: "halloween",
  title: "Halloween",
  noun: "Halloween",
  tagline: "Boo, but make it cute.",
  description: "Pumpkins, bats, and the ghost's favourite night of the year.",
  families: ["festivals"],
  accent: "#F4E4D6",
  arrives: "October",
  preview: () => [seasonCover("halloween")],
};
