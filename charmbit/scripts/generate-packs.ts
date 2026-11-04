/**
 * Generates sticker-pack artwork into assets/svg/packs/<pack>/<slug>.svg.
 *
 *   npm run art:packs
 *
 * Each sticker is composed from layers: body (per species), colorway (per pack),
 * and face (per reaction). Output is plain SVG; once generated, a file can be
 * redrawn by hand and this script won't be needed for it.
 *
 * Conventions: viewBox 0 0 128 128, ids prefixed with the slug, linework in
 * currentColor (except colorways that set their own glowing ink).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PACKS, packSlug, type Reaction } from "../src/lib/assets/packs.ts";

type Point = readonly [number, number];

interface Paint {
  /** Fur/body gradient: highlight → base → shadow. */
  body: readonly [string, string, string];
  stripe?: string;
  muzzle: string;
  innerEar: string;
  nose: string;
  /** Eye + linework colour. `currentColor` lets the Ink control recolour it. */
  ink: string;
  /** Glowing eyes instead of glossy dark ones. */
  glowEyes?: string;
  halo?: string;
  blush: string;
}

interface Face {
  eyes: readonly [Point, Point];
  eyeSize: number;
  mouth: Point;
  cheeks: readonly [Point, Point];
  nose?: Point;
  whiskers?: boolean;
  tear: Point;
  float: Point;
}

const PAINTS: Record<string, Paint> = {
  // Miso the cat
  ginger: { body: ["#FFD596", "#FFA94A", "#EE7A1E"], stripe: "#E0661A", muzzle: "#FFF4E2", innerEar: "#FFB0A3", nose: "#FF8C98", ink: "currentColor", blush: "#FF8FA3" },
  silver: { body: ["#FFFFFF", "#E9EBF0", "#B8BDC9"], stripe: "#A2A8B6", muzzle: "#FFFFFF", innerEar: "#FFC4CF", nose: "#FF9AAA", ink: "currentColor", blush: "#FF9EB1" },
  gold: { body: ["#FFF6C2", "#FFD45C", "#E7A21B"], stripe: "#D9920F", muzzle: "#FFFAE6", innerEar: "#FFBFA6", nose: "#FF9A8A", ink: "currentColor", halo: "#FFE27A", blush: "#FF9E8F" },
  mist: { body: ["#93AADB", "#4F6AA0", "#273763"], muzzle: "#8FA4D3", innerEar: "#7088BD", nose: "#C9D6F2", ink: "#EAF0FF", glowEyes: "#FFF3D1", blush: "#B9A6E8" },
  // Boo the ghost
  cloud: { body: ["#FFFFFF", "#F4F2F6", "#D3CEDB"], muzzle: "#FFFFFF", innerEar: "#FFFFFF", nose: "#FF9AAA", ink: "currentColor", blush: "#FF9EB1" },
  moon: { body: ["#FCFAFF", "#E2DAFF", "#B3A5EA"], muzzle: "#FFFFFF", innerEar: "#FFFFFF", nose: "#FF9AAA", ink: "currentColor", halo: "#D9CCFF", blush: "#FF9EC4" },
};

const n = (value: number) => Number(value.toFixed(2));

/** A heart centred on (x, y); `s` = half-width. */
function heartPath([x, y]: Point, s: number): string {
  const k = s / 9;
  const p = (dx: number, dy: number) => `${n(x + dx * k)} ${n(y + dy * k)}`;
  return `M${p(0, 7)}C${p(-1, 6)} ${p(-9, 1.5)} ${p(-9, -3.5)}C${p(-9, -7)} ${p(-6.5, -9)} ${p(-4, -9)}C${p(-2.2, -9)} ${p(-0.8, -8)} ${p(0, -6.5)}C${p(0.8, -8)} ${p(2.2, -9)} ${p(4, -9)}C${p(6.5, -9)} ${p(9, -7)} ${p(9, -3.5)}C${p(9, 1.5)} ${p(1, 6)} ${p(0, 7)}Z`;
}

