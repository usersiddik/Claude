import { BRAND } from "../brand.ts";

/** Server-side sign-in settings. Sign-in (and the copy gate) turns on when all three are set. */
export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  secret: string;
}

export function authConfig(): AuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const secret = process.env.AUTH_SECRET;
  if (!clientId || !clientSecret || !secret || secret.length < 32) return null;
  return { clientId, clientSecret, secret };
}

export const SESSION_COOKIE = `${BRAND.id}_session`;
export const STATE_COOKIE = `${BRAND.id}_oauth`;
export const SESSION_TTL = 60 * 60 * 24 * 30;
export const STATE_TTL = 60 * 10;

export const GOOGLE_AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";

/** Cookie flags: never readable by scripts, sent on top-level returns from Google. */
export const cookieOptions = (secure: boolean, maxAge: number) => ({ httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge });

export const callbackUrl = (origin: string) => `${origin}/api/auth/callback/google`;
