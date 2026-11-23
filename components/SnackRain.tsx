"use client";

import { useEffect, useRef } from "react";
import { SNACK_IDS, SNACK_SYMBOLS } from "@/components/snack-sprites";

type Drop = {
  id: string;
  left: number;
  size: number;
  dur: number;
  delay: number;
  dx: number;
  r0: number;
  r1: number;
  o: number;
  extra: boolean;
};

/** Small seeded generator, so the server and the browser render exactly the same markup. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PHONE = 22; // drops shown on phones
const ALL = 40; // drops shown from tablet width up

const DROPS: Drop[] = (() => {
  const rnd = seeded(7151);
  return Array.from({ length: ALL }, (_, i) => {
    const extra = i >= PHONE;
    const cols = extra ? ALL - PHONE : PHONE;
    const j = extra ? i - PHONE : i;
    // walk the columns in a scattered order so neighbours never fall together
    const col = (j * (extra ? 5 : 7)) % cols;
    const left = ((col + 0.12 + rnd() * 0.76) / cols) * 100;
    const depth = rnd(); // 0 = far, 1 = near
    const dur = 11.5 - depth * 4.5 + rnd() * 1.5; // nearer snacks fall faster
    const dir = rnd() < 0.5 ? -1 : 1;
    const r0 = Math.round(rnd() * 360);
    return {
      id: SNACK_IDS[(i * 4 + 1) % SNACK_IDS.length],
      left: Math.round(left * 10) / 10,
      size: Math.round(20 + depth * 19), // 20-39px
      dur: Math.round(dur * 100) / 100,
      delay: -Math.round(rnd() * dur * 100) / 100, // negative: already mid-fall at first paint
      dx: Math.round((rnd() - 0.5) * 80),
      r0,
      r1: r0 + dir * Math.round(220 + rnd() * 320),
      o: Math.round((0.84 + depth * 0.16) * 100) / 100,
      extra,
    };
  });
})();

/**
 * A light rain of tiny single-piece snacks behind the hero text.
 * Each snack is one transform animation (compositor only, no per-frame JavaScript). It pauses when the hero is
 * off screen, and nothing is created at all for people who ask for reduced motion.
 */
export function SnackRain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(".snack"));
    const wide = window.matchMedia("(min-width: 768px)");
    const live = new Map<number, Animation>();
    let paused = false;

    const frames = (d: Drop, h: number): Keyframe[] => [
      { transform: `translate3d(0px, -64px, 0px) rotate(${d.r0}deg)` },
      { transform: `translate3d(${d.dx}px, ${h + 64}px, 0px) rotate(${d.r1}deg)` },
    ];

    // (re)start only the snacks that are shown at this width, and re-aim them when the hero's height changes
    const sync = () => {
      const h = el.clientHeight;
      const limit = wide.matches ? nodes.length : PHONE;
      nodes.forEach((n, i) => {
        const d = DROPS[i];
        const a = live.get(i);
        if (i >= limit) {
          a?.cancel();
          live.delete(i);
        } else if (a) {
          (a.effect as KeyframeEffect).setKeyframes(frames(d, h));
        } else {
          const na = n.animate(frames(d, h), { duration: d.dur * 1000, delay: d.delay * 1000, iterations: Infinity, easing: "linear", fill: "both" });
          if (paused) na.pause();
          live.set(i, na);
        }
      });
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    wide.addEventListener("change", sync);
    const io = new IntersectionObserver(([e]) => {
      paused = !e.isIntersecting;
      live.forEach((a) => (paused ? a.pause() : a.play()));
    });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
      wide.removeEventListener("change", sync);
      live.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="snack-rain pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <svg width="0" height="0" className="absolute" focusable="false" dangerouslySetInnerHTML={{ __html: SNACK_SYMBOLS }} />
      {DROPS.map((d, i) => (
        <span key={i} className={d.extra ? "snack snack-extra" : "snack"} style={{ left: `${d.left}%`, width: d.size, height: d.size, opacity: d.o }}>
          <svg viewBox="0 0 48 48" focusable="false">
            <use href={`#s-${d.id}`} />
          </svg>
        </span>
      ))}
    </div>
  );
}