/** Four-point sparkle centred on (x, y). */
function sparklePath([x, y]: Point, s: number): string {
  return `M${x} ${n(y - s)}C${n(x + s * 0.15)} ${n(y - s * 0.15)} ${n(x + s * 0.15)} ${n(y - s * 0.15)} ${n(x + s)} ${y}C${n(x + s * 0.15)} ${n(y + s * 0.15)} ${n(x + s * 0.15)} ${n(y + s * 0.15)} ${x} ${n(y + s)}C${n(x - s * 0.15)} ${n(y + s * 0.15)} ${n(x - s * 0.15)} ${n(y + s * 0.15)} ${n(x - s)} ${y}C${n(x - s * 0.15)} ${n(y - s * 0.15)} ${n(x - s * 0.15)} ${n(y - s * 0.15)} ${x} ${n(y - s)}Z`;
}

function defs(id: (name: string) => string, paint: Paint): string {
  const [light, base, shadow] = paint.body;
  return [
    `<defs>`,
    `<radialGradient id="${id("body")}" cx="0.4" cy="0.3" r="0.85">`,
    `<stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${base}"/><stop offset="1" stop-color="${shadow}"/>`,
    `</radialGradient>`,
    `<radialGradient id="${id("muzzle")}" cx="0.5" cy="0.45" r="0.6">`,
    `<stop offset="0" stop-color="${paint.muzzle}"/><stop offset="0.6" stop-color="${paint.muzzle}" stop-opacity="0.85"/><stop offset="1" stop-color="${paint.muzzle}" stop-opacity="0"/>`,
    `</radialGradient>`,
    `<linearGradient id="${id("heart")}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="#FF7FA0"/><stop offset="1" stop-color="#E8355E"/>`,
    `</linearGradient>`,
    `<linearGradient id="${id("tear")}" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0" stop-color="#D6EEFF"/><stop offset="1" stop-color="#6FB4FF"/>`,
    `</linearGradient>`,
    paint.halo
      ? `<radialGradient id="${id("halo")}" cx="0.5" cy="0.5" r="0.5"><stop offset="0.35" stop-color="${paint.halo}" stop-opacity="0.75"/><stop offset="1" stop-color="${paint.halo}" stop-opacity="0"/></radialGradient>`
      : "",
    paint.glowEyes
      ? `<radialGradient id="${id("glow")}" cx="0.5" cy="0.5" r="0.5"><stop offset="0.3" stop-color="${paint.glowEyes}" stop-opacity="0.55"/><stop offset="1" stop-color="${paint.glowEyes}" stop-opacity="0"/></radialGradient>`
      : "",
    `</defs>`,
  ].join("");
}

function catBody(id: (name: string) => string, paint: Paint): string {
  const stripes = paint.stripe
    ? `<path d="M56 41C57.5 45 57.5 49 55.5 53M64 38.5V51M72 41C70.5 45 70.5 49 72.5 53" stroke="${paint.stripe}" stroke-width="3.4" stroke-linecap="round" opacity="0.8"/>`
    : "";
  return [
    paint.halo ? `<circle cx="64" cy="70" r="62" fill="url(#${id("halo")})"/>` : "",
    // Ears
    `<path d="M24 66C21.5 47 22 31 27 19.5C29 14.5 34.5 14 38.5 17.5C45.5 23.5 52 31 57.5 38.5Z" fill="url(#${id("body")})"/>`,
    `<path d="M104 66C106.5 47 106 31 101 19.5C99 14.5 93.5 14 89.5 17.5C82.5 23.5 76 31 70.5 38.5Z" fill="url(#${id("body")})"/>`,
    `<path d="M31 50C30 39.5 30.5 31 33 25C34 22.5 36.5 22.5 38.5 24.5C43 29 47 34 50.5 39.5Z" fill="${paint.innerEar}" opacity="0.9"/>`,
    `<path d="M97 50C98 39.5 97.5 31 95 25C94 22.5 91.5 22.5 89.5 24.5C85 29 81 34 77.5 39.5Z" fill="${paint.innerEar}" opacity="0.9"/>`,
    // Head
    `<ellipse cx="64" cy="75" rx="48" ry="40" fill="url(#${id("body")})"/>`,
    stripes,
    `<ellipse cx="64" cy="93" rx="31" ry="21" fill="url(#${id("muzzle")})"/>`,
    // Paws resting on the edge
    `<ellipse cx="41" cy="117" rx="14.5" ry="9.5" fill="url(#${id("body")})"/>`,
    `<ellipse cx="87" cy="117" rx="14.5" ry="9.5" fill="url(#${id("body")})"/>`,
    `<ellipse cx="41" cy="118" rx="10" ry="6" fill="${paint.muzzle}" opacity="0.55"/>`,
    `<ellipse cx="87" cy="118" rx="10" ry="6" fill="${paint.muzzle}" opacity="0.55"/>`,
    `<path d="M37 114.5V119M45 114.5V119M83 114.5V119M91 114.5V119" stroke="${paint.stripe ?? paint.body[2]}" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>`,
  ].join("");
}

