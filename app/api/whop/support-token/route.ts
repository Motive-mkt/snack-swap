import { NextRequest, NextResponse } from "next/server";
import { isSandbox } from "@/lib/env";
import { openSession, SUPPORT_COOKIE } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Hands the signed-in visitor's chat credentials to <ChatElement>. 401 = not signed in yet. */
export async function GET(req: NextRequest) {
  const s = openSession(req.cookies.get(SUPPORT_COOKIE)?.value);
  if (!s) return NextResponse.json({ signedIn: false }, { status: 401 });
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
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SUPPORT_COOKIE);
  return res;
}
