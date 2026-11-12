import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CAPTION_COLORS, captionEdge, fitCaption, luminance } from "../src/lib/caption.ts";

// A fake measurer: every character is 0.6 em wide.
const measure = (text: string, size: number) => text.length * size * 0.6;

describe("text on stickers", () => {
  it("keeps short text at the largest size on one line", () => {
    assert.deepEqual(fitCaption(measure, "Hi!", 400, 60, 30), { size: 60, lines: ["Hi!"] });
  });

  it("shrinks longer text until it fits on one line", () => {
    const layout = fitCaption(measure, "Good morning sunshine", 400, 60, 30);
    assert.equal(layout.lines.length, 1);
    assert.ok(layout.size < 60 && layout.size >= 30);
    assert.ok(measure(layout.lines[0]!, layout.size) <= 400);
  });

  it("wraps to two lines at the smallest size when shrinking is not enough", () => {
    const layout = fitCaption(measure, "This is a fairly long message for a sticker", 400, 60, 30);
    assert.equal(layout.size, 30);
    assert.equal(layout.lines.length, 2);
    for (const line of layout.lines) assert.ok(measure(line, 30) <= 400, line);
  });

  it("cuts text that cannot fit two lines with an ellipsis", () => {
    const layout = fitCaption(measure, "word ".repeat(30).trim(), 200, 40, 20);
    assert.equal(layout.lines.length, 2);
    assert.ok(layout.lines[1]!.endsWith("…"));
    assert.ok(measure(layout.lines[1]!, 20) <= 200);
  });

  it("ignores empty and whitespace-only text", () => {
    assert.deepEqual(fitCaption(measure, "   ", 400, 60, 30).lines, []);
  });

  it("gives light text a dark edge and dark text a white edge", () => {
    assert.equal(captionEdge("#FFFFFF"), "#141312");
    assert.equal(captionEdge("#F3B62B"), "#141312");
    assert.equal(captionEdge("#141312"), "#FFFFFF");
    assert.equal(captionEdge("#E4183F"), "#FFFFFF");
    assert.ok(luminance("#FFF") > 0.99 && luminance("#000000") === 0);
  });

  it("offers a small set of valid colours, white first", () => {
    assert.equal(CAPTION_COLORS[0]!.hex, "#FFFFFF");
    for (const color of CAPTION_COLORS) assert.match(color.hex, /^#[0-9A-F]{6}$/);
  });
});
