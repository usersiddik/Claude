import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findSvgProblems } from "../src/lib/assets/svg.ts";
import { mix, normalizeHex } from "../src/lib/characters/color.ts";
import { drawSticker, silhouetteOf } from "../src/lib/characters/draw.ts";
import { exportSpec, stickerSlug, stickerTitle } from "../src/lib/characters/export.ts";
import { CATEGORIES, DEFAULT_SPEC, REACTIONS } from "../src/lib/characters/options.ts";

const refsResolve = (svg: string) =>
  [...svg.matchAll(/url\(#([^)]+)\)/g)].every(([, ref]) => svg.includes(`id="${ref}"`));

describe("colour helpers", () => {
  it("normalises and mixes hex colours", () => {
    assert.equal(normalizeHex("abc"), "#AABBCC");
    assert.equal(normalizeHex("#12345g"), null);
    assert.equal(mix("#000000", "#FFFFFF", 0.5), "#808080");
  });
});

describe("reaction catalogue", () => {
  it("has unique ids, a known category for each, and every category is used", () => {
    assert.equal(new Set(REACTIONS.map((reaction) => reaction.id)).size, REACTIONS.length);
    for (const category of CATEGORIES) assert.ok(REACTIONS.some((reaction) => reaction.category === category.id), category.id);
    assert.ok(REACTIONS.length >= 25);
  });
});

describe("sticker drawing", () => {
  it("draws every reaction for every supported species as safe SVG with resolvable references", () => {
    for (const reaction of REACTIONS) {
      for (const species of reaction.species) {
        for (const glass of [false, true]) {
          const svg = drawSticker({ ...DEFAULT_SPEC, species, reaction: reaction.id, glass });
          assert.deepEqual(findSvgProblems(svg), [], `${species}/${reaction.id}`);
          assert.ok(refsResolve(svg), `${species}/${reaction.id}${glass ? "/glass" : ""}: unresolved url()`);
          assert.ok(!svg.includes("__gold__"), `${reaction.id}: placeholder left in`);
        }
      }
    }
  });

  it("falls back to cats for pair reactions", () => {
    const svg = drawSticker({ ...DEFAULT_SPEC, species: "ghost", reaction: "hug" });
    assert.ok(svg.includes(DEFAULT_SPEC.partner.fur));
  });

  it("applies colours, outfit, and toggles", () => {
    const svg = drawSticker({ ...DEFAULT_SPEC, look: { fur: "#C8B6EF", eyes: "#3E8FDE" }, whiskers: false, blush: false });
    assert.ok(svg.includes("#C8B6EF") && svg.includes("#3E8FDE"));
    assert.ok(!svg.includes('data-part="whiskers"'));
    assert.ok(!/url\(#[^)]*-blush\)/.test(svg));
    const festive = drawSticker({ ...DEFAULT_SPEC, reaction: "diwali-diya", outfit: "#0E8A5C" });
    assert.ok(/url\(#[^)]*-outfit\)/.test(festive), "outfit gradient used");
    assert.ok(festive.includes("#0E8A5C") || festive.includes("#0e8a5c") || /stop-color="#[0-9A-F]{6}"/.test(festive));
  });

  it("namespaces ids per variant", () => {
    const first = drawSticker({ ...DEFAULT_SPEC, look: { fur: "#F4A24C", eyes: "#2E9E6A" } }).match(/id="([^"]+)"/)?.[1];
    const second = drawSticker({ ...DEFAULT_SPEC, look: { fur: "#8EA3CF", eyes: "#2E9E6A" } }).match(/id="([^"]+)"/)?.[1];
    assert.notEqual(first, second);
  });

  it("portable output has no filters", () => {
    for (const reaction of ["hi", "fever", "diwali-hug"] as const) {
      assert.ok(!drawSticker({ ...DEFAULT_SPEC, reaction, portable: true }).includes("<filter"), reaction);
    }
  });

  it("silhouette drops whiskers only", () => {
    const svg = drawSticker(DEFAULT_SPEC);
    const shape = silhouetteOf(svg);
    assert.ok(!shape.includes('data-part="whiskers"'));
    assert.ok(shape.length < svg.length && shape.includes("<path"));
  });
});

describe("sticker exports", () => {
  it("titles and exports single and pair stickers", () => {
    assert.equal(stickerTitle(DEFAULT_SPEC), "Cat Hi");
    assert.equal(stickerSlug({ ...DEFAULT_SPEC, reaction: "hug" }), "cat-couple-hug");
    assert.match(exportSpec(DEFAULT_SPEC, "svg"), /<title>Cat Hi<\/title>/);
    assert.match(exportSpec({ ...DEFAULT_SPEC, reaction: "love" }, "react"), /export function CatLoveCharm/);
    const dart = exportSpec({ ...DEFAULT_SPEC, reaction: "fever" }, "flutter");
    assert.match(dart, /class CatFeverCharm extends StatelessWidget/);
    assert.ok(!dart.includes("<filter"));
  });
});
