import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, Loader2, TriangleAlert } from "lucide-react";
import { AutoRefresh } from "@/components/AutoRefresh";
import { ResendForm } from "@/components/ResendForm";
import { downloadUrlFor } from "@/lib/email";
import { whopAccessUrl, whopMode } from "@/lib/env";
import { orders } from "@/lib/orders";
import { safeErr } from "@/lib/safe";
import { whop } from "@/lib/whop";

export const metadata: Metadata = { title: "Thank you — Snack Swap Playbook", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ orderId?: string; payment?: string; payment_id?: string; status?: string }>;

async function resolveOrder(orderId: string, paymentId?: string) {
  const store = orders();
  let order = await store.get(orderId);
  if (order?.status === "paid") return { order, failed: false };

  // Buyer kept the tab open: confirm with Whop directly instead of waiting for the webhook.
  if (paymentId) {
    try {
      const pay = await whop().payments.retrieve({ id: paymentId });
      const metaId = (pay.metadata as Record<string, unknown> | null)?.orderId;
      if (pay.status === "paid" && metaId === orderId) {
        if (!order) {
          const email = pay.customer_email;
          if (email) await store.put({ orderId, buyerEmail: email.toLowerCase(), status: "pending", createdAt: new Date().toISOString() });
        }
        order = await store.markPaid(orderId, paymentId);
        return { order, failed: false };
      }
      if (pay.status === "void" || pay.status === "uncollectible") return { order, failed: true };
    } catch (e) {
      console.error("[thank-you] payment lookup failed", safeErr(e));
    }
  }
  return { order, failed: false };
}

export default async function ThankYou({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const orderId = sp.orderId;
  const paymentId = sp.payment ?? sp.payment_id;

  if (whopMode()) {
    // Whop-library delivery: the redirect only happens after a successful payment.
    const url = whopAccessUrl();
    return (
      <main id="main" className="wrap flex min-h-dvh max-w-2xl flex-col justify-center py-16">
        <Link href="/" className="font-display text-2xl font-semibold">Snack Swap <span className="text-sm text-ink-2">by Bite</span></Link>
        <div className="mt-8 rounded-3xl border border-line bg-paper-2 p-7 sm:p-9">
          <CheckCircle2 className="size-9 text-sage" aria-hidden />
          <h1 className="mt-4 text-[2.5rem]">Thank you, your swaps are ready</h1>
          <p className="mt-3 text-ink-2">
            Open your Whop library to download the PDF. Sign in to Whop with the <strong className="text-ink">same email you used at checkout</strong> (Whop will send you a quick sign-in link). Your receipt is in that inbox too.
          </p>
          {url && (
            <a href={url} className="btn-primary mt-6 w-full sm:w-auto" target="_blank" rel="noopener noreferrer">
              <Download className="size-5" aria-hidden /> Open my Snack Swap
            </a>
          )}
          <p className="mt-4 text-xs text-ink-2">Can&apos;t find it? Check spam for the Whop email, or use the support button on the site and include your checkout email.</p>
        </div>
      </main>
    );
  }

  const { order, failed } = orderId ? await resolveOrder(orderId, paymentId) : { order: null, failed: false };
  const paid = order?.status === "paid";

  return (
    <main id="main" className="wrap flex min-h-dvh max-w-2xl flex-col justify-center py-16">
      <Link href="/" className="font-display text-2xl font-semibold">Snack Swap <span className="text-sm text-ink-2">by Bite</span></Link>

      <div className="mt-8 rounded-3xl border border-line bg-paper-2 p-7 sm:p-9">
        {paid && order ? (
          <>
            <CheckCircle2 className="size-9 text-sage" aria-hidden />
            <h1 className="mt-4 text-[2.5rem]">Your Playbook is ready</h1>
            <p className="mt-3 text-ink-2">
              Payment confirmed. Download it now — a backup link is also on its way to <strong className="text-ink">{order.buyerEmail}</strong>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={downloadUrlFor(order.orderId)} className="btn-primary w-full sm:w-auto">
                <Download className="size-5" aria-hidden /> Download the PDF
              </a>
              {whopAccessUrl() && (
                <a href={whopAccessUrl()} className="btn-ghost w-full sm:w-auto" target="_blank" rel="noopener noreferrer">
                  Open in your Whop library
                </a>
              )}
            </div>
            {whopAccessUrl() && (
              <p className="mt-3 text-xs text-ink-2">Your purchase is also saved in Whop. Sign in there with <strong className="text-ink">{order.buyerEmail}</strong> to re-download any time.</p>
            )}
            <p className="mt-3 text-xs text-ink-2">151 pages · links stay valid for 7 days, and you can always request a fresh one below.</p>
          </>
        ) : failed ? (
          <>
            <TriangleAlert className="size-9 text-paprika" aria-hidden />
            <h1 className="mt-4 text-[2.2rem]">That payment didn&apos;t go through</h1>
            <p className="mt-3 text-ink-2">Nothing was charged. You can head back and try again with the same or a different payment method.</p>
            <Link href="/#checkout" className="btn-primary mt-6">Back to checkout</Link>
          </>
        ) : (
          <>
            <Loader2 className="size-9 animate-spin text-ink-2" aria-hidden />
            <h1 className="mt-4 text-[2.2rem]">Confirming your payment…</h1>
            <p className="mt-3 text-ink-2">
              This usually takes a few seconds. This page will update on its own — and your download link is emailed the moment the payment is confirmed, so it&apos;s safe to close the tab.
            </p>
            <AutoRefresh />
          </>
        )}
      </div>

      <section className="mt-8" aria-labelledby="resend-h">
        <h2 id="resend-h" className="font-sans text-lg font-semibold">Lost your link?</h2>
        <p className="mb-3 text-sm text-ink-2">No Whop account needed — we&apos;ll email a fresh one.</p>
        <ResendForm />
      </section>
    </main>
  );
}
