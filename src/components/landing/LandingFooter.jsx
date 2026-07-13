import React from "react";
import { Link } from "react-router-dom";

const FooterLink = ({ href, children, isExternal }) => {
  const linkClass = "text-xs md:text-sm text-slate-400 hover:text-[#FFE700] hover:translate-x-1 transition-all duration-150 inline-block font-semibold";
  
  if (isExternal) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {children}
        </a>
      </li>
    );
  }

  // Use Link if it's a real route or standard anchor navigation
  if (href.startsWith("/")) {
    return (
      <li>
        <Link to={href} className={linkClass}>
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <a href={href} className={linkClass}>
        {children}
      </a>
    </li>
  );
};

const LandingFooter = () => {
  return (
    <footer className="relative bg-[#111111] text-[#FAF9F6] pt-16 pb-8 overflow-hidden select-none border-t border-white/10 min-h-[50vh] flex flex-col justify-between">
      
      {/* ── Background Elements ── */}
      {/* Massive faded background typography */}
      <div 
        className="absolute bottom-[-2%] left-1/2 -translate-x-1/2 text-[7rem] sm:text-[12rem] md:text-[18rem] lg:text-[22rem] font-black text-white/[0.012] font-outfit leading-none select-none pointer-events-none tracking-tighter uppercase z-0 whitespace-nowrap"
        aria-hidden="true"
      >
        SASTALMS.
      </div>

      {/* Playful peeking designer illustration */}
      <div 
        className="absolute right-6 bottom-0 w-24 sm:w-32 md:w-40 lg:w-48 opacity-15 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <img
          src="/pixles market illustrations/Designer 5.png"
          alt=""
          className="w-full h-auto object-contain"
          draggable="false"
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 w-full relative z-10">
        
        {/* ── Top Area (Brand + Nav groups) ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start pb-12 md:pb-16 border-b border-white/10">
          
          {/* Brand area */}
          <div className="md:col-span-5 flex flex-col items-start space-y-4">
            <h4 className="text-2xl font-black font-outfit text-white tracking-tight uppercase">
              SASTALMS<span className="text-[#FFE700]">.</span>
            </h4>
            <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed max-w-sm">
              A complete, deployable LMS project built around video learning, self-hosting, and practical infrastructure costs.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6 sm:gap-8 w-full">
            
            {/* EXPLORE Group */}
            <nav className="flex flex-col space-y-4" aria-label="Footer Explore Navigation">
              <h5 className="text-[10px] font-black text-[#FFE700] uppercase tracking-widest font-outfit">
                EXPLORE
              </h5>
              <ul className="space-y-2.5">
                <FooterLink href="/courses">Courses</FooterLink>
                <FooterLink href="/creator/courses">Creator Studio</FooterLink>
                <FooterLink href="/login">Sign In</FooterLink>
              </ul>
            </nav>

            {/* PROJECT Group */}
            <nav className="flex flex-col space-y-4" aria-label="Footer Project Navigation">
              <h5 className="text-[10px] font-black text-[#FFE700] uppercase tracking-widest font-outfit">
                PROJECT
              </h5>
              <ul className="space-y-2.5">
                <FooterLink href="https://github.com/joydipbag27/veoLMS-frontend-react" isExternal>Source Code</FooterLink>
                <FooterLink href="#">Documentation</FooterLink>
                <FooterLink href="#architecture">Architecture</FooterLink>
              </ul>
            </nav>

            {/* CONNECT Group */}
            <nav className="flex flex-col space-y-4" aria-label="Footer Developer Navigation">
              <h5 className="text-[10px] font-black text-[#FFE700] uppercase tracking-widest font-outfit">
                CONNECT
              </h5>
              <ul className="space-y-2.5">
                <FooterLink href="#">Portfolio</FooterLink>
                <FooterLink href="https://github.com/joydipbag27" isExternal>GitHub</FooterLink>
                <FooterLink href="#">LinkedIn</FooterLink>
              </ul>
            </nav>

          </div>

        </div>

        {/* ── Bottom Area (Signature + Copyright) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 pb-4 w-full text-slate-500">
          
          {/* Playful developer signature */}
          <div className="text-[9px] font-black tracking-widest uppercase font-outfit">
            BUILT, BROKEN, DEBUGGED, AND SHIPPED BY JOYDIP.
          </div>

          {/* Copyright statement */}
          <div className="text-[9px] font-black tracking-widest uppercase font-outfit">
            © 2026 SASTALMS
          </div>

        </div>

      </div>
    </footer>
  );
};

export default LandingFooter;
