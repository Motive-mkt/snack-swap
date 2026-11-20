import { NextRequest } from "next/server";
import { DIAG_JS } from "@/lib/diag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Which parts of the real page stay switched on for each test link. */
const MODES: Record<string, { js: boolean; img: boolean; font: boolean; anim: boolean }> = {
  bare: { js: false, img: false, font: false, anim: false },
  img: { js: false, img: true, font: false, anim: false },
  anim: { js: false, img: false, font: false, anim: true },
  font: { js: false, img: false, font: true, anim: false },
  js: { js: true, img: false, font: false, anim: false },
  all: { js: true, img: true, font: true, anim: true },
  nojs: { js: false, img: true, font: true, anim: true },
  noimg: { js: true, img: false, font: true, anim: true },
  noanim: { js: true, img: true, font: true, anim: false },
};

/** TEMPORARY: serves the real home page with chosen features switched off, plus phone-side breadcrumbs. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ mode: string }> }) {
  const { mode } = await ctx.params;
  const m = MODES[mode];
  if (!m) return new Response("Unknown test", { status: 404 });

  const h = req.headers;
  console.log(
    "[diag] req " +
      JSON.stringify({ mode, ua: h.get("user-agent"), ch: h.get("sec-ch-ua"), mob: h.get("sec-ch-ua-mobile"), country: h.get("x-vercel-ip-country"), edge: (h.get("x-vercel-id") || "").split("::")[0] }),
  );

  const res = await fetch(new URL("/", req.url), { cache: "no-store", headers: { "user-agent": "diag-proxy" } });
  let html = await res.text();

  const csp = [!m.js && "script-src 'unsafe-inline'", !m.img && "img-src data:", !m.font && "font-src 'none'"].filter(Boolean).join("; ");
  const inject =
    (csp ? `<meta http-equiv="Content-Security-Policy" content="${csp}">` : "") +
    (m.anim ? "" : "<style>*,*::before,*::after{animation:none!important;transition:none!important}</style>") +
    `<script>${DIAG_JS}</script>`;
  html = html.replace(/<head>/i, "<head>" + inject);

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
