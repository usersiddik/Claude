import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_CREATURE, drawCreature } from "../src/lib/art/creatures.ts";
import { buildUniverse, isLive } from "../src/lib/universe/index.ts";
import { buildSearchIndex, POPULAR_SEARCHES, search, terms } from "../src/lib/universe/search.ts";

const index = buildSearchIndex(buildUniverse([]).filter(isLive));
const ids = (query: string) => search(index, query).map((result) => `${result.collection.id}/${result.item.id}`);

describe("keyword search", () => {
  it("folds phrases, plurals, and slang into shared concepts", () => {
    assert.deepEqual(terms("Good morning!"), ["morning"]);
    assert.deepEqual(terms("mwah"), ["kiss"]);
    assert.deepEqual(terms("a sticker for my bunny"), ["rabbit"]);
    assert.deepEqual(terms("Thank you"), ["thanks"]);
  });

  it("finds kisses across collections, by any word for them", () => {
    const kiss = ids("kiss");
    assert.ok(kiss.includes("cats/kiss") && kiss.includes("love/cat-kiss") && kiss.includes("frogs/kiss"));
    assert.deepEqual(ids("mwah"), kiss);
    assert.deepEqual(ids("smooch"), kiss);
  });

  it("ranks the best match first and narrows with more words", () => {
    assert.equal(ids("diwali")[0]?.split("/")[0], "diwali", "the Diwali collection leads");
    assert.equal(ids("sorry")[0], "everyday/sorry");
    const catKiss = ids("cat kiss");
    assert.ok(catKiss.length > 0 && catKiss.every((id) => id.includes("cat")));
    assert.ok(ids("love").length > 20);
    assert.ok(ids("flowers").includes("love/cat-flowers"));
    assert.ok(ids("birthday").some((id) => id.endsWith("yay") || id.endsWith("congrats")));
  });

  it("returns nothing for unknown words or empty queries", () => {
    assert.deepEqual(ids("dinosaur"), []);
    assert.deepEqual(ids("   "), []);
    assert.deepEqual(ids("the a for"), []);
  });

  it("has results for every popular search", () => {
    for (const query of POPULAR_SEARCHES) assert.ok(ids(query).length > 0, query);
  });
});

describe("flowers for you", () => {
  it("draws the daisy bouquet with pleading eyes", () => {
    const svg = drawCreature({ ...DEFAULT_CREATURE, reaction: "flowers", stance: "stand", look: { fur: "#F1DCC0", eyes: "#3A2C26" } });
    assert.ok(svg.includes("#F6C232"), "daisy centres");
    assert.ok(svg.includes("#F1DCC0"));
  });
});
