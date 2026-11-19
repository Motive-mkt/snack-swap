import { SITE, STATS } from "@/data/site";

export function CtaBand({ tone = "tomato", line }: { tone?: "tomato" | "butter"; line: string }) {
  return (
    <div className={`border-y-[3px] border-ink ${tone === "tomato" ? "bg-tomato" : "bg-butter"}`}>
      <div className="wrap flex flex-col items-start justify-between gap-5 py-9 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-[clamp(1.7rem,3.6vw,2.6rem)] font-extrabold lowercase leading-none tracking-tight text-ink">{line}</p>
          <p className="mt-2 text-sm font-medium text-ink">
            {STATS.total} recipes · {SITE.pages} pages · gram weights and macros on every one · instant PDF
          </p>
        </div>
        <a href="#checkout" className="btn-ghost shrink-0">
          get your snack swap{SITE.price ? ` · ${SITE.price}` : ""}
        </a>
      </div>
    </div>
  );
}
