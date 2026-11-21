"use client";

import Image from "next/image";
import { Check, Lock } from "lucide-react";
import { SITE, STATS } from "@/data/site";

const CHECKOUT_URL = "https://whop.com/checkout/plan_xm2ljJT2ETStl";

const INCLUDES = [
  `${STATS.total} craving-led recipes across 7 categories`,
  "Gram weights with approximate US cup & spoon equivalents",
  "Per-serving nutrition on every recipe, estimated from USDA FoodData Central",
  "Ingredient & pantry guide + grocery shopping guide",
  "Batch preparation & storage guide with food-safety temperatures",
  "Instant access in your Whop library, plus a receipt by email",
];

export function CheckoutSection() {
  return (
    <section id="checkout" aria-labelledby="checkout-h" className="border-y-[3px] border-ink bg-butter py-20 lg:py-28">
      <div className="wrap">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">One-time purchase</p>
          <h2 id="checkout-h" className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">Get your Snack Swap</h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-[2rem] border-[3px] border-ink bg-paper-2 shadow-[10px_10px_0_var(--ink)] lg:grid-cols-[1fr_1fr]">
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

        {/* Checkout: plain link to Whop's hosted checkout (no embedded payment widget) */}
          <div className="p-7 sm:p-9">
            <p className="text-base font-semibold">Instant access after payment</p>
            <p className="mt-2 text-sm text-ink-2">
              You will pay on Whop&apos;s secure checkout, then open your PDF from your Whop library. Use the same email to sign in.
            </p>
            <a href={CHECKOUT_URL} className="btn-primary mt-6 w-full !min-h-14 text-center">
              Get the Snack Swap Playbook
            </a>

            <p className="mt-6 flex items-start gap-2 text-[0.82rem] font-medium text-ink-2">
              <Lock className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden />
              <span>Instant access after payment • Free Whop sign-in with this email • Secured by Whop</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
