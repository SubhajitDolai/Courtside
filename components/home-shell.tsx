'use client';

import dynamic from 'next/dynamic';

import HeroSection from "@/components/hero-section";
import LogoCloud from "@/components/logo-cloud";
import ContentSection from "@/components/content-3";
import BannedRedirect from "@/components/banned-redirect";

const AboutSports = dynamic(() => import('@/components/aboutSports'), { ssr: false });
const CallToAction = dynamic(() => import('@/components/call-to-action'), { ssr: false });
const FAQsThree = dynamic(() => import('@/components/faqs-3'), { ssr: false });
const TeamSection = dynamic(() => import('@/components/team'), { ssr: false });
const FooterSection = dynamic(() => import('@/components/footer'), { ssr: false });
const MorphingPopoverTextarea = dynamic(
  () => import('@/components/ui/morphingPopoverTextarea').then(mod => mod.MorphingPopoverTextarea),
  { ssr: false }
);

export default function HomeShell() {
  return (
    <>
      <BannedRedirect />
      <HeroSection />
      <LogoCloud />
      <ContentSection />
      <AboutSports />
      <CallToAction />
      <FAQsThree />
      <TeamSection />
      <MorphingPopoverTextarea />
      <FooterSection />
    </>
  );
}