import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookieOpts } from "@/lib/cookies";
import { appUrl } from "@/lib/env";
import { oauthBase, oauthCookie } from "@/lib/oauth";
import { allow, clientIp } from "@/lib/safe";
import { signToken } from "@/lib/tokens";

export const runtime = "nodejs";

/** Support Chat only: sends the visitor through Whop OAuth (PKCE). Buying never touches this. */
export async function GET(req: Request) {
  const appId = process.env.WHOP_APP_ID;
  if (!appId || !allow(`support-login:${clientIp(req)}`, 20, 60_000)) return NextResponse.redirect(`${appUrl()}/?support=error#faq`);
  const verifier = randomBytes(32).toString("base64url");
  const state = randomBytes(16).toString("base64url");
  const nonce = randomBytes(16).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const url = new URL(`${oauthBase()}/oauth/authorize`);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: appId,
    redirect_uri: `${appUrl()}/api/whop/oauth/callback`,
    scope: "openid profile support_chat:read support_chat:message:create",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();

  const res = NextResponse.redirect(url);
  res.cookies.set(oauthCookie(), signToken("oauth-support", { state, verifier }, 600), cookieOpts("/api/whop/oauth", 600));
  return res;
}
