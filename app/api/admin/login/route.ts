import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminConfig, adminOauthCookie } from "@/lib/admin";
import { cookieOpts } from "@/lib/cookies";
import { appUrl } from "@/lib/env";
import { oauthBase } from "@/lib/oauth";
import { allow, clientIp } from "@/lib/safe";
import { signToken } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Starts owner sign-in through Whop (OAuth 2.1 + PKCE). Looks like any missing page unless the owner area is configured. */
export async function GET(req: NextRequest) {
  const cfg = adminConfig();
  if (!cfg) return new NextResponse(null, { status: 404 });
  if (!allow(`admin-login:${clientIp(req)}`, 20, 60_000)) return new NextResponse(null, { status: 429 });

  const verifier = randomBytes(32).toString("base64url");
  const state = randomBytes(16).toString("base64url");
  const nonce = randomBytes(16).toString("base64url");

  const url = new URL(`${oauthBase()}/oauth/authorize`);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: cfg.appId,
    redirect_uri: `${appUrl()}/api/admin/callback`,
    scope: "openid profile email",
    state,
    nonce,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
  }).toString();

  const res = NextResponse.redirect(url);
  res.cookies.set(adminOauthCookie(), signToken("oauth-admin", { state, verifier }, 600), cookieOpts("/api/admin", 600));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
