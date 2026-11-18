"use client";

import { useMemo } from "react";
import { loadWhop } from "@whop/elements";
import { Checkout, CheckoutElement, ExpressCheckoutElement, WhopElements } from "@whop/elements-react";

/** Embedded, guest-friendly Whop payment UI. Loaded lazily — only after the buyer has entered an email. */
export default function WhopCheckoutPanel({
  checkoutConfigId,
  orderId,
  email,
  environment,
}: {
  checkoutConfigId: string;
  orderId: string;
  email: string;
  environment: "production" | "sandbox";
}) {
  const elements = useMemo(() => loadWhop(), []);
  const returnUrl = `${window.location.origin}/thank-you?orderId=${orderId}`;

  return (
    <WhopElements elements={elements} environment={environment}>
      <Checkout
        checkoutConfiguration={checkoutConfigId}
        metadata={{ orderId }}
        returnUrl={returnUrl}
        onComplete={(p) => {
          // Wallet sheets (Apple/Google Pay) can complete without a page redirect.
          if (p.result === "payment") window.location.assign(`${returnUrl}&payment=${p.paymentId}`);
        }}
        fallback={<div className="h-40 animate-pulse rounded-2xl bg-paper-3" aria-label="Loading secure checkout" />}
      >
        <ExpressCheckoutElement />
        <div className="my-4 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-ink-2" aria-hidden>
          <span className="h-px flex-1 bg-line" /> or pay by card <span className="h-px flex-1 bg-line" />
        </div>
        <CheckoutElement buyerEmail={email} />
      </Checkout>
    </WhopElements>
  );
}
