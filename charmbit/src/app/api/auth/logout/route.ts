import { NextResponse, type NextRequest } from "next/server";
import { cookieOptions, SESSION_COOKIE } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

/** Signs out. POST only, so other sites can't sign people out with a link. */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(SESSION_COOKIE, "", cookieOptions(new URL(request.url).protocol === "https:", 0));
  return response;
}
