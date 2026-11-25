import { cookieName } from "./cookies";
import { isSandbox } from "./env";

export const oauthCookie = () => cookieName("ss_oauth");
export const oauthBase = () => (isSandbox() ? "https://sandbox-api.whop.com" : "https://api.whop.com");
