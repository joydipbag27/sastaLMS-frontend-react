import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <footer className="relative bg-[#111111] text-[#FAF9F6] pt-16 pb-8 overflow-hidden select-none border-t border-white/10 min-h-[50vh] flex flex-col justify-between">
      
      {/* ── Background Elements ── */}
      {/* Massive faded background typography */}
      <motion.div 
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="absolute bottom-[-2%] left-1/2 -translate-x-1/2 text-[5rem] sm:text-[8rem] md:text-[14rem] lg:text-[22rem] font-black text-white/[0.012] font-outfit leading-none select-none pointer-events-none tracking-tighter uppercase z-0 whitespace-nowrap"
        aria-hidden="true"
      >
        SASTALMS.
      </motion.div>

      {/* Playful peeking designer illustration */}
      <motion.div 
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 15 }}
        whileInView={{ opacity: 0.15, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute right-6 bottom-0 w-24 sm:w-32 md:w-40 lg:w-48 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <img
          src="/pixles market illustrations/Designer 5.png"
          alt=""
          className="w-full h-auto object-contain"
          draggable="false"
        />
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 w-full relative z-10">
        
        {/* ── Top Area (Brand + Nav groups) ── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: prefersReduced ? 0 : 0.08
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start pb-12 md:pb-16 border-b border-white/10"
        >
          
          {/* Brand area */}
          <motion.div 
            variants={prefersReduced ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            className="md:col-span-5 flex flex-col items-start space-y-4"
          >
            <h4 className="text-2xl font-black font-outfit text-white tracking-tight uppercase">
              sasta<span className="bg-[#FFE700] text-[#111111] px-1.5 py-0.5 rounded-lg ml-1 shadow-sm font-black">LMS</span>
            </h4>
            <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed max-w-sm">
              A complete, deployable LMS project built around video learning, self-hosting, and practical infrastructure costs.
            </p>
          </motion.div>

          {/* Navigation Columns */}
          <motion.div 
            variants={prefersReduced ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            className="md:col-span-7 grid grid-cols-3 gap-6 sm:gap-8 w-full"
          >
            
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

          </motion.div>

        </motion.div>

        {/* ── Bottom Area (Signature + Copyright) ── */}
        <motion.div 
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 pb-4 w-full text-slate-500"
        >
          
          {/* Playful developer signature */}
          <div className="text-[9px] font-black tracking-widest uppercase font-outfit">
            BUILT, BROKEN, DEBUGGED, AND SHIPPED BY JOYDIP.
          </div>

          {/* Copyright statement */}
          <div className="text-[9px] font-black tracking-widest uppercase font-outfit">
            © 2026 SASTALMS
          </div>

        </motion.div>

      </div>
    </footer>
  );
};

export default LandingFooter;
