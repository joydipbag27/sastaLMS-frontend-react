import React from "react";
import { Code, BookOpen, Rocket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const DeploymentSection = () => {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revealVariants = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const rocketVariants = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: 40, y: 20, rotate: 4 },
        visible: { opacity: 1, x: 0, y: 0, rotate: 0, transition: { duration: 0.8, ease: "easeOut" } }
      };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReduced ? 0 : 0.08,
      }
    }
  };

  const staggerItem = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <section className="relative bg-[#111111] text-[#FAF9F6] py-16 lg:py-24 overflow-hidden select-none border-t border-white/10">
      
      {/* Decorative large background word */}
      <div className="absolute bottom-[8%] left-[5%] text-[6rem] sm:text-[10rem] md:text-[15rem] font-black text-white/[0.01] font-outfit leading-none select-none pointer-events-none tracking-tighter uppercase z-0">
        RUN IT
      </div>

      {/* Decorative ambient blurred glow */}
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-[#FFE700]/2 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* ── Top Area (Asymmetric Grid) ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start relative mb-12 md:mb-16">
          
          {/* Top Left: Text Introduction & Desktop CTAs */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={revealVariants}
            className="md:col-span-7 flex flex-col items-start text-left space-y-6"
          >
            
            {/* Eyebrow */}
            <span className="inline-block text-[#FFE700] text-[10px] font-black tracking-widest uppercase font-outfit">
              OPEN. DOCUMENTED. DEPLOYABLE.
            </span>

            {/* Massive Headline with SastaLMS Highlight */}
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-none font-outfit tracking-tight uppercase">
              RUN YOUR OWN <br />
              <span className="md:ml-20 lg:ml-28 relative inline-block mt-2 px-3 py-1 text-[#111111] z-10 leading-none">
                <span className="absolute inset-0 bg-[#FFE700] rounded-xl -rotate-1 transform -z-10 shadow-sm border border-[#E6CF00]/30"></span>
                SASTALMS.
              </span>
            </h2>

            {/* Supporting Copy */}
            <p className="text-sm md:text-base text-slate-400 font-semibold leading-relaxed max-w-md">
              Explore the source, understand how the system is built, follow the deployment documentation, and run the complete LMS on infrastructure you operate.
            </p>

            {/* CTAs (Desktop / Tablet Only) */}
            <div className="hidden md:flex flex-wrap items-center gap-4 pt-2">
              <motion.a
                href="https://github.com/joydipbag27/sastaLMS-frontend-react"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-2 bg-[#FFE700] hover:bg-[#FFE700]/90 active:scale-[0.98] text-[#111111] px-6 py-3 rounded-xl font-bold font-outfit text-sm transition-all duration-150 shadow-md shadow-[#FFE700]/10"
              >
                VIEW SOURCE CODE
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </motion.a>
              
              <motion.a
                href="/docs"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-2 border border-white/20 hover:bg-white/5 active:scale-[0.98] text-[#FAF9F6] px-6 py-3 rounded-xl font-bold font-outfit text-sm transition-all duration-150"
              >
                READ DOCUMENTATION
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>

          </motion.div>

          {/* Top Right: Large Illustration (Desktop/Tablet) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={rocketVariants}
            className="hidden md:flex md:col-span-5 flex-col items-center justify-center relative"
          >
            {/* Multi-layered light glow to make the dark illustration stand out */}
            <div className="absolute w-[85%] h-[85%] bg-[#FFE700]/15 rounded-full blur-[70px] -z-10" />
            <div className="absolute w-[60%] h-[60%] bg-white/5 rounded-full blur-[40px] -z-10" />
            <img
              src="/pixles market illustrations/Fast 1.png"
              alt="Launch SastaLMS deployment illustration"
              className="w-full h-auto max-w-[260px] lg:max-w-[320px] object-contain drop-shadow-2xl relative z-10"
              draggable="false"
              loading="lazy"
            />
          </motion.div>

          {/* Mobile Only: Large Illustration (rendered between copy and actions) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={rocketVariants}
            className="flex md:hidden w-full max-w-[200px] mx-auto py-4 relative items-center justify-center"
          >
            <div className="absolute w-[80%] h-[80%] bg-[#FFE700]/12 rounded-full blur-[50px] -z-10" />
            <div className="absolute w-[50%] h-[50%] bg-white/5 rounded-full blur-[30px] -z-10" />
            <img
              src="/pixles market illustrations/Fast 1.png"
              alt="Launch SastaLMS deployment illustration"
              className="w-full h-auto object-contain drop-shadow-xl relative z-10"
              draggable="false"
            />
          </motion.div>

        </div>

        {/* ── Middle/Lower Area (Three Actions Row) ── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 pt-6 border-t border-white/10 relative z-10"
        >
          
          {/* Action 01 */}
          <motion.div variants={staggerItem} className="flex flex-col items-start text-left space-y-4 border-b border-white/5 pb-6 md:border-b-0 md:pb-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 font-outfit tracking-wider">01</span>
              <div className="shrink-0 w-8 h-8 rounded-lg bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700]">
                <Code size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h3 className="font-black text-white text-sm md:text-base font-outfit tracking-wider uppercase mb-1.5">
                EXPLORE THE SOURCE
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                Inspect the frontend, backend services, media pipeline, and application implementation.
              </p>
            </div>
          </motion.div>

          {/* Action 02 */}
          <motion.div variants={staggerItem} className="flex flex-col items-start text-left space-y-4 border-b border-white/5 pb-6 md:border-b-0 md:pb-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 font-outfit tracking-wider">02</span>
              <div className="shrink-0 w-8 h-8 rounded-lg bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700]">
                <BookOpen size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h3 className="font-black text-white text-sm md:text-base font-outfit tracking-wider uppercase mb-1.5">
                READ THE DOCUMENTATION
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                Understand the system architecture, required services, configuration, deployment process, and operational requirements.
              </p>
            </div>
          </motion.div>

          {/* Action 03 */}
          <motion.div variants={staggerItem} className="flex flex-col items-start text-left space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 font-outfit tracking-wider">03</span>
              <div className="shrink-0 w-8 h-8 rounded-lg bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700]">
                <Rocket size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h3 className="font-black text-white text-sm md:text-base font-outfit tracking-wider uppercase mb-1.5">
                DEPLOY THE SYSTEM
              </h3>
              <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
                Configure the required infrastructure, deploy the application, and operate your own SastaLMS instance.
              </p>
            </div>
          </motion.div>

        </motion.div>

        {/* Mobile Only: CTAs (placed at the bottom after actions) */}
        <div className="flex md:hidden flex-col gap-3 pt-10 relative z-10 w-full">
          <motion.a
            href="https://github.com/joydipbag27/sastaLMS-frontend-react"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 bg-[#FFE700] hover:bg-[#FFE700]/90 active:scale-[0.98] text-[#111111] py-3.5 rounded-xl font-bold font-outfit text-sm transition-all duration-150 shadow-md shadow-[#FFE700]/10"
          >
            VIEW SOURCE CODE
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </motion.a>
          
          <motion.a
            href="/docs"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 active:scale-[0.98] text-[#FAF9F6] py-3.5 rounded-xl font-bold font-outfit text-sm transition-all duration-150"
          >
            READ DOCUMENTATION
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

      </div>
    </section>
  );
};

export default DeploymentSection;
