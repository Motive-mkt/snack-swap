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

const recipe = recipeById(2);

/* ---------- geometry helpers ---------- */
const N = 7;
const PTS = 48;
function blob(r: number, wobble: number, phase: number, lobes: number) {
  let d = "";
  for (let i = 0; i < PTS; i++) {
    const a = (i / PTS) * Math.PI * 2;
    const rr = r + wobble * Math.sin(a * lobes + phase);
    const x = +(rr * Math.cos(a)).toFixed(2);
    const y = +(rr * Math.sin(a) * 0.96).toFixed(2);
    d += `${i === 0 ? "M" : "L"}${x} ${y} `;
  }
  return d + "Z";
}
const FLAT = blob(33, 0, 0, 5);

const CX = 320;
const FAN_Y = 205;
const fanX = (i: number) => CX + (i - 3) * 76;
const fanY = (i: number) => FAN_Y + Math.abs(i - 3) * 4;
const HEAP = [
  [-66, -4], [-44, -20], [-22, -8], [0, -26], [22, -8], [44, -20], [66, -4],
];
const BOWL_X = 320;
const BOWL_Y = 292;

const STEPS = [
  { n: "01", label: "Whole" },
  { n: "02", label: "Slice & Dry" },
  { n: "03", label: "Oil & 400°F Bake" },
  { n: "04", label: `${fmt(recipe.kcal)} kcal Crunch` },
];

const CAPTIONS = [
  { h: "Start with three russets", p: "500 g russet potatoes (about 3 medium), scrubbed and left unpeeled." },
  {
    h: "Slice thin, rinse, dry",
    p: "1/16-inch (1.5 mm) rounds on a mandoline with its guard. Rinse off surface starch and pat very dry — dry slices crisp instead of steaming.",
  },
  {
    h: "Oil, salt, 400°F",
    p: "10 g olive oil and 2 g fine salt, one layer, no overlap. Bake at 400°F (204°C) and pull chips as the edges turn light golden.",
  },
  {
    h: `${fmt(recipe.kcal)} kcal a serving`,
    p: "A serving is 1/4 of the batch — about 28–30 g, roughly 25–35 chips. They finish crisping as they cool.",
  },
];

/* ---------- scene pieces ---------- */
function Potato({ p, x, y, rot, s }: { p: MotionValue<number>; x: number; y: number; rot: number; s: number }) {
  const opacity = useTransform(p, [0, 0.2, 0.28], [1, 1, 0]);
  const scale = useTransform(p, [0, 0.28], [s, s * 0.85]);
  return (
    <motion.g style={{ opacity, scale, transformBox: "fill-box", transformOrigin: "center" }}>
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <ellipse rx="54" ry="36" fill="#B98A58" stroke="#8A6038" strokeWidth="2.5" />
        <ellipse rx="40" ry="22" cy="-6" fill="#C79B68" opacity="0.55" />
        {[[-22, 6], [10, -10], [26, 10]].map(([ex, ey], i) => (
          <circle key={i} cx={ex} cy={ey} r="2.6" fill="#8A6038" />
        ))}
      </g>
    </motion.g>
  );
}

function Slice({ p, i }: { p: MotionValue<number>; i: number }) {
  const wavy = blob(33, 3.6, i * 1.3, 6 + (i % 3));
  const opacity = useTransform(p, [0.24, 0.3], [0, 1]);
  const x = useTransform(p, [0.26, 0.5, 0.76, 0.93], [CX, fanX(i), fanX(i), BOWL_X + HEAP[i][0]]);
  const y = useTransform(p, [0.26, 0.5, 0.76, 0.93], [FAN_Y, fanY(i), fanY(i), BOWL_Y + HEAP[i][1]]);
  const rotate = useTransform(p, [0.26, 0.5, 0.76, 0.93], [0, (i - 3) * 7, (i - 3) * 7, (i - 3) * 22 + (i % 2 ? 10 : -8)]);
  const scale = useTransform(p, [0.76, 0.93], [1, 0.74]);
  const d = useTransform(p, [0.52, 0.76], [FLAT, wavy]);
  const fill = useTransform(p, [0.5, 0.74], ["#EEE2B8", "#DBA645"]);
  const stroke = useTransform(p, [0.5, 0.74], ["#CDBB85", "#B5801F"]);
  return (
    <motion.g style={{ opacity, x, y, rotate, scale }}>
      <motion.path d={d} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <motion.circle r="9" fill="none" stroke={stroke} strokeWidth="1.2" opacity={0.5} />
    </motion.g>
  );
}

function WaterRipple({ p, delay }: { p: MotionValue<number>; delay: number }) {
  const a = 0.36 + delay;
  const scale = useTransform(p, [a, a + 0.1], [0.35, 1.5]);
  const opacity = useTransform(p, [a, a + 0.02, a + 0.1], [0, 0.55, 0]);
  return (
    <motion.circle
      cx={CX}
      cy={FAN_Y}
      r="150"
      fill="none"
      stroke="#74C3D6"
      strokeWidth="3"
      style={{ scale, opacity, transformBox: "fill-box", transformOrigin: "center" }}
    />
  );
}

