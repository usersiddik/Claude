import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { base64url, pkceChallenge, safeReturnTo, sign, userFromIdToken, verify } from "../src/lib/auth/token.ts";

const SECRET = "a-test-secret-that-is-long-enough-1234567890";
const encode = (value: unknown) => base64url(new TextEncoder().encode(JSON.stringify(value)));
const idToken = (claims: Record<string, unknown>) => `${encode({ alg: "RS256" })}.${encode(claims)}.signature`;
const NOW = 1_800_000_000_000;
const good = { iss: "https://accounts.google.com", aud: "client-123", sub: "42", email: "riya@example.com", email_verified: true, name: "Riya", picture: "https://lh3.googleusercontent.com/a/x", exp: NOW / 1000 + 600 };

describe("signed tokens", () => {
  it("round-trips and expires", async () => {
    const token = await sign({ sub: "42", name: "Riya" }, SECRET, 60, NOW);
    assert.deepEqual({ ...(await verify(token, SECRET, NOW)), exp: 0 }, { sub: "42", name: "Riya", exp: 0 });
    assert.equal(await verify(token, SECRET, NOW + 61_000), null, "expired");
  });

  it("rejects tampering, other secrets, and junk", async () => {
    const token = await sign({ sub: "42" }, SECRET, 60, NOW);
    const [payload, signature] = token.split(".");
    const forged = `${encode({ sub: "1", exp: NOW / 1000 + 60 })}.${signature}`;
    assert.equal(await verify(forged, SECRET, NOW), null);
    assert.equal(await verify(`${payload}.${signature}x`, SECRET, NOW), null);
    assert.equal(await verify(token, `${SECRET}-other`, NOW), null);
    for (const junk of [undefined, "", "abc", "a.b.c", "....", `${payload}.`]) assert.equal(await verify(junk, SECRET, NOW), null, String(junk));
  });
});

describe("PKCE and return paths", () => {
  it("matches the RFC 7636 example challenge", async () => {
    assert.equal(await pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"), "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("only allows paths on this site", () => {
    assert.equal(safeReturnTo("/?c=cats&s=hi#library"), "/?c=cats&s=hi#library");
    for (const bad of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "", null, undefined, "/a\nb"]) assert.equal(safeReturnTo(bad), "/", String(bad));
  });
});

describe("Google ID tokens", () => {
  it("reads a verified Google user", () => {
    assert.deepEqual(userFromIdToken(idToken(good), "client-123", NOW), { sub: "42", email: "riya@example.com", name: "Riya", picture: "https://lh3.googleusercontent.com/a/x" });
  });

  it("rejects the wrong issuer, audience, expiry, or an unverified email", () => {
    for (const [label, claims] of [
      ["issuer", { ...good, iss: "https://evil.example" }],
      ["audience", { ...good, aud: "someone-else" }],
      ["expired", { ...good, exp: NOW / 1000 - 1 }],
      ["unverified", { ...good, email_verified: false }],
      ["no email", { ...good, email: undefined }],
    ] as const) {
      assert.equal(userFromIdToken(idToken(claims), "client-123", NOW), null, label);
    }
    assert.equal(userFromIdToken("not-a-token", "client-123", NOW), null);
  });

  it("drops non-https photos and falls back to the email name", () => {
    const user = userFromIdToken(idToken({ ...good, name: "", picture: "http://example.com/a.png" }), "client-123", NOW);
    assert.equal(user?.name, "riya");
    assert.equal(user?.picture, null);
  });
});
