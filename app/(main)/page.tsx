
import CallToAction from "@/components/call-to-action";
import ContentSection from "@/components/content-3";
import FAQsThree from "@/components/faqs-3";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import LogoCloud from "@/components/logo-cloud";
import AboutSports from "@/components/aboutSports";
import TeamSection from "@/components/team";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  // ✅ Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // ✅ Get profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // ✅ If banned ➔ redirect to /banned
    if (profile?.role === 'ban') {
      redirect('/banned');
    }
  }

  // ✅ Normal UI rendering
  return (
    <>
      <HeroSection />
      <LogoCloud />
      <ContentSection />
      <AboutSports />
      <CallToAction />
      <FAQsThree />
      <TeamSection />
      <FooterSection />
    </>
  );
}