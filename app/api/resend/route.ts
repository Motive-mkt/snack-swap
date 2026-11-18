import { NextResponse } from "next/server";
import { z } from "zod";
import { sendDeliveryEmail } from "@/lib/email";
import { orders } from "@/lib/orders";

export const runtime = "nodejs";
const Body = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

/** Always answers { ok: true } so the form can't be used to discover who bought. Rate-limited per email. */
export async function POST(req: Request) {
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
    console.error("[resend] failed", err);
  }
  return NextResponse.json({ ok: true });
}
