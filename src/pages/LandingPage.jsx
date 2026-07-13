import React from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";
import VideoExperienceSection from "../components/landing/VideoExperienceSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import OwnershipSection from "../components/landing/OwnershipSection";
import DeploymentSection from "../components/landing/DeploymentSection";
import CostModelSection from "../components/landing/CostModelSection";


const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans antialiased overflow-x-hidden selection:bg-brand/30">
      <LandingNavbar />
      <main>
        <LandingHero />
        <VideoExperienceSection />
        <HowItWorksSection />
        <OwnershipSection />
        <DeploymentSection />
        <CostModelSection />
      </main>
    </div>
  );
};

export default LandingPage;



