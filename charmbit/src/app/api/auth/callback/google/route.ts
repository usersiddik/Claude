import { NextResponse, type NextRequest } from "next/server";
import { authConfig, callbackUrl, cookieOptions, GOOGLE_TOKEN, SESSION_COOKIE, SESSION_TTL, STATE_COOKIE } from "@/lib/auth/config";
import { safeReturnTo, sign, userFromIdToken, verify } from "@/lib/auth/token";

export const dynamic = "force-dynamic";

/** Google sends people back here. Checks the request we started, then signs them in. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const config = authConfig();
  const pending = config ? await verify<{ state: string; verifier: string; returnTo: string }>(request.cookies.get(STATE_COOKIE)?.value, config.secret) : null;
  const returnTo = safeReturnTo(pending?.returnTo);
  const secure = url.protocol === "https:";

  const back = (status: "ok" | "error") => {
    // URL keeps the flag in the query, ahead of any #fragment.
    const target = new URL(returnTo, url.origin);
    if (status === "error") target.searchParams.set("auth", "error");
    const response = NextResponse.redirect(target);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(STATE_COOKIE, "", cookieOptions(secure, 0));
    return response;
  };

  const code = url.searchParams.get("code");
  // The state must match the one we set, or this isn't a sign-in we started.
  if (!config || !pending || !code || url.searchParams.get("state") !== pending.state) return back("error");

  try {
    const exchange = await fetch(GOOGLE_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: callbackUrl(url.origin),
        code_verifier: pending.verifier,
      }),
      cache: "no-store",
    });
    if (!exchange.ok) return back("error");
    const tokens = (await exchange.json()) as { id_token?: string };
    const user = tokens.id_token ? userFromIdToken(tokens.id_token, config.clientId) : null;
    if (!user) return back("error");
    const response = back("ok");
    response.cookies.set(SESSION_COOKIE, await sign({ ...user }, config.secret, SESSION_TTL), cookieOptions(secure, SESSION_TTL));
    return response;
  } catch {
    return back("error");
  }
}
