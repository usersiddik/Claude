import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prepareSvg } from "../src/lib/sticker.ts";

describe("sticker preparation", () => {
  it("sets pixel size and resolves currentColor", () => {
    const out = prepareSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" fill="none"><path stroke="currentColor"/></svg>', 476, "#2B3576");
    assert.match(out, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 96 96" fill="none" width="476" height="476">/);
    assert.ok(!out.includes("currentColor"));
    assert.ok(out.includes('stroke="#2B3576"'));
  });
});
