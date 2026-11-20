import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** TEMPORARY: receives phone-side breadcrumbs from the /d/<mode> test pages and writes them to the runtime log. */
export async function POST(req: Request) {
  const body = (await req.text()).slice(0, 1800);
  console.log("[diag] b " + body);
  return new NextResponse(null, { status: 204 });
}
