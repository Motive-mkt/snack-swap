import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/cormorant-garamond";
import "./globals.css";
import { SupportProvider } from "@/components/SupportProvider";

const siteUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Snack Swap Playbook — 40 craving-led snack swaps, macros included",
  description:
    "40 homemade swaps for the chips, cookies, soft-serve and fast-food favourites you actually crave. Gram weights, US cup equivalents, USDA-based nutrition per serving. 151-page PDF, instant download.",
  openGraph: {
    title: "Snack Swap Playbook by Bite",
    description:
      "40 craving-led kitchen swaps with gram-accurate macros. Buy without a Whop account — instant PDF download.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4efe3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
        >
          Skip to content
        </a>
        <SupportProvider>{children}</SupportProvider>
      </body>
    </html>
  );
}
