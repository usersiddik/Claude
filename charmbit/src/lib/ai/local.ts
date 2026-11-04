/**
 * Quick mode: a keyword designer used when Claude isn't configured or is
 * unavailable. It understands characters, moods, Diwali, love, colours,
 * quoted words, names, and simple refinements, so the maker always answers.
 */
import { DEFAULT_CREATURE, DEFAULT_LOOKS, findReaction, type ReactionId, type Species } from "../art/creatures.ts";
import { DEFAULT_DIWALI } from "../art/kids.ts";
import { DEFAULT_LOVE } from "../art/love.ts";
import { cleanCaption, sanitizeDesign, type CreatureDesign, type Design, type DesignReply, type KidsDesign, type LoveDesign } from "./design.ts";

const COLORS: readonly [RegExp, { fur: string; accent: string; name: string }][] = [
  [/\b(pink|rose)\b/, { fur: "#F4B6C6", accent: "#F06CA8", name: "pink" }],
  [/\b(purple|lavender|violet|lilac)\b/, { fur: "#C8B6EF", accent: "#8A5FD6", name: "lavender" }],
  [/\b(blue|sky|navy)\b/, { fur: "#9CC8F2", accent: "#2A4BC2", name: "blue" }],
  [/\b(green|mint)\b/, { fur: "#A9DEC8", accent: "#0E8A5C", name: "mint" }],
  [/\b(red|crimson)\b/, { fur: "#F4A24C", accent: "#E4183F", name: "red" }],
  [/\b(yellow|gold|golden)\b/, { fur: "#F4C14E", accent: "#E8A61C", name: "gold" }],
  [/\b(white|snow)\b/, { fur: "#F7F5F2", accent: "#E4183F", name: "white" }],
  [/\b(black|midnight|dark)\b/, { fur: "#2B2C38", accent: "#8E1B3A", name: "midnight" }],
  [/\b(grey|gray|silver)\b/, { fur: "#C2C7D2", accent: "#5A5B66", name: "grey" }],
  [/\b(orange|ginger)\b/, { fur: "#F4A24C", accent: "#F29A1E", name: "orange" }],
  [/\b(brown|cocoa|chocolate)\b/, { fur: "#B08462", accent: "#8E1B3A", name: "cocoa" }],
];

const SPECIES: readonly [RegExp, Species][] = [
  [/\b(cat|cats|kitty|kitten|meow)\b/, "cat"],
  [/\b(ghost|ghosts|boo|spooky)\b/, "ghost"],
  [/\b(frog|frogs|toad)\b/, "frog"],
  [/\b(rabbit|rabbits|bunny|bunnies)\b/, "rabbit"],
  [/\b(giraffe|giraffes)\b/, "giraffe"],
];

const MOODS: readonly [RegExp, ReactionId, string][] = [
  [/\b(hug|hugs|hugging|cuddle|cuddles)\b/, "hug", "Hugs"],
  [/\b(couple|together|us|partner|bae|husband|wife|boyfriend|girlfriend)\b/, "cheek", "Us"],
  [/\b(heart ?eyes|smitten|crush|in love)\b/, "smitten", "Smitten"],
  [/\b(kiss|mwah)\b/, "kiss", "Mwah"],
  [/\b(miss you|missing)\b/, "missyou", "Miss you"],
  [/\b(love|heart|valentine)\b/, "love", "Love you"],
  [/\b(morning|coffee|tea|wake)\b/, "morning", "Good morning"],
  [/\b(night|sleep|sleepy|tired|bed)\b/, "night", "Good night"],
  [/\b(thank|thanks|grateful)\b/, "thanks", "Thank you"],
  [/\b(sick|fever|ill|unwell|get well)\b/, "fever", "Get well soon"],
  [/\b(lol|laugh|haha|funny|lmao)\b/, "lol", "LOL"],
  [/\b(cry|crying|sad|upset)\b/, "crying", "Sorry"],
  [/\b(sorry|tear|hurt)\b/, "tear", "Sorry"],
  [/\b(angry|grumpy|mad|annoyed|monday|hmph)\b/, "grumpy", "Hmph"],
  [/\b(shy|blush|blushing|cute)\b/, "shy", "Hehe"],
  [/\b(wow|omg|shock|shocked|surprised)\b/, "shocked", "OMG"],
  [/\b(cool|chill|sunglasses|boss)\b/, "cool", "Cool"],
  [/\b(yay|party|celebrate|congrats|birthday|excited|happy)\b/, "yay", "Yay!"],
  [/\b(naughty|cheeky|oops|tease)\b/, "naughty", "Hehe"],
  [/\b(what|confused|huh|why)\b/, "huh", "Huh?"],
  [/\b(hi|hello|hey|bye|wave)\b/, "hi", "Hi!"],
];

