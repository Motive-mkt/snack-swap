"use client";

import Image from "next/image";
import { useState } from "react";
import { Scale, ShoppingBasket, Timer, ShieldCheck, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { recipeById } from "@/data/recipes";
import { fmt } from "@/lib/utils";
import { Reveal } from "./Reveal";

const soft = recipeById(27);
const roll = recipeById(37);

const PILLARS = [
  {
    icon: Scale,
    h: "Gram-scale, USDA-based nutrition",
    p: "Weights are the calculation basis, with approximate US cup and spoon equivalents beside them. Nutrition is calculated from USDA FoodData Central values per 100 g, scaled to each ingredient's recipe weight and divided by the serving.",
    foot: "Estimates — not laboratory analyses.",
  },
  {
    icon: ShoppingBasket,
    h: "Ordinary US supermarket staples",
    p: "Corn tortillas, potatoes, oats, flour, beans, Greek yogurt, eggs, chicken, cheese and chocolate. The shopping guide shows how to overlap ingredients across the week — oats for cookies, bars and clusters; yogurt for frozen desserts and dips; potatoes for chips, fries and tots.",
    foot: "No specialty flours or powders to hunt down.",
  },
  {
    icon: Timer,
    h: "Active prep vs. the real wait",
    p: `Each recipe separates hands-on time from cooking, chilling and freezing. The soft-serve bowl is ${soft.prepLabel} of work and ${soft.totalLabel} on the clock; the fruit roll-ups are ${roll.prepLabel} of work and ${roll.totalLabel} in the dehydrator.`,
    foot: "No “5-minute snack” fiction.",
  },
  {
    icon: ShieldCheck,
    h: "Food-safety rigor",
    p: "Poultry is cooked to 165°F (74°C). Chilled leftovers go to 40°F (4°C) or below. The guide reminds you that flour is a raw food — never taste raw dough or batter — and cookie dough for the frozen yogurt is baked first. Guidance draws on USDA FSIS, FDA, CDC and FoodSafety.gov.",
    foot: "Always check allergen labels on every package.",
  },
];

const PEEK = [
  {
    id: "27",
    tab: "#27 Soft-Serve Bowl",
    img: "/pages/p100.webp",
    alt: "Page 100 of the Playbook: Thick Chocolate Soft-Serve Bowl with ingredient list in grams, numbered steps and a full-height photo.",
    r: soft,
    bullets: ["Weights in grams first, US cup and spoon equivalents in brackets", "Prep, freeze and blend time shown separately", "Numbered steps with the 'stop when thick, smooth and moundable' cue"],
    page: 100,
  },
  {
    id: "28",
    tab: "#28 Chicken Nuggets",
    img: "/pages/p104.webp",
    alt: "Page 104 of the Playbook: Baked Whole-Grain Chicken Nuggets recipe page.",
    r: recipeById(28),
    bullets: ["Protein-forward swap with the macro panel at the end of every recipe", "Internal-temperature check printed in the method", "Equipment, serving size, storage and allergen notes on the closing page"],
    page: 104,
  },
  {
    id: "18",
    tab: "#18 PB Cups",
    img: "/pages/p69.webp",
    alt: "Page 69 of the Playbook: Mini Chocolate-Shell Peanut-Butter Cups recipe page.",
    r: recipeById(18),
    bullets: ["Candy-style bites with added sugar called out, not hidden", "Chill time separated from the 20 minutes of hands-on work", "Direct-format alternative label tells you what's preserved"],
    page: 69,
  },
];

export function KitchenStandardsAndSpreads() {
  const [tab, setTab] = useState("27");
  return (
    <section id="inside" aria-labelledby="inside-h" className="bg-espresso py-20 text-paper lg:py-28">
      <div className="wrap">
        <Reveal className="max-w-2xl">
          <p className="eyebrow !text-[#A9C09E]">Inside the Playbook</p>
          <h2 id="inside-h" className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">Built like a kitchen reference, not a viral PDF</h2>
        </Reveal>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal as="li" key={p.h} delay={i * 0.05} className="rounded-3xl border border-paper/15 bg-paper/[0.05] p-6 sm:p-7">
              <p.icon className="size-6 text-[#E9A07F]" aria-hidden />
              <h3 className="mt-4 text-[1.7rem]">{p.h}</h3>
              <p className="mt-2.5 text-[0.97rem] leading-relaxed text-paper/80">{p.p}</p>
              <p className="mt-4 text-sm font-medium text-[#A9C09E]">{p.foot}</p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-16 flex items-center gap-3">
          <BookOpen className="size-5 text-[#E9A07F]" aria-hidden />
          <h3 className="text-[1.9rem]">Peek inside the Playbook</h3>
        </div>
        <p className="mt-2 max-w-xl text-sm text-paper/70">Real pages from the 151-page edition — this is the layout you receive.</p>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <div className="-mx-5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0">
            <TabsList shape="pill" size="md" aria-label="Sample recipe pages" className="w-max !bg-paper/10">
              {PEEK.map((p) => (
                <TabsTrigger
                  key={p.id}
                  value={p.id}
                  className="!min-h-11 px-4 !text-paper/75 hover:!text-paper data-[state=active]:!bg-paper data-[state=active]:!text-ink"
                >
                  {p.tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {PEEK.map((p) => (
            <TabsContent key={p.id} value={p.id} className="!mt-6">
              <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,560px)_1fr]">
                <div className="overflow-hidden rounded-xl bg-paper shadow-[0_30px_70px_-30px_rgb(0_0_0/0.8)] ring-1 ring-paper/20">
                  <Image src={p.img} alt={p.alt} width={1000} height={1294} sizes="(min-width:1024px) 560px, 92vw" className="h-auto w-full" />
                </div>
                <div>
                  <p className="eyebrow !text-[#A9C09E]">Playbook page {p.page}</p>
                  <h4 className="mt-2 font-display text-[2rem] leading-tight">{p.r.title}</h4>
                  <p className="mt-1 text-sm italic text-paper/70">{p.r.insp ? `Inspired by ${p.r.insp} (not affiliated)` : ""}</p>
                  <dl className="num mt-5 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl bg-paper/15 text-center">
                    {[
                      [fmt(p.r.kcal), "kcal"],
                      [fmt(p.r.protein), "g protein"],
                      [fmt(p.r.sugar), "g added sugar"],
                    ].map(([v, u]) => (
                      <div key={u} className="bg-espresso px-3 py-3.5">
                        <dd className="text-xl font-semibold">{v}</dd>
                        <dt className="text-[0.68rem] uppercase tracking-wider text-paper/60">{u}</dt>
                      </div>
                    ))}
                  </dl>
                  <p className="num mt-4 text-sm text-paper/75">Active prep {p.r.prepLabel} · total {p.r.totalLabel} · makes {p.r.makes}</p>
                  <ul className="mt-6 space-y-3 text-[0.97rem] text-paper/85">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-[#E9A07F]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-xs text-paper/55">Per serving, estimated. Photos in the Playbook are conceptual food visualizations.</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
