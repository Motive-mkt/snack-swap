"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** x / y are the sticker's center as % of the stage, w its width as % of the stage width. */
export type Orbit = { src: string; x: number; y: number; w: number; rot: number; depth: number; front?: boolean };
export type Step = { h: string; p: string };

type Props = {
  id: string;
  bg: string; // tailwind bg class for the section
  eyebrow: string;
  title: string;
  steps: Step[];
  /** h = frame height as % of the stage height, ratio = photo height / width */
  hero: { src: string; alt: string; h: number; ratio: number };
  mode: "drop" | "unroll";
  orbit: Orbit[];
  chips: string[];
  note: string;
  /** tailwind bg class for the round plate behind the photo */
  plate: string;
  /** three crumb / fleck colors that pop off the photo */
  crumbs: [string, string, string];
};

/** A fan of crumbs flying out to one side (angle -72°..+46°, so mostly up and out). */
const FAN = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((-72 + (i / (n - 1)) * 118) * Math.PI) / 180;
    return { ax: Math.cos(a), ay: Math.sin(a), d: 62 + (i % 3) * 30, s: 6 + (i % 4) * 2 };
  });

/**
 * Pinned, scroll-scrubbed scene built from the Playbook's own food photography.
 * A sunburst and plate spin up behind the framed photo, which drops in (or unrolls),
 * crumbs pop off it, a light sweep crosses it, and die-cut sticker cutouts burst out from
 * behind it at different depths while the step copy swaps as you scroll.
 * Everything animates transform / opacity only, so it stays light on phones.
 */
