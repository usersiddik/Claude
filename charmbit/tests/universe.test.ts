import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadAssets } from "../src/lib/assets/load.ts";
import { findSvgProblems } from "../src/lib/assets/svg.ts";
import { buildUniverse, countStickers, defaultValues, exportItem, findItem, isLive, propertiesFor, renderItem, stickerSlug, stickerTitle, UPCOMING } from "../src/lib/universe/index.ts";
import { refsResolve } from "./art.test.ts";

const universe = buildUniverse(loadAssets());
// Drawn collections only: image packs are files, not SVG to check here.
const live = universe.filter(isLive).filter((collection) => collection.media === undefined || collection.media === "vector");

describe("collection registry", () => {
  it("has unique collection ids and a healthy size", () => {
    assert.equal(new Set(universe.map((collection) => collection.id)).size, universe.length);
    assert.ok(live.length >= 8);
    assert.ok(countStickers(universe) >= 180);
    assert.equal(UPCOMING.length, 3);
  });

  it("gives every live collection at least 15 unique stickers, and cats 40 or more", () => {
    for (const collection of live) {
      const ids = collection.items.map((item) => item.id);
      assert.equal(new Set(ids).size, ids.length, `${collection.id}: duplicate ids`);
      if (collection.id !== "icons") assert.ok(ids.length >= 15, `${collection.id} has ${ids.length}`);
      for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${collection.id}/${id}`);
    }
    assert.ok(live.find((collection) => collection.id === "cats")!.items.length >= 40);
  });

  it("keeps groups, properties, uses, and covers consistent", () => {
    for (const collection of live) {
      const groups = new Set(collection.groups.map((group) => group.id));
      const properties = new Set(collection.properties.map((property) => property.id));
      for (const item of collection.items) {
        assert.ok(groups.has(item.group), `${collection.id}/${item.id}: unknown group ${item.group}`);
        for (const use of item.uses) assert.ok(properties.has(use), `${collection.id}/${item.id}: unknown property ${use}`);
      }
      for (const group of groups) assert.ok(collection.items.some((item) => item.group === group), `${collection.id}: empty group ${group}`);
      for (const id of collection.cover) assert.ok(collection.items.some((item) => item.id === id), `${collection.id}: cover ${id}`);
      for (const property of collection.properties) {
        if (property.kind === "color") assert.ok(property.swatches.some((swatch) => swatch.hex === property.default), `${collection.id}/${property.id}: default not a swatch`);
      }
    }
  });

  it("renders every sticker with default values as safe, self-contained SVG", () => {
    for (const collection of live) {
      const values = defaultValues(collection);
      for (const item of collection.items) {
        const svg = renderItem(collection, item, values, true);
        assert.deepEqual(findSvgProblems(svg), [], `${collection.id}/${item.id}`);
        assert.ok(refsResolve(svg), `${collection.id}/${item.id}: unresolved url()`);
        assert.ok(!svg.includes("<filter"), `${collection.id}/${item.id}: portable output has a filter`);
      }
    }
  });

  it("applies property values", () => {
    const love = live.find((collection) => collection.id === "love")!;
    const heart = findItem(love, "glossy-heart");
    assert.deepEqual(propertiesFor(love, heart).map((property) => property.id), ["heart"]);
    assert.ok(renderItem(love, heart, { ...defaultValues(love), heart: "#123456" }).includes("#123456"));
    const icons = live.find((collection) => collection.id === "icons")!;
    const svg = renderItem(icons, icons.items[0]!, { fill: null, ink: "#2B3576" });
    assert.ok(svg.includes("#2B3576") && !svg.includes("currentColor"));
  });

  it("names and exports stickers in every format", () => {
    const cats = live.find((collection) => collection.id === "cats")!;
    const hi = findItem(cats, "hi");
    assert.equal(stickerTitle(cats, hi), "Cat Hi");
    assert.equal(stickerSlug(cats, hi), "cat-hi");
    const values = defaultValues(cats);
    assert.match(exportItem(cats, hi, values, "svg"), /<title>Cat Hi<\/title>/);
    assert.match(exportItem(cats, findItem(cats, "love"), values, "react"), /export function CatLoveSticker/);
    const dart = exportItem(cats, findItem(cats, "fever"), values, "flutter");
    assert.match(dart, /class CatFeverSticker extends StatelessWidget/);
    assert.ok(!dart.includes("<filter"));
    const diwali = live.find((collection) => collection.id === "diwali")!;
    assert.equal(stickerSlug(diwali, findItem(diwali, "diya-girl")), "diwali-diya-girl");
  });
});

it("randomValues only touches the properties a sticker uses, with valid choices", async () => {
  const { GENERATED, propertiesFor, randomValues } = await import("../src/lib/universe/index.ts");
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (const collection of GENERATED) {
    for (const item of collection.items) {
      const values = randomValues(collection, item, random);
      const used = propertiesFor(collection, item);
      assert.deepEqual(Object.keys(values).sort(), used.map((property) => property.id).sort());
      for (const property of used) {
        const value = values[property.id];
        if (property.kind === "toggle") assert.equal(typeof value, "boolean");
        else assert.ok(property.swatches.some((swatch) => swatch.hex === value), `${collection.id}/${item.id} ${property.id}`);
      }
      // Whatever comes out must still draw.
      assert.match(collection.render(item, { ...Object.fromEntries(collection.properties.map((p) => [p.id, p.default])), ...values }), /^<svg/);
    }
  }
});
