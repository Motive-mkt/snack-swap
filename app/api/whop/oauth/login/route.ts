import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { appUrl, required } from "@/lib/env";
import { OAUTH_COOKIE, oauthBase } from "@/lib/oauth";
import { signToken } from "@/lib/tokens";

export const runtime = "nodejs";

/** Support Chat only: sends the visitor through Whop OAuth (PKCE). Buying never touches this. */
export async function GET() {
  const verifier = randomBytes(32).toString("base64url");
  const state = randomBytes(16).toString("base64url");
  const nonce = randomBytes(16).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const url = new URL(`${oauthBase()}/oauth/authorize`);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: required("WHOP_APP_ID"),
    redirect_uri: `${appUrl()}/api/whop/oauth/callback`,
    scope: "openid profile support_chat:read support_chat:message:create",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();

  const res = NextResponse.redirect(url);
  res.cookies.set(OAUTH_COOKIE, signToken({ state, verifier }, 600), {
    httpOnly: true,
    secure: appUrl().startsWith("https"),
    sameSite: "lax",
    path: "/api/whop/oauth",
    maxAge: 600,
  });
  return res;
}
