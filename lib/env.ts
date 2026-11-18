/** Central place for env access. Server-only values must never be imported into client components. */
export const appUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const isSandbox = () => process.env.WHOP_SANDBOX === "true";

export function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}
