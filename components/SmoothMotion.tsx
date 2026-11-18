"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Global motion layer: Lenis smooth scroll synced to GSAP's ticker + ScrollTrigger,
 * masked line reveals on every <h2>, [data-speed] parallax, magnetic buttons and a
 * trailing cursor ring. Everything sits behind gsap.matchMedia so reduced-motion users
 * get the plain page.
 */
export function SmoothMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({
        lerp: 0.1,
        anchors: { offset: -72 },
        prevent: (node) => !!node.closest?.('[role="dialog"]'),
      });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // masked line reveals on section headings
      const splits: SplitText[] = [];
      document.querySelectorAll<HTMLElement>("main h2").forEach((el) => {
        if (el.closest("[data-nosplit]")) return;
        splits.push(
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 115,
                duration: 1,
                ease: "power4.out",
                stagger: 0.09,
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              });
            },
          }),
        );
      });

      // parallax
      document.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
        const s = parseFloat(el.dataset.speed || "0");
        gsap.fromTo(
          el,
          { y: -s * 90 },
          {
            y: s * 90,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      const cleanups: Array<() => void> = [];

      // magnetic buttons + cursor ring (mouse only)
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        document.querySelectorAll<HTMLElement>(".btn-primary, .btn-ghost").forEach((btn) => {
          const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
          const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          btn.addEventListener("pointermove", move);
          btn.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            btn.removeEventListener("pointermove", move);
            btn.removeEventListener("pointerleave", leave);
          });
        });

        const ring = document.createElement("div");
        ring.className = "cursor-ring";
        ring.setAttribute("aria-hidden", "true");
        document.body.appendChild(ring);
        const rx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
        const ry = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          ring.classList.add("is-on");
          rx(e.clientX);
          ry(e.clientY);
          const hot = (e.target as HTMLElement | null)?.closest?.("a, button, [role='tab'], summary, input");
          ring.classList.toggle("is-hot", !!hot);
        };
        const onLeave = () => ring.classList.remove("is-on");
        window.addEventListener("pointermove", onMove);
        document.documentElement.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
          ring.remove();
        });
      }

      return () => {
        cleanups.forEach((c) => c());
        splits.forEach((s) => s.revert());
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