const DIWALI: readonly [RegExp, string][] = [
  [/\b(family|parents|mom|dad|mother|father)\b/, "family"],
  [/\b(siblings?|brother|sister|bhai|didi)\b/, "sparkler-siblings"],
  [/\b(rangoli)\b/, "rangoli-girl"],
  [/\b(lantern|kandil)\b/, "lantern-girl"],
  [/\b(sweets?|laddoo|ladoo|mithai)\b/, "laddoo-boy"],
  [/\b(gift|present)\b/, "gift-boy"],
  [/\b(aarti|puja|pooja|prayer)\b/, "aarti-girl"],
  [/\b(namaste|greet)\b/, "namaste-girl"],
  [/\b(firework|fireworks|cracker|crackers|anar|rocket)\b/, "anar-boy"],
  [/\b(sparkler|sparklers|phuljhadi)\b/, "sparkler-boy"],
  [/\b(diya|diyas|lamp|light)\b/, "diya-girl"],
];

const LOVE: readonly [RegExp, string][] = [
  [/\b(rose|roses)\b/, "rose"],
  [/\b(tulip|tulips)\b/, "tulip"],
  [/\b(bouquet|flowers)\b/, "bouquet"],
  [/\b(daisy|sunflower|flower)\b/, "daisy"],
  [/\b(balloon)\b/, "balloon"],
  [/\b(letter|note)\b/, "love-letter"],
  [/\b(chocolate|chocolates)\b/, "chocolates"],
  [/\b(lollipop|candy|sweet)\b/, "lollipop"],
  [/\b(angel|wings)\b/, "winged"],
  [/\b(arrow|cupid)\b/, "arrow"],
  [/\b(broken|mended|heal)\b/, "mended-heart"],
];

const find = <T>(text: string, table: readonly (readonly [RegExp, T, ...unknown[]])[]): T | undefined => table.find(([pattern]) => pattern.test(text))?.[1];

/** Words to letter: quoted text, "saying …", or a name after "for". */
function captionFrom(prompt: string): string {
  const quoted = prompt.match(/["“'‘]([^"”'’]{1,40})["”'’]/)?.[1];
  if (quoted) return cleanCaption(quoted);
  const saying = prompt.match(/\b(?:saying|says|that says|with the words|text)\s+(.{1,40})$/i)?.[1];
  if (saying) return cleanCaption(saying.replace(/^./, (char) => char.toUpperCase()));
  return "";
}

function nameFrom(prompt: string): string {
  const match = prompt.match(/\bfor (?:my )?(?:\w+ )?([A-Z][a-z]{1,14})\b/);
  return match?.[1] ?? "";
}

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function creature(species: Species, reaction: ReactionId, extra: Partial<CreatureDesign> = {}): CreatureDesign {
  const look = DEFAULT_LOOKS[species];
  const info = findReaction(reaction);
  return {
    kind: "creature",
    title: `${capitalise(species)} ${info.name.toLowerCase()}`,
    species,
    reaction,
    stance: "sit",
    fur: look.fur,
    eyes: look.eyes,
    heart: "#E4183F",
    outfit: DEFAULT_CREATURE.outfit,
    partner: DEFAULT_CREATURE.partner.fur,
    blush: true,
    pattern: true,
    whiskers: true,
    glass: false,
    caption: "",
    captionColor: "#E8175D",
    ...extra,
  };
}

