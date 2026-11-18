import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Format grams/kcal without trailing zeros: 16.5 -> "16.5", 132 -> "132". */
export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));
