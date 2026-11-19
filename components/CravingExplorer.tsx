"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Clock, SearchX } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, RECIPES, recipeImage, type CategoryId, type Recipe } from "@/data/recipes";
import { STATS } from "@/data/site";
import { fmt } from "@/lib/utils";

type Quick = "sugar0" | "protein10" | "prep20" | "kcal150";
const QUICK: { id: Quick; label: string; count: number; test: (r: Recipe) => boolean }[] = [
  { id: "sugar0", label: "0 g Added Sugar", count: STATS.zeroSugar, test: (r) => r.sugar === 0 },
  { id: "protein10", label: "10 g+ Protein", count: STATS.protein10, test: (r) => r.protein >= 10 },
  { id: "prep20", label: "≤20 Min Active Prep", count: STATS.quickPrep, test: (r) => r.prepMin <= 20 },
  { id: "kcal150", label: "≤150 kcal", count: STATS.under150, test: (r) => r.kcal <= 150 },
];

const MAX = {
  kcal: Math.max(...RECIPES.map((r) => r.kcal)),
  protein: Math.max(...RECIPES.map((r) => r.protein)),
  carbs: Math.max(...RECIPES.map((r) => r.carbs)),
  fat: Math.max(...RECIPES.map((r) => r.fat)),
  fiber: Math.max(...RECIPES.map((r) => r.fiber)),
  sugar: Math.max(...RECIPES.map((r) => r.sugar)),
};

const MACROS = [
  { k: "kcal", label: "kcal", unit: "", bar: "bg-paprika" },
  { k: "protein", label: "Protein", unit: "g", bar: "bg-sage" },
  { k: "carbs", label: "Carbs", unit: "g", bar: "bg-amber" },
  { k: "fat", label: "Fat", unit: "g", bar: "bg-ink-2" },
  { k: "fiber", label: "Fiber", unit: "g", bar: "bg-sage" },
  { k: "sugar", label: "Added sugar", unit: "g", bar: "bg-berry" },
] as const;

