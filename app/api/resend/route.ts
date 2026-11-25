import { NextResponse } from "next/server";
import { z } from "zod";
import { sendDeliveryEmail } from "@/lib/email";
import { whopMode } from "@/lib/env";
import { orders } from "@/lib/orders";
import { allow, clientIp, safeErr, sameOrigin } from "@/lib/safe";

export const runtime = "nodejs";
const Body = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

/** Always answers { ok: true } so the form can't be used to discover who bought. Rate-limited per email. */
export async function POST(req: Request) {
  if (whopMode()) return new NextResponse(null, { status: 404 }); // email delivery is off while Whop delivers the PDF
  if (!sameOrigin(req)) return new NextResponse(null, { status: 403 });
  if (!allow(`resend:${clientIp(req)}`, 5, 60_000)) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  const { email } = parsed.data;
  try {
    const store = orders();
    if (await store.once(`resend:${email}`, 60)) {
      const order = await store.latestPaidByEmail(email);
      if (order) await sendDeliveryEmail(order.buyerEmail, order.orderId);
    }
  } catch (err) {
    console.error("[resend] failed", safeErr(err));
  }
  return NextResponse.json({ ok: true });
}
