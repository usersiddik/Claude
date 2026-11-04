import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findSvgProblems } from "../src/lib/assets/svg.ts";
import { REACTIONS } from "../src/lib/art/creatures.ts";
import { DIWALI_IDS } from "../src/lib/art/kids.ts";
import { LOVE_IDS } from "../src/lib/art/love.ts";
import { CAPTION_LIMIT, cleanCaption, designSlug, renderDesign, REPLY_SCHEMA, sanitizeDesign, sanitizeReply, type Design } from "../src/lib/ai/design.ts";
import { exportDesign } from "../src/lib/ai/export.ts";
import { composeLocally } from "../src/lib/ai/local.ts";
import { SYSTEM_PROMPT } from "../src/lib/ai/prompt.ts";
import { drawableText, traceText } from "../src/lib/ai/trace.ts";
import { refsResolve } from "./art.test.ts";

/** Strict structured outputs need every object closed and every property required. */
function assertStrict(schema: unknown, path = "$"): void {
  if (!schema || typeof schema !== "object") return;
  const node = schema as Record<string, unknown>;
  if (node.type === "object") {
    assert.equal(node.additionalProperties, false, `${path}: additionalProperties must be false`);
    const keys = Object.keys(node.properties as object).sort();
    assert.deepEqual([...(node.required as string[])].sort(), keys, `${path}: every property must be required`);
  }
  for (const [key, value] of Object.entries(node)) {
    if (Array.isArray(value)) value.forEach((item, index) => assertStrict(item, `${path}.${key}[${index}]`));
    else if (value && typeof value === "object") assertStrict(value, `${path}.${key}`);
  }
}

const valid = (svg: string, label: string) => {
  assert.deepEqual(findSvgProblems(svg), [], label);
  assert.ok(refsResolve(svg), `${label}: unresolved url()`);
};

describe("AI design schema", () => {
  it("is a strict schema that lists the whole catalogue", () => {
    assertStrict(REPLY_SCHEMA);
    const json = JSON.stringify(REPLY_SCHEMA);
    for (const reaction of REACTIONS) assert.ok(json.includes(`"${reaction.id}"`), reaction.id);
    for (const id of [...DIWALI_IDS, ...LOVE_IDS]) assert.ok(json.includes(`"${id}"`), id);
  });

  it("briefs the model on every option without volatile text", () => {
    for (const reaction of REACTIONS) assert.ok(SYSTEM_PROMPT.includes(`- ${reaction.id}:`), reaction.id);
    for (const id of [...DIWALI_IDS, ...LOVE_IDS]) assert.ok(SYSTEM_PROMPT.includes(`- ${id}:`), id);
    assert.ok(!/\b20\d\d-\d\d-\d\d\b/.test(SYSTEM_PROMPT), "no dates, so the prompt caches");
  });
});

describe("AI design validation", () => {
  it("repairs designs the engine can't draw as asked", () => {
    const repaired = sanitizeDesign({ kind: "creature", title: "<b>Hug</b>", species: "ghost", reaction: "hug", stance: "stand", fur: "nope", eyes: "#3a2c26", caption: "<script>Hi</script>", captionColor: "#123" });
    assert.ok(repaired && repaired.kind === "creature");
    assert.equal(repaired.species, "cat", "couples are cats");
    assert.equal(repaired.stance, "sit", "hug has no standing pose");
    assert.equal(repaired.fur, "#F4A24C");
    assert.equal(repaired.eyes, "#3A2C26");
    assert.equal(repaired.captionColor, "#112233");
    assert.ok(!repaired.title.includes("<") && !repaired.caption.includes("<"));
  });

  it("rejects unknown kinds and scenes and trims captions", () => {
    assert.equal(sanitizeDesign({ kind: "dragon" }), null);
    assert.equal(sanitizeDesign({ kind: "kids", scene: "moon-landing" }), null);
    assert.equal(sanitizeDesign(null), null);
    assert.ok(cleanCaption("Happy birthday to my favourite person in the world").length <= CAPTION_LIMIT);
    const reply = sanitizeReply({ reply: "Hi", designs: [{ kind: "love", scene: "rose" }, { kind: "x" }, { kind: "love", scene: "tulip" }] });
    assert.equal(reply?.designs.length, 2);
  });
});

describe("AI rendering and lettering", () => {
  it("traces captions in the sticker font and drops what it can't draw", () => {
    const traced = traceText("Happy Diwali Riya!");
    assert.ok(traced && traced.w > traced.h && traced.d.startsWith("M"));
    assert.equal(drawableText("Hi नमस्ते Meera"), "Hi Meera");
    assert.equal(traceText("नमस्ते"), null);
  });

  it("draws every kind of design, with and without a caption", () => {
    const designs = [...composeLocally("pink frog saying good morning to Meera").designs, ...composeLocally("Diwali for my sister Riya").designs, ...composeLocally("purple heart that says Be mine").designs];
    assert.ok(designs.some((design) => design.kind === "kids") && designs.some((design) => design.kind === "love"));
    for (const design of designs) {
      const lettering = design.caption ? traceText(design.caption) : null;
      valid(renderDesign(design, lettering), `${design.kind}/${design.title}`);
      assert.ok(!renderDesign(design, lettering, true).includes("<filter"), "portable output has no filters");
    }
  });

  it("exports AI stickers as code", () => {
    const design = { ...composeLocally("grumpy cat").designs[0]!, lettering: null };
    assert.match(designSlug(design), /^ai-[a-z0-9-]+$/);
    assert.match(exportDesign(design, "react"), /export function Ai\w+Sticker/);
    assert.ok(!exportDesign(design, "flutter").includes("<filter"));
  });
});

describe("quick mode", () => {
  it("answers with three designs and letters names and quoted words", () => {
    const diwali = composeLocally("Diwali sticker for my sister Riya");
    assert.equal(diwali.designs.length, 3);
    assert.ok(diwali.designs.every((design) => design.kind === "kids"));
    assert.equal(diwali.designs[0]!.caption, "Happy Diwali Riya");
    assert.equal(composeLocally("grumpy cat that says 'Monday again'").designs[0]!.caption, "Monday again");
    const couple = composeLocally("two cats hugging").designs.map((design) => (design as Extract<Design, { kind: "creature" }>).reaction);
    assert.equal(new Set(couple).size, 3, "couples vary their pose");
  });

  it("refines earlier designs from chips and plain words", () => {
    const first = composeLocally("grumpy cat").designs;
    const blue = composeLocally("make it blue", first).designs;
    assert.ok(blue.every((design) => design.kind !== "creature" || design.fur === "#9CC8F2"));
    assert.ok(composeLocally("Add a caption", first).designs.every((design) => design.caption.length > 0));
    const cuter = composeLocally("Make it cuter", first).designs;
    assert.notDeepEqual(cuter.map((design) => (design as Extract<Design, { kind: "creature" }>).reaction), first.map((design) => (design as Extract<Design, { kind: "creature" }>).reaction));
    assert.equal(composeLocally("Another colour", first).reply, "Updated. Here it is with your changes.");
    assert.equal(composeLocally("Something different", first).reply, "Here's a fresh direction.");
  });
});
