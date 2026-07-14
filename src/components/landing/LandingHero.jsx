import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { Play, TrendingUp, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const LandingHero = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isCreator = profile?.role === "CREATOR";

  const handleSecondaryCTA = () => {
    if (!profile) {
      navigate("/login?returnTo=/creator/courses");
    } else if (isCreator) {
      navigate("/creator/courses");
    } else {
      navigate("/courses");
    }
  };

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.1,
        delayChildren: prefersReduced ? 0 : 0.05,
      }
    }
  };

  const itemVariants = prefersReduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
        }
      };

  const illustrationVariants = prefersReduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      }
    : {
        hidden: { opacity: 0, scale: 0.97, y: 15 },
        visible: { 
          opacity: 1, 
          scale: 1,
          y: 0,
          transition: { duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] } 
        }
      };

  return (
    <section className="relative overflow-hidden bg-[#F6F4EB] py-16 lg:py-24 xl:py-32 select-none">
      {/* Background Accent Gradients */}
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] bg-[#FFE700]/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-[#FFE700]/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
 
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
 
        {/* Left Column: Copy & Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col items-start text-left space-y-6 md:space-y-8"
        >
 
          {/* Eyebrow */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-[#FFE700]/10 border border-[#FFE700]/30 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-widest text-slate-800 uppercase font-outfit shadow-sm"
          >
            <Sparkles size={12} className="text-[#B3A100]" />
            A SELF-HOSTED LEARNING PLATFORM
          </motion.div>
 
          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-[#111111] leading-[1.08] tracking-tight font-outfit"
          >
            TURN KNOWLEDGE <br className="hidden md:inline" />
            INTO COURSES. <br />
            <span className="relative inline-block mt-2 px-3 py-1 z-10">
              {/* Highlight Backdrop */}
              <span className="absolute inset-0 bg-[#FFE700] rounded-xl -rotate-1 transform -z-10 shadow-sm border border-[#E6CF00]/30"></span>
              TEACH YOUR WAY.
            </span>
          </motion.h1>
 
          {/* Supporting Copy */}
          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg text-slate-650 font-medium leading-relaxed max-w-xl"
          >
            Create structured courses, deliver adaptive video lessons, accept payments, track student progress, and manage your learning platform from one place.
          </motion.p>
 
          {/* CTAs */}
          <motion.div 
            variants={itemVariants}
            className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <Link to="/courses" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 bg-[#FFE700] hover:bg-[#FFE700]/90 active:scale-[0.98] text-[#111111] px-8 py-4 rounded-xl font-bold font-outfit shadow-md shadow-[#FFE700]/10 transition-all duration-150 text-base"
              >
                Explore Courses
                <ArrowRight size={18} className="transform group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            </Link>
 
            <motion.button
              onClick={handleSecondaryCTA}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-[0.98] text-slate-800 px-8 py-4 rounded-xl font-bold font-outfit shadow-sm transition-all duration-150 text-base"
            >
              Open Creator Studio
            </motion.button>
          </motion.div>
 
          {/* Supporting text */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-outfit"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFE700] animate-pulse"></div>
            Built as a complete, deployable LMS platform.
          </motion.div>
        </motion.div>
 
        {/* Right Column: Illustration & Composition */}
        <motion.div 
          variants={illustrationVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-5 flex items-center justify-center relative mt-8 lg:mt-0"
        >
 
          {/* Subtle Technical Dot Grid Underlay */}
          <div className="absolute inset-0 w-full h-full max-w-[420px] max-h-[420px] mx-auto -z-10 opacity-70">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <defs>
                <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#E2E8F0" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-grid)" />
            </svg>
          </div>
 
          {/* Background Decorative Yellow Circle Outline */}
          <div className="absolute w-[60%] h-[60%] sm:w-[70%] sm:h-[70%] lg:w-[80%] lg:h-[80%] border-2 border-dashed border-[#FFE700]/30 rounded-full -z-10 animate-spin" style={{ animationDuration: "25s" }}></div>
 
          {/* Core Illustration Wrapper */}
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[480px] bg-transparent p-4 flex items-center justify-center">
 
            {/* The Selected Illustration */}
            <img
              src="/pixles market illustrations/Knowledge.png"
              alt="Knowledge and Online Learning Illustration"
              className="w-full h-auto object-contain select-none drop-shadow-lg"
              draggable="false"
            />
 
          </div>
        </motion.div>
 
      </div>
    </section>
  );
};

export default LandingHero;

