import { cookieName } from "./cookies";
import { safeEqual } from "./safe";
import { signToken, verifyToken } from "./tokens";

/**
 * Owner-only area. Nobody is "an admin" by default: the area exists only when these three settings are present,
 * and only the one Whop account they name (plus its verified email) is ever let in. Everyone else gets a plain 404.
 *
 *   ADMIN_WHOP_APP_ID   Whop OAuth app (public client) used only to prove who you are
 *   ADMIN_WHOP_USER_ID  your Whop user id (user_...)
 *   ADMIN_EMAIL         optional extra lock: Whop must also report this address as verified
 */
export const ADMIN_TTL_SECONDS = 60 * 60 * 8;
export const adminCookie = () => cookieName("ss_admin", "host");
export const adminOauthCookie = () => cookieName("ss_admin_oauth");

export type AdminConfig = { appId: string; userId: string; email: string | null };

export function adminConfig(): AdminConfig | null {
  const appId = process.env.ADMIN_WHOP_APP_ID?.trim();
  const userId = process.env.ADMIN_WHOP_USER_ID?.trim();
  if (!appId || !userId) return null;
  return { appId, userId, email: process.env.ADMIN_EMAIL?.trim().toLowerCase() || null };
}

// Changing the owner id or email in the settings instantly invalidates every existing owner session.
const purpose = (c: AdminConfig) => `admin:${c.userId}:${c.email ?? ""}`;

export function sealAdmin(c: AdminConfig, name?: string) {
  return signToken(purpose(c), { uid: c.userId, name }, ADMIN_TTL_SECONDS);
}

export function openAdmin(cookieValue: string | undefined): { userId: string; name?: string } | null {
  const c = adminConfig();
  if (!c) return null;
  const t = verifyToken<{ uid: string; name?: string }>(purpose(c), cookieValue);
  if (!t || typeof t.uid !== "string" || !safeEqual(t.uid, c.userId)) return null;
  return { userId: t.uid, name: typeof t.name === "string" ? t.name.slice(0, 80) : undefined };
}

/** The identity check at the end of Whop sign-in. Returns a short reason code (no personal data) when it fails. */
export function checkIdentity(c: AdminConfig, info: { sub?: string; email?: string; email_verified?: boolean }): string | null {
  if (typeof info.sub !== "string" || !safeEqual(info.sub, c.userId)) return "user-mismatch";
  if (c.email) {
    if (typeof info.email !== "string") return "email-missing";
    if (info.email_verified === false) return "email-unverified";
    if (!safeEqual(info.email.trim().toLowerCase(), c.email)) return "email-mismatch";
  }
  return null;
}
