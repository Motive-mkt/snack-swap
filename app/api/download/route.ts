import { NextResponse } from "next/server";
import { orders } from "@/lib/orders";
import { getPdfSource, PDF_FILENAME } from "@/lib/storage";
import { verifyToken } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const payload = verifyToken<{ orderId: string }>(token);
  if (!payload) return new NextResponse("This download link is invalid or has expired. Request a new one from the site.", { status: 401 });

  const order = await orders().get(payload.orderId);
  if (!order || order.status !== "paid") return new NextResponse("Order not found or not paid.", { status: 403 });

  try {
    const src = await getPdfSource();
    if (src.kind === "redirect") return NextResponse.redirect(src.url, 302);
    return new Response(src.stream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(src.size),
        "Content-Disposition": `attachment; filename="${PDF_FILENAME}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[download] storage error", err);
    return new NextResponse("The file is temporarily unavailable. Please try again shortly.", { status: 500 });
  }
}
