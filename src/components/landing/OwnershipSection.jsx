import React from "react";
import { Server, Database, Settings, ArrowRight, Globe, Cloud } from "lucide-react";

const OwnershipSection = () => {
  return (
    <section
      id="architecture"
      className="relative bg-[#FCFAF2] py-14 lg:py-20 overflow-hidden select-none border-t border-[#FFE700]/30"
    >
      {/* Subtle top edge dot line accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#FFE700]/50 to-transparent" />

      {/* Decorative ambient blurred glow */}
      <div className="absolute top-[10%] left-[-10%] w-[35%] h-[35%] bg-[#FFE700]/4 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-[#FFE700]/4 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Oversized background typography decoration */}
      <div className="absolute top-[15%] left-[5%] text-[9rem] md:text-[12rem] lg:text-[14rem] font-black text-[#111111]/[0.015] font-outfit leading-none select-none pointer-events-none tracking-tighter uppercase z-0">
        BUILT
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-center">

          {/* ── Left Column: Large Illustration (Desktop/Tablet) ── */}
          <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center relative">
            {/* Pale yellow abstract background shape to ground the illustration */}
            <div className="absolute inset-0 bg-[#FFE700]/8 rounded-full blur-3xl transform scale-90 -z-10" />

            {/* Oversized background typography decorator next to illustration */}
            <span className="absolute -top-8 -left-6 text-[5rem] lg:text-[6rem] font-black text-[#111111]/[0.025] font-outfit leading-none select-none pointer-events-none tracking-tighter uppercase">
              CLOUD
            </span>





            <img
              src="/pixles market illustrations/Bug 1.png"
              alt="veoLMS Cloud Infrastructure and Storage Ownership"
              className="w-full h-auto max-w-[240px] lg:max-w-[320px] object-contain drop-shadow-xl"
              draggable="false"
              loading="lazy"
            />
          </div>

          {/* ── Right Column: Copy & Principles ── */}
          <div className="md:col-span-7 flex flex-col items-start text-left space-y-6 lg:space-y-8">

            {/* Eyebrow */}
            <span className="inline-block bg-[#FFE700]/10 border border-[#FFE700]/25 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#998A00] uppercase font-outfit">
              BUILT FOR DEPLOYMENT
            </span>

            {/* Main Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#111111] leading-tight font-outfit tracking-tight">
              THE HARD PARTS. <br />
              <span className="relative inline-block mt-1.5 px-3 py-0.5 z-10">
                <span className="absolute inset-0 bg-[#FFE700] rounded-xl -rotate-1 transform -z-10 shadow-sm border border-[#E6CF00]/30"></span>
                ALREADY HANDLED.
              </span>
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed max-w-md">
              Deploy a complete LMS system where video processing, secure media delivery, storage, payments, enrollments, and platform management already work together. Built with practical infrastructure decisions that keep reliability and operating costs in mind.
            </p>

            {/* ── Mobile Illustration: Rendered inline between copy and principles on small screens ── */}
            <div className="block md:hidden w-full max-w-[200px] mx-auto py-4 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#FFE700]/8 rounded-full blur-2xl transform scale-75 -z-10" />


              <img
                src="/pixles market illustrations/Data Cloud 3.png"
                alt="veoLMS Cloud Infrastructure and Storage Ownership"
                className="w-full h-auto object-contain drop-shadow-lg"
                draggable="false"
              />
            </div>

            {/* ── Three Ownership Principles Stack ── */}
            <div className="w-full space-y-0">

              {/* Principle 01 — READY TO DEPLOY */}
              <div className="flex items-start gap-4 py-4">
                <span className="text-[10px] font-black text-slate-400 font-outfit tracking-wider mt-1.5">01</span>
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2px_2px_0px_0px_rgba(255,231,0,1)]">
                  <Server size={15} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0 ml-1">
                  <h3 className="text-sm md:text-base font-black text-[#111111] font-outfit tracking-wider uppercase">
                    READY TO DEPLOY
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed mt-1">
                    A complete application stack designed to be hosted and operated on your own infrastructure.
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-200/50" />

              {/* Principle 02 — INTEGRATED MEDIA PIPELINE */}
              <div className="flex items-start gap-4 py-4">
                <span className="text-[10px] font-black text-slate-400 font-outfit tracking-wider mt-1.5">02</span>
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2px_2px_0px_0px_rgba(255,231,0,1)]">
                  <Database size={15} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0 ml-1">
                  <h3 className="text-sm md:text-base font-black text-[#111111] font-outfit tracking-wider uppercase">
                    INTEGRATED MEDIA PIPELINE
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed mt-1">
                    Video processing, adaptive streaming, storage transfer, and secure delivery work together as one connected system.
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-200/50" />

              {/* Principle 03 — BUILT WITH COST IN MIND */}
              <div className="flex items-start gap-4 py-4">
                <span className="text-[10px] font-black text-slate-400 font-outfit tracking-wider mt-1.5">03</span>
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2px_2px_0px_0px_rgba(255,231,0,1)]">
                  <Settings size={15} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0 ml-1">
                  <h3 className="text-sm md:text-base font-black text-[#111111] font-outfit tracking-wider uppercase">
                    BUILT WITH COST IN MIND
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed mt-1">
                    Storage, media delivery, and infrastructure decisions are designed to keep operating costs practical for smaller deployments.
                  </p>
                </div>
              </div>

            </div>

            {/* CTA Button */}
            <a
              href="#architecture"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2 bg-[#111111] hover:bg-[#111111]/85 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold font-outfit text-sm shadow-md shadow-black/10 transition-all duration-150 mt-4"
            >
              EXPLORE THE SYSTEM
              <ArrowRight
                size={16}
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </a>

          </div>

        </div>
      </div>
    </section>
  );
};

export default OwnershipSection;
