import { DEFAULT_DIWALI, DIWALI_IDS, DIWALI_SCENES, drawDiwali } from "../../art/kids.ts";
import { withCaption } from "../../art/lettering.ts";
import { LETTERS, OUTFITS, SKIN } from "../swatches.ts";
import { colorOf, flagOf, type LiveCollection, type StickerItem } from "../types.ts";

/** Lettered wishes built on a scene. */
const WISHES: Record<string, { scene: string; phrase: string; name: string }> = {
  "wish-happy-diwali": { scene: "diya-girl", phrase: "Happy Diwali", name: "Happy Diwali" },
  "wish-shubh-deepavali": { scene: "diya-trio", phrase: "Shubh Deepavali", name: "Shubh Deepavali" },
  "wish-sparkler": { scene: "sparkler-siblings", phrase: "Happy Diwali", name: "Sparkly wishes" },
};

const scenes: StickerItem[] = DIWALI_IDS.map((id) => {
  const scene = DIWALI_SCENES[id]!;
  return {
    id,
    name: scene.name,
    caption: scene.caption,
    group: scene.people ? "kids" : "decor",
    uses: scene.people ? ["outfit", "skin", "lights"] : ["outfit", "lights"],
  };
});

const wishes: StickerItem[] = Object.entries(WISHES).map(([id, wish]) => ({
  id,
  name: wish.name,
  caption: wish.phrase,
  group: "wishes",
  uses: ["outfit", "skin", "lights", "letters"],
}));

export const diwali: LiveCollection = {
  status: "live",
  id: "diwali",
  title: "Diwali",
  noun: "Diwali",
  tagline: "Diyas, sparklers, and little people.",
  description: "Kids in kurtas and lehengas lighting diyas, twirling sparklers, and sharing laddoos, plus rangoli, kandils, and lettered wishes.",
  families: ["festivals"],
  accent: "#FFE0BD",
  groups: [
    { id: "kids", name: "Kids" },
    { id: "wishes", name: "Wishes" },
    { id: "decor", name: "Decor" },
  ],
  properties: [
    { id: "outfit", kind: "color", label: "Outfit", swatches: OUTFITS, default: DEFAULT_DIWALI.outfit, custom: true },
    { id: "skin", kind: "color", label: "Skin tone", swatches: SKIN, default: DEFAULT_DIWALI.skin },
    { id: "letters", kind: "color", label: "Lettering", swatches: LETTERS, default: "#F97316" },
    { id: "lights", kind: "toggle", label: "String lights", default: true },
  ],
  items: [...scenes.filter((item) => item.group === "kids"), ...wishes, ...scenes.filter((item) => item.group === "decor")],
  cover: ["sparkler-siblings", "diya-girl", "kandil"],
  render: (item, values, options = {}) => {
    const paint = {
      outfit: colorOf(values, "outfit", DEFAULT_DIWALI.outfit),
      skin: colorOf(values, "skin", DEFAULT_DIWALI.skin),
      lights: flagOf(values, "lights", true),
      portable: options.portable,
    };
    const wish = WISHES[item.id];
    if (wish) return withCaption(drawDiwali(wish.scene, paint), wish.phrase, colorOf(values, "letters", "#F97316"));
    return drawDiwali(item.id, paint);
  },
};
