import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhatIsPostUp from "@/components/WhatIsPostUp";
import AnalyticsSection from "@/components/AnalyticsSection";
import VideoSection from "@/components/VideoSection";
import PartnersSection from "@/components/PartnersSection";
import PricingSection from "@/components/PricingSection";
import SegmentsSection from "@/components/SegmentsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <WhatIsPostUp />
      <AnalyticsSection />
      <VideoSection />
      <PartnersSection />
      <PricingSection />
      <SegmentsSection />
      <Footer />
    </div>
  );
}
