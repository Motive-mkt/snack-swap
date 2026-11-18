import { signToken, verifyToken } from "./tokens";

/** Support-chat session, sealed (HMAC-signed) into an httpOnly cookie. The Whop access token lives here only. */
export const SUPPORT_COOKIE = "ss_support";
export type SupportSession = { userId: string; channelId: string; accessToken: string; name?: string };

export const sealSession = (s: SupportSession, ttl = 3300) => signToken(s as unknown as Record<string, unknown>, ttl);
export const openSession = (v: string | undefined) => verifyToken<SupportSession>(v);
