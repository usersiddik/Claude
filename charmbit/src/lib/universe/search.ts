/**
 * Keyword search across every collection. Words are folded into shared
 * concepts first, so "mwah" finds kisses, "sad" finds tears, and "birthday"
 * finds celebrations, without any service or index to host.
 */
import type { LiveCollection, StickerItem } from "./types.ts";

/** Concept → the words people use for it. The concept word itself also counts. */
const CONCEPTS: Record<string, readonly string[]> = {
  love: ["heart", "hearts", "valentine", "valentines", "romance", "romantic", "crush", "luv", "smitten", "sweetheart", "sweethearts", "adore"],
  kiss: ["mwah", "smooch", "kisses", "kissing", "xoxo"],
  hug: ["hugs", "hugging", "cuddle", "cuddles", "embrace"],
  morning: ["gm", "coffee", "tea", "breakfast", "wake", "sunrise"],
  night: ["gn", "sleep", "sleepy", "bedtime", "nap", "tired", "goodnight"],
  thanks: ["thank", "thankyou", "thx", "ty", "grateful"],
  sorry: ["apology", "apologise", "apologize"],
  cry: ["crying", "sad", "tears", "tear", "upset", "waah", "teary"],
  lol: ["laugh", "laughing", "haha", "hehe", "funny", "lmao", "rofl"],
  grumpy: ["angry", "mad", "annoyed", "hmph", "monday", "cross"],
  shocked: ["omg", "wow", "surprise", "surprised", "shock"],
  cool: ["sunglasses", "chill", "swag"],
  fever: ["sick", "ill", "unwell", "flu", "cold"],
  yay: ["celebrate", "party", "congrats", "congratulations", "birthday", "bday", "excited", "hooray"],
  hi: ["hello", "hey", "wave", "bye", "greetings", "hii"],
  shy: ["blush", "blushing", "embarrassed"],
  naughty: ["cheeky", "tease", "wink", "tongue", "oops"],
  huh: ["confused", "what", "question", "hmm"],
  flowers: ["flower", "daisy", "daisies", "rose", "roses", "tulip", "tulips", "bouquet", "floral"],
  diwali: ["deepavali", "diya", "diyas", "lamp", "festival", "lights", "sparkler", "sparklers", "rangoli", "crackers", "fireworks", "kandil", "lantern", "mithai", "laddoo"],
  miss: ["missyou", "missing"],
  couple: ["couples", "together", "partner", "bae", "pair"],
  cat: ["cats", "kitty", "kitten", "meow"],
  ghost: ["ghosts", "boo", "spooky"],
  frog: ["frogs", "toad"],
  rabbit: ["rabbits", "bunny", "bunnies"],
  giraffe: ["giraffes"],
  kids: ["kid", "child", "children", "girl", "boy", "family", "siblings", "sister", "brother"],
};

/** Multi-word phrases that mean one thing. */
const PHRASES: readonly [RegExp, string][] = [
  [/\bgood ?morning\b/g, "morning"],
  [/\bgood ?night\b/g, "night"],
  [/\bthank ?you\b/g, "thanks"],
  [/\bmiss ?you\b/g, "miss"],
  [/\bget well( soon)?\b/g, "fever"],
  [/\blove ?you\b/g, "love"],
  [/\bheart ?eyes\b/g, "smitten"],
];

/** Extra meanings for stickers, by a word in their id (e.g. a tear also says sorry). */
const TAGS: Record<string, string> = {
  tear: "sorry cry",
  crying: "sorry cry",
  missyou: "miss love",
  smitten: "love crush",
  hug: "love couple",
  cheek: "love couple",
  shoulder: "love couple",
  thanks: "grateful",
  fever: "sick",
  flowers: "love flowers",
  night: "sleep",
  morning: "coffee",
};

const STOP = new Set(["a", "an", "the", "for", "you", "my", "me", "i", "to", "with", "and", "of", "in", "on", "is", "it", "that", "says", "saying", "sticker", "stickers", "some", "please", "good", "soon", "your", "us"]);

const CANONICAL = new Map<string, string>();
for (const [concept, words] of Object.entries(CONCEPTS)) {
  CANONICAL.set(concept, concept);
  for (const word of words) CANONICAL.set(word, concept);
}

/** Lowercase words with phrases folded and plurals of known concepts mapped. */
export function terms(text: string): string[] {
  let value = text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  for (const [pattern, concept] of PHRASES) value = value.replace(pattern, ` ${concept} `);
  return value
    .split(/[^a-z0-9]+/)
    .filter((word) => word && !STOP.has(word))
    .map((word) => CANONICAL.get(word) ?? word);
}

interface Entry {
  collection: LiveCollection;
  item: StickerItem;
  /** Weighted field terms: name 6, tags 5, caption and id 4, group and collection 2. */
  fields: readonly (readonly [number, readonly string[]])[];
  /** The collection's own words: a match here ranks its stickers first. */
  home: readonly string[];
}

export interface SearchIndex {
  entries: readonly Entry[];
}

export interface SearchResult {
  collection: LiveCollection;
  item: StickerItem;
  score: number;
}

export function buildSearchIndex(collections: readonly LiveCollection[]): SearchIndex {
  const entries: Entry[] = [];
  for (const collection of collections) {
    const groups = new Map(collection.groups.map((group) => [group.id, group.name]));
    const collectionTerms = terms(`${collection.title} ${collection.noun}`);
    for (const item of collection.items) {
      // Stickers without artwork yet are not findable: a search should never lead to a placeholder.
      if (item.image?.pending) continue;
      const idWords = item.id.split("-");
      const tags = `${idWords.map((word) => TAGS[word] ?? "").join(" ")} ${item.tags ?? ""}`;
      entries.push({
        collection,
        item,
        fields: [
          [6, terms(item.name)],
          [5, terms(tags)],
          [4, terms(`${item.caption} ${idWords.join(" ")}`)],
          [2, [...terms(groups.get(item.group) ?? ""), ...collectionTerms]],
        ],
        home: collectionTerms,
      });
    }
  }
  return { entries };
}

/** How well one query term matches a field term: exact, or a prefix of a longer word. */
function match(query: string, word: string): number {
  if (query === word) return 1;
  if (query.length >= 3 && word.startsWith(query)) return 0.6;
  return 0;
}

/** Stickers matching every term of the query, best first. */
export function search(index: SearchIndex, query: string, limit = 60): SearchResult[] {
  const wanted = [...new Set(terms(query))];
  if (wanted.length === 0) return [];
  const results: SearchResult[] = [];
  for (const entry of index.entries) {
    let score = 0;
    let matchedAll = true;
    for (const term of wanted) {
      let best = 0;
      for (const [weight, words] of entry.fields) {
        for (const word of words) best = Math.max(best, weight * match(term, word));
      }
      if (best === 0) {
        matchedAll = false;
        break;
      }
      score += best + (entry.home.some((word) => match(term, word) > 0) ? 1 : 0);
    }
    if (matchedAll) results.push({ collection: entry.collection, item: entry.item, score });
  }
  // Stable sort keeps collection and item order among equal scores.
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Popular searches, shown as chips. */
export const POPULAR_SEARCHES = ["love", "kiss", "hug", "good morning", "flowers", "diwali", "sorry", "lol", "thanks", "cool", "angry", "sleepy"] as const;

/** The popular searches that find something in these collections, so no chip leads to an empty page. */
export function popularSearches(index: SearchIndex, limit = 8): string[] {
  return POPULAR_SEARCHES.filter((query) => search(index, query, 1).length > 0).slice(0, limit);
}