function Card({ r, index }: { r: Recipe; index: number }) {
  return (
    <article
      className="card-in group flex flex-col overflow-hidden sticker !rounded-3xl transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_var(--ink)]"
      style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
    >
      <div className="relative aspect-[4/3] bg-paper-3">
        <Image
          src={recipeImage(r.id)}
          alt={`${r.title}`}
          fill
          sizes="(min-width:1024px) 360px, (min-width:640px) 45vw, 92vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="num absolute left-3 top-3 rounded-full bg-paper-2/95 px-2.5 py-1 text-xs font-bold text-ink">
          {String(r.id).padStart(2, "0")}
        </span>
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider ${
            r.kind === "direct" ? "bg-paprika text-white" : "bg-sage text-white"
          }`}
        >
          {r.kind === "direct" ? "Direct-format" : "Craving"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.55rem] leading-[1.05]">{r.title}</h3>
        <p className="mt-1.5 text-sm italic text-ink-2">
          {r.insp ? `Inspired by ${r.insp} (not affiliated)` : "Inspired by a general craving"}
        </p>

        <p className="num mt-3 flex items-center gap-2 text-[0.82rem] text-ink-2">
          <Clock className="size-4 shrink-0 text-sage" aria-hidden />
          <span>
            <strong className="font-semibold text-ink">{r.prepLabel}</strong> active · {r.totalLabel} total
          </span>
        </p>

        <dl className="num mt-4 grid grid-cols-3 gap-x-3 gap-y-3 border-t border-line pt-4">
          {MACROS.map((m) => {
            const v = r[m.k];
            const pct = Math.max(v > 0 ? 6 : 0, (v / MAX[m.k]) * 100);
            return (
              <div key={m.k}>
                <dt className="text-[0.64rem] font-semibold uppercase tracking-wider text-ink-2">{m.label}</dt>
                <dd className="text-[0.98rem] font-semibold leading-tight">
                  {fmt(v)}
                  <span className="ml-0.5 text-[0.7rem] font-medium text-ink-2">{m.unit}</span>
                </dd>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-3" aria-hidden>
                  <div className={`h-full rounded-full ${m.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </dl>
        <p className="mt-3 text-[0.68rem] text-ink-2/80">Per serving · {r.makes} · estimates</p>
      </div>
    </article>
  );
}

export function CravingExplorer() {
  const [cat, setCat] = useState<"all" | CategoryId>("all");
  const [quick, setQuick] = useState<Quick[]>([]);
  const [showAll, setShowAll] = useState(false);

  const matches = useMemo(() => {
    const tests = QUICK.filter((q) => quick.includes(q.id)).map((q) => q.test);
    return RECIPES.filter((r) => (cat === "all" || r.cat === cat) && tests.every((t) => t(r)));
  }, [cat, quick]);

  const visible = showAll ? matches : matches.slice(0, 6);
  const toggle = (id: Quick) => {
    setShowAll(false);
    setQuick((q) => (q.includes(id) ? q.filter((x) => x !== id) : [...q, id]));
  };

  return (
    <section id="swaps" aria-labelledby="swaps-h" className="py-20 lg:py-28">
      <div className="wrap">
        <div className="max-w-2xl">
          <p className="eyebrow">The collection</p>
          <h2 id="swaps-h" className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)]">What do you snack on at 9&nbsp;PM?</h2>
          <p className="mt-4 text-[1.05rem] text-ink-2">
            Pick a craving family, then narrow by what matters to you. Every number below is the per-serving
            estimate printed on that recipe&apos;s page in the Playbook.
          </p>
        </div>

        <Tabs
          value={cat}
          onValueChange={(v) => {
            setCat(v as "all" | CategoryId);
            setShowAll(false);
          }}
          className="mt-9"
        >
          <div className="-mx-5 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:px-0">
            <TabsList shape="pill" size="md" aria-label="Craving categories" className="w-max sm:w-auto sm:flex-wrap">
              <TabsTrigger value="all" className="!min-h-11 px-4">
                All {STATS.total}
              </TabsTrigger>
              {CATEGORIES.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="!min-h-11 px-4">
                  {c.short} <span className="num ml-1.5 text-xs text-ink-2">{RECIPES.filter((r) => r.cat === c.id).length}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Quick filters">
            <span className="mr-1 text-sm font-medium text-ink-2">Quick filters</span>
            {QUICK.map((q) => {
              const on = quick.includes(q.id);
              return (
                <button
                  key={q.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(q.id)}
                  className={`num inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
                    on ? "border-ink bg-ink text-paper" : "border-line bg-paper-2 text-ink hover:border-ink"
                  }`}
                >
                  {on && <span aria-hidden>✓</span>}
                  {q.label} <span className={on ? "text-paper/70" : "text-ink-2"}>({q.count})</span>
                </button>
              );
            })}
            {quick.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuick([]);
                  setShowAll(false);
                }}
                className="min-h-11 cursor-pointer px-2 text-sm font-medium text-paprika underline underline-offset-4"
              >
                Clear
              </button>
            )}
          </div>

          <TabsContent value={cat} className="!mt-7">
            <p className="num text-sm text-ink-2" role="status" aria-live="polite">
              Showing {visible.length} of {matches.length} matching swaps
            </p>

            {matches.length === 0 ? (
              <div className="mt-5 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-line bg-paper-2 p-10 text-center">
                <SearchX className="size-8 text-ink-2" aria-hidden />
                <p className="font-display text-2xl">No swaps match every filter</p>
                <p className="max-w-sm text-sm text-ink-2">Try removing one quick filter — most combinations still have a few options.</p>
                <button type="button" className="btn-ghost !min-h-11" onClick={() => setQuick([])}>
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((r, i) => (
                  <li key={r.id}>
                    <Card r={r} index={i} />
                  </li>
                ))}
              </ul>
            )}

            {matches.length > 6 && (
              <div className="mt-9 flex justify-center">
                <button type="button" className="btn-ghost" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
                  {showAll ? "Show fewer swaps" : `Show all matching swaps (${matches.length})`}
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <p className="mt-8 max-w-3xl text-xs text-ink-2">
          &ldquo;Direct-format alternative&rdquo; means the recipe keeps a defining shape, texture or flavour direction.
          &ldquo;Craving alternative&rdquo; shares an occasion or sensory note without claiming to recreate the
          original. Brand names belong to their owners and appear for identification only. Photos are for
          illustration.
        </p>
      </div>
    </section>
  );
}
