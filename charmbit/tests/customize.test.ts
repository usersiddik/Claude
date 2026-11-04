import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadAssets } from "../src/lib/assets/load.ts";
import { applyFill, customizeSvg, findFill, findInk, primaryFill } from "../src/lib/customize.ts";
import { buildExport } from "../src/lib/exports/index.ts";

const assets = loadAssets();
const mochi = assets.find((asset) => asset.slug === "mochi")!;

describe("customisation", () => {
  it("every asset's main fill appears in its artwork", () => {
    for (const asset of assets) {
      assert.ok(asset.sourceSvg.toUpperCase().includes(`FILL="${primaryFill(asset).toUpperCase()}"`), asset.id);
    }
  });

  it("replaces only the main fill", () => {
    const recoloured = customizeSvg(mochi, "#B4D2F0");
    assert.ok(recoloured.includes('fill="#B4D2F0"'));
    assert.ok(!recoloured.includes('fill="#F6D673"'));
    assert.ok(recoloured.includes('fill="#F4A28C"'), "blush stays coral");
  });

  it("is a no-op for Original", () => {
    assert.equal(applyFill(mochi.sourceSvg, "#F6D673", null), mochi.sourceSvg);
  });

  it("falls back to defaults for unknown ids", () => {
    assert.equal(findFill("nope").id, "original");
    assert.equal(findInk(undefined).id, "auto");
    assert.equal(findInk(undefined).hex, null);
  });

  it("carries colour choices into every export", () => {
    const options = { fill: "#B4D2F0", ink: "#2B3576" };
    const svg = buildExport(mochi, "svg", options);
    assert.match(svg, /color="#2B3576"/);
    assert.match(svg, /fill="#B4D2F0"/);
    assert.match(buildExport(mochi, "react", options), /color = "#2B3576"/);
    assert.match(buildExport(mochi, "flutter", options), /Color\(0xFF2B3576\)/);
  });

  it("keeps currentColor when ink is not customised", () => {
    assert.ok(!buildExport(mochi, "svg").includes(' color="'));
    assert.match(buildExport(mochi, "react"), /color = "currentColor"/);
  });
});
