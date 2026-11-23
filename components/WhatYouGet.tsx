import { SITE, STATS } from "@/data/site";

const ITEMS = [
  { t: `${STATS.total} craving-led recipes`, d: "Crunchy, sweet, creamy, savory — each one a home-kitchen swap for a snack you already love.", c: "bg-blush" },
  { t: "Gram weights + cup equivalents", d: "Weigh it once and it works every time. US cups and spoons are listed beside every weight.", c: "bg-mint" },
  { t: "Macros on every recipe", d: "Calories, protein, carbs, fat, fiber and sugar per serving, estimated from USDA FoodData Central.", c: "bg-butter" },
  { t: "Honest prep times", d: "Active hands-on time is listed separately from baking, chilling or drying, so you can plan your evening.", c: "bg-paper-2" },
  { t: "Pantry + grocery guides", d: "What to stock, what to buy and what to skip, so the first shop isn't a guessing game.", c: "bg-mint" },
  { t: "Batch prep + storage", d: "Make once, snack all week, with food-safety temperatures spelled out.", c: "bg-blush" },
];

export function WhatYouGet() {
  return (
    <section aria-labelledby="wyg-h" className="bg-paper py-20 lg:py-28">
      <div className="wrap">
        <p className="eyebrow">What&apos;s in the download</p>
        <h2 id="wyg-h" className="mt-3 max-w-3xl text-[clamp(2.2rem,5.5vw,4.2rem)]">
          one pdf. {SITE.pages} pages. everything you need to start swapping tonight.
        </h2>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <li key={it.t} className={`sticker !rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1 ${it.c}`}>
              <p className="font-display text-2xl font-extrabold leading-tight tracking-tight">{it.t}</p>
              <p className="mt-2 text-[0.97rem] leading-relaxed text-ink">{it.d}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a href="#checkout" className="btn-primary !min-h-14 text-[1.05rem]">
            get your snack swap{SITE.price ? ` · ${SITE.price}` : ""}
          </a>
          <p className="text-sm font-medium text-ink-2">Instant access after payment · secure checkout by Whop</p>
        </div>
      </div>
    </section>
  );
}
