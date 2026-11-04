import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { CATALOG } from "../src/lib/assets/catalog.ts";
import { countByFilter, matchesQuery, selectAssets } from "../src/lib/assets/filters.ts";
import { FAMILY_DIRECTORY, loadAssets, svgPathFor, validateCatalog } from "../src/lib/assets/load.ts";
import { PACKS } from "../src/lib/assets/packs.ts";
import { PALETTE } from "../src/lib/assets/palette.ts";
import { findSvgProblems } from "../src/lib/assets/svg.ts";

describe("catalogue", () => {
  it("is internally consistent", () => {
    assert.deepEqual(validateCatalog(CATALOG), []);
  });

  it("has an SVG file for every entry and no orphan files", () => {
    for (const meta of CATALOG) assert.ok(existsSync(svgPathFor(meta)), `missing ${svgPathFor(meta)}`);
    const expected = new Set(CATALOG.map((meta) => svgPathFor(meta)));
    const directories = [
      ...Object.values(FAMILY_DIRECTORY),
      ...PACKS.map((pack) => path.join("packs", pack.id)),
    ];
    for (const directory of directories) {
      const full = path.join(process.cwd(), "assets", "svg", directory);
      for (const file of readdirSync(full)) {
        assert.ok(expected.has(path.join(full, file)), `orphan SVG ${directory}/${file}`);
      }
    }
  });

  it("loads assets with valid, safe SVG", () => {
    const assets = loadAssets();
    assert.equal(assets.length, CATALOG.length);
    for (const asset of assets) {
      assert.deepEqual(findSvgProblems(asset.sourceSvg), [], asset.id);
      assert.ok(asset.width > 0 && asset.height > 0);
    }
  });

  it("only uses palette colours in flat artwork", () => {
    const allowed = new Set(Object.values(PALETTE).map((swatch) => swatch.hex.toUpperCase()));
    for (const asset of loadAssets().filter((item) => item.recolorable !== false)) {
      for (const [hex] of asset.sourceSvg.matchAll(/#[0-9a-fA-F]{6}/g)) {
        assert.ok(allowed.has(hex.toUpperCase()), `${asset.id} uses off-palette ${hex}`);
      }
    }
  });

  it("flags unsafe SVG", () => {
    assert.ok(findSvgProblems('<svg viewBox="0 0 1 1"><script>x()</script></svg>').length > 0);
    assert.ok(findSvgProblems('<svg viewBox="0 0 1 1" onload="x()"></svg>').length > 0);
    assert.ok(findSvgProblems('<svg viewBox="0 0 1 1"><use href="https://x.test/a.svg#a"/></svg>').length > 0);
    assert.ok(findSvgProblems("<svg></svg>").length > 0);
  });
});

describe("filters", () => {
  const assets = loadAssets();

  it("derives counts from data and keeps previews out of copyable views", () => {
    const counts = countByFilter(assets, "");
    const available = assets.filter((asset) => asset.status === "available");
    assert.equal(counts.all, available.length);
    assert.equal(counts.charms + counts.marks + counts.stickers, available.length);
    assert.equal(counts.miso + counts.boo, counts.stickers);
    assert.equal(counts.duos, assets.filter((asset) => asset.family === "duo").length);
    assert.equal(counts.characters + counts.objects, counts.charms + counts.stickers);
    assert.equal(counts.ui, counts.marks);
    for (const id of ["all", "charms", "marks", "stickers", "characters", "objects", "ui", "reactions"] as const) {
      assert.ok(selectAssets(assets, { query: "", filter: id }).every((asset) => asset.status === "available"), id);
    }
  });

  it("matches every query word", () => {
    const mochi = assets.find((asset) => asset.slug === "mochi");
    assert.ok(mochi);
    assert.ok(matchesQuery(mochi, "HAPPY butter"));
    assert.ok(!matchesQuery(mochi, "happy grumpy"));
  });

  it("combines filter and query", () => {
    const result = selectAssets(assets, { query: "heart", filter: "marks" });
    assert.deepEqual(result.map((asset) => asset.slug), ["soft-like"]);
    assert.deepEqual(selectAssets(assets, { query: "weather", filter: "all" }).map((asset) => asset.slug), ["nimbus"]);
    assert.equal(selectAssets(assets, { query: "heart", filter: "duos" }).length, 0);
  });
});

describe("sticker packs", () => {
  const assets = loadAssets();

  it("expands every colorway × reaction", () => {
    for (const pack of PACKS) {
      const members = assets.filter((asset) => asset.pack?.id === pack.id);
      assert.equal(members.length, pack.colorways.length * pack.reactions.length, pack.id);
      for (const colorway of pack.colorways) {
        for (const reaction of pack.reactions) {
          assert.ok(
            members.some((asset) => asset.pack?.colorway === colorway.id && asset.pack.reaction === reaction.id),
            `${pack.id}/${colorway.id}/${reaction.id}`,
          );
        }
      }
    }
  });

  it("namespaces gradient ids by slug so stickers can share a page", () => {
    for (const asset of assets.filter((item) => item.pack)) {
      for (const [, id] of asset.sourceSvg.matchAll(/\bid="([^"]+)"/g)) {
        assert.ok(id?.startsWith(`${asset.slug}-`), `${asset.slug}: ${id}`);
      }
      for (const [, ref] of asset.sourceSvg.matchAll(/url\(#([^)]+)\)/g)) {
        assert.ok(asset.sourceSvg.includes(`id="${ref}"`), `${asset.slug}: dangling url(#${ref})`);
      }
    }
  });

  it("is found by reaction and species", () => {
    assert.ok(selectAssets(assets, { query: "cat love", filter: "all" }).every((asset) => asset.pack?.reaction === "love"));
    assert.ok(selectAssets(assets, { query: "ghost", filter: "all" }).length >= 8);
  });
});

