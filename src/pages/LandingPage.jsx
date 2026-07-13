import React from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";
import VideoExperienceSection from "../components/landing/VideoExperienceSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import OwnershipSection from "../components/landing/OwnershipSection";
import CostModelSection from "../components/landing/CostModelSection";
import ComparisonSection from "../components/landing/ComparisonSection";
import DeploymentSection from "../components/landing/DeploymentSection";
import LandingFooter from "../components/landing/LandingFooter";


const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F6F4EB] text-[#111111] font-sans antialiased selection:bg-brand/30">
      <LandingNavbar />
      <main className="overflow-x-hidden">
        <LandingHero />
        <VideoExperienceSection />
        <HowItWorksSection />
        <OwnershipSection />
        <CostModelSection />
        <ComparisonSection />
        <DeploymentSection />
        <LandingFooter />
      </main>
    </div>
  );
};

export default LandingPage;





