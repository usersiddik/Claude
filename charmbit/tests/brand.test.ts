import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL("../src/", import.meta.url).pathname;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test("brand config derives every form of the name", async () => {
  const { BRAND, brandKey } = await import("../src/lib/brand.ts");
  assert.ok(BRAND.name.length > 0);
  assert.equal(BRAND.wordmark, BRAND.name.toLowerCase());
  assert.equal(BRAND.initial, BRAND.name.charAt(0).toUpperCase());
  assert.equal(brandKey("theme"), `${BRAND.id}:theme`);
});

test("NEXT_PUBLIC_BRAND_NAME overrides the working name", async () => {
  process.env.NEXT_PUBLIC_BRAND_NAME = "  Testname ";
  try {
    // A query string gives a fresh module instance that reads the variable again.
    const fresh = "../src/lib/brand.ts?override";
    const { BRAND } = (await import(fresh)) as typeof import("../src/lib/brand.ts");
    assert.equal(BRAND.name, "Testname");
    assert.equal(BRAND.wordmark, "testname");
    assert.equal(BRAND.initial, "T");
  } finally {
    delete process.env.NEXT_PUBLIC_BRAND_NAME;
  }
});

test("the working name appears only in the brand config", async () => {
  const { BRAND } = await import("../src/lib/brand.ts");
  const name = new RegExp(BRAND.name, "i");
  const offenders = files(SRC)
    .filter((path) => !path.endsWith(join("lib", "brand.ts")))
    .filter((path) => name.test(readFileSync(path, "utf8")))
    .map((path) => path.slice(SRC.length));
  assert.deepEqual(offenders, []);
});
