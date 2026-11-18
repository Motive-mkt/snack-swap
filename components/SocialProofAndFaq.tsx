"use client";

import { Check, ClipboardCheck, ShieldCheck, Wrench } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { REVIEWS } from "@/data/reviews";
import { SITE, STATS } from "@/data/site";
import { fmt } from "@/lib/utils";
import { useSupport } from "./SupportProvider";

/* ------------------------------------------------------------------ */
/* Section 8 — FTC-safe proof (16 CFR Part 465)                       */
/* ------------------------------------------------------------------ */
const EQUIPMENT = [
  ["Kitchen scale", "Every recipe is weighed in grams."],
  ["Oven + baking sheets", "Parchment and a wire rack help."],
  ["Blender or food processor", "The soft-serve needs a food processor."],
  ["Mandoline with guard", "For the potato chips (or a processor slicing disc)."],
  ["Air fryer / air popper", "Only for tater tots and air-popped popcorn."],
  ["Food dehydrator", "Required for fruit squares, roll-ups and pear chips."],
];

export function SocialProof() {
  const specs = [
    [String(STATS.total), "recipes, each with a nutrition panel"],
    [String(STATS.zeroSugar), "with 0 g added sugar"],
    [String(STATS.under150), "at or under 150 kcal a serving"],
    [fmt(STATS.medianKcal), "kcal — the median serving"],
    [String(STATS.quickPrep), "need 20 minutes or less of hands-on prep"],
    [String(STATS.protein10), "deliver 10 g+ protein a serving"],
  ];

  return (
    <section aria-labelledby="proof-h" className="py-20 lg:py-28">
      <div className="wrap">
        <div className="max-w-2xl">
          <p className="eyebrow">{SITE.SHOW_VERIFIED_REVIEWS ? "Verified readers" : "Pre-launch edition"}</p>
          <h2 id="proof-h" className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">
            {SITE.SHOW_VERIFIED_REVIEWS ? "What readers cooked first" : "Edition integrity & equipment check"}
          </h2>
        </div>

        {SITE.SHOW_VERIFIED_REVIEWS && REVIEWS.length > 0 ? (
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <li key={r.name + r.swapTried} className="flex flex-col rounded-3xl border border-line bg-paper-2 p-6">
                <p className="text-[1.02rem] leading-relaxed">&ldquo;{r.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold">{r.name}</p>
                <p className="text-sm text-ink-2">{r.detail} · tried {r.swapTried}</p>
                <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs font-semibold text-sage">
                  <ShieldCheck className="size-3.5" aria-hidden />
                  {r.disclosure === "verified-buyer" ? "Verified buyer" : "Received free advance review copy"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="sticker !rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sage">
                <ClipboardCheck className="size-5" aria-hidden />
                <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.14em]">Counted from the recipe pages</h3>
              </div>
              <dl className="num mt-5 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
                {specs.map(([v, l]) => (
                  <div key={l}>
                    <dt className="font-display text-[2.6rem] font-medium leading-none text-paprika">{v}</dt>
                    <dd className="mt-1.5 text-sm text-ink-2">{l}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 border-t border-line pt-4 text-sm text-ink-2">
                Highest protein: {STATS.topProtein.title} — <span className="num">{fmt(STATS.topProtein.protein)} g for {fmt(STATS.topProtein.kcal)} kcal</span>. All figures are
                per serving, estimated from USDA FoodData Central values.
              </p>
            </div>

            <div className="sticker !rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sage">
                <Wrench className="size-5" aria-hidden />
                <h3 className="font-sans text-sm font-semibold uppercase tracking-[0.14em]">Honest kitchen-equipment check</h3>
              </div>
              <ul className="mt-5 space-y-3">
                {EQUIPMENT.map(([t, d]) => (
                  <li key={t} className="flex gap-3">
                    <Check className="mt-1 size-4 shrink-0 text-sage" aria-hidden />
                    <span>
                      <span className="font-semibold">{t}</span> <span className="text-sm text-ink-2">— {d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!SITE.SHOW_VERIFIED_REVIEWS && (
          <p className="mt-6 max-w-3xl text-sm text-ink-2">
            Reviews will appear here once real readers have cooked from the Playbook. We only publish genuine reviews, with any free
            copy or other connection disclosed — never invented testimonials.
          </p>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 10 — FAQ                                                    */
/* ------------------------------------------------------------------ */
export function Faq() {
  const support = useSupport();
  const items = [
    {
      q: "Do I need a Whop account to buy?",
      a: (
        <p>
          No. Check out as a guest with just your email — card, Apple Pay, Google Pay or PayPal where your device supports them. Payment is processed by Whop,
          but you never have to create or sign in to a Whop account to buy or download the Playbook.
        </p>
      ),
    },
    {
      q: "How do I get the PDF?",
      a: (
        <p>
          Right after payment you get an instant download on the confirmation page, and a backup download link is emailed to the address you entered. If the email
          doesn&apos;t show up, check spam, or request a fresh link from the confirmation page or the support window — links are tied to your order, not to an account.
        </p>
      ),
    },
    {
      q: "What kitchen tools do I need?",
      a: (
        <p>
          A kitchen scale, an oven with baking sheets, and a blender or food processor cover most of the book. A few recipes call for extras: a mandoline with guard (or
          a food-processor slicing disc) for the potato chips, an air fryer for the tater tots, an air popper for the popcorn, and a food dehydrator for the berry fruit
          squares, fruit roll-ups and cinnamon-pear chips.
        </p>
      ),
    },
    {
      q: "Will these taste exactly like the originals?",
      a: (
        <p>
          No — they&apos;re alternatives, not identical copies. {STATS.direct} recipes are &ldquo;direct-format alternatives&rdquo; that keep a defining shape, texture or
          flavour direction; the other {STATS.craving} are &ldquo;craving alternatives&rdquo; that share an occasion or sensory note. Brand names are reference points only,
          and Snack Swap is not affiliated with or endorsed by any brand named.
        </p>
      ),
    },
    {
      q: "How does support work?",
      a: (
        <p>
          Quick fixes (resending your link, conversions, allergens, receipts) are answered in the{" "}
          <button type="button" onClick={support.open} className="cursor-pointer font-semibold text-paprika underline underline-offset-4">
            support window
          </button>
          . For live one-to-one messaging you sign in or create a free Whop account, because that chat lives inside Whop&apos;s Support Chat — buying never requires it.
          {SITE.supportEmail ? ` You can also email ${SITE.supportEmail}.` : ""}
        </p>
      ),
    },
    {
      q: "What about nutrition numbers and allergens?",
      a: (
        <p>
          Nutrition is estimated per serving from USDA FoodData Central values scaled to each recipe&apos;s ingredient weights — not laboratory analysis, and not medical
          advice. The guide doesn&apos;t promise weight loss or prescribe a calorie target. Every recipe has an allergen note, but always check each package label for
          allergens and cross-contact statements, and talk to a clinician or registered dietitian about your own needs.
        </p>
      ),
    },
  ];

  return (
    <section id="faq" aria-labelledby="faq-h" className="py-20 lg:py-28">
      <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow">Before you buy</p>
          <h2 id="faq-h" className="mt-3 text-[clamp(2.2rem,5vw,3.4rem)]">Questions, answered straight</h2>
        </div>
        <Accordion type="single" collapsible className="border-t border-border">
          {items.map((it, i) => (
            <AccordionItem key={it.q} value={`i${i}`}>
              <AccordionTrigger>{it.q}</AccordionTrigger>
              <AccordionContent>{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
