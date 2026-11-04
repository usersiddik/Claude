import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findSvgProblems } from "../src/lib/assets/svg.ts";
import { mix, normalizeHex } from "../src/lib/art/color.ts";
import { DEFAULT_CREATURE, DEFAULT_LOOKS, drawCreature, REACTIONS } from "../src/lib/art/creatures.ts";
import { DEFAULT_DIWALI, DIWALI_IDS, DIWALI_SCENES, drawDiwali } from "../src/lib/art/kids.ts";
import { silhouetteOf } from "../src/lib/art/kit.ts";
import { LETTERING } from "../src/lib/art/lettering-glyphs.ts";
import { lettering, withCaption } from "../src/lib/art/lettering.ts";
import { DEFAULT_LOVE, drawLove, LOVE_IDS } from "../src/lib/art/love.ts";
import { SEASON_COVERS } from "../src/lib/art/seasons.ts";

/** Every url(#id) points at an element in the same document. */
export const refsResolve = (svg: string) => [...svg.matchAll(/url\(#([^)]+)\)/g)].every(([, ref]) => svg.includes(`id="${ref}"`));

const valid = (svg: string, label: string) => {
  assert.deepEqual(findSvgProblems(svg), [], label);
  assert.ok(refsResolve(svg), `${label}: unresolved url()`);
  assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>"), `${label}: not a document`);
};

describe("colour helpers", () => {
  it("normalises and mixes hex colours", () => {
    assert.equal(normalizeHex("abc"), "#AABBCC");
    assert.equal(normalizeHex("#12345g"), null);
    assert.equal(mix("#000000", "#FFFFFF", 0.5), "#808080");
  });
});

describe("creatures", () => {
  it("draws every reaction for every species, stance, and glass setting", () => {
    for (const reaction of REACTIONS) {
      for (const species of reaction.species) {
        for (const stance of reaction.stands ? (["sit", "stand"] as const) : (["sit"] as const)) {
          for (const glass of [false, true]) {
            valid(drawCreature({ ...DEFAULT_CREATURE, species, reaction: reaction.id, stance, glass, look: DEFAULT_LOOKS[species] }), `${species}/${reaction.id}/${stance}/${glass}`);
          }
        }
      }
    }
  });

  it("applies colours and toggles", () => {
    const svg = drawCreature({ ...DEFAULT_CREATURE, look: { fur: "#C8B6EF", eyes: "#3E8FDE" }, whiskers: false, blush: false });
    assert.ok(svg.includes("#C8B6EF") && svg.includes("#3E8FDE"));
    assert.ok(!svg.includes('data-part="whiskers"'));
    assert.ok(!/url\(#[^)]*-blush\)/.test(svg));
    const love = drawCreature({ ...DEFAULT_CREATURE, reaction: "love", heart: "#8A5FD6" });
    assert.ok(love.includes("#8A5FD6"), "heart colour is used");
  });

  it("couples fall back to cats and use the partner colour", () => {
    const svg = drawCreature({ ...DEFAULT_CREATURE, species: "ghost", reaction: "hug" });
    assert.ok(svg.includes(DEFAULT_CREATURE.partner.fur));
  });

  it("namespaces ids per variant and keeps portable output filter-free", () => {
    const first = drawCreature(DEFAULT_CREATURE).match(/id="([^"]+)"/)?.[1];
    const second = drawCreature({ ...DEFAULT_CREATURE, look: { fur: "#8EA3CF", eyes: "#2E9E6A" } }).match(/id="([^"]+)"/)?.[1];
    assert.notEqual(first, second);
    for (const reaction of ["hi", "fever", "diwali-hug"] as const) assert.ok(!drawCreature({ ...DEFAULT_CREATURE, reaction, portable: true }).includes("<filter"), reaction);
  });

  it("silhouettes drop whiskers, glows, lights, and sparks", () => {
    const svg = drawCreature({ ...DEFAULT_CREATURE, reaction: "sparkler" });
    const shape = silhouetteOf(svg);
    assert.ok(svg.includes('data-part="decor"') && svg.includes('data-part="whiskers"'));
    assert.ok(!shape.includes('data-part="decor"') && !shape.includes('data-part="glow"') && !shape.includes('data-part="whiskers"'));
    assert.ok(shape.includes("-outfit)"), "the character itself stays");
  });
});

describe("people, love, lettering", () => {
  it("draws every Diwali scene, most of them with people", () => {
    for (const id of DIWALI_IDS) valid(drawDiwali(id, DEFAULT_DIWALI), `diwali/${id}`);
    assert.ok(DIWALI_IDS.filter((id) => DIWALI_SCENES[id]!.people).length >= 15);
  });

  it("recolours Diwali outfits and skin", () => {
    const svg = drawDiwali("diya-girl", { ...DEFAULT_DIWALI, outfit: "#0E8A5C", skin: "#7A4C32", lights: false });
    assert.ok(svg.includes("#0E8A5C") || /stop-color="#[0-9A-F]{6}"/.test(svg));
    assert.ok(svg.includes("#7A4C32"));
    assert.ok(!svg.includes('data-part="decor"><path d="M-10'), "lights are off");
  });

  it("draws every Love scene in any heart colour", () => {
    for (const id of LOVE_IDS) valid(drawLove(id, { ...DEFAULT_LOVE, heart: "#8A5FD6" }), `love/${id}`);
  });

  it("traces lettering and captions stickers", () => {
    assert.ok(Object.keys(LETTERING).length >= 20);
    assert.equal(lettering("Not traced", "#000000", [0, 0], [10, 10]), "");
    const svg = withCaption(drawCreature(DEFAULT_CREATURE), "Hi!", "#E8175D");
    valid(svg, "caption");
    assert.ok(svg.includes("#E8175D") && !svg.includes("<text"));
  });

  it("draws festival covers", () => {
    for (const [season, draw] of Object.entries(SEASON_COVERS)) valid(draw(), season);
  });
});
