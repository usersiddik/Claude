import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadAssets } from "../src/lib/assets/load.ts";
import { buildArchive, buildUniverse, isLive, stickerSrc } from "../src/lib/universe/index.ts";
import { buildPack, masterPrompt, PACKS, stickerPrompt } from "../src/lib/universe/packs/index.ts";
import { buildSearchIndex, search } from "../src/lib/universe/search.ts";

const sheru = PACKS.find((pack) => pack.id === "sheru")!;

describe("image packs", () => {
  it("every pack definition is well formed", () => {
    for (const pack of PACKS) {
      const ids = pack.stickers.map((sticker) => sticker.id);
      assert.equal(new Set(ids).size, ids.length, `${pack.id}: duplicate sticker ids`);
      assert.ok(pack.looks.length > 0);
      for (const sticker of pack.stickers) {
        assert.match(sticker.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
        assert.ok(pack.groups.some((group) => group.id === sticker.group), `${pack.id}/${sticker.id}: unknown group`);
        assert.ok(sticker.scene.length > 20 && sticker.name && sticker.caption);
      }
      for (const id of pack.cover) assert.ok(ids.includes(id), `${pack.id}: cover ${id}`);
    }
  });

  it("starts with 16 distinct Sheru stickers", () => {
    assert.equal(sheru.stickers.length, 16);
    assert.equal(new Set(sheru.stickers.map((sticker) => sticker.scene)).size, 16);
  });

  it("a pack with no files is not shown", () => {
    assert.equal(buildPack(sheru, []), null);
  });

  it("only stickers with a default-look file appear, with their other looks", () => {
    const pack = buildPack(sheru, ["coffee.webp", "coffee.black.webp", "shades.png", "lol.black.webp", "notes.txt"])!;
    assert.deepEqual(pack.items.map((item) => item.id), ["shades", "coffee"]);
    const coffee = pack.items.find((item) => item.id === "coffee")!;
    assert.equal(coffee.image?.src, "/packs/sheru/coffee.webp");
    assert.deepEqual(coffee.image?.variants.map((variant) => variant.id), ["white", "black"]);
    assert.deepEqual(pack.items.find((item) => item.id === "shades")!.image?.variants, []);
    assert.equal(pack.media, "image");
    assert.ok(pack.cover.every((id) => pack.items.some((item) => item.id === id)));
    assert.ok(pack.groups.every((group) => pack.items.some((item) => item.group === group.id)));
    assert.equal(stickerSrc(pack, coffee), "/packs/sheru/coffee.webp");
  });

  it("the archive shows until a pack has stickers, then steps aside", () => {
    const icons = loadAssets();
    const before = buildUniverse(icons, {});
    assert.deepEqual(before.map((collection) => collection.id), buildArchive(icons).map((collection) => collection.id));
    const after = buildUniverse(icons, { sheru: ["coffee.webp"] });
    assert.deepEqual(after.map((collection) => collection.id), ["sheru"]);
    const both = buildUniverse(icons, { sheru: ["coffee.webp"] }, true);
    assert.equal(both.length, before.length + 1);
    assert.equal(both[0]!.id, "sheru");
  });

  it("pack stickers are searchable by their tags", () => {
    const pack = buildPack(sheru, sheru.stickers.map((sticker) => `${sticker.id}.webp`))!;
    const index = buildSearchIndex([pack].filter(isLive));
    assert.equal(search(index, "good morning")[0]?.item.id, "coffee");
    assert.equal(search(index, "broke")[0]?.item.id, "broke");
    assert.ok(search(index, "sunglasses").some((result) => result.item.id === "shades"));
  });

  it("prompts fix the identity and never ask for text or scenery", () => {
    const prompt = stickerPrompt(sheru, sheru.stickers[0]!);
    assert.ok(prompt.includes(sheru.identity));
    assert.ok(prompt.includes(sheru.stickers[0]!.scene));
    assert.match(prompt, /solid, bright green/);
    assert.match(prompt, /Do not add any text/);
    assert.ok(masterPrompt(sheru).includes(sheru.looks[0]!.wardrobe));
    assert.ok(stickerPrompt(sheru, sheru.stickers[0]!, sheru.looks[1]).includes(sheru.looks[1]!.wardrobe));
  });
});
