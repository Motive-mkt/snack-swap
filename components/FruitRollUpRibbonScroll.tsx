"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { recipeById } from "@/data/recipes";
import { fmt } from "@/lib/utils";

const recipe = recipeById(37);

/** Ribbon path in a 400x800 canvas: top-left → centre-right → back left → bottom-right. */
const RIBBON =
  "M 72 84 C 190 96 330 130 332 236 C 334 350 66 330 68 450 C 70 570 334 548 334 656 C 334 706 312 736 296 752";

/** Spiral (coil) centred on 0,0 */
function spiral(turns: number, r0: number, r1: number) {
  const steps = 90;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = r0 + ((r1 - r0) * i) / steps;
    d += `${i === 0 ? "M" : "L"}${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)} `;
  }
  return d;
}
const COIL = spiral(2.6, 4, 30);

const MILESTONES = [
  {
    at: 0.16,
    h: "Blended smooth",
    p: "300 g apple, 250 g strawberries, 150 g blueberries and 10 g lemon juice — no honey, syrup or added sugar. Heated to 160°F (71°C), then cooled 5 minutes.",
  },
  {
    at: 0.5,
    h: "Spread thin, dried low",
    p: "Spread 1/8–1/4 inch (3–6 mm) on lined dehydrator trays and dried at 140°F (60°C) for 6–12 hours, until the centre springs back but still bends.",
  },
  {
    at: 0.82,
    h: "Cooled and cut",
    p: "Cooled 30 minutes, peeled from the liner and cut with clean scissors into 6 narrow strips, then rolled.",
  },
];

const FRUITS = [
  { key: "apple", label: "300 g apple", x: 44, y: 28, c: "#C94B3B" },
  { key: "straw", label: "250 g strawberries", x: 172, y: 40, c: "#D1364B" },
  { key: "blue", label: "150 g blueberries", x: 40, y: 150, c: "#4A5BA8" },
  { key: "lemon", label: "10 g lemon juice", x: 178, y: 150, c: "#E8C247" },
] as const;

function Fruit({ p, f, i }: { p: MotionValue<number>; f: (typeof FRUITS)[number]; i: number }) {
  const tx = 72 - f.x;
  const ty = 84 - f.y;
  const x = useTransform(p, [0.02 + i * 0.01, 0.18], [0, tx]);
  const y = useTransform(p, [0.02 + i * 0.01, 0.18], [0, ty]);
  const scale = useTransform(p, [0.02, 0.18], [1, 0.25]);
  const opacity = useTransform(p, [0.1, 0.19], [1, 0]);
  const labelOpacity = useTransform(p, [0, 0.07], [1, 0]);
  return (
    <>
      <motion.g style={{ x, y, scale, opacity, transformBox: "fill-box", transformOrigin: "center" }}>
        <g transform={`translate(${f.x} ${f.y})`}>
          {f.key === "apple" && (
            <>
              <circle r="18" fill={f.c} />
              <path d="M2 -18 q 4 -9 11 -9" stroke="#4F6A47" strokeWidth="3" fill="none" strokeLinecap="round" />
              <ellipse cx="-6" cy="-6" rx="4" ry="7" fill="#fff" opacity="0.25" />
            </>
          )}
          {f.key === "straw" && (
            <>
              <path d="M0 22 C -24 6 -20 -16 0 -14 C 20 -16 24 6 0 22 Z" fill={f.c} />
              <path d="M-10 -14 L0 -22 L10 -14 L0 -10 Z" fill="#4F6A47" />
              {[[-6, -2], [5, 0], [-2, 8], [8, 9]].map(([sx, sy], k) => (
                <circle key={k} cx={sx} cy={sy} r="1.3" fill="#F6D9A0" />
              ))}
            </>
          )}
          {f.key === "blue" && (
            <>
              {[[-12, 4], [4, -6], [10, 10]].map(([bx, by], k) => (
                <circle key={k} cx={bx} cy={by} r="10" fill={f.c} />
              ))}
              <circle cx="4" cy="-6" r="2.6" fill="#2F3B7A" />
            </>
          )}
          {f.key === "lemon" && (
            <>
              <ellipse rx="20" ry="14" fill={f.c} transform="rotate(-18)" />
              <path d="M-22 -2 q-4 -3 0 -6 M22 2 q4 3 0 6" stroke={f.c} strokeWidth="3" fill="none" />
            </>
          )}
        </g>
      </motion.g>
      <motion.text
        x={f.x}
        y={f.y + 38}
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill="#1E0B2B"
        className="max-sm:hidden"
        style={{ opacity: labelOpacity }}
      >
        {f.label}
      </motion.text>
    </>
  );
}

