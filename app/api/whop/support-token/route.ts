import { NextRequest, NextResponse } from "next/server";
import { clearCookie } from "@/lib/cookies";
import { isSandbox } from "@/lib/env";
import { sameOrigin } from "@/lib/safe";
import { openSession, supportCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Hands the signed-in visitor's chat credentials to <ChatElement>. signedIn:false = not signed in yet. */
export async function GET(req: NextRequest) {
  const s = openSession(req.cookies.get(supportCookie())?.value);
  if (!s) return NextResponse.json({ signedIn: false }, { headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(
    {
      signedIn: true,
      accessToken: s.accessToken,
      channelId: s.channelId,
      accountId: process.env.WHOP_ACCOUNT_ID,
      name: s.name,
      environment: isSandbox() ? "sandbox" : "production",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Sign out of support chat. */
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return new NextResponse(null, { status: 403 });
  const res = NextResponse.json({ ok: true });
  clearCookie(res, supportCookie(), "/");
  return res;
}
