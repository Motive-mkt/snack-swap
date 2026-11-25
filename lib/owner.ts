import "server-only";
import { cookies } from "next/headers";
import { adminCookie, openAdmin } from "./admin";

/** The signed-in owner, or null. Every owner page and route checks this itself; never rely on the proxy alone. */
export async function getOwner() {
  const jar = await cookies();
  return openAdmin(jar.get(adminCookie())?.value);
}
