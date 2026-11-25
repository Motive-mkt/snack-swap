import { NextResponse, type NextRequest } from "next/server";
import { adminCookie, openAdmin } from "@/lib/admin";

/**
 * First lock on the owner area. Anyone without a valid owner session is sent to a page that doesn't exist,
 * so /admin and /api/admin/* look exactly like any other missing address. Every owner page and route checks
 * the session again itself, so this is a second lock, never the only one.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const signingIn = pathname === "/api/admin/login" || pathname === "/api/admin/callback"; // must work before you're signed in
  if (!signingIn && !openAdmin(req.cookies.get(adminCookie())?.value)) {
    return NextResponse.rewrite(new URL("/_not-found-owner", req.url));
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"] };
