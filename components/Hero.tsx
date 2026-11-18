"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { recipeById, recipeImage } from "@/data/recipes";
import { SITE, STATS } from "@/data/site";
import { fmt } from "@/lib/utils";

const PREVIEW_IDS = [1, 27, 28] as const;
const SHORT: Record<number, string> = { 1: "Tortilla Triangles", 27: "Soft-Serve Bowl", 28: "Chicken Nuggets" };

export function Hero() {
  const [active, setActive] = useState<string>(String(PREVIEW_IDS[0]));

  const proof = [
    `${STATS.total} Recipes`,
    `${STATS.zeroSugar} With 0 g Added Sugar`,
    `${STATS.quickPrep} ≤20 Min Active Prep`,
    "Buy Without a Whop Account",
  ];

  return (
    <section id="top" className="paper-grain relative">
      <div className="wrap grid grid-cols-[minmax(0,1fr)] items-center gap-12 pb-16 pt-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14 lg:pb-20 lg:pt-12">
        <div className="min-w-0">
          <p className="inline-flex max-w-full flex-wrap items-center gap-x-2 rounded-full border border-line bg-paper-2 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-sage">
            <span>{STATS.total} Craving-Led Kitchen Swaps</span>
            <span aria-hidden>•</span>
            <span>Ordinary US Supermarket Staples</span>
          </p>

          <h1 className="mt-5 text-[clamp(2.5rem,6.4vw,4.1rem)] text-balance">
            Keep the Crunch, Chocolate, and Soft-Serve Cravings.{" "}
            <em className="font-medium italic text-paprika">Swap the Ingredient Math.</em>
          </h1>

          <p className="mt-6 max-w-[34rem] text-[1.075rem] leading-relaxed text-ink-2">
            Every recipe lists gram weights next to US cup and spoon equivalents, with nutrition estimated per
            serving from USDA FoodData Central values — and honest active prep time kept separate from the
            chilling, baking or drying wait.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a href="#checkout" className="btn-primary">
              Get the Playbook{SITE.price ? ` · ${SITE.price}` : ""}
            </a>
            <a href="#swaps" className="btn-ghost">
              Browse the {STATS.total} swaps <ArrowDown className="size-4" aria-hidden />
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2" aria-label="At a glance">
            {proof.map((p) => (
              <li
                key={p}
                className="num rounded-full border border-line bg-paper-2 px-3.5 py-1.5 text-[0.82rem] font-semibold text-ink"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Craving Swap Preview */}
        <div className="relative mx-auto w-full min-w-0 max-w-[460px]">
          <div
            aria-hidden
            className="absolute -left-10 bottom-6 hidden w-[150px] -rotate-6 overflow-hidden rounded-md shadow-[0_20px_40px_-12px_rgb(43_29_20/0.45)] ring-1 ring-ink/10 xl:block"
          >
            <Image src="/pages/cover.webp" alt="" width={900} height={1165} sizes="150px" className="h-auto w-full" />
          </div>

          <Tabs value={active} onValueChange={setActive} className="relative">
            <div className="mb-3">
              <p className="eyebrow mb-2">Craving swap preview</p>
              <TabsList shape="pill" size="sm" aria-label="Choose a swap to preview" className="w-full justify-between">
                {PREVIEW_IDS.map((id) => (
                  <TabsTrigger key={id} value={String(id)} className="!min-h-9 flex-1">
                    {SHORT[id]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {PREVIEW_IDS.map((id, i) => {
              const r = recipeById(id);
              return (
                <TabsContent key={id} value={String(id)} className="!mt-0">
                  <article className="overflow-hidden rounded-3xl border border-line bg-paper-2 shadow-[0_30px_60px_-30px_rgb(43_29_20/0.5)]">
                    <div className="relative aspect-[5/4] w-full bg-paper-3">
                      <Image
                        src={recipeImage(id)}
                        alt={`${r.title}, a homemade swap from the Playbook`}
                        fill
                        priority={i === 0}
                        sizes="(min-width:1024px) 440px, 92vw"
                        className="object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-paper backdrop-blur">
                        {r.kind === "direct" ? "Direct-format alternative" : "Craving alternative"}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="text-[1.9rem]">{r.title}</h2>
                      {r.insp && (
                        <p className="mt-1 text-sm italic text-ink-2">Inspired by {r.insp} (not affiliated)</p>
                      )}
                      <dl className="num mt-4 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-paper">
                        <div className="px-3 py-3">
                          <dt className="text-[0.68rem] font-semibold uppercase tracking-wider text-ink-2">Energy</dt>
                          <dd className="text-xl font-semibold">{fmt(r.kcal)} <span className="text-xs font-medium text-ink-2">kcal</span></dd>
                        </div>
                        <div className="px-3 py-3">
                          <dt className="text-[0.68rem] font-semibold uppercase tracking-wider text-ink-2">Protein</dt>
                          <dd className="text-xl font-semibold">{fmt(r.protein)} <span className="text-xs font-medium text-ink-2">g</span></dd>
                        </div>
                        <div className="px-3 py-3">
                          <dt className="text-[0.68rem] font-semibold uppercase tracking-wider text-ink-2">Added sugar</dt>
                          <dd className="text-xl font-semibold">{fmt(r.sugar)} <span className="text-xs font-medium text-ink-2">g</span></dd>
                        </div>
                      </dl>
                      <p className="mt-4 flex items-center gap-2 text-sm text-ink-2">
                        <Clock className="size-4 text-sage" aria-hidden />
                        <span className="num">
                          Active prep {r.prepLabel} · total {r.totalLabel}
                        </span>
                      </p>
                      <p className="mt-3 text-[0.7rem] text-ink-2/80">
                        Per serving, estimated. Conceptual food visualization.
                      </p>
                    </div>
                  </article>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
