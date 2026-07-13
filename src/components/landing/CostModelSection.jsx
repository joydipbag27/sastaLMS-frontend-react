import React from "react";
import { Database, Globe, Cpu } from "lucide-react";

const CostModelSection = () => {
  return (
    <section
      id="cost-model"
      className="relative bg-[#F6F4EB] py-12 lg:py-16 overflow-hidden select-none border-t border-slate-200/40"
    >
      {/* Subtle top edge dot line accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Decorative large background word */}
      <div className="absolute top-[12%] left-[4%] text-[7rem] md:text-[10rem] lg:text-[13rem] font-black text-[#111111]/[0.015] font-outfit leading-none select-none pointer-events-none tracking-tighter uppercase z-0">
        WHAT COSTS?
      </div>

      {/* Decorative ambient blurred glow */}
      <div className="absolute bottom-[5%] left-[-10%] w-[35%] h-[35%] bg-[#FFE700]/4 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* ── Section Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 flex flex-col items-center space-y-4">
          <span className="inline-block bg-[#FFE700]/10 border border-[#FFE700]/25 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#998A00] uppercase font-outfit">
            COSTS WITHOUT THE MYSTERY
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#111111] leading-tight font-outfit tracking-tight">
            PAY FOR THE INFRASTRUCTURE. <br />
            <span className="relative inline-block mt-1.5 px-3 py-0.5 z-10">
              <span className="absolute inset-0 bg-[#FFE700] rounded-xl -rotate-1 transform -z-10 shadow-sm border border-[#E6CF00]/30"></span>
              NOT ANOTHER LMS SUBSCRIPTION.
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed max-w-xl mt-2">
            SastaLMS does not pretend every deployment costs the same. Your operating cost depends on how much media you store and deliver, how you process video, and the infrastructure your deployment consumes.
          </p>
        </div>

        {/* ── Mobile Only: Large Illustration (rendered between copy and columns) ── */}
        <div className="flex md:hidden w-full max-w-[220px] mx-auto pb-8 relative items-center justify-center">
          <div className="absolute inset-0 bg-[#FFE700]/8 rounded-full blur-2xl transform scale-75 -z-10" />
          <img
            src="/pixles market illustrations/Finance Analysis.png"
            alt="Infrastructure planning illustration"
            className="w-full h-auto object-contain drop-shadow-lg"
            draggable="false"
          />
        </div>

        {/* ── Three Cost Areas Columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12 w-full pt-6 md:pt-8 relative z-10">
          
          {/* Cost Area 01 — STORE */}
          <div className="flex flex-col items-start text-left space-y-4 border-b border-slate-200/40 pb-6 md:border-b-0 md:pb-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-450 font-outfit tracking-wider">01</span>
              <div className="shrink-0 w-9 h-9 rounded-xl bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2.5px_2.5px_0px_0px_rgba(255,231,0,1)]">
                <Database size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h3 className="font-black text-[#111111] text-sm md:text-base font-outfit tracking-wider uppercase mb-1.5">
                STORE
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                Keep course media in object storage while temporary processing files exist only as long as the pipeline needs them.
              </p>
            </div>
          </div>

          {/* Cost Area 02 — DELIVER */}
          <div className="flex flex-col items-start text-left space-y-4 border-b border-slate-200/40 pb-6 md:border-b-0 md:pb-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-450 font-outfit tracking-wider">02</span>
              <div className="shrink-0 w-9 h-9 rounded-xl bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2.5px_2.5px_0px_0px_rgba(255,231,0,1)]">
                <Globe size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h3 className="font-black text-[#111111] text-sm md:text-base font-outfit tracking-wider uppercase mb-1.5">
                DELIVER
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                Delivery cost depends on viewing traffic, origin egress, available allowances, and how effectively the CDN serves cached media.
              </p>
            </div>
          </div>

          {/* Cost Area 03 — PROCESS & RUN */}
          <div className="flex flex-col items-start text-left space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-450 font-outfit tracking-wider">03</span>
              <div className="shrink-0 w-9 h-9 rounded-xl bg-white border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[2.5px_2.5px_0px_0px_rgba(255,231,0,1)]">
                <Cpu size={16} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h3 className="font-black text-[#111111] text-sm md:text-base font-outfit tracking-wider uppercase mb-1.5">
                PROCESS & RUN
              </h3>
              <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                Use managed processing and pay-per-use compute, or run the included self-hosted transcoding path on infrastructure you operate.
              </p>
            </div>
          </div>

        </div>

        {/* ── Desktop Only: Large Illustration (rendered beneath columns) ── */}
        <div className="hidden md:flex w-full justify-center relative mt-8 mb-1 z-0">
          <div className="absolute w-64 h-64 bg-[#FFE700]/6 rounded-full blur-3xl pointer-events-none transform scale-90" />
          

          <img
            src="/pixles market illustrations/Finance Analysis.png"
            alt="Infrastructure planning illustration"
            className="w-full max-w-[280px] lg:max-w-[320px] h-auto object-contain relative z-10 drop-shadow-xl"
            draggable="false"
            loading="lazy"
          />
        </div>

        {/* ── Cost Equation Area (Visually Memorable Conclusion) ── */}
        <div className="w-full border-y border-slate-200/80 py-6 my-6 md:my-8 relative flex flex-col items-center justify-center text-center z-10">
          <div className="text-[9px] font-black tracking-widest text-[#998A00] uppercase font-outfit mb-3">
            YOUR CONFIGURATION
          </div>
          <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black font-outfit tracking-tight leading-tight text-[#111111] flex flex-wrap items-center justify-center gap-2 sm:gap-3 uppercase">
            <span className="bg-[#FFE700] px-3 py-1 rounded-xl -rotate-[0.5deg] inline-block shadow-sm text-[#111111] border border-[#E6CF00]/30 font-black">
              YOUR COST
            </span>
            <span className="text-slate-400 font-extrabold">=</span>
            <span>STORAGE</span>
            <span className="text-slate-400 font-extrabold">+</span>
            <span>DELIVERY</span>
            <span className="text-slate-400 font-extrabold">+</span>
            <span>PROCESSING</span>
            <span className="text-slate-450 font-extrabold">+</span>
            <span>COMPUTE</span>
          </div>
        </div>

        {/* ── Disclaimer / Credibility Note ── */}
        <div className="text-center w-full max-w-2xl px-4 z-10">
          <p className="text-[10px] md:text-[11px] text-slate-500 font-semibold leading-relaxed">
            Provider pricing, free allowances, cache behavior, deployment region, and usage patterns can change the final cost. SastaLMS exposes the major cost drivers instead of pretending every deployment costs the same.
          </p>
        </div>

      </div>
    </section>
  );
};

export default CostModelSection;
