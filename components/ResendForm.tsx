"use client";

import { useState } from "react";

/** "Resend my download link" — no account needed. Same neutral confirmation either way. */
export function ResendForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor={compact ? "resend-email-sm" : "resend-email"} className="block text-sm font-semibold">
        Email you used at checkout
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={compact ? "resend-email-sm" : "resend-email"}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-h-12 flex-1 rounded-full border border-line bg-paper px-5 text-base outline-none focus:border-ink"
        />
        <button type="submit" disabled={state === "loading"} className="btn-ghost !min-h-12">
          {state === "loading" ? "Sending…" : "Resend my download link"}
        </button>
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-sm text-ink-2">
        {state === "done" && "If that email has a paid order, a fresh download link is on its way. Check spam too."}
        {state === "error" && "Something went wrong — please try again."}
      </p>
    </form>
  );
}
