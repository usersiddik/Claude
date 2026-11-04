import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { optimizeSvg } from "../src/lib/assets/svg.ts";
import { componentName } from "../src/lib/exports/index.ts";
import { svgToJsx, toJsxAttributeName } from "../src/lib/exports/react.ts";
import { toFlutter } from "../src/lib/exports/flutter.ts";
import { toReact } from "../src/lib/exports/react.ts";
import { toSvg } from "../src/lib/exports/svg.ts";

const source = {
  title: "Test's Star",
  slug: "test-star",
  family: "charm" as const,
  sourceSvg: optimizeSvg(`<?xml version="1.0"?>
    <!-- comment -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none">
      <title>Old</title>
      <path d="M1 1h2" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <circle cx="4" cy="4" r="2" fill="#F6D673"/>
    </svg>`),
};

describe("optimizeSvg", () => {
  it("strips metadata and whitespace", () => {
    assert.equal(
      source.sourceSvg,
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none"><path d="M1 1h2" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="4" cy="4" r="2" fill="#F6D673"/></svg>',
    );
  });
});

describe("naming", () => {
  it("builds PascalCase component names with a family suffix", () => {
    assert.equal(componentName("gold-star", "charm"), "GoldStarCharm");
    assert.equal(componentName("twin-copy", "mark"), "TwinCopyMark");
    assert.equal(componentName("3d-cube", "duo"), "Asset3dCubeDuo");
  });
});

describe("SVG export", () => {
  it("adds an escaped title, role and intrinsic size", () => {
    const svg = toSvg(source);
    assert.match(svg, /^<svg [^>]*width="96" height="96"[^>]*role="img">/);
    assert.match(svg, /<title>Test's Star<\/title>/);
    assert.ok(!svg.includes("Old"));
    assert.ok(svg.endsWith("</svg>"));
  });
});

describe("React export", () => {
  it("converts attributes to JSX", () => {
    assert.equal(toJsxAttributeName("stroke-width"), "strokeWidth");
    assert.equal(toJsxAttributeName("class"), "className");
    assert.equal(toJsxAttributeName("aria-hidden"), "aria-hidden");
    assert.equal(svgToJsx('<path stroke-linecap="round"/>'), '<path strokeLinecap="round" />');
  });

  it("produces a typed, accessible component", () => {
    const code = toReact(source);
    assert.match(code, /export function TestStarCharm\(/);
    assert.match(code, /export type TestStarCharmProps/);
    assert.match(code, /size = 96/);
    assert.match(code, /title = "Test's Star"/);
    assert.match(code, /role=\{decorative \? undefined : "img"\}/);
    assert.match(code, /strokeWidth="3"/);
    assert.ok(!code.includes("stroke-width"));
  });
});

describe("Flutter export", () => {
  it("wraps the SVG in SvgPicture.string with the dependency noted", () => {
    const code = toFlutter(source);
    assert.match(code, /flutter pub add flutter_svg/);
    assert.match(code, /class TestStarCharm extends StatelessWidget/);
    assert.match(code, /SvgPicture\.string\(/);
    assert.match(code, /semanticsLabel = 'Test\\'s Star'/);
    assert.ok(code.includes(`r'''${source.sourceSvg}'''`));
  });
});
