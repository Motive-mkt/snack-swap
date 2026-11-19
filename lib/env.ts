/** Central place for env access. Server-only values must never be imported into client components. */
export const appUrl = () => (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const isSandbox = () => process.env.WHOP_SANDBOX === "true";

export function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

/** True while no private PDF storage is configured: delivery then happens through the Whop library. */
export const whopMode = () => !process.env.S3_BUCKET && !process.env.PRIVATE_PDF_PATH;

/** Where buyers open the Files app on Whop (their purchase unlocks it). Optional. */
export const whopAccessUrl = () => process.env.WHOP_ACCESS_URL || "";
