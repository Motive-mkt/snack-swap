import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { unwrapWebhook } from "@whop/sdk/helpers";
import { sendDeliveryEmail } from "@/lib/email";
import { whopMode } from "@/lib/env";
import { orders } from "@/lib/orders";

export const runtime = "nodejs";
export const maxDuration = 10; // Whop expects a 2xx within 5 seconds

type PaymentData = {
  id?: string;
  status?: string;
  product_id?: string | null;
  customer_email?: string | null;
  metadata?: Record<string, unknown> | null;
};
type WhopEvent = { type?: string; data?: PaymentData };

const DAY = 60 * 60 * 24;

export async function POST(req: Request) {
  const raw = await req.text(); // raw body — required for signature verification
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) return new NextResponse("Webhook secret not configured", { status: 500 });

  let event: WhopEvent;
  try {
    event = unwrapWebhook<WhopEvent>(raw, { headers: Object.fromEntries(req.headers), key: secret });
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type !== "payment.succeeded" || !event.data) return NextResponse.json({ ok: true, ignored: event.type });

  const store = orders();
  const whId = req.headers.get("webhook-id") ?? "";
  // Whop delivers at-least-once and retries up to 12 times: make every delivery idempotent.
  if (whId && !(await store.once(`wh:${whId}`, 4 * DAY))) return NextResponse.json({ ok: true, duplicate: true });

  const p = event.data;
  try {
    const expectedProduct = process.env.WHOP_PRODUCT_ID;
    if (expectedProduct && p.product_id && p.product_id !== expectedProduct) return NextResponse.json({ ok: true, ignored: "other product" });

    const metaId = typeof p.metadata?.orderId === "string" ? p.metadata.orderId : undefined;
    let order = metaId ? await store.get(metaId) : null;
    if (!order) {
      // Pending record missing (e.g. cold in-memory store) or purchase made outside our checkout:
      // fall back to the email Whop collected so the buyer is never left without a file.
      if (!p.customer_email) return NextResponse.json({ ok: true, ignored: "no email" });
      order = { orderId: metaId ?? randomUUID(), buyerEmail: p.customer_email.toLowerCase(), status: "pending", createdAt: new Date().toISOString() };
      await store.put(order);
    }

    const paid = await store.markPaid(order.orderId, p.id);
    if (paid && !whopMode() && (await store.once(`mail:${paid.orderId}`, 400 * DAY))) {
      try {
        await sendDeliveryEmail(paid.buyerEmail, paid.orderId);
      } catch (e) {
        await store.forget(`mail:${paid.orderId}`);
        throw e;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[whop webhook] failed", err);
    if (whId) await store.forget(`wh:${whId}`); // let Whop's retry run again
    return new NextResponse("Processing error", { status: 500 });
  }
}
