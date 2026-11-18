import { WhopClient, WhopEnvironment } from "@whop/sdk";
import { isSandbox, required } from "./env";

/** Server-side Whop client. Set WHOP_SANDBOX=true to talk to sandbox-api.whop.com (test data, no real money). */
export function whop() {
  return new WhopClient({
    token: required("WHOP_API_KEY"),
    environment: isSandbox() ? WhopEnvironment.Sandbox : WhopEnvironment.Production,
  });
}
