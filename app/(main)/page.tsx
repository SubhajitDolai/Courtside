
import CallToAction from "@/components/call-to-action";
import ContentSection from "@/components/content-3";
import FAQsThree from "@/components/faqs-3";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import LogoCloud from "@/components/logo-cloud";
import AboutSports from "@/components/aboutSports";

export default function Home() {
  return (
    <>
      <HeroSection />
      <LogoCloud />
      <ContentSection />
      <AboutSports />
      <CallToAction />
      <FAQsThree />
      <FooterSection />
    </>
  );
}
