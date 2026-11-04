/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node script */
/**
 * Traces sticker lettering to SVG paths.
 *
 *   npm i --no-save opentype.js@1.3.4 @fontsource/baloo-2@5.1.0
 *   node scripts/lettering.cjs src/lib/art/lettering-glyphs.ts "Hi!" "Good morning" …
 *
 * Pass every phrase (old and new): the output file is rewritten.
 */
const opentype = require("opentype.js");
const fs = require("fs");
const font = opentype.loadSync(require.resolve("@fontsource/baloo-2/files/baloo-2-latin-800-normal.woff"));
const phrases = process.argv.slice(3);
const out = {};
for (const text of phrases) {
  const size = 100;
  const path = font.getPath(text, 0, 0, size, { kerning: true });
  const box = path.getBoundingBox();
  // Translate so the box starts at 0,0 and round to integers.
  const r = (v) => Math.round(v);
  let d = "";
  for (const c of path.commands) {
    const X = (v) => r(v - box.x1), Y = (v) => r(v - box.y1);
    if (c.type === "M") d += `M${X(c.x)} ${Y(c.y)}`;
    else if (c.type === "L") d += `L${X(c.x)} ${Y(c.y)}`;
    else if (c.type === "Q") d += `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`;
    else if (c.type === "C") d += `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`;
    else if (c.type === "Z") d += "Z";
  }
  d = d.replace(/ -/g, "-").replace(/(L(-?\d+) (-?\d+))\1/g, "$1");
  out[text] = { d, w: r(box.x2 - box.x1), h: r(box.y2 - box.y1) };
}
const body = Object.entries(out).map(([k, v]) => `  ${JSON.stringify(k)}: { w: ${v.w}, h: ${v.h}, d: ${JSON.stringify(v.d)} },`).join("\n");
fs.writeFileSync(process.argv[2], `/**
 * Sticker lettering traced from Baloo 2 ExtraBold (SIL Open Font License 1.1,
 * Copyright 2019 Ek Type) so text renders identically everywhere, including
 * flutter_svg and the PNG export, without loading a font.
 * Generated; edit the phrase list in the README to regenerate.
 */
export interface Lettering {
  /** Width and height of the traced text at 100px. */
  w: number;
  h: number;
  d: string;
}

export const LETTERING: Record<string, Lettering> = {
${body}
};
`);
console.log(Object.keys(out).length, fs.statSync(process.argv[2]).size);
