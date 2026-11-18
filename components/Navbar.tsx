"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSupport } from "./SupportProvider";

const LINKS = [
  { href: "#swaps", label: "Swaps" },
  { href: "#inside", label: "Inside" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const support = useSupport();

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-baseline gap-2" aria-label="Snack Swap by Bite — home">
          <span className="whitespace-nowrap font-display text-[1.3rem] font-extrabold lowercase leading-none tracking-[-0.04em] sm:text-[1.65rem]">snack swap</span>
          <span className="hidden rounded-sm bg-ink px-1.5 py-0.5 sm:inline text-[0.62rem] font-bold uppercase tracking-[0.18em] text-paper">
            Bite
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2.5 text-[0.95rem] font-medium text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <button
            type="button"
            onClick={support.open}
            className="cursor-pointer rounded-full px-4 py-2.5 text-[0.95rem] font-medium text-ink-2 transition-colors hover:bg-paper-3 hover:text-ink"
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#checkout" className="btn-primary !min-h-11 whitespace-nowrap !px-3.5 text-[0.85rem] !shadow-[3px_3px_0_var(--ink)] sm:!px-5 sm:text-[0.95rem]">
            get the playbook
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 cursor-pointer place-items-center rounded-full text-ink hover:bg-paper-3 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-paper md:hidden">
          <ul className="wrap flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center text-base font-medium"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  support.open();
                }}
                className="flex min-h-12 w-full cursor-pointer items-center text-left text-base font-medium"
              >
                Contact
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
