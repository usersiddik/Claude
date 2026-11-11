import type { PackDefinition } from "./types.ts";

/**
 * Sheru: a white lion who dresses in white and wears gold. Our own character,
 * built around one fixed identity so every sticker is recognisably him.
 * The first 16 stickers; add more to `stickers` as the pack grows.
 */
export const sheru: PackDefinition = {
  id: "sheru",
  title: "Sheru",
  noun: "Sheru",
  tagline: "The boss. Always in white, always in gold.",
  description: "A white lion with expensive taste and a soft heart. Sixteen moods, from boss mode to burnt dinner.",
  families: ["characters"],
  accent: "#E9D9A6",
  identity:
    "an anthropomorphic white lion with a broad, calm face, warm amber eyes, a soft pink-brown nose, a small notch in the tip of his left ear, and a full, thick pure white mane swept back from his forehead that falls to his shoulders. He has a tall, broad-shouldered human build with white-furred hands. He always wears a thick gold chain with a round gold locket engraved with the letter S, and a gold wristwatch on his left wrist.",
  looks: [
    { id: "white", name: "White suit", swatch: "#F4F1EA", wardrobe: "an immaculate tailored white suit with fine gold embroidery on the lapels, a white waistcoat and white trousers" },
    { id: "black", name: "Black suit", swatch: "#1F1D1B", wardrobe: "an immaculate tailored black suit with fine gold embroidery on the lapels, a black waistcoat and black trousers" },
    { id: "kurta", name: "White kurta", swatch: "#D9C48A", wardrobe: "a crisp white silk kurta with gold buttons and a cream shawl over one shoulder" },
  ],
  groups: [
    { id: "boss", name: "Boss mode" },
    { id: "life", name: "Coffee & life" },
    { id: "feels", name: "Reactions" },
    { id: "oops", name: "Funny" },
  ],
  cover: ["boss-walk", "shades", "coffee"],
  stickers: [
    { id: "boss-walk", name: "Boss walk", caption: "Make way.", group: "boss", tags: "entrance walk confident swag attitude arrive", scene: "full body, striding straight toward the camera mid-step, one hand adjusting his jacket button, chin slightly raised, calm unbothered expression" },
    { id: "shades", name: "Shades on", caption: "Not my problem.", group: "boss", tags: "cool sunglasses attitude unbothered chill", scene: "waist up, wearing black sunglasses, arms crossed over his chest, a small one-sided smirk" },
    { id: "watch", name: "Checking the time", caption: "You're late.", group: "boss", tags: "watch late time waiting hurry", scene: "waist up, left wrist raised, tapping his gold watch with one finger, one eyebrow raised, looking straight at the viewer" },
    { id: "side-eye", name: "Side-eye", caption: "Really?", group: "boss", tags: "side eye judging really seriously sarcastic doubt", scene: "close-up of head and shoulders, head turned away while his eyes slide sideways toward the viewer, one brow lifted, mouth flat and unimpressed" },
    { id: "coffee", name: "Morning coffee", caption: "First, coffee.", group: "life", tags: "morning coffee gm good morning espresso chai tea", scene: "waist up, holding a small white espresso cup with a gold rim near his mouth, eyes half closed with contentment, a little steam rising from the cup" },
    { id: "laptop", name: "Working", caption: "Busy. Call later.", group: "life", tags: "work busy laptop office meeting later", scene: "seated, waist up, typing on a slim gold laptop, focused expression, reading glasses low on his nose" },
    { id: "headphones", name: "Vibing", caption: "Do not disturb.", group: "life", tags: "music headphones vibe chill song relax", scene: "waist up, large white-and-gold headphones over his mane, eyes closed, head tilted, a relaxed smile, one hand on the headphone cup" },
    { id: "lol", name: "Laughing", caption: "I can't. Stop.", group: "feels", tags: "lol laugh haha funny lmao hilarious", scene: "waist up, head thrown back roaring with laughter, mouth wide open, eyes squeezed shut, one hand on his chest" },
    { id: "cry", name: "Dramatic tears", caption: "Why me.", group: "feels", tags: "cry sad tears crying upset drama sorry", scene: "waist up, crying dramatically, big tears streaming down his cheeks, lower lip trembling, dabbing one eye with a white silk handkerchief" },
    { id: "shy", name: "Shy", caption: "Stop it, you.", group: "feels", tags: "shy blush embarrassed aww flattered", scene: "waist up, looking down and away with a bashful smile, one hand rubbing the back of his neck, a soft pink blush on his cheeks" },
    { id: "angry", name: "Not happy", caption: "Say that again.", group: "feels", tags: "angry mad annoyed furious grr", scene: "waist up, brows pulled down hard, jaw clenched, nostrils flared, glaring at the viewer, both fists clenched at his sides" },
    { id: "thanks", name: "Thank you", caption: "Much appreciated.", group: "feels", tags: "thanks thank you grateful namaste respect appreciate", scene: "waist up, right hand placed flat over his heart, head bowed slightly, eyes closed, a warm grateful smile" },
    { id: "win", name: "We did it", caption: "Told you.", group: "feels", tags: "yay win celebrate success party congrats proud", scene: "waist up, both fists raised high above his head in victory, huge open-mouthed grin, eyes bright" },
    { id: "sleepy", name: "Sleepy", caption: "Five more minutes.", group: "oops", tags: "sleepy tired night gn good night yawn bed messy morning", scene: "waist up, just woken up, mane wild and tangled on one side, eyes barely open, mid-yawn, wearing a white silk dressing gown instead of his usual outfit, still wearing the gold chain" },
    { id: "broke", name: "Empty wallet", caption: "Month end.", group: "oops", tags: "broke wallet money empty salary month end poor", scene: "waist up, holding an open brown leather wallet upside down with nothing falling out, staring into it with wide shocked eyes and a small open mouth" },
    { id: "kitten", name: "Tiny friend", caption: "Fine. You can stay.", group: "oops", tags: "kitten cute love aww baby soft hug affection", scene: "waist up, cradling a tiny fluffy white kitten in both hands against his chest, looking down at it with soft melting eyes and a gentle smile" },
  ],
};
