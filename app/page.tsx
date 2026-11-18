import { CheckoutSection } from "@/components/CheckoutSection";
import { CravingExplorer } from "@/components/CravingExplorer";
import { Footer } from "@/components/Footer";
import { FruitRollUpRibbonScroll } from "@/components/FruitRollUpRibbonScroll";
import { Hero } from "@/components/Hero";
import { KitchenStandardsAndSpreads } from "@/components/KitchenStandardsAndSpreads";
import { Navbar } from "@/components/Navbar";
import { PotatoToChipScroll } from "@/components/PotatoToChipScroll";
import { Faq, SocialProof } from "@/components/SocialProofAndFaq";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <PotatoToChipScroll />
        <CravingExplorer />
        <FruitRollUpRibbonScroll />
        <KitchenStandardsAndSpreads />
        <SocialProof />
        <CheckoutSection />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
