import { createHash, timingSafeEqual } from "node:crypto";
import { appUrl } from "./env";

/** Constant-time string comparison (hashes first so the lengths never differ). */
export function safeEqual(a: string, b: string): boolean {
  const h = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(a), h(b));
}

/** Short, secret-free description of an error for the logs (SDK error objects can carry request details). */
export const safeErr = (e: unknown): string => (e instanceof Error ? `${e.name}: ${e.message}` : "unknown error").slice(0, 300);

/** Best-effort per-instance limiter. Real flood protection belongs to the host's firewall; this stops casual hammering. */
const hits = new Map<string, { n: number; reset: number }>();
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  h.n += 1;
  return h.n <= max;
}

export const clientIp = (req: Request) =>
  req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

/** True for requests our own pages made. Blocks other sites from triggering state-changing calls. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) {
    const site = req.headers.get("sec-fetch-site");
    return site === null || site === "same-origin" || site === "none";
  }
  try {
    const o = new URL(origin);
    return o.origin === new URL(appUrl()).origin || o.host === req.headers.get("host");
  } catch {
    return false;
  }
}
