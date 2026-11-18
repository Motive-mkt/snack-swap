import { CheckoutSection } from "@/components/CheckoutSection";
import { CravingExplorer } from "@/components/CravingExplorer";
import { Footer } from "@/components/Footer";
import { FruitRollUpRibbonScroll } from "@/components/FruitRollUpRibbonScroll";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { RECIPES } from "@/data/recipes";
import { KitchenStandardsAndSpreads } from "@/components/KitchenStandardsAndSpreads";
import { Navbar } from "@/components/Navbar";
import { PotatoToChipScroll } from "@/components/PotatoToChipScroll";
import { Faq, SocialProof } from "@/components/SocialProofAndFaq";

const TITLES = RECIPES.map((r) => r.title.toLowerCase());

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee items={TITLES.slice(0, 14)} className="bg-tomato text-ink" duration={55} />
        <PotatoToChipScroll />
        <CravingExplorer />
        <Marquee items={TITLES.slice(14, 28)} className="bg-ink text-butter" duration={60} reverse />
        <FruitRollUpRibbonScroll />
        <KitchenStandardsAndSpreads />
        <Marquee items={TITLES.slice(28)} className="bg-mint text-ink" duration={50} />
        <SocialProof />
        <CheckoutSection />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
