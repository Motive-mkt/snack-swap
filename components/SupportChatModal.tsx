"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog } from "radix-ui";
import { loadWhop } from "@whop/elements";
import { Chat, ChatElement, WhopElements } from "@whop/elements-react";
import { LifeBuoy, LogOut, X } from "lucide-react";
import { SITE } from "@/data/site";
import { ResendForm } from "./ResendForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

type Creds = { accessToken: string; channelId: string; accountId: string; environment: "production" | "sandbox"; name?: string };

function LiveChat({ c }: { c: Creds }) {
  const elements = useMemo(() => loadWhop(), []);
  return (
    <WhopElements elements={elements} environment={c.environment}>
      <Chat accessToken={c.accessToken} accountId={c.accountId} channelId={c.channelId}>
        <ChatElement className="h-full" />
      </Chat>
    </WhopElements>
  );
}

const QUICK = [
  {
    q: "I lost my download link",
    a: <ResendForm compact />,
  },
  {
    q: "I don't have a kitchen scale",
    a: (
      <p>
        Every recipe lists grams first, with approximate US cup and spoon equivalents beside them. Weights govern when volume measures vary, so a basic digital scale is the most useful tool in the book —
        especially for oils, chocolate, cheese and flour.
      </p>
    ),
  },
  {
    q: "Allergens",
    a: (
      <p>
        Several recipes include milk, wheat, eggs, peanuts, tree nuts, soy or sesame. Each recipe has an allergen note, but always check every package label for allergens and cross-contact statements.
      </p>
    ),
  },
  {
    q: "Receipts & billing",
    a: <p>Whop processes the payment and sends your receipt to the email you used at checkout. If you can&apos;t find it, check spam, then message us below with that email address.</p>,
  },
];

export default function SupportChatModal({ open, onOpenChange, error }: { open: boolean; onOpenChange: (v: boolean) => void; error?: boolean }) {
  const [creds, setCreds] = useState<Creds | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetch("/api/whop/support-token", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && setCreds(d?.signedIn ? (d as Creds) : null))
      .catch(() => alive && setCreds(null))
      .finally(() => alive && setChecked(true));
    return () => {
      alive = false;
    };
  }, [open]);

  async function signOut() {
    await fetch("/api/whop/support-token", { method: "DELETE" }).catch(() => {});
    setCreds(null);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-espresso/60 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby="support-desc"
          className="fixed inset-x-0 bottom-0 z-[100] max-h-[92dvh] overflow-y-auto rounded-t-3xl border border-line bg-paper-2 p-6 shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(560px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <LifeBuoy className="size-6 text-paprika" aria-hidden />
              <Dialog.Title className="font-display text-[1.9rem] leading-none">Support</Dialog.Title>
            </div>
            <Dialog.Close aria-label="Close support" className="grid size-11 cursor-pointer place-items-center rounded-full hover:bg-paper-3">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description id="support-desc" className="mt-2 text-sm text-ink-2">
            Most questions are answered right here. You never need a Whop account to buy or download.
          </Dialog.Description>

          <Accordion type="single" collapsible className="mt-5 border-t border-border">
            {QUICK.map((it, i) => (
              <AccordionItem key={it.q} value={`q${i}`}>
                <AccordionTrigger className="!min-h-12 !py-3 !text-[0.95rem]">{it.q}</AccordionTrigger>
                <AccordionContent className="!text-sm">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 rounded-2xl bg-paper-3 p-4 text-sm leading-relaxed">
            <strong>Checkout requires zero Whop account.</strong> To message us directly inside live Whop Support Chat, sign in or create a free Whop account below
            {SITE.supportEmail ? (
              <>
                {" "}
                (or email <a className="font-semibold text-paprika underline underline-offset-2" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>)
              </>
            ) : null}
            .
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-paprika-deep">
              Sign-in didn&apos;t complete. Please try again{SITE.supportEmail ? ` or email ${SITE.supportEmail}` : ""}.
            </p>
          )}

          {!checked ? (
            <div className="mt-5 h-12 animate-pulse rounded-full bg-paper-3" />
          ) : creds ? (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm text-ink-2">
                <span>Signed in{creds.name ? ` as ${creds.name}` : ""} — live Whop Support Chat</span>
                <button type="button" onClick={signOut} className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-medium hover:text-ink">
                  <LogOut className="size-4" aria-hidden /> Sign out
                </button>
              </div>
              <div className="h-[420px] overflow-hidden rounded-2xl border border-line bg-paper">
                <LiveChat c={creds} />
              </div>
            </div>
          ) : (
            <a href="/api/whop/oauth/login" className="btn-primary mt-5 w-full">
              Chat live via Whop (sign in or create a free Whop account)
            </a>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