const DROPS = Array.from({ length: 10 }, (_, i) => ({ x: 110 + i * 46, land: FAN_Y - 18 + ((i * 7) % 5) * 9 }));
const SALT = Array.from({ length: 14 }, (_, i) => ({
  x: 96 + ((i * 97) % 450),
  land: FAN_Y - 24 + ((i * 13) % 6) * 9,
}));

function OilDrop({ p, i, x, land }: { p: MotionValue<number>; i: number; x: number; land: number }) {
  const s = 0.5 + i * 0.011;
  const y = useTransform(p, [s, s + 0.07], [-20, land]);
  const opacity = useTransform(p, [s - 0.001, s, s + 0.07, s + 0.12], [0, 1, 1, 0.0]);
  return <motion.ellipse cx={x} rx="3.2" ry="5" fill="#E3A23B" style={{ y, opacity }} />;
}
function SaltGrain({ p, i, x, land }: { p: MotionValue<number>; i: number; x: number; land: number }) {
  const s = 0.58 + i * 0.008;
  const y = useTransform(p, [s, s + 0.06], [-20, land]);
  const opacity = useTransform(p, [s - 0.001, s, s + 0.06, s + 0.14], [0, 1, 1, 0]);
  return <motion.rect x={x} width="3.4" height="3.4" rx="0.6" fill="#fffdf6" stroke="#cfc5ad" strokeWidth="0.6" style={{ y, opacity, rotate: i * 23 }} />;
}

function Scene({ p }: { p: MotionValue<number> }) {
  const glow = useTransform(p, [0.5, 0.64, 0.8, 0.95], [0, 0.85, 1, 0.45]);
  const weightOpacity = useTransform(p, [0, 0.05, 0.2, 0.26], [0, 1, 1, 0]);
  const mandolineY = useTransform(p, [0.25, 0.46], [30, 380]);
  const mandolineOpacity = useTransform(p, [0.25, 0.28, 0.44, 0.47], [0, 1, 1, 0]);
  const bowlOpacity = useTransform(p, [0.74, 0.86], [0, 1]);
  const heatOpacity = useTransform(p, [0.5, 0.58, 0.78, 0.86], [0, 1, 1, 0]);
  return (
    <svg
      viewBox="0 0 640 420"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Illustration: three russet potatoes are sliced thin, rinsed, oiled and baked into crisp golden chips served in a bowl."
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="ovenGlow" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#F2A54B" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#E0782F" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#E0782F" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="640" height="420" rx="28" fill="#FBF8F1" />
      <motion.rect x="0" y="0" width="640" height="420" rx="28" fill="url(#ovenGlow)" style={{ opacity: glow }} />

      {/* whole potatoes */}
      <Potato p={p} x={238} y={218} rot={-14} s={1} />
      <Potato p={p} x={338} y={246} rot={8} s={1.04} />
      <Potato p={p} x={420} y={196} rot={22} s={0.92} />
      <motion.text x="320" y="78" textAnchor="middle" fontSize="24" fontWeight="600" fill="#2B1D14" style={{ opacity: weightOpacity }}>
        500 g russets · scrubbed, skin on
      </motion.text>

      {/* water ripples + slices */}
      {[0, 0.025, 0.05].map((d) => (
        <WaterRipple key={d} p={p} delay={d} />
      ))}
      {Array.from({ length: N }, (_, i) => (
        <Slice key={i} p={p} i={i} />
      ))}

      {/* mandoline hairline */}
      <motion.g style={{ opacity: mandolineOpacity, y: mandolineY }}>
        <line x1="28" x2="612" y1="0" y2="0" stroke="#2B1D14" strokeWidth="1.2" />
        <rect x="28" y="-4" width="26" height="8" rx="2" fill="#2B1D14" />
        <rect x="586" y="-4" width="26" height="8" rx="2" fill="#2B1D14" />
      </motion.g>

      {/* oil + salt */}
      {DROPS.map((d, i) => (
        <OilDrop key={i} p={p} i={i} x={d.x} land={d.land} />
      ))}
      {SALT.map((s, i) => (
        <SaltGrain key={i} p={p} i={i} x={s.x} land={s.land} />
      ))}

      <motion.g style={{ opacity: heatOpacity }}>
        <rect x="206" y="364" width="228" height="36" rx="18" fill="#B23E1B" />
        <text x="320" y="388" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff">
          400°F (204°C) bake
        </text>
      </motion.g>

      {/* bowl (wireframe) */}
      <motion.g style={{ opacity: bowlOpacity }}>
        <path
          d="M214 296 Q214 380 320 380 Q426 380 426 296 Z"
          fill="#FBF8F1"
          stroke="#2B1D14"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M214 296 Q320 314 426 296" fill="none" stroke="#2B1D14" strokeWidth="2" opacity="0.5" />
      </motion.g>
    </svg>
  );
}

