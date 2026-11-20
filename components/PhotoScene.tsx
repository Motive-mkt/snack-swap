"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { dbg } from "@/lib/dbg";

export type Orbit = { src: string; x: number; y: number; w: number; rot: number; depth: number };
export type Step = { h: string; p: string };

type Props = {
  id: string;
  bg: string; // tailwind bg class for the section
  eyebrow: string;
  title: string;
  steps: Step[];
  hero: { src: string; alt: string; w: number; ratio: number; framed?: boolean };
  mode: "drop" | "unroll";
  orbit: Orbit[];
  chips: string[];
  note: string;
};

/**
 * Pinned, scroll-scrubbed scene built from real food photography (background-removed cutouts
 * of the Playbook's own photos): the hero lands or unrolls, the other snacks burst in around it
 * at different depths, and the step copy swaps as you scroll.
 */
export function PhotoScene({ id, bg, eyebrow, title, steps, hero, mode, orbit, chips, note }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        const n = steps.length;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el.querySelector("[data-pin]"),
            start: "top top+=64",
            end: () => `+=${Math.round(window.innerHeight * (n * 0.9 + 0.6))}`,
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
          },
        });

        // hero
        if (mode === "drop") {
          tl.fromTo("[data-hero]", { yPercent: -160, rotate: -28, scale: 0.7, opacity: 0 }, { yPercent: 0, rotate: 0, scale: 1, opacity: 1, ease: "back.out(1.5)", duration: 0.2 }, 0);
        } else {
          tl.fromTo("[data-hero]", { clipPath: "inset(0 100% 0 0)", rotate: -10, xPercent: -14 }, { clipPath: "inset(0 0% 0 0)", rotate: 0, xPercent: 0, ease: "power2.out", duration: 0.5 }, 0);
        }
        tl.to("[data-hero]", { scale: 1.12, rotate: mode === "drop" ? 6 : -3, duration: 0.8 }, 0.2);

        // orbit items burst in, then drift
        el.querySelectorAll<HTMLElement>("[data-orbit]").forEach((o, i) => {
          const dx = parseFloat(o.dataset.x || "0");
          const dy = parseFloat(o.dataset.y || "0");
          const d = parseFloat(o.dataset.depth || "1");
          const r = parseFloat(o.dataset.rot || "0");
          tl.fromTo(
            o,
            { xPercent: dx * 90, yPercent: dy * 90, scale: 0.3, opacity: 0, rotate: r - 40 },
            { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, rotate: r, ease: "back.out(1.4)", duration: 0.22 },
            0.12 + i * 0.06,
          ).to(o, { yPercent: -18 * d, rotate: r + 10 * d, duration: 0.7 }, 0.34 + i * 0.02);
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
        tl.fromTo("[data-chip]", { scale: 0, rotate: -18 }, { scale: 1, rotate: 0, stagger: 0.04, ease: "back.out(2)", duration: 0.1 }, 1 - 0.2);
        dbg("scene:" + id);
      }, el);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [steps, mode]);

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-h`} className={`relative ${bg}`}>
      <div data-pin className="relative flex min-h-[calc(100svh-64px)] flex-col overflow-hidden">
        <div className="wrap pt-8 lg:pt-10">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-h`} data-nosplit className="mt-2 text-[clamp(2rem,5.2vw,4rem)]">{title}</h2>
        </div>

        <div className="wrap grid flex-1 grid-cols-[minmax(0,1fr)] items-center gap-4 pb-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
          {/* copy */}
          <div className="relative order-2 motion-safe:min-h-[220px] lg:order-1 motion-safe:lg:min-h-[260px]">
            {steps.map((s, i) => (
              <div key={s.h} data-step={i} className="absolute inset-x-0 top-0 motion-reduce:static">
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

          {/* stage */}
          <div className="relative order-1 mx-auto mb-10 aspect-[5/4] w-full max-w-[720px] lg:order-2 lg:mb-0 lg:aspect-[6/5]">
            {orbit.map((o) => (
              <div
                key={o.src}
                className="absolute"
                style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, transform: "translate(-50%,-50%)" }}
              >
                <div
                  data-orbit
                  data-x={o.x < 50 ? -1 : 1}
                  data-y={o.y < 50 ? -1 : 1}
                  data-depth={o.depth}
                  data-rot={o.rot}
                  style={{ transform: `rotate(${o.rot}deg)` }}
                >
                  <Image src={o.src} alt="" width={600} height={600} sizes="(min-width:1024px) 20vw, 30vw" className="h-auto w-full pointer-fine:drop-shadow-[0_14px_14px_rgba(30,11,43,0.35)]" />
                </div>
              </div>
            ))}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${hero.w}%` }}>
              <div data-hero className={hero.framed ? "sticker !rounded-[1.5rem] bg-paper-2 p-1.5 shadow-[8px_8px_0_var(--ink)]" : undefined}>
                <Image
                  src={hero.src}
                  alt={hero.alt}
                  width={640}
                  height={Math.round(640 * hero.ratio)}
                  sizes="(min-width:1024px) 30vw, 60vw"
                  className={hero.framed ? "h-auto w-full rounded-[1.1rem]" : "h-auto w-full pointer-fine:drop-shadow-[0_26px_22px_rgba(30,11,43,0.45)]"}
                />
              </div>
            </div>
            <ul className="absolute inset-x-0 -bottom-9 flex flex-nowrap justify-center gap-1.5 sm:gap-2 lg:bottom-0 lg:flex-wrap" aria-label="Nutrition per serving">
              {chips.map((c) => (
                <li key={c} data-chip className="num rounded-full border-2 border-ink bg-paper-2 px-2.5 py-1 text-xs font-bold sm:px-3.5 sm:py-1.5 sm:text-sm">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="wrap pb-5 text-xs text-ink-2">{note}</p>
      </div>
    </section>
  );
}
