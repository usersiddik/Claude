/**
 * Small, dependency-free building blocks for Google sign-in: signed tokens
 * (HMAC-SHA256 via Web Crypto), PKCE, safe return paths, and ID token checks.
 * Pure functions, so they're easy to test.
 */

export interface User {
  /** Google account id. */
  sub: string;
  email: string;
  name: string;
  picture: string | null;
}

const encoder = new TextEncoder();

export function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64url(text: string): Uint8Array {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

/** Constant-time comparison, so signatures can't be guessed byte by byte. */
function same(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index]! ^ b[index]!;
  return diff === 0;
}

/** `payload.signature`, with an expiry (seconds since the epoch) inside the payload. */
export async function sign(data: Record<string, unknown>, secret: string, ttlSeconds: number, now = Date.now()): Promise<string> {
  const payload = base64url(encoder.encode(JSON.stringify({ ...data, exp: Math.floor(now / 1000) + ttlSeconds })));
  return `${payload}.${base64url(await hmac(secret, payload))}`;
}

/** The payload when the signature is valid and it hasn't expired; otherwise null. */
export async function verify<T extends Record<string, unknown>>(token: string | undefined, secret: string, now = Date.now()): Promise<(T & { exp: number }) | null> {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;
  try {
    if (!same(fromBase64url(signature), await hmac(secret, payload))) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as T & { exp?: unknown };
    if (typeof data.exp !== "number" || data.exp * 1000 <= now) return null;
    return data as T & { exp: number };
  } catch {
    return null;
  }
}

/** PKCE S256 challenge for a verifier. */
export async function pkceChallenge(verifier: string): Promise<string> {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(verifier))));
}

/** Only same-site paths, so sign-in can't be used to bounce people to another site. */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\") || /[\r\n]/.test(value)) return "/";
  return value.slice(0, 512);
}

/**
 * Reads the user from a Google ID token received directly from Google's token
 * endpoint over TLS (OpenID Connect allows trusting the signature in that case),
 * after checking issuer, audience, expiry, and a verified email.
 */
export function userFromIdToken(idToken: string, clientId: string, now = Date.now()): User | null {
  try {
    const part = idToken.split(".")[1];
    if (!part) return null;
    const claims = JSON.parse(new TextDecoder().decode(fromBase64url(part))) as Record<string, unknown>;
    const issuerOk = claims.iss === "https://accounts.google.com" || claims.iss === "accounts.google.com";
    const audienceOk = claims.aud === clientId || (Array.isArray(claims.aud) && claims.aud.includes(clientId));
    const fresh = typeof claims.exp === "number" && claims.exp * 1000 > now;
    if (!issuerOk || !audienceOk || !fresh || claims.email_verified !== true) return null;
    if (typeof claims.sub !== "string" || typeof claims.email !== "string") return null;
    return {
      sub: claims.sub,
      email: claims.email,
      name: typeof claims.name === "string" && claims.name ? claims.name : claims.email.split("@")[0]!,
      picture: typeof claims.picture === "string" && claims.picture.startsWith("https://") ? claims.picture : null,
    };
  } catch {
    return null;
  }
}
