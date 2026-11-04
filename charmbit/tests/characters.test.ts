import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findSvgProblems } from "../src/lib/assets/svg.ts";
import { mix, normalizeHex } from "../src/lib/characters/color.ts";
import { exportSubject, renderSubject } from "../src/lib/characters/export.ts";
import { DEFAULT_CHARACTER, REACTIONS } from "../src/lib/characters/options.ts";
import { renderCharacter, renderCouple, silhouetteOf } from "../src/lib/characters/render.ts";

const couple = {
  a: { fur: "#EED6B8", eyes: "#B9772A" },
  b: { fur: "#55555F", eyes: "#2F9A68" },
  pose: "snuggle" as const,
  reaction: "love" as const,
  glass: true,
  blush: true,
  stripes: true,
  whiskers: true,
  heart: true,
};

describe("colour helpers", () => {
  it("normalises and mixes hex colours", () => {
    assert.equal(normalizeHex("abc"), "#AABBCC");
    assert.equal(normalizeHex("#12345g"), null);
    assert.equal(mix("#000000", "#FFFFFF", 0.5), "#808080");
  });
});

describe("character renderer", () => {
  it("renders every reaction for both species as safe SVG", () => {
    for (const species of ["cat", "ghost"] as const) {
      for (const reaction of REACTIONS) {
        const svg = renderCharacter({ ...DEFAULT_CHARACTER, species, reaction: reaction.id });
        assert.deepEqual(findSvgProblems(svg), [], `${species}/${reaction.id}`);
        for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(svg.includes(`id="${ref}"`), `${species}/${reaction.id}: url(#${ref})`);
      }
    }
  });

  it("applies the chosen colours and toggles", () => {
    const svg = renderCharacter({ ...DEFAULT_CHARACTER, fur: "#C6B3EE", glass: false, blush: false, whiskers: false });
    assert.ok(svg.includes("#C6B3EE"));
    assert.ok(!svg.includes('data-part="whiskers"'));
    assert.ok(!/url\(#[^)]*-blush\)/.test(svg), "blush gradient unused");
    assert.ok(renderCharacter({ ...DEFAULT_CHARACTER, glass: true }).includes("-glass)"));
  });

  it("gives different variants different id namespaces", () => {
    const first = renderCharacter({ ...DEFAULT_CHARACTER, fur: "#F2A04A" }).match(/id="([^"]+)"/)?.[1];
    const second = renderCharacter({ ...DEFAULT_CHARACTER, fur: "#7F96C6" }).match(/id="([^"]+)"/)?.[1];
    assert.notEqual(first, second);
  });

  it("renders both couple poses with resolvable references", () => {
    for (const pose of ["snuggle", "cheek"] as const) {
      const svg = renderCouple({ ...couple, pose });
      assert.deepEqual(findSvgProblems(svg), [], pose);
      for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(svg.includes(`id="${ref}"`), `${pose}: url(#${ref})`);
    }
  });

  it("portable output has no filters", () => {
    assert.ok(!renderCharacter({ ...DEFAULT_CHARACTER, portable: true }).includes("<filter"));
    assert.ok(!renderCouple({ ...couple, portable: true }).includes("<filter"));
  });

  it("silhouette drops whiskers only", () => {
    const svg = renderCharacter(DEFAULT_CHARACTER);
    const shape = silhouetteOf(svg);
    assert.ok(!shape.includes('data-part="whiskers"'));
    assert.ok(shape.length < svg.length && shape.includes("<path"));
  });
});

describe("studio exports", () => {
  const subject = { kind: "single" as const, options: DEFAULT_CHARACTER };
  it("exports SVG, React, and filter-free Flutter", () => {
    assert.match(exportSubject(subject, "svg"), /<title>Cat Love<\/title>/);
    assert.match(exportSubject(subject, "react"), /export function CatLoveCharm/);
    const dart = exportSubject(subject, "flutter");
    assert.match(dart, /class CatLoveCharm extends StatelessWidget/);
    assert.ok(!dart.includes("<filter"));
    assert.ok(renderSubject(subject).includes("<filter"));
  });
});
