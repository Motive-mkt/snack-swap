"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowDown, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { recipeById, recipeImage } from "@/data/recipes";
import { SITE, STATS } from "@/data/site";
import { fmt } from "@/lib/utils";

const PREVIEW_IDS = [1, 27, 28] as const;
const SHORT: Record<number, string> = { 1: "Tortilla Triangles", 27: "Soft-Serve Bowl", 28: "Chicken Nuggets" };

const STICKERS = [
  { id: 1, cls: "left-[71%] top-[40%] w-[14%] -rotate-6", speed: 0.5, bg: "bg-blush" },
  { id: 27, cls: "left-[69%] top-[4%] w-[14%] rotate-[5deg]", speed: -0.4, bg: "bg-mint" },
  { id: 28, cls: "left-[84%] top-[17%] w-[14%] -rotate-3", speed: 0.7, bg: "bg-paper-2" },
];

export function Hero() {
  const [active, setActive] = useState<string>(String(PREVIEW_IDS[0]));
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from("[data-hero-line] > span", { yPercent: 118, duration: 1.15, stagger: 0.12 }, 0.1)
          .from("[data-hero-sticker]", { scale: 0.2, rotate: 0, opacity: 0, duration: 0.9, stagger: 0.1, ease: "back.out(1.6)" }, 0.45)
          .from("[data-hero-badge]", { scale: 0, rotate: -120, duration: 1, ease: "back.out(1.4)" }, 0.8)
          .from("[data-hero-fade]", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.9);

        // pointer-follow drift on the stickers (fine pointers only)
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          el.querySelectorAll<HTMLElement>("[data-hero-drift]").forEach((s, i) => {
            const d = (i % 2 ? -1 : 1) * (14 + i * 4);
            const xTo = gsap.quickTo(s, "x", { duration: 0.8, ease: "power3" });
            const yTo = gsap.quickTo(s, "y", { duration: 0.8, ease: "power3" });
            el.addEventListener("pointermove", (e) => {
              const nx = e.clientX / window.innerWidth - 0.5;
              const ny = e.clientY / window.innerHeight - 0.5;
              xTo(nx * d * 2);
              yTo(ny * d * 2);
            });
          });
        }
      }, el);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  const proof = [
    `${STATS.total} recipes`,
    `${STATS.zeroSugar} with 0 g added sugar`,
    `${STATS.quickPrep} ≤20 min active prep`,
    "no whop account needed",
  ];

  return (
    <section id="top" ref={root} className="relative overflow-x-clip bg-butter">
      {/* ── headline stage ── */}
      <div className="relative mx-auto md:min-h-[min(88svh,820px)] max-w-[1500px] px-5 pb-10 pt-10 sm:px-8 lg:pt-14">
        <p
          data-hero-fade
          className="relative z-10 inline-flex max-w-full items-center gap-2 rounded-full border-[2.5px] border-ink bg-paper-2 px-4 py-1.5 text-[0.74rem] font-bold uppercase tracking-[0.12em] text-ink"
        >
          <span className="size-2 rounded-full bg-tomato" aria-hidden />
          {STATS.total} craving-led kitchen swaps · by bite
        </p>

        <h1 className="relative z-10 mt-6 text-[clamp(3.4rem,17vw,6rem)] leading-[0.86] tracking-[-0.055em] md:max-w-[68%] md:text-[clamp(4rem,8.3vw,9.5rem)]">
          <span className="block overflow-hidden pb-[0.08em]" data-hero-line>
            <span className="block">swap the</span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]" data-hero-line>
            <span className="block">snack.</span>
          </span>
          <span className="block overflow-hidden pb-[0.1em] text-paprika" data-hero-line>
            <span className="block">keep the crave.</span>
          </span>
        </h1>

        {/* stickers: real Playbook photography */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          {STICKERS.map((st) => (
            <div key={st.id} className={`absolute ${st.cls}`} data-speed={st.speed}>
              <div data-hero-sticker data-hero-drift className={`sticker overflow-hidden !rounded-[1.4rem] p-1.5 ${st.bg}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1rem]">
                  <Image src={recipeImage(st.id)} alt="" fill sizes="20vw" className="object-cover" priority />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* mobile sticker strip */}
        <div aria-hidden className="mt-8 flex gap-3 md:hidden">
          {[1, 27, 28].map((id, i) => (
            <div key={id} data-hero-sticker className={`sticker w-1/3 overflow-hidden !rounded-2xl p-1 ${i % 2 ? "rotate-3" : "-rotate-3"}`}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image src={recipeImage(id)} alt="" fill sizes="30vw" className="object-cover" />
              </div>
            </div>
          ))}
        </div>

        {/* rotating badge */}
        <div
          data-hero-badge
          aria-hidden
          className="absolute bottom-6 right-5 z-10 hidden size-[130px] items-center justify-center rounded-full border-[3px] border-ink bg-tomato sm:flex lg:right-[5%] lg:size-[165px]"
        >
          <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 size-full">
            <defs>
              <path id="ring" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
            </defs>
            <text className="fill-ink" style={{ font: "800 17px var(--font-display)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <textPath href="#ring">40 swaps • 151 pages • real macros • </textPath>
            </text>
          </svg>
          <span className="font-display text-4xl font-extrabold lowercase text-ink lg:text-5xl">bite</span>
        </div>
      </div>

      {/* ── copy + preview ── */}
      <div className="border-t-[3px] border-ink bg-paper">
        <div className="wrap grid grid-cols-[minmax(0,1fr)] items-center gap-12 py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-20">
          <div className="min-w-0">
            <p data-hero-fade className="max-w-[36rem] text-[1.12rem] leading-relaxed text-ink">
              Keep the crunch, the chocolate and the soft-serve. Every recipe lists gram weights beside US cup and
              spoon equivalents, with nutrition estimated per serving from USDA FoodData Central — and honest active
              prep time, kept separate from the chilling, baking or drying wait.
            </p>

            <div data-hero-fade className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a href="#checkout" className="btn-primary">
                get the playbook{SITE.price ? ` · ${SITE.price}` : ""}
              </a>
              <a href="#swaps" className="btn-ghost">
                browse the {STATS.total} swaps <ArrowDown className="size-4" aria-hidden />
              </a>
            </div>

            <ul data-hero-fade className="mt-9 flex flex-wrap gap-2.5" aria-label="At a glance">
              {proof.map((p, i) => (
                <li
                  key={p}
                  className={`num rounded-full border-2 border-ink px-4 py-1.5 text-[0.84rem] font-bold text-ink ${
                    ["bg-blush", "bg-mint", "bg-butter", "bg-paper-2"][i]
                  }`}
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>

        {/* Craving Swap Preview */}
        <div className="relative mx-auto w-full min-w-0 max-w-[460px]">
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
                  <article className="overflow-hidden sticker !rounded-3xl">
                    <div className="relative aspect-[5/4] w-full bg-paper-3">
                      <Image
                        src={recipeImage(id)}
                        alt={`${r.title}, a homemade swap from the Playbook`}
                        fill
                        priority={i === 0}
                        sizes="(min-width:1024px) 440px, 92vw"
                        className="object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-butter">
                        {r.kind === "direct" ? "Direct-format alternative" : "Craving alternative"}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-[1.9rem]">{r.title}</h3>
                      {r.insp && (
                        <p className="mt-1 text-sm italic text-ink-2">Inspired by {r.insp} (not affiliated)</p>
                      )}
                      <dl className="num mt-4 grid grid-cols-3 divide-x-2 divide-ink rounded-2xl border-2 border-ink bg-butter">
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
      </div>
    </section>
  );
}
