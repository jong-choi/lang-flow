import { FeaturesSection } from "@/app/_components/landing/features-section";
import { FlowDemoSection } from "@/app/_components/landing/flow-demo-section";
import { FooterCTA } from "@/app/_components/landing/footer-cta";
import { HeroSection } from "@/app/_components/landing/hero-section";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FlowDemoSection />
      <FeaturesSection />
      <FooterCTA />
    </main>
  );
}
