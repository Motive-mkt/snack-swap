"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-checks the order every few seconds while the webhook / payment is still settling. */
export function AutoRefresh({ everyMs = 4000, maxTries = 20 }: { everyMs?: number; maxTries?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      if (++n > maxTries) return clearInterval(t);
      router.refresh();
    }, everyMs);
    return () => clearInterval(t);
  }, [router, everyMs, maxTries]);
  return null;
}