const PHRASES: Partial<Record<ReactionId, string>> = { hi: "Hi!", morning: "Good morning", night: "Good night", thanks: "Thank you", huh: "Huh?", smile: "Hehe", yay: "Yay!", naughty: "Oops!", lol: "LOL", tear: "Sorry", crying: "Sorry", shy: "Stop it", shocked: "OMG", grumpy: "Hmph", cool: "Cool", fever: "Get well soon", love: "Love you", kiss: "Mwah", missyou: "Miss you", smitten: "Smitten", hug: "Hugs", cheek: "Us", shoulder: "My person" };

const phraseFor = (design: Design) => (design.kind === "creature" ? (PHRASES[design.reaction] ?? "Hi!") : design.kind === "kids" ? "Happy Diwali" : "Love you");

/** Applies colour, stance, caption, or mood changes to earlier designs. */
function refine(prompt: string, previous: readonly Design[]): Design[] | null {
  const text = prompt.toLowerCase();
  const recolour = /\b(another|different|new|other) colou?r\b/.test(text);
  const tone = find(text, COLORS) ?? (recolour ? COLORS[(previous.length + text.length + Math.floor(Math.random() * COLORS.length)) % COLORS.length]![1] : undefined);
  const stand = /\bstand(ing)?\b/.test(text);
  const sit = /\bsit(ting)?\b/.test(text);
  const addCaption = /\badd (a |some )?(caption|text|words|name)\b/.test(text);
  const caption = captionFrom(prompt) || (/\b(name|caption|text|words)\b/.test(text) ? nameFrom(prompt) : "");
  const noCaption = /\b(no|remove|without) (caption|text|words)\b/.test(text);
  const cuter = /\bcuter|more cute|adorable\b/.test(text);
  const newSubject = find(text, SPECIES) || /\bdiwali\b/.test(text) || find(text, LOVE);
  if (newSubject || (!tone && !stand && !sit && !caption && !noCaption && !addCaption && !cuter)) return null;
  return previous.slice(0, 3).map((design, index) => {
    const next: Design = { ...design };
    if (tone) {
      if (next.kind === "creature") next.fur = tone.fur;
      if (next.kind === "kids") next.outfit = tone.accent;
      if (next.kind === "love") next.heart = next.flower = tone.accent;
    }
    if (next.kind === "creature" && next.species === "cat" && (stand || sit) && findReaction(next.reaction).stands) next.stance = stand ? "stand" : "sit";
    if (cuter) {
      if (next.kind === "creature") {
        next.blush = true;
        if (!findReaction(next.reaction).pair) next.reaction = (["shy", "smitten", "love"] as const)[index % 3]!;
      }
      if (next.kind === "love") next.scene = (["heart-face", "shy-heart", "daisy"] as const)[index % 3]!;
    }
    if (caption) next.caption = caption;
    else if (addCaption && !next.caption) next.caption = phraseFor(next);
    if (noCaption) next.caption = "";
    return next;
  });
}

/** Every design passes the same checks as Claude's (species and moods that go together). */
export function composeLocally(prompt: string, previous: readonly Design[] = []): DesignReply {
  const result = compose(prompt, previous);
  return { reply: result.reply, designs: result.designs.map(sanitizeDesign).filter((design): design is Design => design !== null) };
}

