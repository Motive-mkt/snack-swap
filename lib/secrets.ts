import "server-only";
import { hkdfSync } from "node:crypto";

/**
 * Signing keys are never stored anywhere: each one is derived (HKDF-SHA256) from the secrets that already
 * live in the host's locked environment, plus a purpose label. A token made for one purpose (say a support
 * chat session) can therefore never be accepted for another (the owner area), even though both are signed.
 */
const ROOT_SOURCES = ["DOWNLOAD_TOKEN_SECRET", "WHOP_API_KEY", "WHOP_WEBHOOK_SECRET"] as const;

const cache = new Map<string, Buffer>();

function rootMaterial(): string {
  const joined = ROOT_SOURCES.map((n) => process.env[n] ?? "")
    .filter(Boolean)
    .join("\u0000");
  if (joined.length < 32) throw new Error("Not enough secret material configured to sign tokens");
  return joined;
}

export function deriveKey(purpose: string): Buffer {
  let key = cache.get(purpose);
  if (!key) {
    key = Buffer.from(hkdfSync("sha256", rootMaterial(), "snackswap/v2", `purpose:${purpose}`, 32));
    cache.set(purpose, key);
  }
  return key;
}
