import type { Metadata } from "next";
import { createHash } from "node:crypto";
import { notFound } from "next/navigation";
import { secureCookies } from "@/lib/cookies";
import { getOwner } from "@/lib/owner";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner", robots: { index: false, follow: false, nocache: true } };

/** Secrets are only ever described, never shown: set or not, how long, and a short fingerprint to tell versions apart. */
const KEYS: Array<[string, string]> = [
  ["WHOP_API_KEY", "Whop API key"],
  ["WHOP_WEBHOOK_SECRET", "Whop webhook secret"],
  ["DOWNLOAD_TOKEN_SECRET", "Download-link secret"],
  ["RESEND_API_KEY", "Email (Resend) key"],
  ["UPSTASH_REDIS_REST_TOKEN", "Orders database token"],
  ["AWS_SECRET_ACCESS_KEY", "PDF storage secret"],
];
const fingerprint = (v: string) => createHash("sha256").update(v).digest("hex").slice(0, 6);

export default async function Admin() {
  const owner = await getOwner();
  if (!owner) notFound(); // identical to any page that doesn't exist

  const rows = KEYS.map(([name, label]) => {
    const v = process.env[name];
    return { name, label, set: !!v, len: v?.length ?? 0, fp: v ? fingerprint(v) : "" };
  });
  const checks: Array<[string, boolean]> = [
    ["Only your Whop account opens this page", true],
    ["Whop API key is set", !!process.env.WHOP_API_KEY],
    ["Webhook signature check is on", !!process.env.WHOP_WEBHOOK_SECRET],
    ["Cookies are HTTPS-only", secureCookies()],
  ];
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  return (
    <main id="main" className="wrap max-w-2xl py-12" data-nosplit>
      <p className="text-sm font-semibold uppercase tracking-widest text-sage">Owner area</p>
      <h1 className="mt-2 text-[2.2rem]">Hi {owner.name ?? "Jesse"}</h1>
      <p className="mt-2 text-ink-2">Only you can see this page. Everyone else gets a normal &ldquo;not found&rdquo;.</p>

      <section className="mt-8 rounded-3xl border border-line bg-paper-2 p-6" aria-labelledby="keys-h">
        <h2 id="keys-h" className="font-sans text-lg font-semibold">Your keys</h2>
        <p className="mb-3 text-sm text-ink-2">Values are never shown anywhere. The fingerprint just tells you if a key changed.</p>
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li key={r.name} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>
                <span className="font-semibold">{r.label}</span>
                <span className="block text-xs text-ink-2">{r.name}</span>
              </span>
              <span className="text-right">
                <span className={r.set ? "font-semibold text-sage" : "text-ink-2"}>{r.set ? "Set" : "Not used"}</span>
                {r.set && <span className="block text-xs text-ink-2">{r.len} chars · {r.fp}</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-3xl border border-line bg-paper-2 p-6" aria-labelledby="sec-h">
        <h2 id="sec-h" className="font-sans text-lg font-semibold">Security checks</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {checks.map(([label, ok]) => (
            <li key={label} className="flex items-center justify-between gap-3">
              <span>{label}</span>
              <span className={ok ? "font-semibold text-sage" : "font-semibold text-paprika"}>{ok ? "OK" : "Check"}</span>
            </li>
          ))}
        </ul>
        {commit && <p className="mt-4 text-xs text-ink-2">Live version {commit}</p>}
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <a className="btn-ghost" href="https://whop.com/dashboard" target="_blank" rel="noopener noreferrer">Whop dashboard</a>
        <a className="btn-ghost" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">Vercel</a>
        <form method="post" action="/api/admin/logout">
          <button type="submit" className="btn-primary">Sign out</button>
        </form>
      </div>
    </main>
  );
}
