import { CheckoutSection } from "@/components/CheckoutSection";
import { CravingExplorer } from "@/components/CravingExplorer";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { CtaBand } from "@/components/CtaBand";
import { Marquee } from "@/components/Marquee";
import { StickyCta } from "@/components/StickyCta";
import { RECIPES } from "@/data/recipes";
import { KitchenStandardsAndSpreads } from "@/components/KitchenStandardsAndSpreads";
import { Navbar } from "@/components/Navbar";
import { CrunchScene, RibbonScene } from "@/components/RealScenes";
import { Faq, SocialProof } from "@/components/SocialProofAndFaq";

const TITLES = RECIPES.map((r) => r.title.toLowerCase());

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee items={TITLES.slice(0, 14)} className="bg-tomato text-ink" duration={55} />
        <CrunchScene />
        <CravingExplorer />
        <Marquee items={TITLES.slice(14, 28)} className="bg-ink text-butter" duration={60} reverse />
        <CtaBand line="found your craving? it's in the playbook." />
        <RibbonScene />
        <KitchenStandardsAndSpreads />
        <Marquee items={TITLES.slice(28)} className="bg-mint text-ink" duration={50} />
        <CtaBand tone="butter" line="stop guessing. start swapping." />
        <SocialProof />
        <CheckoutSection />
        <Faq />
      </main>
      <Footer />
      <div className="h-20 bg-espresso lg:hidden" aria-hidden />
      <StickyCta />
    </>
  );
}
