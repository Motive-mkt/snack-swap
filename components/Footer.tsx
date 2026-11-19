"use client";

import { SITE } from "@/data/site";
import { useSupport } from "./SupportProvider";

export function Footer() {
  const support = useSupport();
  return (
    <footer className="bg-espresso text-paper/80">
      <div className="wrap py-14">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <p className="font-display text-3xl text-paper">Snack Swap</p>
            <p className="mt-1 text-sm">Your favourite cravings, reimagined in your own kitchen.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {[["#swaps", "Swaps"], ["#inside", "Inside"], ["#faq", "FAQ"], ["#checkout", "Get your Snack Swap"]].map(([h, l]) => (
              <a key={h} href={h} className="flex min-h-11 items-center hover:text-paper">{l}</a>
            ))}
            <button type="button" onClick={support.open} className="flex min-h-11 cursor-pointer items-center hover:text-paper">Contact</button>
            {SITE.supportEmail && <a href={`mailto:${SITE.supportEmail}`} className="flex min-h-11 items-center hover:text-paper">{SITE.supportEmail}</a>}
          </nav>
        </div>

        <div className="mt-10 space-y-3 border-t border-paper/15 pt-8 text-xs leading-relaxed text-paper/65">
          <p>
            <strong className="text-paper/85">Not affiliated.</strong> Snack Swap is an independent publication. Brand names and trademarks mentioned (including Doritos, Lay&apos;s, Oreo, Pop-Tarts, Reese&apos;s,
            McDonald&apos;s, Wendy&apos;s, Taco Bell, Sonic, Fruit by the Foot and others) belong to their respective owners, appear for identification only, and imply no sponsorship or endorsement. Recipes are homemade
            alternatives, not copies of any product.
          </p>
          <p>
            <strong className="text-paper/85">Nutrition.</strong> Values are estimates per serving, calculated from USDA FoodData Central nutrient values per 100 g scaled to stated ingredient weights. They are not laboratory
            analyses and can vary by brand, preparation and portion. Snack Swap does not provide medical advice, weight-loss promises or calorie prescriptions — speak with a clinician or registered dietitian about your needs.
          </p>
          <p>
            <strong className="text-paper/85">Allergens.</strong> Several recipes include milk, wheat, eggs, peanuts, tree nuts, soy or sesame. Always read ingredient labels and cross-contact statements. Follow the food-safety temperatures in
            each recipe. Photos are for illustration; your results will vary.
          </p>
          <p>© 2026 Bite. All rights reserved. Payments processed by Whop.</p>
        </div>
      </div>
    </footer>
  );
}
