import React from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";
import VideoExperienceSection from "../components/landing/VideoExperienceSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import ArchitectureSection from "../components/landing/ArchitectureSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans antialiased overflow-x-hidden selection:bg-brand/30">
      <LandingNavbar />
      <main>
        <LandingHero />
        <VideoExperienceSection />
        <HowItWorksSection />
        <ArchitectureSection />
      </main>
    </div>
  );
};

export default LandingPage;