function ghostBody(id: (name: string) => string, paint: Paint): string {
  return [
    paint.halo ? `<circle cx="64" cy="66" r="62" fill="url(#${id("halo")})"/>` : "",
    // Little arms
    `<path d="M27 78C17 79 12 86 15 91C18 95 25 92 29 87Z" fill="url(#${id("body")})"/>`,
    `<path d="M101 78C111 79 116 86 113 91C110 95 103 92 99 87Z" fill="url(#${id("body")})"/>`,
    // Body with a soft scalloped hem
    `<path d="M24 108V60C24 37 42 20 64 20C86 20 104 37 104 60V108Q99 120 92 112Q85 120 78 112Q71 120 64 112Q57 120 50 112Q43 120 36 112Q29 120 24 108Z" fill="url(#${id("body")})"/>`,
    `<ellipse cx="54" cy="40" rx="14" ry="8" fill="#FFFFFF" opacity="0.55" transform="rotate(-20 54 40)"/>`,
  ].join("");
}

function eyes(face: Face, paint: Paint, reaction: Reaction["id"], id: (name: string) => string): string {
  const s = face.eyeSize;
  const [l, r] = face.eyes;
  const ink = paint.glowEyes ?? paint.ink;
  const glow = paint.glowEyes
    ? `<circle cx="${l[0]}" cy="${l[1]}" r="${s * 2.2}" fill="url(#${id("glow")})"/><circle cx="${r[0]}" cy="${r[1]}" r="${s * 2.2}" fill="url(#${id("glow")})"/>`
    : "";

  if (reaction === "love") {
    return (
      `<path d="${heartPath(l, s * 1.25)}" fill="url(#${id("heart")})"/><path d="${heartPath(r, s * 1.25)}" fill="url(#${id("heart")})"/>` +
      `<ellipse cx="${n(l[0] - s * 0.55)}" cy="${n(l[1] - s * 0.55)}" rx="${n(s * 0.28)}" ry="${n(s * 0.2)}" fill="#FFFFFF" opacity="0.9"/>` +
      `<ellipse cx="${n(r[0] - s * 0.55)}" cy="${n(r[1] - s * 0.55)}" rx="${n(s * 0.28)}" ry="${n(s * 0.2)}" fill="#FFFFFF" opacity="0.9"/>`
    );
  }

  if (reaction === "blush") {
    const arc = ([x, y]: Point) => `M${n(x - s * 0.95)} ${n(y + s * 0.25)}C${n(x - s * 0.6)} ${n(y - s * 0.65)} ${n(x + s * 0.6)} ${n(y - s * 0.65)} ${n(x + s * 0.95)} ${n(y + s * 0.25)}`;
    return glow + `<path d="${arc(l)}${arc(r)}" stroke="${ink}" stroke-width="${n(s * 0.42)}" stroke-linecap="round" fill="none"/>`;
  }

  const sad = reaction === "sad";
  const ry = sad ? s * 1.02 : s * 1.12;
  const rx = sad ? s * 0.94 : s;
  const dy = sad ? s * 0.18 : 0;
  const one = ([x, y]: Point) =>
    `<ellipse cx="${x}" cy="${n(y + dy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${ink}"/>` +
    (paint.glowEyes
      ? ""
      : `<circle cx="${n(x + s * 0.34)}" cy="${n(y + dy - s * 0.42)}" r="${n(s * (sad ? 0.42 : 0.36))}" fill="#FFFFFF"/>` +
        `<circle cx="${n(x - s * 0.32)}" cy="${n(y + dy + s * 0.45)}" r="${n(s * 0.17)}" fill="#FFFFFF" opacity="0.9"/>` +
        (sad ? `<ellipse cx="${x}" cy="${n(y + dy + s * 0.78)}" rx="${n(s * 0.55)}" ry="${n(s * 0.16)}" fill="#BFE3FF" opacity="0.85"/>` : ""));
  const brows = sad
    ? `<path d="M${n(l[0] - s * 1.1)} ${n(l[1] - s * 1.55)}L${n(l[0] + s * 0.9)} ${n(l[1] - s * 2.1)}M${n(r[0] + s * 1.1)} ${n(r[1] - s * 1.55)}L${n(r[0] - s * 0.9)} ${n(r[1] - s * 2.1)}" stroke="${ink}" stroke-width="${n(s * 0.3)}" stroke-linecap="round" opacity="0.8"/>`
    : "";
  return glow + one(l) + one(r) + brows;
}

