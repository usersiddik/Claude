/**
 * Traces caption text to SVG paths on the server, with the same font and
 * settings as the prebuilt lettering, so custom words (names, wishes) look
 * like the rest of the set and need no font on the device.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import type { Lettering } from "../art/lettering.ts";

let font: opentype.Font | undefined;

function load(): opentype.Font {
  if (!font) {
    const file = readFileSync(path.join(process.cwd(), "assets", "fonts", "baloo-2-latin-800-normal.woff"));
    font = opentype.parse(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
  }
  return font;
}

/** Drops characters the font can't draw (it covers Latin scripts). */
export function drawableText(text: string): string {
  const face = load();
  return [...text].filter((char) => char === " " || face.charToGlyphIndex(char) > 0).join("").replace(/\s+/g, " ").trim();
}

/** Text as one path at 100px, origin at the top-left of its bounding box. */
export function traceText(text: string): Lettering | null {
  const clean = drawableText(text);
  if (!clean) return null;
  const glyphs = load().getPath(clean, 0, 0, 100, { kerning: true });
  const box = glyphs.getBoundingBox();
  const X = (value: number) => Math.round(value - box.x1);
  const Y = (value: number) => Math.round(value - box.y1);
  let d = "";
  for (const c of glyphs.commands) {
    if (c.type === "M") d += `M${X(c.x)} ${Y(c.y)}`;
    else if (c.type === "L") d += `L${X(c.x)} ${Y(c.y)}`;
    else if (c.type === "Q") d += `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`;
    else if (c.type === "C") d += `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`;
    else if (c.type === "Z") d += "Z";
  }
  return { d: d.replace(/ -/g, "-"), w: Math.round(box.x2 - box.x1), h: Math.round(box.y2 - box.y1) };
}
