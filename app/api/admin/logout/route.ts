import { NextRequest, NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin";
import { clearCookie } from "@/lib/cookies";
import { appUrl } from "@/lib/env";
import { sameOrigin } from "@/lib/safe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return new NextResponse(null, { status: 403 });
  const res = NextResponse.redirect(`${appUrl()}/`, 303);
  clearCookie(res, adminCookie(), "/");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
