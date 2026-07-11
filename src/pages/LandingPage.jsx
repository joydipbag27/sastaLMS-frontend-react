import React from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingHero from "../components/landing/LandingHero";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans antialiased overflow-x-hidden selection:bg-brand/30">
      <LandingNavbar />
      <main>
        <LandingHero />
      </main>
    </div>
  );
};

export default LandingPage;
