import { NextRequest, NextResponse } from "next/server";
import { ADMIN_TTL_SECONDS, adminConfig, adminCookie, adminOauthCookie, checkIdentity, sealAdmin } from "@/lib/admin";
import { clearCookie, cookieOpts } from "@/lib/cookies";
import { appUrl } from "@/lib/env";
import { oauthBase } from "@/lib/oauth";
import { allow, clientIp, safeEqual, safeErr } from "@/lib/safe";
import { verifyToken } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Success and failure both land on /admin, which shows the owner their page and everyone else a plain 404. */
function finish(reason: string | null, sealed?: string) {
  if (reason) console.warn(`[admin] sign-in refused: ${reason}`); // reason codes only, never personal data
  const res = NextResponse.redirect(`${appUrl()}/admin`);
  clearCookie(res, adminOauthCookie(), "/api/admin");
  if (sealed) res.cookies.set(adminCookie(), sealed, cookieOpts("/", ADMIN_TTL_SECONDS));
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(req: NextRequest) {
  const cfg = adminConfig();
  if (!cfg) return new NextResponse(null, { status: 404 });
  if (!allow(`admin-callback:${clientIp(req)}`, 20, 60_000)) return new NextResponse(null, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const saved = verifyToken<{ state: string; verifier: string }>("oauth-admin", req.cookies.get(adminOauthCookie())?.value);
  const code = sp.get("code");
  const state = sp.get("state");
  if (sp.get("error")) return finish("provider-error");
  if (!saved || !code || code.length > 2048 || !state || !safeEqual(state, saved.state)) return finish("bad-state");

  let accessToken = "";
  try {
    // 1) exchange the one-time code (PKCE public client: no client secret exists to leak)
    const tokenRes = await fetch(`${oauthBase()}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${appUrl()}/api/admin/callback`,
        client_id: cfg.appId,
        code_verifier: saved.verifier,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!tokenRes.ok) return finish(`token-${tokenRes.status}`);
    accessToken = ((await tokenRes.json()) as { access_token?: string }).access_token ?? "";
    if (!accessToken) return finish("token-empty");

    // 2) who is this? Whop answers with the verified account id and email
    const infoRes = await fetch(`${oauthBase()}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!infoRes.ok) return finish(`userinfo-${infoRes.status}`);
    const info = (await infoRes.json()) as { sub?: string; name?: string; email?: string; email_verified?: boolean };

    // 3) only the owner's own account, and (when set) only their verified email
    const bad = checkIdentity(cfg, info);
    if (bad) return finish(bad);
    return finish(null, sealAdmin(cfg, info.name));
  } catch (err) {
    console.error("[admin] sign-in failed", safeErr(err));
    return finish("error");
  } finally {
    // The Whop token was only needed to read who you are. Revoke it right away (best effort).
    if (accessToken) {
      fetch(`${oauthBase()}/oauth/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken, client_id: cfg.appId }),
        signal: AbortSignal.timeout(4000),
      }).catch(() => {});
    }
  }
}
