import { randomUUID } from "node:crypto";

/*
  Order storage behind a tiny interface so it swaps cleanly to Postgres / Supabase / Vercel KV.
  - Upstash/Vercel KV (REST) is used automatically when UPSTASH_REDIS_REST_URL / _TOKEN
    (or KV_REST_API_URL / _TOKEN) are set — this is what you want on Vercel.
  - Otherwise an in-memory store is used (fine for local dev; NOT durable across serverless instances).
*/
export type Order = {
  orderId: string;
  buyerEmail: string;
  status: "pending" | "paid";
  createdAt: string;
  paidAt?: string;
  whopPaymentId?: string;
};

export interface OrderStore {
  create(email: string): Promise<Order>;
  get(orderId: string): Promise<Order | null>;
  /** Persist a (possibly external) order, e.g. a purchase made without our checkout. */
  put(order: Order): Promise<void>;
  markPaid(orderId: string, whopPaymentId?: string): Promise<Order | null>;
  latestPaidByEmail(email: string): Promise<Order | null>;
  /** Returns true the first time a key is seen (idempotency / rate-limit guard). */
  once(key: string, ttlSeconds: number): Promise<boolean>;
  /** Release a once() key so a failed attempt can be retried (e.g. webhook redelivery). */
  forget(key: string): Promise<void>;
}

const TTL = 60 * 60 * 24 * 400;
const norm = (e: string) => e.trim().toLowerCase();

/* ---------------- in-memory ---------------- */
class MemoryStore implements OrderStore {
  private orders = new Map<string, Order>();
  private byEmail = new Map<string, string>();
  private seen = new Map<string, number>();
  async create(email: string) {
    const o: Order = { orderId: randomUUID(), buyerEmail: norm(email), status: "pending", createdAt: new Date().toISOString() };
    this.orders.set(o.orderId, o);
    return o;
  }
  async get(id: string) { return this.orders.get(id) ?? null; }
  async put(o: Order) {
    this.orders.set(o.orderId, o);
    if (o.status === "paid") this.byEmail.set(norm(o.buyerEmail), o.orderId);
  }
  async markPaid(id: string, pay?: string) {
    const o = this.orders.get(id);
    if (!o) return null;
    if (o.status !== "paid") Object.assign(o, { status: "paid", paidAt: new Date().toISOString(), whopPaymentId: pay });
    this.byEmail.set(norm(o.buyerEmail), id);
    return o;
  }
  async latestPaidByEmail(email: string) {
    const id = this.byEmail.get(norm(email));
    return id ? (await this.get(id)) : null;
  }
  async once(key: string, ttl: number) {
    const now = Date.now();
    const exp = this.seen.get(key);
    if (exp && exp > now) return false;
    this.seen.set(key, now + ttl * 1000);
    return true;
  }
  async forget(key: string) { this.seen.delete(key); }
}

/* ---------------- Upstash / Vercel KV (REST) ---------------- */
class RestStore implements OrderStore {
  constructor(private url: string, private token: string) {}
  private async cmd<T = unknown>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`KV ${res.status}`);
    return ((await res.json()) as { result: T }).result;
  }
  async create(email: string) {
    const o: Order = { orderId: randomUUID(), buyerEmail: norm(email), status: "pending", createdAt: new Date().toISOString() };
    await this.cmd("SET", `order:${o.orderId}`, JSON.stringify(o), "EX", TTL);
    return o;
  }
  async get(id: string) {
    const v = await this.cmd<string | null>("GET", `order:${id}`);
    return v ? (JSON.parse(v) as Order) : null;
  }
  async put(o: Order) {
    await this.cmd("SET", `order:${o.orderId}`, JSON.stringify(o), "EX", TTL);
    if (o.status === "paid") await this.cmd("SET", `email:${norm(o.buyerEmail)}`, o.orderId, "EX", TTL);
  }
  async markPaid(id: string, pay?: string) {
    const o = await this.get(id);
    if (!o) return null;
    if (o.status !== "paid") Object.assign(o, { status: "paid", paidAt: new Date().toISOString(), whopPaymentId: pay });
    await this.put(o);
    return o;
  }
  async latestPaidByEmail(email: string) {
    const id = await this.cmd<string | null>("GET", `email:${norm(email)}`);
    return id ? this.get(id) : null;
  }
  async once(key: string, ttl: number) {
    const r = await this.cmd<string | null>("SET", `once:${key}`, "1", "NX", "EX", ttl);
    return r === "OK";
  }
  async forget(key: string) { await this.cmd("DEL", `once:${key}`); }
}

const g = globalThis as unknown as { __orderStore?: OrderStore };
export function orders(): OrderStore {
  if (g.__orderStore) return g.__orderStore;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  g.__orderStore = url && token ? new RestStore(url, token) : new MemoryStore();
  return g.__orderStore;
}
