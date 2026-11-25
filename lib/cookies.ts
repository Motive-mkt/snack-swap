import type { NextResponse } from "next/server";
import { appUrl } from "./env";

/** On https every cookie is Secure and uses a __Host- / __Secure- name, so a browser refuses to accept it from anywhere else. */
export const secureCookies = () => appUrl().startsWith("https://");

export const cookieName = (base: string, scope: "host" | "secure" = "secure") =>
  secureCookies() ? `${scope === "host" ? "__Host-" : "__Secure-"}${base}` : base;

/** HttpOnly always; Lax so the cookie survives the redirect back from Whop sign-in. */
export const cookieOpts = (path: string, maxAge: number) => ({
  httpOnly: true,
  secure: secureCookies(),
  sameSite: "lax" as const,
  path,
  maxAge,
});

/** Expire a cookie with the same attributes it was set with (a __Host- cookie cannot be removed without Secure). */
export function clearCookie(res: NextResponse, name: string, path: string) {
  res.cookies.set(name, "", cookieOpts(path, 0));
}