function mouth(face: Face, paint: Paint, reaction: Reaction["id"]): string {
  const [x, y] = face.mouth;
  const ink = paint.ink;
  const stroke = `stroke="${ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  switch (reaction) {
    case "love":
      return (
        `<path d="M${x - 6.5} ${y}C${x - 5.5} ${y + 7} ${x + 5.5} ${y + 7} ${x + 6.5} ${y}Z" fill="${paint.glowEyes ? "#2A3560" : "#5A2A2E"}"/>` +
        `<path d="M${x - 3.2} ${y + 4.2}C${x - 1.5} ${y + 2.4} ${x + 1.5} ${y + 2.4} ${x + 3.2} ${y + 4.2}C${x + 2} ${y + 5.6} ${x - 2} ${y + 5.6} ${x - 3.2} ${y + 4.2}Z" fill="#FF8DA0"/>`
      );
    case "sad":
      return `<path d="M${x - 5} ${y + 4}C${x - 3} ${y + 0.5} ${x + 3} ${y + 0.5} ${x + 5} ${y + 4}" ${stroke}/>`;
    case "blush":
      return `<path d="M${x - 4.5} ${y + 1}C${x - 3.4} ${y + 2.8} ${x - 1.2} ${y + 2.8} ${x} ${y + 1}C${x + 1.2} ${y + 2.8} ${x + 3.4} ${y + 2.8} ${x + 4.5} ${y + 1}" ${stroke}/>`;
    default:
      return `<path d="M${x} ${y}C${x} ${y + 3} ${x - 2} ${y + 4.5} ${x - 4.5} ${y + 4.5}C${x - 6.5} ${y + 4.5} ${x - 7.8} ${y + 3.3} ${x - 8.3} ${y + 1.9}M${x} ${y}C${x} ${y + 3} ${x + 2} ${y + 4.5} ${x + 4.5} ${y + 4.5}C${x + 6.5} ${y + 4.5} ${x + 7.8} ${y + 3.3} ${x + 8.3} ${y + 1.9}" ${stroke}/>`;
  }
}

