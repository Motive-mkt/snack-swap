import { RECIPES } from "./recipes";

/** Every claim on the page is derived from the recipe data — nothing is hand-typed. */
const kcal = RECIPES.map((r) => r.kcal).sort((a, b) => a - b);
const mid = Math.floor(kcal.length / 2);
const medianKcal = kcal.length % 2 ? kcal[mid] : (kcal[mid - 1] + kcal[mid]) / 2;
const topProtein = RECIPES.reduce((a, b) => (b.protein > a.protein ? b : a));

export const STATS = {
  total: RECIPES.length,
  zeroSugar: RECIPES.filter((r) => r.sugar === 0).length,
  under150: RECIPES.filter((r) => r.kcal <= 150).length,
  atMost200: RECIPES.filter((r) => r.kcal <= 200).length,
  quickPrep: RECIPES.filter((r) => r.prepMin <= 20).length,
  fiber3: RECIPES.filter((r) => r.fiber >= 3).length,
  protein10: RECIPES.filter((r) => r.protein >= 10).length,
  direct: RECIPES.filter((r) => r.kind === "direct").length,
  craving: RECIPES.filter((r) => r.kind === "craving").length,
  medianKcal,
  topProtein,
};

export const SITE = {
  name: "Snack Swap Playbook",
  brand: "Bite",
  pages: 151,
  /** Set NEXT_PUBLIC_PRICE_LABEL (e.g. "$19") to show the price on the offer card. Whop's checkout always shows the real, authoritative price. */
  price: process.env.NEXT_PUBLIC_PRICE_LABEL || "",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  /** Flip to true only once genuine, disclosed reviews exist in data/reviews.ts (FTC 16 CFR Part 465). */
  SHOW_VERIFIED_REVIEWS: false,
};
