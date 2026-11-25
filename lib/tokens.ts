import { createHmac, timingSafeEqual } from "node:crypto";
import { deriveKey } from "./secrets";

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const mac = (purpose: string, data: string) => createHmac("sha256", deriveKey(purpose)).update(data).digest();

export const DOWNLOAD_TTL_SECONDS = 60 * 60 * 24 * 7;

/**
 * HMAC-signed, expiring token: base64url(payload).base64url(sig).
 * The key is derived per `purpose`, so a token only verifies for the purpose it was made for.
 */
export function signToken(purpose: string, payload: Record<string, unknown>, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const body = b64(JSON.stringify({ ...payload, p: purpose, iat: now, exp: now + ttlSeconds }));
  return `${body}.${b64(mac(purpose, body))}`;
}

/** Returns the payload, or null for anything forged, expired, malformed or made for another purpose. Never throws. */
export function verifyToken<T extends Record<string, unknown>>(purpose: string, token: string | null | undefined): (T & { exp: number }) | null {
  try {
    if (!token || token.length > 4096) return null;
    const parts = token.split(".");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    const [body, sig] = parts;
    const expected = mac(purpose, body);
    const given = Buffer.from(sig, "base64url");
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp: number; p?: string };
    if (p.p !== purpose) return null;
    return typeof p.exp === "number" && p.exp > Math.floor(Date.now() / 1000) ? p : null;
  } catch {
    return null;
  }
}
