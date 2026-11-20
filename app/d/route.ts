export const dynamic = "force-dynamic";

const LINKS: Array<[string, string, string]> = [
  ["bare", "1", "Text and colours only"],
  ["img", "2", "Adds the photos"],
  ["anim", "3", "Adds the moving bits"],
  ["font", "4", "Adds the fonts"],
  ["js", "5", "Adds the scripts"],
  ["all", "6", "Everything (the full page)"],
  ["nojs", "7", "Everything except scripts"],
  ["noimg", "8", "Everything except photos"],
  ["noanim", "9", "Everything except moving bits"],
];

/** TEMPORARY: plain-HTML index of the phone test pages (no scripts, no styles from the site). */
export function GET() {
  const items = LINKS.map(
    ([m, n, label]) =>
      `<a href="/d/${m}" style="display:block;margin:10px 0;padding:16px;border:2px solid #222;border-radius:12px;color:#111;text-decoration:none;font-size:18px"><b>${n}.</b> ${label}</a>`,
  ).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Phone test</title></head><body style="font-family:sans-serif;margin:0;padding:20px;max-width:520px"><h1 style="font-size:24px">Phone test</h1><p style="font-size:17px;line-height:1.4">Open each link one at a time and wait about 8 seconds on it. Use the back button to return here. Note which ones show "This page couldn't load".</p>${items}</body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
