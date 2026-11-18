"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowLeft, Check, Lock, Mail } from "lucide-react";
import { SITE, STATS } from "@/data/site";

const WhopCheckoutPanel = dynamic(() => import("./WhopCheckoutPanel"), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse rounded-2xl bg-paper-3" aria-label="Loading secure checkout" />,
});

type Session = { orderId: string; checkoutConfigId: string; environment: "production" | "sandbox" };

const INCLUDES = [
  `${STATS.total} craving-led recipes across 7 categories`,
  "Gram weights with approximate US cup & spoon equivalents",
  "Per-serving nutrition on every recipe, estimated from USDA FoodData Central",
  "Ingredient & pantry guide + grocery shopping guide",
  "Batch preparation & storage guide with food-safety temperatures",
  "Instant PDF download + emailed backup link",
];

export function CheckoutSection() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSession(data as Session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="checkout" aria-labelledby="checkout-h" className="bg-paper-3/60 py-20 lg:py-28">
      <div className="wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">One-time purchase</p>
          <h2 id="checkout-h" className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">Get the Playbook</h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-[2rem] border border-line bg-paper-2 shadow-[0_40px_80px_-40px_rgb(43_29_20/0.5)] lg:grid-cols-[1fr_1fr]">
          {/* Offer */}
          <div className="border-b border-line p-7 sm:p-9 lg:border-b-0 lg:border-r">
            <div className="flex items-start gap-5">
              <Image src="/pages/cover.webp" alt="Snack Swap Playbook cover" width={900} height={1165} sizes="110px" className="h-auto w-[96px] shrink-0 rounded-md shadow-lg ring-1 ring-ink/10 sm:w-[110px]" />
              <div>
                <h3 className="text-[1.8rem] sm:text-[2.1rem]">Snack Swap Playbook</h3>
                <p className="text-sm text-ink-2">{SITE.pages}-Page Digital Edition · PDF</p>
                <p className="num mt-3 font-display text-4xl font-semibold">{SITE.price || <span className="font-sans text-base font-medium text-ink-2">Price shown at checkout</span>}</p>
              </div>
            </div>
            <ul className="mt-7 space-y-3">
              {INCLUDES.map((t) => (
                <li key={t} className="flex gap-3 text-[0.97rem]">
                  <Check className="mt-1 size-4 shrink-0 text-sage" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-xs leading-relaxed text-ink-2">
              Homemade alternatives, not identical copies. No weight-loss promises or calorie prescriptions. Nutrition values are estimates.
            </p>
          </div>

          {/* Checkout */}
          <div className="p-7 sm:p-9">
            <ol className="num flex items-center gap-2 text-xs font-semibold" aria-label="Checkout steps">
              <li className={`rounded-full px-3 py-1 ${!session ? "bg-ink text-paper" : "bg-sage-soft text-sage"}`}>1 · Email</li>
              <li aria-hidden className="h-px w-6 bg-line" />
              <li className={`rounded-full px-3 py-1 ${session ? "bg-ink text-paper" : "border border-line text-ink-2"}`}>2 · Payment</li>
            </ol>

            {!session ? (
              <form onSubmit={start} className="mt-6" noValidate>
                <label htmlFor="buyer-email" className="block text-base font-semibold">
                  Where should we email your download link?
                </label>
                <div className="relative mt-3">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-2" aria-hidden />
                  <input
                    id="buyer-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-invalid={!!error}
                    aria-describedby={error ? "email-err" : "email-help"}
                    className="min-h-14 w-full rounded-full border border-line bg-paper pl-12 pr-5 text-base outline-none transition-colors focus:border-ink"
                  />
                </div>
                <p id="email-help" className="mt-2 text-sm text-ink-2">We&apos;ll use it only to deliver your file and receipt.</p>
                {error && (
                  <p id="email-err" role="alert" className="mt-2 text-sm font-medium text-paprika-deep">
                    {error}
                  </p>
                )}
                <button type="submit" disabled={busy} className="btn-primary mt-5 w-full !min-h-14">
                  {busy ? "Preparing secure checkout…" : "Continue to payment"}
                </button>
              </form>
            ) : (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setSession(null)}
                  className="mb-4 inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink"
                >
                  <ArrowLeft className="size-4" aria-hidden /> Change email ({email})
                </button>
                <WhopCheckoutPanel checkoutConfigId={session.checkoutConfigId} orderId={session.orderId} email={email} environment={session.environment} />
              </div>
            )}

            <p className="mt-6 flex items-start gap-2 text-[0.82rem] font-medium text-ink-2">
              <Lock className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden />
              <span>No Whop account required • Instant download + emailed backup link • Secured by Whop</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