/* ---------- section ---------- */
export function PotatoToChipScroll() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.0005 });
  const still = useMotionValue(1);
  const p = reduce ? still : smooth;

  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3;
    setStep((prev) => (prev === s ? prev : s));
  });
  const activeStep = reduce ? 3 : step;

  const badgeOpacity = useTransform(p, [0.78, 0.9], [0, 1]);
  const badgeY = useTransform(p, [0.78, 0.9], [14, 0]);

  const macros = [
    [fmt(recipe.kcal), "kcal"],
    [fmt(recipe.fat), "g fat"],
    [fmt(recipe.fiber), "g fiber"],
    [fmt(recipe.sugar), "g added sugar"],
  ];

  if (reduce) {
    return (
      <section aria-labelledby="potato-h" className="wrap py-16 lg:py-24">
        <p className="eyebrow">Recipe 02 · Crunchy &amp; Salty</p>
        <h2 id="potato-h" className="mt-3 text-[clamp(2.1rem,5vw,3.4rem)]">From three potatoes to a real snap</h2>
        <div className="mt-8 grid items-center gap-8 lg:grid-cols-2">
          <div className="aspect-[640/420] w-full overflow-hidden rounded-[28px] border border-line">
            <Scene p={p} />
          </div>
          <ol className="grid gap-3">
            {CAPTIONS.map((c, i) => (
              <li key={c.h} className="rounded-2xl border border-line bg-paper-2 p-4">
                <p className="num text-xs font-semibold text-paprika">{STEPS[i].n}</p>
                <p className="font-display text-xl">{c.h}</p>
                <p className="text-sm text-ink-2">{c.p}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="num mt-5 text-sm text-ink-2">
          {macros.map(([v, u]) => `${v} ${u}`).join(" · ")} — Direct-format alternative, inspired by Lay&apos;s Classic (not affiliated).
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="potato-h" className="relative">
      <div ref={ref} className="relative h-[260vh]">
        <div className="sticky top-16 flex h-[calc(100dvh-4rem)] min-h-[520px] items-center overflow-x-clip">
          <div className="wrap w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Recipe 02 · Crunchy &amp; Salty</p>
                <h2 id="potato-h" className="mt-2 text-[clamp(1.8rem,4vw,2.8rem)]">From three potatoes to a real snap</h2>
              </div>
              <ol aria-label="Progress" className="num flex gap-1.5 text-[0.7rem] font-semibold sm:text-xs">
                {STEPS.map((s, i) => (
                  <li
                    key={s.n}
                    aria-current={i === activeStep ? "step" : undefined}
                    className={`whitespace-nowrap rounded-full border px-2.5 py-1.5 transition-colors duration-300 ${
                      i === activeStep ? "border-ink bg-ink text-paper" : i < activeStep ? "border-sage bg-sage-soft text-sage" : "border-line text-ink-2"
                    }`}
                  >
                    <span aria-hidden>{s.n} </span>
                    <span className="max-sm:sr-only">{s.label}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 grid items-center gap-5 lg:mt-7 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10">
              <div className="order-2 lg:order-1">
                <div className="grid">
                {CAPTIONS.map((c, i) => (
                  <div
                    key={c.h}
                    aria-hidden={i !== activeStep}
                    className={`[grid-area:1/1] transition-all duration-300 ${i === activeStep ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
                  >
                    <h3 className="text-[1.7rem] sm:text-3xl">{c.h}</h3>
                    <p className="mt-2 max-w-md text-[0.98rem] text-ink-2">{c.p}</p>
                  </div>
                ))}
                </div>
                <motion.ul style={{ opacity: badgeOpacity, y: badgeY }} className="num mt-5 flex flex-wrap gap-2" aria-label="Nutrition per serving">
                  {macros.map(([v, u]) => (
                    <li key={u} className="rounded-full border border-ink/15 bg-paper-2 px-3 py-1.5 text-sm font-semibold">
                      {v} <span className="font-medium text-ink-2">{u}</span>
                    </li>
                  ))}
                </motion.ul>
                <motion.p style={{ opacity: badgeOpacity }} className="mt-3 text-xs italic text-ink-2">
                  Direct-format alternative — inspired by Lay&apos;s Classic (not affiliated)
                </motion.p>
              </div>
              <div className="order-1 aspect-[640/420] max-h-[48dvh] w-full justify-self-center overflow-hidden rounded-[28px] border border-line shadow-[0_30px_60px_-34px_rgb(43_29_20/0.5)] lg:order-2 lg:max-h-[62dvh]">
                <Scene p={p} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
