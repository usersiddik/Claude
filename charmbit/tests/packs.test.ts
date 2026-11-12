import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadAssets } from "../src/lib/assets/load.ts";
import { buildArchive, buildUniverse, CATEGORIES, categoryOf, isLive, stickerSrc } from "../src/lib/universe/index.ts";
import { buildPack, PACKS, stickerPrompt } from "../src/lib/universe/packs/index.ts";
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

  it("Sheru has 40 distinct stickers: 20 free and 20 premium", () => {
    assert.equal(sheru.stickers.length, 40);
    assert.equal(new Set(sheru.stickers.map((sticker) => sticker.scene)).size, 40);
    assert.equal(sheru.stickers.filter((sticker) => sticker.premium).length, 20);
  });

  it("a pack with no files still lists every sticker, as coming soon", () => {
    const pack = buildPack(sheru, [])!;
    assert.equal(pack.items.length, 40);
    assert.ok(pack.items.every((item) => item.image?.pending && item.image.src === "/packs/placeholder.svg"));
    assert.equal(buildPack(sheru, ["boss-point.webp"])!.items.filter((item) => item.image?.pending).length, 39);
    // With the lock on, only the 20 free stickers are listed.
    assert.equal(buildPack({ ...sheru, lockPremium: true }, ["crown.webp"])!.items.length, 20);
  });

  it("only free stickers with a default-look file appear, with their other looks", () => {
    const pack = buildPack(sheru, ["chai-sip.webp", "chai-sip.black.webp", "boss-point.png", "laughing.black.webp", "notes.txt"])!;
    assert.deepEqual(pack.items.filter((item) => !item.image?.pending).map((item) => item.id), ["boss-point", "chai-sip"]);
    const chai = pack.items.find((item) => item.id === "chai-sip")!;
    assert.equal(chai.image?.src, "/packs/sheru/chai-sip.webp");
    assert.deepEqual(chai.image?.variants.map((variant) => variant.id), ["white", "black"]);
    assert.deepEqual(pack.items.find((item) => item.id === "boss-point")!.image?.variants, []);
    assert.equal(pack.media, "image");
    assert.ok(pack.cover.every((id) => pack.items.some((item) => item.id === id)));
    assert.ok(pack.groups.every((group) => pack.items.some((item) => item.group === group.id)));
    assert.equal(stickerSrc(pack, chai), "/packs/sheru/chai-sip.webp");
  });

  it("every sticker is free while the premium lock is off", () => {
    assert.equal(sheru.lockPremium, false);
    const pack = buildPack(sheru, ["boss-point.webp", "crown.webp"])!;
    assert.deepEqual(pack.items.filter((item) => !item.image?.pending).map((item) => item.id), ["boss-point", "crown"]);
    assert.deepEqual(pack.locked, []);
    assert.equal(buildPack(sheru, sheru.stickers.map((sticker) => `${sticker.id}.webp`))!.items.length, 40);
  });

  it("with the lock on, premium stickers are locked tiles kept out of the usable stickers", () => {
    const pack = buildPack({ ...sheru, lockPremium: true }, ["boss-point.webp", "crown.webp"])!;
    assert.deepEqual(pack.items.filter((item) => !item.image?.pending).map((item) => item.id), ["boss-point"]);
    assert.equal(pack.locked?.length, 20);
    assert.ok(pack.locked!.every((item) => item.locked && item.image?.src));
    assert.equal(pack.locked!.find((item) => item.id === "crown")!.image!.src, "/packs/sheru/crown.webp");
    assert.equal(pack.locked!.find((item) => item.id === "wink")!.image!.src, "/packs/sheru/boss-point.webp");
    assert.equal(search(buildSearchIndex([pack]), "crown").length, 0);
  });

  it("packs with files sit ahead of the drawn collections, each in its category", () => {
    const icons = loadAssets();
    const before = buildUniverse(icons, {});
    assert.deepEqual(before.slice(1).map((collection) => collection.id), buildArchive(icons).map((collection) => collection.id));
    const after = buildUniverse(icons, { sheru: ["chai-sip.webp"], gifs: ["cat-sad.gif"] });
    assert.deepEqual(after.slice(0, 2).map((collection) => collection.id), ["sheru", "gifs"]);
    assert.equal(after.length, before.length + 1);
    assert.deepEqual(after.slice(0, 3).filter(isLive).map(categoryOf), ["whatsapp", "gif", "colour"]);
    assert.deepEqual(CATEGORIES.map((category) => category.id), ["whatsapp", "colour", "gif"]);
  });

  it("every .gif in the GIF folder becomes a sticker named after its file", () => {
    const gifs = PACKS.find((pack) => pack.id === "gifs")!;
    assert.equal(buildPack(gifs, ["notes.txt", "Bad Name.gif", "cover.png"]), null);
    const pack = buildPack(gifs, ["cat-sad.gif", "cat-drinking-water.gif"])!;
    assert.equal(pack.media, "animated");
    assert.deepEqual(pack.items.map((item) => [item.id, item.name]), [["cat-drinking-water", "Cat drinking water"], ["cat-sad", "Cat sad"]]);
    assert.ok(pack.items.every((item) => item.image?.animated && item.image.src.endsWith(".gif")));
    const index = buildSearchIndex([pack]);
    assert.equal(search(index, "water")[0]?.item.id, "cat-drinking-water");
    assert.equal(search(index, "sad cat")[0]?.item.id, "cat-sad");
  });

  it("pack stickers are searchable by their tags", () => {
    const pack = buildPack(sheru, sheru.stickers.map((sticker) => `${sticker.id}.webp`))!;
    const index = buildSearchIndex([pack].filter(isLive));
    assert.equal(search(index, "good morning")[0]?.item.id, "good-morning");
    assert.equal(search(index, "chai")[0]?.item.id, "chai-sip");
    assert.ok(search(index, "sunglasses").some((result) => result.item.id === "shades-off"));
  });

  it("prompts fix the identity and never ask for a border or scenery", () => {
    const prompt = stickerPrompt(sheru, sheru.stickers[0]!);
    assert.ok(prompt.includes(sheru.identity));
    assert.ok(prompt.includes(sheru.stickers[0]!.scene));
    assert.ok(prompt.includes(sheru.looks[0]!.wardrobe));
    assert.match(prompt, /#808080/);
    assert.match(prompt, /No white sticker border/);
    assert.ok(stickerPrompt(sheru, sheru.stickers[0]!, sheru.looks[1]).includes(sheru.looks[1]!.wardrobe));
  });
});
