"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/data/site";

/** Mobile-first buy bar: appears after the hero, hides while the checkout itself is on screen. */
export function StickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [atCheckout, setAtCheckout] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const checkout = document.getElementById("checkout");
    if (!hero || !checkout) return;
    const a = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), { threshold: 0 });
    const b = new IntersectionObserver(([e]) => setAtCheckout(e.isIntersecting), { threshold: 0.05 });
    a.observe(hero);
    b.observe(checkout);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);

  const show = pastHero && !atCheckout;
  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-ink bg-butter px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        <p className="min-w-0 flex-1 text-sm font-bold leading-tight text-ink">
          Snack Swap · 40 recipes
          <span className="block text-xs font-medium text-ink-2">{SITE.price ? `${SITE.price} · instant PDF` : "Instant PDF download"}</span>
        </p>
        <a href="#checkout" tabIndex={show ? 0 : -1} className="btn-primary !min-h-11 shrink-0 !px-5 text-[0.95rem] !shadow-[3px_3px_0_var(--ink)]">
          get it now
        </a>
      </div>
    </div>
  );
}