function compose(prompt: string, previous: readonly Design[]): DesignReply {
  const text = prompt.toLowerCase();
  const refined = previous.length > 0 ? refine(prompt, previous) : null;
  if (refined) return { reply: "Updated. Here it is with your changes.", designs: refined };
  if (previous.length > 0 && /\b(something|anything) (else|different)|surprise me\b/.test(text)) {
    const first = previous[0]!;
    const reaction: ReactionId = first.kind === "creature" ? alternate(first.reaction) : "smitten";
    const cast: Species[] = (["frog", "giraffe", "rabbit", "ghost", "cat"] as const).filter((who) => !(first.kind === "creature" && who === first.species)).slice(0, 3);
    return { reply: "Here's a fresh direction.", designs: cast.map((who) => creature(findReaction(reaction).species.includes(who) ? who : "cat", reaction)) };
  }

  const tone = find(text, COLORS);
  const caption = captionFrom(prompt);
  const name = nameFrom(prompt);

  if (/\b(diwali|deepavali|diya|rangoli|kandil|festival of lights)\b/.test(text)) {
    const first = find(text, DIWALI) ?? "diya-girl";
    const scenes = [first, ...["sparkler-siblings", "diya-girl", "family", "diya-trio"].filter((scene) => scene !== first)].slice(0, 3);
    const wish = caption || (name ? `Happy Diwali ${name}` : "");
    const designs: KidsDesign[] = scenes.map((scene, index) => ({
      kind: "kids",
      title: index === 0 ? "Diwali wishes" : "Festival of lights",
      scene,
      outfit: tone?.accent ?? DEFAULT_DIWALI.outfit,
      skin: DEFAULT_DIWALI.skin,
      lights: true,
      caption: cleanCaption(index === 0 ? wish || "Happy Diwali" : index === 1 ? wish : ""),
      captionColor: "#F97316",
    }));
    return { reply: "Three Diwali stickers, lights included.", designs };
  }

  const loveScene = find(text, LOVE);
  if (loveScene || (/\b(heart|valentine)\b/.test(text) && !find(text, SPECIES))) {
    const scenes = [loveScene ?? "glossy-heart", ...["heart-face", "rose", "two-hearts"].filter((scene) => scene !== loveScene)].slice(0, 3);
    const designs: LoveDesign[] = scenes.map((scene, index) => ({
      kind: "love",
      title: index === 0 ? "Love note" : "Little love",
      scene,
      heart: tone?.accent ?? DEFAULT_LOVE.heart,
      flower: tone?.accent ?? DEFAULT_LOVE.flower,
      caption: index === 0 ? caption || (name ? `Love you ${name}` : "") : "",
      captionColor: "#E8175D",
    }));
    return { reply: "Made with love. Pick your favourite.", designs };
  }

  const species = find(text, SPECIES);
  const mood = MOODS.find(([pattern]) => pattern.test(text));
  const reaction: ReactionId = mood?.[1] ?? "smile";
  const words = caption || (name ? `${mood?.[2] ?? "Hi"} ${name}` : "");
  const cast: Species[] = species ? [species, species, species === "cat" ? "rabbit" : "cat"] : ["cat", "frog", "rabbit"];
  const fur = (who: Species) => (tone ? tone.fur : DEFAULT_LOOKS[who].fur);
  if (findReaction(reaction).pair) {
    const couples: ReactionId[] = [reaction, ...(["hug", "cheek", "shoulder"] as const).filter((id) => id !== reaction)];
    const designs = couples.map((id, index) =>
      creature("cat", id, { fur: fur("cat"), heart: tone?.accent ?? "#E4183F", caption: cleanCaption(index === 0 ? words : ""), captionColor: "#E8175D", title: `Cat couple ${findReaction(id).name.toLowerCase()}` }),
    );
    return { reply: "Two cats, one heart. Three ways to say it.", designs };
  }
  const designs: CreatureDesign[] = cast.map((actor, index) => {
    // A ghost can't do every mood: fall back to a cat for that design.
    const who: Species = findReaction(reaction).species.includes(actor) ? actor : "cat";
    const standing = index === 1 && who === "cat" && findReaction(reaction).stands;
    return creature(who, index === 1 && !standing ? alternate(reaction) : reaction, {
      fur: fur(who),
      heart: tone?.accent ?? "#E4183F",
      stance: standing ? "stand" : "sit",
      caption: cleanCaption(index === 0 ? words : index === 2 ? words || (mood?.[2] ?? "") : ""),
      captionColor: index === 2 ? "#2563EB" : "#E8175D",
    });
  });
  return { reply: species || mood ? "Here are three takes on that." : "Here are a few to start with. Tell me a mood, a character, or the words you want.", designs };
}

/** A close cousin of a mood, for variety. */
function alternate(reaction: ReactionId): ReactionId {
  const pairs: Partial<Record<ReactionId, ReactionId>> = { love: "smitten", smitten: "love", morning: "hi", night: "smile", thanks: "yay", lol: "naughty", crying: "tear", tear: "missyou", grumpy: "shocked", shy: "love", cool: "naughty", yay: "thanks", hi: "smile", smile: "yay", huh: "shocked", fever: "tear", kiss: "smitten", missyou: "love" };
  return pairs[reaction] ?? "smile";
}
