type D = { log: (k: string, v?: unknown) => void };

/** Breadcrumb for the temporary phone-crash diagnostics. No-op unless the diag script is on the page. */
export function dbg(k: string, v?: unknown) {
  try {
    (window as unknown as { __d?: D }).__d?.log(k, v);
  } catch {
    /* ignore */
  }
}
