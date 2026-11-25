import type { NextConfig } from "next";

const prod = process.env.NODE_ENV === "production";

// Locks down what the page may load or talk to. Whop's chat widget needs its own domains; everything else is refused.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.whop.com",
  "style-src 'self' 'unsafe-inline' https://*.whop.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://*.whop.com",
  "media-src 'self' blob: https:",
  "connect-src 'self' https://*.whop.com wss://*.whop.com https://*.whop.tw",
  "frame-src https://*.whop.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=(), serial=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  ...(prod ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const ownerHeaders = [
  { key: "Cache-Control", value: "private, no-store" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: { formats: ["image/webp"] },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: ownerHeaders },
      { source: "/api/admin/:path*", headers: ownerHeaders },
    ];
  },
};

export default nextConfig;
