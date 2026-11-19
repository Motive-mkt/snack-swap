import { appUrl, whopAccessUrl } from "./env";
import { signToken } from "./tokens";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export function downloadUrlFor(orderId: string) {
  return `${appUrl()}/api/download?token=${encodeURIComponent(signToken({ orderId }))}`;
}

/**
 * Sends the branded delivery email through Resend's REST API (no SDK needed).
 * Swap the fetch for Postmark / SES / EmailSync if you prefer — keep the signature.
 * Without RESEND_API_KEY the link is logged to the server console (local dev only).
 */
export async function sendDeliveryEmail(to: string, orderId: string): Promise<void> {
  const link = downloadUrlFor(orderId);
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const html = `<!doctype html><html><body style="margin:0;background:#ffd84d;font-family:Inter,Arial,sans-serif;color:#1e0b2b">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="560" style="max-width:560px;background:#fffaee;border:3px solid #1e0b2b;border-radius:24px;padding:32px">
  <tr><td>
    <p style="margin:0 0 4px;font:600 12px Inter,Arial;letter-spacing:.16em;text-transform:uppercase;color:#1f6b4a">Snack Swap · Bite</p>
    <h1 style="margin:0 0 12px;font:800 34px Arial Black,Arial,sans-serif;letter-spacing:-.03em;text-transform:lowercase">your playbook is ready</h1>
    <p style="margin:0 0 20px;line-height:1.6">Thanks for your order. Your 151-page Snack Swap Playbook PDF is one tap away.</p>
    <p style="margin:0 0 24px"><a href="${esc(link)}" style="display:inline-block;background:#ff5a2b;color:#1e0b2b;border:2.5px solid #1e0b2b;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:999px">Download the Playbook</a></p>
    ${whopAccessUrl() ? `<p style="margin:0 0 20px;font-size:14px"><a href="${esc(whopAccessUrl())}" style="color:#1e0b2b;font-weight:700">Or open it in your Whop library</a> (sign in with this email).</p>` : ""}
    <p style="margin:0 0 8px;font-weight:600">Kitchen quick-start</p>
    <ul style="margin:0 0 20px;padding-left:18px;line-height:1.7">
      <li>Weigh ingredients — grams are the calculation basis; cups and spoons are approximations.</li>
      <li>Read the whole recipe first: active prep and total time are listed separately.</li>
      <li>Check allergen labels on every package, and cook poultry to 165°F (74°C).</li>
    </ul>
    <p style="margin:0 0 6px;font-size:14px;color:#4a3a57">This link works for 7 days. Need a new one? Use “Resend my download link” on the site — no account needed.</p>
    <p style="margin:0;font-size:14px;color:#4a3a57">${support ? `Questions? Reply to ${esc(support)}. ` : ""}A free Whop account is only needed for live chat or to re-download from your Whop library.</p>
  </td></tr></table>
  <p style="max-width:520px;font-size:12px;color:#4a3a57;margin:16px 0 0">Nutrition figures are estimates, not medical advice. Brand names are reference points only; Snack Swap is not affiliated with any brand named.</p>
  </td></tr></table></body></html>`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email:dev] To ${to} — download link: ${link}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Snack Swap <onboarding@resend.dev>",
      to: [to],
      reply_to: support || undefined,
      subject: "Your Snack Swap Playbook download",
      html,
    }),
  });
  if (!res.ok) throw new Error(`Email provider error ${res.status}: ${await res.text()}`);
}
