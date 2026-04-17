import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/features/hosting/components/Hero";
import { ServicesSection } from "@/features/services/components/ServicesSection";
import { BentoGrid } from "@/features/portfolio/components/BentoGrid";
import { HostingPlans } from "@/features/hosting/components/HostingPlans";
import { ContactSection } from "@/features/services/components/ContactSection";
import { AboutSection } from "@/features/services/components/AboutSection";
import { CookieBanner } from "@/components/ui/CookieBanner";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        <div className="bg-[#FAFBFA] dark:bg-background">
          <Hero />
          <ServicesSection />
        </div>
        <HostingPlans />
        <BentoGrid />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
