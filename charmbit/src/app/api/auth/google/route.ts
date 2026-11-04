import { NextResponse, type NextRequest } from "next/server";
import { authConfig, callbackUrl, cookieOptions, GOOGLE_AUTHORIZE, STATE_COOKIE, STATE_TTL } from "@/lib/auth/config";
import { pkceChallenge, randomToken, safeReturnTo, sign } from "@/lib/auth/token";

export const dynamic = "force-dynamic";

/** Starts Google sign-in: remembers where to come back to, then hands over to Google. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get("returnTo"));
  const config = authConfig();
  if (!config) {
    // URL keeps the flag in the query, ahead of any #fragment.
    const back = new URL(returnTo, url.origin);
    back.searchParams.set("auth", "unavailable");
    return NextResponse.redirect(back);
  }

  const state = randomToken();
  const verifier = randomToken(48);
  const google = new URL(GOOGLE_AUTHORIZE);
  google.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(url.origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: await pkceChallenge(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  const response = NextResponse.redirect(google);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(STATE_COOKIE, await sign({ state, verifier, returnTo }, config.secret, STATE_TTL), cookieOptions(url.protocol === "https:", STATE_TTL));
  return response;
}
