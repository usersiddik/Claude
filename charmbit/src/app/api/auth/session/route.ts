import { NextResponse, type NextRequest } from "next/server";
import { authConfig, SESSION_COOKIE } from "@/lib/auth/config";
import { verify, type User } from "@/lib/auth/token";

export const dynamic = "force-dynamic";

/** Who's signed in. `enabled` is false until Google sign-in is configured. */
export async function GET(request: NextRequest) {
  const config = authConfig();
  const session = config ? await verify<User & Record<string, unknown>>(request.cookies.get(SESSION_COOKIE)?.value, config.secret) : null;
  const user: User | null = session ? { sub: session.sub, email: session.email, name: session.name, picture: session.picture } : null;
  return NextResponse.json({ enabled: Boolean(config), user }, { headers: { "Cache-Control": "private, no-store" } });
}