function Shears({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, [0.86, 0.95], [0, 1]);
  const rot = useTransform(p, [0.86, 0.98], [18, 0]);
  return (
    <motion.g style={{ opacity, rotate: rot, transformBox: "fill-box", transformOrigin: "center" }}>
      <g transform="translate(262 770)">
        <path d="M0 0 L40 -26" stroke="#1E0B2B" strokeWidth="5" strokeLinecap="round" />
        <path d="M0 -22 L40 4" stroke="#1E0B2B" strokeWidth="5" strokeLinecap="round" />
        <circle cx="-8" cy="-2" r="9" fill="none" stroke="#B23E1B" strokeWidth="4" />
        <circle cx="-8" cy="-22" r="9" fill="none" stroke="#B23E1B" strokeWidth="4" />
      </g>
    </motion.g>
  );
}

function Canvas({ p, ribbon }: { p: MotionValue<number>; ribbon: MotionValue<number> }) {
  const pathRef = useRef<SVGPathElement>(null);
  const tipX = useMotionValue(72);
  const tipY = useMotionValue(84);
  const coilRotate = useTransform(p, [0.14, 0.9], [0, 720]);
  const coilOpacity = useTransform(p, [0.1, 0.2], [0, 1]);
  const coilScale = useTransform(p, [0.14, 0.9], [1, 0.8]);
  useMotionValueEvent(ribbon, "change", (v) => {
    const el = pathRef.current;
    if (!el) return;
    const pt = el.getPointAtLength(el.getTotalLength() * Math.max(0, Math.min(1, v)));
    tipX.set(pt.x);
    tipY.set(pt.y);
  });
  const tipOpacity = useTransform(ribbon, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  return (
    <svg
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMin meet"
      role="img"
      aria-label="Illustration: apple, strawberries, blueberries and lemon juice merge into a coiled fruit roll that unrolls into a glossy berry ribbon."
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="berry" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B0304A" />
          <stop offset="100%" stopColor="#7E1F36" />
        </linearGradient>
      </defs>
      {/* guide (faint) */}
      <path d={RIBBON} ref={pathRef} fill="none" stroke="#E6DCC8" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      <path d={RIBBON} fill="none" stroke="#DDD3BF" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" transform="translate(0 0)" />
      {/* ribbon */}
      <motion.path d={RIBBON} fill="none" stroke="#6F1A30" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: ribbon }} />
      <motion.path d={RIBBON} fill="none" stroke="url(#berry)" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: ribbon }} />
      <motion.path
        d={RIBBON}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.32"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-9 -9)"
        style={{ pathLength: ribbon }}
      />
      <motion.circle r="23" fill="#9B2C3F" stroke="#6F1A30" strokeWidth="2" style={{ x: tipX, y: tipY, opacity: tipOpacity }} cx={0} cy={0} />

      {/* coil */}
      <g transform="translate(72 84)">
        <motion.g style={{ rotate: coilRotate, opacity: coilOpacity, scale: coilScale }}>
          <path d={COIL} fill="none" stroke="#6F1A30" strokeWidth="13" strokeLinecap="round" />
          <path d={COIL} fill="none" stroke="#B0304A" strokeWidth="9" strokeLinecap="round" />
          <circle r="5" fill="#E8B7BF" />
        </motion.g>
      </g>

      {FRUITS.map((f, i) => (
        <Fruit key={f.key} p={p} f={f} i={i} />
      ))}
      <Shears p={p} />
    </svg>
  );
}

function Card({ m, i, lit, side }: { m: (typeof MILESTONES)[number]; i: number; lit: boolean; side: "l" | "r" }) {
  return (
    <div
      className={`w-[min(300px,100%)] rounded-2xl border-2 bg-paper-2 p-4 transition-all duration-300 ${
        lit ? "border-ink opacity-100 shadow-[5px_5px_0_var(--ink)]" : "border-ink/40 opacity-50"
      } ${side === "l" ? "text-right" : ""}`}
    >
      <p className="num text-xs font-semibold text-berry">0{i + 1}</p>
      <h3 className="text-2xl">{m.h}</h3>
      <p className="mt-1 text-sm text-ink-2">{m.p}</p>
    </div>
  );
}

