import { NextRequest, NextResponse } from "next/server";
import { appUrl, required } from "@/lib/env";
import { clearCookie, cookieOpts } from "@/lib/cookies";
import { oauthBase, oauthCookie } from "@/lib/oauth";
import { safeEqual, safeErr } from "@/lib/safe";
import { sealSession, supportCookie } from "@/lib/session";
import { verifyToken } from "@/lib/tokens";
import { whop } from "@/lib/whop";

export const runtime = "nodejs";

const back = (qs: string) => NextResponse.redirect(`${appUrl()}/?${qs}#faq`);

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  if (sp.get("error")) return back("support=error");

  const saved = verifyToken<{ state: string; verifier: string }>("oauth-support", req.cookies.get(oauthCookie())?.value);
  const code = sp.get("code");
  if (!saved || !code || !safeEqual(sp.get("state") ?? "", saved.state)) return back("support=error");

  try {
    // 1) exchange the code (PKCE public client)
    const tokenRes = await fetch(`${oauthBase()}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${appUrl()}/api/whop/oauth/callback`,
        client_id: required("WHOP_APP_ID"),
        code_verifier: saved.verifier,
      }),
    });
    if (!tokenRes.ok) throw new Error(`token ${tokenRes.status}`);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    // 2) who is this? `sub` is the verified Whop user id
    const infoRes = await fetch(`${oauthBase()}/oauth/userinfo`, { headers: { Authorization: `Bearer ${access_token}` } });
    if (!infoRes.ok) throw new Error(`userinfo ${infoRes.status}`);
    const info = (await infoRes.json()) as { sub: string; name?: string };

    // 3) open (or fetch the existing) support channel — server key carries support_chat:create
    const channel = await whop().supportChannels.create({ account_id: required("WHOP_ACCOUNT_ID"), user_id: info.sub });

    const res = back("support=open");
    res.cookies.set(supportCookie(), sealSession({ userId: info.sub, channelId: channel.id, accessToken: access_token, name: info.name }), cookieOpts("/", 3300)); // access tokens last 1 hour
    clearCookie(res, oauthCookie(), "/api/whop/oauth");
    return res;
  } catch (err) {
    console.error("[whop oauth] callback failed", safeErr(err));
    return back("support=error");
  }
}
