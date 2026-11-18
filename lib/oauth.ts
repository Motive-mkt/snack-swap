import { isSandbox } from "./env";

export const OAUTH_COOKIE = "ss_oauth";
export const oauthBase = () => (isSandbox() ? "https://sandbox-api.whop.com" : "https://api.whop.com");
