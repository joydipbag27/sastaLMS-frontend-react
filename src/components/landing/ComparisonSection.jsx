import React from "react";

const ComparisonSection = () => {
  return (
    <section
      id="comparison"
      className="relative bg-[#FCFAF2] py-12 lg:py-16 overflow-hidden select-none border-t border-slate-200/40"
    >
      {/* Subtle top edge dot line accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#FFE700]/30 to-transparent" />

      {/* Decorative ambient blurred glow */}
      <div className="absolute top-[25%] left-[-10%] w-[30%] h-[30%] bg-[#FFE700]/3 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-[#FFE700]/3 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        
        {/* ── Section Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 flex flex-col items-center space-y-4">
          <span className="inline-block bg-[#FFE700]/15 border border-[#FFE700]/25 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#998A00] uppercase font-outfit">
            CHOOSE THE MODEL
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#111111] leading-tight font-outfit tracking-tight">
            TWO WAYS TO RUN AN LMS. <br />
            <span className="relative inline-block mt-1.5 px-3 py-0.5 z-10">
              <span className="absolute inset-0 bg-[#FFE700] rounded-xl -rotate-1 transform -z-10 shadow-sm border border-[#E6CF00]/30"></span>
              KNOW WHAT YOU'RE CHOOSING.
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed max-w-xl mt-2">
            A hosted LMS trades infrastructure responsibility for provider-managed convenience. SastaLMS gives you a complete system to deploy and operate yourself. The right choice depends on how much control and operational responsibility you want.
          </p>
        </div>

        {/* ── Main Comparison Grid ── */}
        <div className="w-full relative">
          
          {/* Vertical Divider (Desktop Only) */}
          <div className="hidden md:block w-px h-[28rem] bg-[#111111]/10 absolute left-1/2 top-0 -translate-x-1/2 z-0" />
          
          {/* Central OR badge (Desktop Only) */}
          <div className="hidden md:flex w-9 h-9 rounded-full bg-[#FFE700] border-2 border-[#111111] items-center justify-center text-[10px] font-black font-outfit text-[#111111] absolute left-1/2 top-48 -translate-x-1/2 z-10 shadow-sm">
            OR
          </div>

          <div className="grid grid-cols-1 md:grid-cols-11 items-stretch gap-10 md:gap-0 relative z-10">
            
            {/* ── Left Side: HOSTED LMS ── */}
            <div className="md:col-span-5 flex flex-col items-center text-center space-y-4 md:pr-8 relative">
              {/* Faded Background Header */}
              <span className="absolute top-0 text-[4rem] lg:text-[5rem] font-black text-[#111111]/[0.015] font-outfit leading-none select-none pointer-events-none tracking-tighter uppercase z-0">
                HOSTED
              </span>

              {/* Meta Annotation */}
              <div className="border border-[#111111]/15 bg-white/70 px-2.5 py-0.5 rounded text-[9px] font-black text-[#998A00] tracking-wider uppercase font-outfit z-10">
                provider managed
              </div>

              {/* Metaphorical Illustration: Meditation 1 (relaxing / assisted convenience) */}
              <div className="w-full max-w-[180px] lg:max-w-[220px] aspect-square flex items-center justify-center relative z-10">
                <div className="absolute inset-0 bg-[#FFE700]/4 rounded-full blur-2xl transform scale-75 -z-10" />
                <img
                  src="/pixles market illustrations/Meditation 1.png"
                  alt="Convenience and relaxation illustration"
                  className="w-full h-auto object-contain drop-shadow-md"
                  draggable="false"
                  loading="lazy"
                />
              </div>

              <h3 className="text-base font-black text-[#111111] font-outfit tracking-wider uppercase pt-2 relative z-10">
                HOSTED LMS
              </h3>

              <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed max-w-xs relative z-10">
                Start with a platform operated for you and work within the provider's product and pricing model.
              </p>
            </div>

            {/* Empty Center Spacing column on desktop */}
            <div className="hidden md:block md:col-span-1" />

            {/* ── Right Side: SASTALMS ── */}
            <div className="md:col-span-5 flex flex-col items-center text-center space-y-4 md:pl-8 relative">
              {/* Faded Background Header */}
              <span className="absolute top-0 text-[4rem] lg:text-[5rem] font-black text-[#111111]/[0.015] font-outfit leading-none select-none pointer-events-none tracking-tighter uppercase z-0">
                SELF-RUN
              </span>

              {/* Meta Annotation */}
              <div className="border border-[#111111]/15 bg-white/70 px-2.5 py-0.5 rounded text-[9px] font-black text-[#998A00] tracking-wider uppercase font-outfit z-10">
                self operated
              </div>

              {/* Metaphorical Illustration: Build (operating machinery / taking control) */}
              <div className="w-full max-w-[180px] lg:max-w-[220px] aspect-square flex items-center justify-center relative z-10">
                <div className="absolute inset-0 bg-[#FFE700]/4 rounded-full blur-2xl transform scale-75 -z-10" />
                <img
                  src="/pixles market illustrations/Drone.png"
                  alt="Operating infrastructure illustration"
                  className="w-full h-auto object-contain drop-shadow-md"
                  draggable="false"
                  loading="lazy"
                />
              </div>

              <h3 className="text-base font-black text-[#111111] font-outfit tracking-wider uppercase pt-2 relative z-10">
                SASTALMS
              </h3>

              <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed max-w-xs relative z-10">
                Deploy the complete system, pay for the infrastructure it consumes, and take responsibility for running it.
              </p>
            </div>

          </div>
        </div>

        {/* ── Five Comparison Rows: Vertical Decision Path ── */}
        <div className="w-full max-w-4xl mx-auto mt-16 md:mt-24 relative z-10">
          
          {/* Central spine vertical line (Desktop) */}
          <div className="hidden md:block absolute top-6 bottom-6 w-[2px] bg-[#FFE700]/70 left-1/2 -translate-x-1/2 z-0" />
          
          {/* Central spine vertical line (Mobile) */}
          <div className="block md:hidden absolute top-6 bottom-6 w-[2px] bg-[#FFE700]/40 left-1/2 -translate-x-1/2 z-0" />

          {/* Tiny annotation near the spine */}
          <div className="hidden md:block absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-[#998A00] font-sans uppercase tracking-wider rotate-[3deg] border border-[#FFE700]/45 bg-[#FCFAF2] px-2.5 py-0.5 rounded pointer-events-none select-none z-20 whitespace-nowrap">
            same goal. different responsibility.
          </div>

          <div className="space-y-6 md:space-y-0">

            {/* Dimension 01 — GETTING STARTED */}
            <div className="relative z-10">
              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-12 items-center py-7">
                {/* Left value (Hosted) */}
                <div className="col-span-5 text-right pr-8 flex flex-col items-end justify-center">
                  <p className="text-sm font-semibold text-slate-500 max-w-xs leading-relaxed">
                    Provider-managed setup.
                  </p>
                </div>
                {/* Spine category */}
                <div className="col-span-2 flex flex-col items-center justify-center relative">
                  <div className="w-9 h-9 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                    01
                  </div>
                  <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit mt-2 bg-[#FCFAF2] px-2 text-center relative z-10 whitespace-nowrap">
                    GETTING STARTED
                  </span>
                </div>
                {/* Right value (SastaLMS) */}
                <div className="col-span-5 text-left pl-8 flex flex-col items-start justify-center">
                  <p className="text-sm font-bold text-[#111111] max-w-xs leading-relaxed">
                    You{" "}
                    <span className="relative inline-block px-1">
                      <span className="absolute bottom-0.5 left-0 right-0 h-[4px] bg-[#FFE700]/70 -z-10 rounded-sm"></span>
                      deploy the system.
                    </span>
                  </p>
                </div>
              </div>

              {/* Mobile view */}
              <div className="flex md:hidden flex-col items-center text-center space-y-4 py-6 relative z-10 w-full">
                <div className="w-8 h-8 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                  01
                </div>
                <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit bg-[#FCFAF2] px-3 z-10 leading-none">
                  GETTING STARTED
                </span>
                
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">HOSTED LMS</span>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs">Provider-managed setup.</p>
                </div>
                <div className="text-[10px] font-black text-[#998A00] font-outfit bg-[#FCFAF2] py-0.5 px-2 rounded-full border border-[#FFE700]/30 z-10">
                  VS
                </div>
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-[#998A00] uppercase tracking-widest font-outfit">SASTALMS</span>
                  <p className="text-xs font-bold text-[#111111] leading-relaxed max-w-xs">You deploy the system.</p>
                </div>
              </div>
            </div>

            {/* Dimension 02 — HOW YOU PAY */}
            <div className="relative z-10">
              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-12 items-center py-7">
                {/* Left value (Hosted) */}
                <div className="col-span-5 text-right pr-8 flex flex-col items-end justify-center">
                  <p className="text-sm font-semibold text-slate-500 max-w-xs leading-relaxed">
                    Pay the provider's pricing model.
                  </p>
                </div>
                {/* Spine category */}
                <div className="col-span-2 flex flex-col items-center justify-center relative">
                  <div className="w-9 h-9 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                    02
                  </div>
                  <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit mt-2 bg-[#FCFAF2] px-2 text-center relative z-10 whitespace-nowrap">
                    HOW YOU PAY
                  </span>
                </div>
                {/* Right value (SastaLMS) */}
                <div className="col-span-5 text-left pl-8 flex flex-col items-start justify-center">
                  <p className="text-sm font-bold text-[#111111] max-w-xs leading-relaxed">
                    Pay for the{" "}
                    <span className="border-b-2 border-dashed border-[#FFE700] pb-0.5">
                      infrastructure
                    </span>{" "}
                    and services you use.
                  </p>
                </div>
              </div>

              {/* Mobile view */}
              <div className="flex md:hidden flex-col items-center text-center space-y-4 py-6 relative z-10 w-full">
                <div className="w-8 h-8 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                  02
                </div>
                <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit bg-[#FCFAF2] px-3 z-10 leading-none">
                  HOW YOU PAY
                </span>
                
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">HOSTED LMS</span>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs">Pay the provider's pricing model.</p>
                </div>
                <div className="text-[10px] font-black text-[#998A00] font-outfit bg-[#FCFAF2] py-0.5 px-2 rounded-full border border-[#FFE700]/30 z-10">
                  VS
                </div>
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-[#998A00] uppercase tracking-widest font-outfit">SASTALMS</span>
                  <p className="text-xs font-bold text-[#111111] leading-relaxed max-w-xs">Pay for the infrastructure and services you use.</p>
                </div>
              </div>
            </div>

            {/* Dimension 03 — SOURCE ACCESS */}
            <div className="relative z-10">
              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-12 items-center py-7">
                {/* Left value (Hosted) */}
                <div className="col-span-5 text-right pr-8 flex flex-col items-end justify-center">
                  <p className="text-sm font-semibold text-slate-500 max-w-xs leading-relaxed">
                    Platform implementation is provider-owned.
                  </p>
                </div>
                {/* Spine category */}
                <div className="col-span-2 flex flex-col items-center justify-center relative">
                  <div className="w-9 h-9 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                    03
                  </div>
                  <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit mt-2 bg-[#FCFAF2] px-2 text-center relative z-10 whitespace-nowrap">
                    SOURCE ACCESS
                  </span>
                </div>
                {/* Right value (SastaLMS) */}
                <div className="col-span-5 text-left pl-8 flex flex-col items-start justify-center">
                  <p className="text-sm font-bold text-[#111111] max-w-xs leading-relaxed">
                    Inspect the{" "}
                    <span className="bg-[#FFE700] px-1.5 py-0.5 rounded text-[#111111] font-black text-xs md:text-sm shadow-sm">
                      project source.
                    </span>
                  </p>
                </div>
              </div>

              {/* Mobile view */}
              <div className="flex md:hidden flex-col items-center text-center space-y-4 py-6 relative z-10 w-full">
                <div className="w-8 h-8 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                  03
                </div>
                <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit bg-[#FCFAF2] px-3 z-10 leading-none">
                  SOURCE ACCESS
                </span>
                
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">HOSTED LMS</span>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs">Platform implementation is provider-owned.</p>
                </div>
                <div className="text-[10px] font-black text-[#998A00] font-outfit bg-[#FCFAF2] py-0.5 px-2 rounded-full border border-[#FFE700]/30 z-10">
                  VS
                </div>
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-[#998A00] uppercase tracking-widest font-outfit">SASTALMS</span>
                  <p className="text-xs font-bold text-[#111111] leading-relaxed max-w-xs">Inspect the project source.</p>
                </div>
              </div>
            </div>

            {/* Dimension 04 — OPERATIONS */}
            <div className="relative z-10">
              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-12 items-center py-7">
                {/* Left value (Hosted) */}
                <div className="col-span-5 text-right pr-8 flex flex-col items-end justify-center">
                  <p className="text-sm font-semibold text-slate-500 max-w-xs leading-relaxed">
                    The provider operates the platform.
                  </p>
                </div>
                {/* Spine category */}
                <div className="col-span-2 flex flex-col items-center justify-center relative">
                  <div className="w-9 h-9 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                    04
                  </div>
                  <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit mt-2 bg-[#FCFAF2] px-2 text-center relative z-10 whitespace-nowrap">
                    OPERATIONS
                  </span>
                </div>
                {/* Right value (SastaLMS) */}
                <div className="col-span-5 text-left pl-8 flex flex-col items-start justify-center">
                  <p className="text-sm font-bold text-[#111111] max-w-xs leading-relaxed relative">
                    You operate your deployment.
                    <span className="absolute -top-1.5 -right-3 text-[#FFE700] font-black text-xs">*</span>
                  </p>
                </div>
              </div>

              {/* Mobile view */}
              <div className="flex md:hidden flex-col items-center text-center space-y-4 py-6 relative z-10 w-full">
                <div className="w-8 h-8 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                  04
                </div>
                <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit bg-[#FCFAF2] px-3 z-10 leading-none">
                  OPERATIONS
                </span>
                
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">HOSTED LMS</span>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs">The provider operates the platform.</p>
                </div>
                <div className="text-[10px] font-black text-[#998A00] font-outfit bg-[#FCFAF2] py-0.5 px-2 rounded-full border border-[#FFE700]/30 z-10">
                  VS
                </div>
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-[#998A00] uppercase tracking-widest font-outfit">SASTALMS</span>
                  <p className="text-xs font-bold text-[#111111] leading-relaxed max-w-xs">You operate your deployment.</p>
                </div>
              </div>
            </div>

            {/* Dimension 05 — PLATFORM DEPENDENCE */}
            <div className="relative z-10">
              {/* Desktop view */}
              <div className="hidden md:grid grid-cols-12 items-center py-7">
                {/* Left value (Hosted) */}
                <div className="col-span-5 text-right pr-8 flex flex-col items-end justify-center">
                  <p className="text-sm font-semibold text-slate-500 max-w-xs leading-relaxed">
                    Operate within the provider's platform.
                  </p>
                </div>
                {/* Spine category */}
                <div className="col-span-2 flex flex-col items-center justify-center relative">
                  <div className="w-9 h-9 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                    05
                  </div>
                  <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit mt-2 bg-[#FCFAF2] px-2 text-center relative z-10 whitespace-nowrap">
                    PLATFORM DEPENDENCE
                  </span>
                </div>
                {/* Right value (SastaLMS) */}
                <div className="col-span-5 text-left pl-8 flex flex-col items-start justify-center">
                  <p className="text-sm font-bold text-[#111111] max-w-xs leading-relaxed">
                    Operate your{" "}
                    <span className="relative inline-block px-1">
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FFE700]/60 -z-10 rounded-sm"></span>
                      own deployed instance.
                    </span>
                  </p>
                </div>
              </div>

              {/* Mobile view */}
              <div className="flex md:hidden flex-col items-center text-center space-y-4 py-6 relative z-10 w-full">
                <div className="w-8 h-8 rounded-full bg-[#FFE700] border-2 border-[#111111] flex items-center justify-center text-xs font-black font-outfit text-[#111111] shadow-sm z-10">
                  05
                </div>
                <span className="text-[10px] font-black text-[#998A00] uppercase tracking-wider font-outfit bg-[#FCFAF2] px-3 z-10 leading-none">
                  PLATFORM DEPENDENCE
                </span>
                
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-outfit">HOSTED LMS</span>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs">Operate within the provider's platform.</p>
                </div>
                <div className="text-[10px] font-black text-[#998A00] font-outfit bg-[#FCFAF2] py-0.5 px-2 rounded-full border border-[#FFE700]/30 z-10">
                  VS
                </div>
                <div className="flex flex-col items-center space-y-1 z-10">
                  <span className="text-[9px] font-black text-[#998A00] uppercase tracking-widest font-outfit">SASTALMS</span>
                  <p className="text-xs font-bold text-[#111111] leading-relaxed max-w-xs">Operate your own deployed instance.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── Conclusion Area ── */}
        <div className="w-full text-center mt-16 md:mt-24 max-w-2xl mx-auto z-10">
          <h3 className="text-xl md:text-3xl lg:text-4xl font-black font-outfit text-[#111111] leading-tight uppercase">
            CHOOSE CONVENIENCE. <br />
            <span className="relative inline-block mt-2 px-3.5 py-0.5 z-10 text-white leading-none">
              <span className="absolute inset-0 bg-[#111111] rounded-xl -rotate-1 transform -z-10 shadow-sm border border-[#111111]/30"></span>
              OR
            </span> <br />
            CHOOSE TO OPERATE IT YOURSELF.
          </h3>
          <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed mt-6 max-w-md mx-auto">
            Neither model removes trade-offs. The difference is who operates the platform and how the costs and responsibilities are distributed.
          </p>
        </div>

      </div>
    </section>
  );
};

export default ComparisonSection;
