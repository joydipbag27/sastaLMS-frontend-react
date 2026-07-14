import React, { useState } from "react";
import VideoPlayerPlaceholder from "./VideoPlayerPlaceholder";
import { Sliders, RotateCcw, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const VideoExperienceSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const headerVariants = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const playerVariants = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, scale: 0.98, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6 } } };

  const featuresContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.08,
      }
    }
  };

  const featureItemVariants = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <section id="experience" className="relative bg-[#F6F4EB] py-12 lg:py-16 overflow-hidden select-none border-t border-slate-200/40">
      
      {/* Decorative background elements */}
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-[#FFE700]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[35%] h-[35%] bg-[#FFE700]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header Content */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={headerVariants}
          className="text-center max-w-2xl mx-auto mb-10 md:mb-14 flex flex-col items-center space-y-4"
        >
          <span className="inline-block bg-[#FFE700]/10 border border-[#FFE700]/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#998A00] uppercase font-outfit">
            BUILT FOR LEARNING
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#111111] leading-tight font-outfit tracking-tight">
            WATCH. LEARN. <br />
            <span className="text-[#998A00]">KEEP MOVING.</span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed">
            A focused learning experience built around adaptive video lessons, structured course content, resume playback, and progress tracking.
          </p>
        </motion.div>

        {/* Main Visual Composition Area */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={playerVariants}
          className="relative max-w-4xl mx-auto mb-10 md:mb-12"
        >
          
          {/* Main Visual: Video Player Placeholder */}
          <div className="relative z-10 w-full">
            <VideoPlayerPlaceholder onPlaybackChange={setIsVideoPlaying} />
          </div>

          {/* Illustration Container - Desktop & Tablet (Absolute / Overlapping) */}
          <div className={`hidden lg:block absolute -bottom-16 -right-16 lg:-right-24 w-56 lg:w-72 z-20 pointer-events-none transition-all duration-300 ${
            isVideoPlaying 
              ? `opacity-0 pointer-events-none ${prefersReduced ? "" : "translate-y-4 translate-x-4"}`
              : "opacity-100 hover:scale-105"
          }`}>
            {/* Pale yellow abstract background shape to ground the illustration */}
            <div className="absolute inset-0 bg-[#FFE700]/10 rounded-full blur-2xl transform scale-75 -z-10"></div>
            
            <img
              src="/pixles market illustrations/Video Tutorial.png"
              alt="Video Tutorial Learning Illustration"
              className="w-full h-auto object-contain drop-shadow-xl"
              draggable="false"
            />
          </div>

          {/* Illustration Container - Mobile & Tablet (Inline layout below player, hidden on lg+) */}
          <div className={`block lg:hidden w-48 mx-auto mt-6 relative transition-all duration-300 ${
            isVideoPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}>
            <div className="absolute inset-0 bg-[#FFE700]/10 rounded-full blur-xl transform scale-75 -z-10"></div>
            <img
              src="/pixles market illustrations/Video Tutorial.png"
              alt="Video Tutorial Learning Illustration"
              className="w-full h-auto object-contain drop-shadow-lg"
              draggable="false"
            />
          </div>

        </motion.div>

        {/* Feature Row Section */}
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={featuresContainerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12 pt-6"
          >
          
            {/* Feature 1: Adaptive Playback */}
            <motion.div variants={featureItemVariants} className="flex flex-col items-start text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE700]/15 flex items-center justify-center text-[#998A00] shadow-sm">
                <Sliders size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-[#111111] text-sm md:text-base font-outfit tracking-wide mb-1.5">
                  Adaptive Playback
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                  Smooth video delivery designed for different viewing conditions.
                </p>
              </div>
            </motion.div>

            {/* Feature 2: Resume Learning */}
            <motion.div variants={featureItemVariants} className="flex flex-col items-start text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE700]/15 flex items-center justify-center text-[#998A00] shadow-sm">
                <RotateCcw size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-[#111111] text-sm md:text-base font-outfit tracking-wide mb-1.5">
                  Resume Learning
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                  Continue lessons from your previous playback position.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Progress Tracking */}
            <motion.div variants={featureItemVariants} className="flex flex-col items-start text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE700]/15 flex items-center justify-center text-[#998A00] shadow-sm">
                <TrendingUp size={16} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-[#111111] text-sm md:text-base font-outfit tracking-wide mb-1.5">
                  Progress Tracking
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                  Track lesson progress and completion throughout the course.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default VideoExperienceSection;

