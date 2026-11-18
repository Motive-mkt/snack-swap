import { createHmac, timingSafeEqual } from "node:crypto";

const secret = () => {
  const s = process.env.DOWNLOAD_TOKEN_SECRET;
  if (!s || s.length < 16) throw new Error("DOWNLOAD_TOKEN_SECRET must be set (16+ chars)");
  return s;
};
const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const mac = (data: string) => createHmac("sha256", secret()).update(data).digest();

export const DOWNLOAD_TTL_SECONDS = 60 * 60 * 24 * 7;

/** HMAC-signed, expiring token: base64url(payload).base64url(sig) */
export function signToken(payload: Record<string, unknown>, ttlSeconds = DOWNLOAD_TTL_SECONDS): string {
  const body = b64(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  return `${body}.${b64(mac(body))}`;
}

export function verifyToken<T extends Record<string, unknown>>(token: string | null | undefined): (T & { exp: number }) | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = mac(body);
  let given: Buffer;
  try { given = Buffer.from(sig, "base64url"); } catch { return null; }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp: number };
    return p.exp > Math.floor(Date.now() / 1000) ? p : null;
  } catch { return null; }
}
