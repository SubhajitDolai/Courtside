'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import HeroSection from "@/components/hero-section";
import LogoCloud from "@/components/logo-cloud";
import BannedRedirect from "@/components/banned-redirect";
import Features from './features-4';

const ContentSection = dynamic(() => import('@/components/content-3'), { ssr: false });
const AboutSports = dynamic(() => import('@/components/aboutSports'), { ssr: false });
const Pricing = dynamic(() => import('@/components/pricing'), { ssr: false });
const CallToAction = dynamic(() => import('@/components/call-to-action'), { ssr: false });
const FAQsThree = dynamic(() => import('@/components/faqs-3'), { ssr: false });
const TeamSection = dynamic(() => import('@/components/team'), { ssr: false });
const FooterSection = dynamic(() => import('@/components/footer'), { ssr: false });
const MorphingPopoverTextarea = dynamic(
  () => import('@/components/ui/morphingPopoverTextarea').then(mod => mod.MorphingPopoverTextarea),
  { ssr: false }
);

export default function HomeShell() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch multiple routes
    router.prefetch('/sports');
    router.prefetch('/my-bookings');
    router.prefetch('/profile');
  }, [router]);

  return (
    <>
      <BannedRedirect />
      <HeroSection />
      <LogoCloud />
      <Features />
      <ContentSection />
      <AboutSports />
      <Pricing />
      <FAQsThree />
      <CallToAction />
      <TeamSection />
      <MorphingPopoverTextarea />
      <FooterSection />
    </>
  );
}