export function FruitRollUpRibbonScroll() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 130, damping: 30, restDelta: 0.0005 });
  const still = useMotionValue(1);
  const p = reduce ? still : smooth;
  const ribbon = useTransform(p, [0.2, 0.85], [0, 1], { clamp: true });
  const [lit, setLit] = useState(-1);
  useMotionValueEvent(ribbon, "change", (v) => {
    const l = MILESTONES.reduce((acc, m, i) => (v >= m.at ? i : acc), -1);
    setLit((prev) => (prev === l ? prev : l));
  });
  const done = useTransform(p, [0.86, 0.96], [0, 1]);
  const doneY = useTransform(p, [0.86, 0.96], [12, 0]);
  const litIdx = reduce ? 2 : lit;

  const pill = (
    <>
      <ul className="num flex flex-wrap gap-2" aria-label="Nutrition per roll-up">
        {[
          [fmt(recipe.kcal), "kcal"],
          [fmt(recipe.fiber), "g fiber"],
          [fmt(recipe.sugar), "g added sugar"],
          ["6", "roll-ups per batch"],
        ].map(([v, u]) => (
          <li key={u} className="rounded-full border border-berry/30 bg-paper-2 px-3 py-1.5 text-sm font-semibold">
            {v} <span className="font-medium text-ink-2">{u}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs italic text-ink-2">Direct-format alternative — inspired by Fruit by the Foot (not affiliated). A food dehydrator is required.</p>
    </>
  );

  const Header = (
    <div>
      <p className="eyebrow">Recipe 37 · Fruit-Forward Sweet Snacks</p>
      <h2 className="mt-2 text-[clamp(1.8rem,4vw,2.8rem)]">Four whole fruits, one flexible ribbon</h2>
    </div>
  );

  if (reduce) {
    return (
      <section aria-labelledby="fruit-h" className="wrap py-16 lg:py-24">
        <div id="fruit-h">{Header}</div>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[320px_1fr]">
          <div className="mx-auto h-[560px] w-full max-w-[320px]">
            <Canvas p={p} ribbon={ribbon} />
          </div>
          <div className="grid gap-4">
            {MILESTONES.map((m, i) => (
              <Card key={m.h} m={m} i={i} lit side="r" />
            ))}
            <div>{pill}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="fruit-h" className="relative bg-mint">
      <div ref={ref} className="relative h-[220vh]">
        <div className="sticky top-16 flex h-[calc(100dvh-4rem)] min-h-[520px] flex-col overflow-x-clip pt-5 sm:pt-7">
          <div id="fruit-h" className="wrap w-full">{Header}</div>

          <div className="wrap relative mt-2 grid min-h-0 w-full flex-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[1fr_minmax(0,360px)_1fr] lg:grid-rows-1">
            {/* desktop left column */}
            <div className="hidden flex-col justify-center pr-6 lg:flex lg:items-end">
              <Card m={MILESTONES[1]} i={1} lit={litIdx >= 1} side="l" />
            </div>

            <div className="relative min-h-0">
              <Canvas p={p} ribbon={ribbon} />
            </div>

            {/* desktop right column */}
            <div className="hidden flex-col justify-between py-[12%] pl-6 lg:flex">
              <Card m={MILESTONES[0]} i={0} lit={litIdx >= 0} side="r" />
              <div>
                <Card m={MILESTONES[2]} i={2} lit={litIdx >= 2} side="r" />
              </div>
            </div>

            {/* mobile: one active card */}
            <div className="grid pb-4 lg:hidden">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.h}
                  aria-hidden={Math.max(litIdx, 0) !== i}
                  className={`[grid-area:1/1] transition-opacity duration-300 ${Math.max(litIdx, 0) === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  <Card m={m} i={i} lit side="r" />
                </div>
              ))}
            </div>
          </div>

          <motion.div style={{ opacity: done, y: doneY }} className="wrap w-full pb-5 pt-1 lg:pb-8">
            {pill}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
