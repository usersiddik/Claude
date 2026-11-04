import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paddingFor, prepareSvg, STROKES, strokeWidth } from "../src/lib/sticker.ts";

describe("sticker preparation", () => {
  it("sets pixel size and resolves currentColor", () => {
    const out = prepareSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" fill="none"><path stroke="currentColor"/></svg>', 476, "#2B3576");
    assert.match(out, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 96 96" fill="none" width="476" height="476">/);
    assert.ok(!out.includes("currentColor"));
    assert.ok(out.includes('stroke="#2B3576"'));
  });
});

describe("outline presets", () => {
  it("grow in steps and always leave room around the art", () => {
    const widths = STROKES.map((stroke) => stroke.width);
    assert.equal(widths[0], 0, "first option is no outline");
    assert.deepEqual([...widths].sort((a, b) => a - b), widths, "ascending");
    for (const stroke of STROKES) {
      assert.equal(strokeWidth(stroke.id), stroke.width);
      // The outline fits inside the margin, and the art keeps most of the canvas.
      assert.ok(paddingFor(stroke.width) > stroke.width && paddingFor(stroke.width) < 0.12, stroke.id);
    }
  });
});