function extras(face: Face, paint: Paint, reaction: Reaction["id"], id: (name: string) => string): string {
  const [cl, cr] = face.cheeks;
  const strong = reaction === "blush";
  const blush =
    `<ellipse cx="${cl[0]}" cy="${cl[1]}" rx="${strong ? 9.5 : 7}" ry="${strong ? 5.8 : 4.3}" fill="${paint.blush}" opacity="${strong ? 0.8 : reaction === "sad" ? 0.3 : 0.5}"/>` +
    `<ellipse cx="${cr[0]}" cy="${cr[1]}" rx="${strong ? 9.5 : 7}" ry="${strong ? 5.8 : 4.3}" fill="${paint.blush}" opacity="${strong ? 0.8 : reaction === "sad" ? 0.3 : 0.5}"/>` +
    (strong
      ? `<path d="M${cl[0] - 5} ${cl[1] + 1.5}l2-3.5M${cl[0] - 1} ${cl[1] + 1.5}l2-3.5M${cl[0] + 3} ${cl[1] + 1.5}l2-3.5M${cr[0] - 5} ${cr[1] + 1.5}l2-3.5M${cr[0] - 1} ${cr[1] + 1.5}l2-3.5M${cr[0] + 3} ${cr[1] + 1.5}l2-3.5" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>`
      : "");

  const nose = face.nose
    ? `<path d="M${face.nose[0] - 3.6} ${face.nose[1] - 1.8}h7.2c.8 0 1.2.9.7 1.5l-2.9 3c-.6.6-1.6.6-2.2 0l-2.9-3c-.5-.6-.1-1.5.7-1.5Z" fill="${paint.nose}"/>`
    : "";

  const whiskers = face.whiskers
    ? `<path d="M31 86.5L20 85.5M31 91.5L24 94M97 86.5L108 85.5M97 91.5L104 94" stroke="${paint.ink}" stroke-width="1.6" stroke-linecap="round" opacity="0.45"/>`
    : "";

  let accent = "";
  if (reaction === "love") {
    accent =
      `<path d="${heartPath(face.float, 7)}" fill="url(#${id("heart")})" transform="rotate(14 ${face.float[0]} ${face.float[1]})"/>` +
      `<path d="${heartPath([face.float[0] - 12, face.float[1] + 12], 4)}" fill="url(#${id("heart")})" opacity="0.8" transform="rotate(-12 ${face.float[0] - 12} ${face.float[1] + 12})"/>`;
  } else if (reaction === "sad") {
    const [x, y] = face.tear;
    accent =
      `<path d="M${x} ${y - 7}C${x - 2.8} ${y - 2.6} ${x - 4.4} ${y} ${x - 4.4} ${y + 2.2}A4.4 4.4 0 0 0 ${x + 4.4} ${y + 2.2}C${x + 4.4} ${y} ${x + 2.8} ${y - 2.6} ${x} ${y - 7}Z" fill="url(#${id("tear")})"/>` +
      `<ellipse cx="${x - 1.4}" cy="${y + 1.4}" rx="1.1" ry="1.6" fill="#FFFFFF" opacity="0.85"/>`;
  } else if (reaction === "blush") {
    accent =
      `<path d="${sparklePath(face.float, 6)}" fill="#FFB3C6"/>` +
      `<path d="${sparklePath([face.float[0] - 11, face.float[1] + 10], 3.5)}" fill="#FFD27A"/>`;
  } else {
    accent = `<path d="${sparklePath(face.float, 4.5)}" fill="#FFD27A" opacity="0.9"/>`;
  }

  return blush + nose + whiskers + accent;
}

const FACES: Record<string, Face> = {
  cat: {
    eyes: [
      [46, 75],
      [82, 75],
    ],
    eyeSize: 7.5,
    mouth: [64, 87.5],
    cheeks: [
      [35, 89],
      [93, 89],
    ],
    nose: [64, 84],
    whiskers: true,
    tear: [89, 90],
    float: [109, 30],
  },
  ghost: {
    eyes: [
      [50, 60],
      [78, 60],
    ],
    eyeSize: 7,
    mouth: [64, 72],
    cheeks: [
      [40, 74],
      [88, 74],
    ],
    tear: [84, 76],
    float: [104, 26],
  },
};

function compose(species: "cat" | "ghost", slug: string, paint: Paint, reaction: Reaction["id"]): string {
  const id = (name: string) => `${slug}-${name}`;
  const face = FACES[species]!;
  const body = species === "cat" ? catBody(id, paint) : ghostBody(id, paint);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">`,
    defs(id, paint),
    body,
    extras(face, paint, reaction, id),
    eyes(face, paint, reaction, id),
    mouth(face, paint, reaction),
    `</svg>`,
  ].join("\n");
}

const root = process.cwd();
let count = 0;
for (const pack of PACKS) {
  const species = pack.species.toLowerCase() === "cat" ? "cat" : "ghost";
  const directory = path.join(root, "assets", "svg", "packs", pack.id);
  mkdirSync(directory, { recursive: true });
  for (const colorway of pack.colorways) {
    const paint = PAINTS[colorway.id];
    if (!paint) throw new Error(`No paint for colorway "${colorway.id}"`);
    for (const reaction of pack.reactions) {
      const slug = packSlug(pack, colorway, reaction);
      writeFileSync(path.join(directory, `${slug}.svg`), compose(species, slug, paint, reaction.id) + "\n");
      count += 1;
    }
  }
}
console.log(`Generated ${count} stickers.`);