export function PhotoScene({ id, bg, eyebrow, title, steps, hero, mode, orbit, chips, note, plate, crumbs }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const stage = el.querySelector<HTMLElement>("[data-stage]");
        if (!stage) return;
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const n = steps.length;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el.querySelector("[data-pin]"),
            start: "top top+=64",
            end: () => `+=${Math.round(window.innerHeight * (n * 0.5 + 0.7))}`,
            pin: true,
            scrub: coarse ? 0.2 : 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // backdrop: sunburst spins up and keeps turning, plate pops in
        tl.fromTo("[data-rays]", { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, ease: "power2.out", duration: 0.16 }, 0)
          .to("[data-spin]", { rotate: 80, duration: 1 }, 0)
          .fromTo("[data-plate]", { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, ease: "back.out(1.6)", duration: 0.16 }, 0.02);

        // hero photo
        let landed: number;
        if (mode === "drop") {
          tl.fromTo("[data-hero]", { yPercent: -150, rotate: -24, scale: 0.75, opacity: 0 }, { yPercent: 0, rotate: -3, scale: 1, opacity: 1, ease: "back.out(1.5)", duration: 0.16 }, 0.03)
            .to("[data-hero]", { scale: 1.06, rotate: 4, duration: 0.8 }, 0.2);
          landed = 0.17;
        } else {
          // the card pops in solid, then the photo unrolls left to right in one short, crisp sweep
          tl.fromTo("[data-hero]", { rotate: -9, scale: 0.86, xPercent: -10 }, { rotate: -2, scale: 1, xPercent: 0, ease: "back.out(1.4)", duration: 0.14 }, 0.03)
            .fromTo("[data-hero]", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.03 }, 0.03)
            .fromTo("[data-clip]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "power2.out", duration: 0.2 }, 0.1)
            .fromTo("[data-roll]", { xPercent: 0, opacity: 1 }, { xPercent: 1667, ease: "power2.out", duration: 0.2 }, 0.1)
            .to("[data-roll]", { opacity: 0, duration: 0.02 }, 0.3)
            .to("[data-hero]", { scale: 1.04, rotate: 1, duration: 0.64 }, 0.34);
          landed = 0.28;
        }

        // light sweep across the photo
        tl.fromTo("[data-sheen]", { xPercent: 0 }, { xPercent: 460, ease: "power1.inOut", duration: 0.2 }, landed + 0.07);

        // crumbs pop off the photo as it lands
        const k = () => stage.clientWidth / 640;
        el.querySelectorAll<HTMLElement>("[data-crumb]").forEach((c) => {
          const ax = parseFloat(c.dataset.ax || "0");
          const ay = parseFloat(c.dataset.ay || "0");
          const d = parseFloat(c.dataset.d || "80");
          tl.fromTo(c, { x: 0, y: 0, scale: 0, opacity: 1 }, { x: () => ax * d * k(), y: () => ay * d * k(), scale: 1, ease: "power2.out", duration: 0.1 }, landed)
            .to(c, { y: "+=48", opacity: 0, scale: 0.4, ease: "power1.in", duration: 0.12 }, landed + 0.1);
        });

        // sticker cutouts burst out from behind the photo, then drift at their own depth
        el.querySelectorAll<HTMLElement>("[data-orbit]").forEach((o, i) => {
          const ox = parseFloat(o.dataset.ox || "50");
          const oy = parseFloat(o.dataset.oy || "50");
          const d = parseFloat(o.dataset.depth || "1");
          const r = parseFloat(o.dataset.rot || "0");
          tl.fromTo(
            o,
            { x: () => ((50 - ox) / 100) * stage.clientWidth, y: () => ((50 - oy) / 100) * stage.clientHeight, scale: 0.25, opacity: 0, rotate: r - 70 },
            { x: 0, y: 0, scale: 1, opacity: 1, rotate: r, ease: "back.out(1.5)", duration: 0.2 },
            0.07 + i * 0.04,
          ).to(o, { yPercent: -12 * d, rotate: r + 9 * d, duration: 0.7 - i * 0.04 }, 0.3 + i * 0.04);
        });

        // step copy
        steps.forEach((_, i) => {
          const sel = `[data-step="${i}"]`;
          const a = i / n;
          const b = (i + 1) / n;
          tl.fromTo(sel, { opacity: 0, y: 44 }, { opacity: 1, y: 0, ease: "power3.out", duration: 0.08 }, i === 0 ? 0.04 : a)
            .to(`[data-dot="${i}"]`, { backgroundColor: "#1e0b2b", scale: 1.25, duration: 0.04 }, a);
          if (i < n - 1) {
            tl.to(sel, { opacity: 0, y: -44, ease: "power3.in", duration: 0.07 }, b - 0.07)
              .to(`[data-dot="${i}"]`, { backgroundColor: "rgba(30,11,43,0.18)", scale: 1, duration: 0.04 }, b - 0.02);
          }
        });

        // macro chips at the end
        tl.fromTo("[data-chip]", { scale: 0, rotate: -18 }, { scale: 1, rotate: 0, stagger: 0.04, ease: "back.out(2)", duration: 0.1 }, 0.72);
      }, el);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [steps, mode, id]);

  // drop: dust pops off both bottom corners of the photo; unroll: flecks spray off its leading edge
  const crumbGroups =
    mode === "drop"
      ? [
          { pos: { left: "3%", top: "96%" }, dir: -1, list: FAN(6) },
          { pos: { left: "97%", top: "96%" }, dir: 1, list: FAN(6) },
        ]
      : [{ pos: { left: "100%", top: "50%" }, dir: 1, list: FAN(12) }];

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-h`} className={`relative ${bg}`}>
      <div data-pin className={`relative flex min-h-[calc(100svh-64px)] flex-col overflow-hidden ${bg}`}>
        <div className="wrap pt-6 lg:pt-10">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-h`} data-nosplit className="mt-2 text-[clamp(2rem,5.2vw,4rem)]">{title}</h2>
        </div>

        <div className="wrap grid flex-1 grid-cols-[minmax(0,1fr)] items-center gap-3 pb-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
          {/* copy */}
          <div className="relative order-2 motion-safe:min-h-[188px] lg:order-1 motion-safe:lg:min-h-[260px]">
            {steps.map((s, i) => (
              <div key={s.h} data-step={i} className="absolute inset-x-0 top-0 motion-reduce:static motion-reduce:mb-6">
                <p className="num text-sm font-bold text-paprika">0{i + 1} / 0{steps.length}</p>
                <h3 className="mt-1 text-[clamp(1.7rem,3.6vw,2.7rem)] lowercase leading-[1]">{s.h}</h3>
                <p className="mt-3 max-w-md text-[1.02rem] leading-relaxed text-ink">{s.p}</p>
              </div>
            ))}
            <div className="absolute bottom-0 left-0 flex gap-2 motion-reduce:hidden" aria-hidden>
              {steps.map((_, i) => (
                <span key={i} data-dot={i} className="size-2.5 rounded-full" style={{ background: i === 0 ? "#1e0b2b" : "rgba(30,11,43,0.18)" }} />
              ))}
            </div>
          </div>

          {/* stage + chips */}
          <div className="order-1 mx-auto flex w-full max-w-[560px] flex-col items-center gap-3 lg:order-2 lg:max-w-[720px]">
            <div
              data-stage
              className="relative aspect-[1/0.86] w-full overflow-hidden lg:aspect-auto lg:h-[clamp(340px,calc(100svh-300px),600px)]"
            >
              {/* sunburst */}
              <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
                <div data-spin className="aspect-square h-[106%]">
                  <div
                    data-rays
                    className="size-full rounded-full"
                    style={{ background: "repeating-conic-gradient(from 0deg, rgb(255 255 255 / 0.55) 0deg 7deg, transparent 7deg 15deg)" }}
                  />
                </div>
              </div>
              {/* plate */}
              <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[86%] -translate-x-1/2 -translate-y-1/2">
                <div data-plate className={`size-full rounded-full border-[3px] border-ink ${plate} shadow-[7px_7px_0_var(--ink)]`} />
              </div>

              {/* cutouts behind the photo */}
              {orbit.filter((o) => !o.front).map((o) => (
                <OrbitSticker key={o.src} o={o} z="z-[1]" />
              ))}

              {/* hero photo */}
              <div
                className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ height: `${hero.h}%`, aspectRatio: `1 / ${hero.ratio}` }}
              >
                <div data-hero className="sticker relative h-full w-full !rounded-[1.4rem] bg-paper-2 p-1.5 shadow-[7px_7px_0_var(--ink)]">
                  <div data-clip className="relative h-full w-full overflow-hidden rounded-[0.95rem]">
                    <Image src={hero.src} alt={hero.alt} fill sizes="(min-width:1024px) 340px, 220px" className="object-cover" />
                    <span
                      aria-hidden
                      data-sheen
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent motion-reduce:hidden"
                    />
                    {mode === "unroll" && (
                      <span
                        aria-hidden
                        data-roll
                        className="pointer-events-none absolute inset-y-0 -left-[6%] w-[6%] border-r-2 border-ink motion-reduce:hidden"
                        style={{ background: "linear-gradient(90deg, #7a1236, #ff8fae 30%, #d62c60 62%, #8f1a41)" }}
                      />
                    )}
                  </div>
                </div>
                {crumbGroups.map((g, gi) => (
                  <div key={gi} aria-hidden className="pointer-events-none absolute z-30 size-0 motion-reduce:hidden" style={g.pos}>
                    {g.list.map((c, i) => (
                      <span
                        key={i}
                        data-crumb
                        data-ax={c.ax * g.dir}
                        data-ay={c.ay}
                        data-d={c.d}
                        className="absolute rounded-[2px] border border-ink/40"
                        style={{ width: c.s, height: c.s, marginLeft: -c.s / 2, marginTop: -c.s / 2, background: crumbs[i % 3] }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* cutouts in front of the photo */}
              {orbit.filter((o) => o.front).map((o) => (
                <OrbitSticker key={o.src} o={o} z="z-20" />
              ))}
            </div>

            <ul className="flex flex-nowrap justify-center gap-1.5 sm:gap-2 lg:flex-wrap" aria-label="Nutrition per serving">
              {chips.map((c) => (
                <li key={c} data-chip className="num rounded-full border-2 border-ink bg-paper-2 px-2.5 py-1 text-xs font-bold sm:px-3.5 sm:py-1.5 sm:text-sm">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="wrap pb-[72px] text-xs text-ink-2 lg:pb-5">{note}</p>
      </div>
    </section>
  );
}

function OrbitSticker({ o, z }: { o: Orbit; z: string }) {
  return (
    <div className={`absolute ${z}`} style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, transform: "translate(-50%,-50%)" }}>
      <div data-orbit data-ox={o.x} data-oy={o.y} data-depth={o.depth} data-rot={o.rot} style={{ transform: `rotate(${o.rot}deg)` }}>
        <Image src={o.src} alt="" width={720} height={720} sizes="(min-width:1024px) 22vw, 32vw" className="h-auto w-full" />
      </div>
    </div>
  );
}
