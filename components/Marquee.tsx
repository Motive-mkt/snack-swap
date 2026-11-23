"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

function Burst() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className="spin-slow mx-6 size-[0.7em] shrink-0 sm:mx-9">
      <path
        fill="currentColor"
        d="M20 0l4.6 11.2L35.1 5l-3.7 11.9L43 20l-11.6 3.1L35.1 35l-10.5-6.2L20 40l-4.6-11.2L4.9 35l3.7-11.9L-3 20l11.6-3.1L4.9 5l10.5 6.2z"
        transform="scale(.93) translate(1.5 1.5)"
      />
    </svg>
  );
}

export function Marquee({
  items,
  className,
  duration = 45,
  reverse = false,
}: {
  items: string[];
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  // the strip and its spinning stars only animate while they can be seen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      el.dataset.paused = e.isIntersecting ? "0" : "1";
    }, { rootMargin: "160px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const row = (
    <div className="flex shrink-0 items-center" aria-hidden>
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap">{t}</span>
          <Burst />
        </span>
      ))}
    </div>
  );
  return (
    <div
      ref={root}
      role="presentation"
      className={cn(
        "marquee-root overflow-hidden border-y-[3px] border-ink py-4 font-display text-[clamp(2rem,5.5vw,4.5rem)] font-extrabold lowercase leading-none tracking-tight sm:py-6",
        className,
      )}
    >
      <div
        className="marquee-track"
        style={{ ["--marquee-d" as string]: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {row}
        {row}
      </div>
    </div>
  );
}
