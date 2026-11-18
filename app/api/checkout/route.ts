import { NextResponse } from "next/server";
import { z } from "zod";
import { appUrl, isSandbox, required } from "@/lib/env";
import { orders } from "@/lib/orders";
import { whop } from "@/lib/whop";

export const runtime = "nodejs";

const Body = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

/**
 * Step 1 of guest checkout: store a pending order for the delivery email, then create a
 * server-side Whop checkout configuration that carries { orderId } as metadata and a
 * redirect back to /thank-you. The buyer never needs a Whop account.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  try {
    const planId = required("WHOP_PLAN_ID");
    const order = await orders().create(parsed.data.email);
    const config = await whop().checkoutConfigurations.create({
      account_id: process.env.WHOP_ACCOUNT_ID || undefined,
      variant_id: planId,
      metadata: { orderId: order.orderId },
      redirect_url: `${appUrl()}/thank-you?orderId=${order.orderId}`,
    });
    return NextResponse.json({
      orderId: order.orderId,
      checkoutConfigId: config.id,
      planId,
      environment: isSandbox() ? "sandbox" : "production",
    });
  } catch (err) {
    console.error("[checkout] failed", err);
    return NextResponse.json({ error: "We couldn't start checkout. Please try again in a moment." }, { status: 502 });
  }
}
