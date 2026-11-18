"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

const SupportChatModal = dynamic(() => import("./SupportChatModal"), { ssr: false });

const Ctx = createContext<{ open: () => void }>({ open: () => {} });
export const useSupport = () => useContext(Ctx);

export function SupportProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);

  const open = () => {
    setMounted(true);
    setOpen(true);
  };

  // Returning from Whop OAuth lands on /?support=open — reopen the modal automatically.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const flag = p.get("support");
    if (flag === "open" || flag === "error") {
      setError(flag === "error");
      open();
      p.delete("support");
      const q = p.toString();
      window.history.replaceState({}, "", window.location.pathname + (q ? `?${q}` : "") + window.location.hash);
    }
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {mounted && <SupportChatModal open={isOpen} onOpenChange={setOpen} error={error} />}
    </Ctx.Provider>
  );
}
