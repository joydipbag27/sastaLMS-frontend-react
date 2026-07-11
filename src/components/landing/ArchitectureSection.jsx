import React from "react";
import {
  Upload,
  Cpu,
  Database,
  Globe,
  Play,
  Shield,
  CreditCard,
  Server,
  Video,
} from "lucide-react";

/* ── Architecture flow stages ── */
const flowStages = [
  { icon: Upload,   label: "Upload",   sub: "Direct media upload" },
  { icon: Cpu,      label: "Process",  sub: "Adaptive HLS encoding" },
  { icon: Database, label: "Store",    sub: "Object storage" },
  { icon: Globe,    label: "Deliver",  sub: "CDN-backed delivery" },
  { icon: Play,     label: "Learn",    sub: "Secure playback" },
];

/* ── Annotation details ── */
const annotations = [
  {
    num: "01",
    icon: Video,
    title: "Adaptive Video Pipeline",
    desc: "HLS-based delivery with multiple quality levels and CDN-backed segment distribution.",
  },
  {
    num: "02",
    icon: Shield,
    title: "Secure Media Access",
    desc: "Controlled lesson playback with short-lived signed media URLs.",
  },
  {
    num: "03",
    icon: CreditCard,
    title: "Payments & Enrollment",
    desc: "Course purchases, enrollment management, payment history, and invoice access.",
  },
  {
    num: "04",
    icon: Server,
    title: "Deployable Architecture",
    desc: "Object storage, CDN delivery, and serverless or traditional backend deployment.",
  },
];

/* Arrow between flow stages */
const FlowArrow = () => (
  <div className="flex items-center justify-center h-14" aria-hidden="true">
    <div className="flex items-center">
      <div className="w-8 h-px bg-gradient-to-r from-[#FFE700]/40 to-[#FFE700]/70" />
      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] border-l-[#FFE700]/70 -ml-px" />
    </div>
  </div>
);

const ArchitectureSection = () => {
  return (
    <section
      className="relative bg-[#FEFCE6] py-12 lg:py-16 overflow-hidden select-none border-t border-[#FFE700]/30"
      id="architecture"
    >
      {/* Dot-grid background */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="arch-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill="#B3A100" opacity="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arch-dots)" />
        </svg>
      </div>

      {/* Ambient glows */}
      <div className="absolute top-[-10%] right-[-8%] w-[30%] h-[30%] bg-[#FFE700]/12 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-8%] w-[25%] h-[25%] bg-[#FFE700]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#FFE700]/60 to-transparent" />

      <div className="max-w-5xl mx-auto px-6">

        {/* ── Section Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 flex flex-col items-center space-y-4">
          <span className="inline-block bg-[#FFE700]/20 border border-[#FFE700]/40 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#998A00] uppercase font-outfit">
            BUILT DIFFERENT
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#111111] leading-tight font-outfit tracking-tight">
            NOT JUST A COURSE UI.
            <br />
            <span className="bg-[#FFE700] px-2 py-0.5 rounded-xl -rotate-[0.5deg] inline-block mt-1 shadow-sm">
              A COMPLETE LMS SYSTEM.
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed max-w-xl">
            veoLMS combines video processing, secure media delivery, payments,
            enrollments, and platform management into one deployable full-stack
            system.
          </p>
        </div>

        {/* ── Pipeline Container ── */}
        <div className="relative bg-[#111111] rounded-2xl shadow-2xl overflow-hidden mb-10 md:mb-12">
          {/* Subtle inner grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="inner-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#inner-grid)" />
            </svg>
          </div>

          {/* Yellow top edge glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFE700]/50 to-transparent" />

          {/* Header bar */}
          <div className="relative z-10 flex items-center gap-2.5 px-6 pt-5 pb-2 md:px-8 md:pt-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFE700]/40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFE700]" />
            </span>
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase font-outfit">
              Media Delivery Pipeline
            </span>
          </div>

          {/* ── Flow Stages ── */}
          <div className="relative z-10 px-6 pb-6 pt-2 md:px-8 md:pb-8">

            {/* ── Desktop layout: 9-column grid ── */}
            <div
              className="hidden md:grid items-center"
              style={{ gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr auto 1fr" }}
            >
              {/* Col 1 — Stage */}
              <div className="flex flex-col items-center text-center">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700] shadow-[0_0_20px_rgba(255,231,0,0.06)] transition-all duration-200 hover:bg-[#FFE700]/15 hover:border-[#FFE700]/30">
                  <Upload size={22} strokeWidth={1.8} />
                </div>
                <div className="mt-3">
                  <div className="text-[13px] font-black text-white font-outfit tracking-wide leading-none">Upload</div>
                  <div className="text-[10px] text-slate-500 font-semibold leading-tight mt-1">Direct media upload</div>
                </div>
              </div>

              {/* Connector */}
              <FlowArrow />

              {/* Col 2 — Stage */}
              <div className="flex flex-col items-center text-center">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700] shadow-[0_0_20px_rgba(255,231,0,0.06)] transition-all duration-200 hover:bg-[#FFE700]/15 hover:border-[#FFE700]/30">
                  <Cpu size={22} strokeWidth={1.8} />
                </div>
                <div className="mt-3">
                  <div className="text-[13px] font-black text-white font-outfit tracking-wide leading-none">Process</div>
                  <div className="text-[10px] text-slate-500 font-semibold leading-tight mt-1">Adaptive HLS encoding</div>
                </div>
              </div>

              {/* Connector */}
              <FlowArrow />

              {/* Col 3 — Stage */}
              <div className="flex flex-col items-center text-center">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700] shadow-[0_0_20px_rgba(255,231,0,0.06)] transition-all duration-200 hover:bg-[#FFE700]/15 hover:border-[#FFE700]/30">
                  <Database size={22} strokeWidth={1.8} />
                </div>
                <div className="mt-3">
                  <div className="text-[13px] font-black text-white font-outfit tracking-wide leading-none">Store</div>
                  <div className="text-[10px] text-slate-500 font-semibold leading-tight mt-1">Object storage</div>
                </div>
              </div>

              {/* Connector */}
              <FlowArrow />

              {/* Col 4 — Stage */}
              <div className="flex flex-col items-center text-center">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700] shadow-[0_0_20px_rgba(255,231,0,0.06)] transition-all duration-200 hover:bg-[#FFE700]/15 hover:border-[#FFE700]/30">
                  <Globe size={22} strokeWidth={1.8} />
                </div>
                <div className="mt-3">
                  <div className="text-[13px] font-black text-white font-outfit tracking-wide leading-none">Deliver</div>
                  <div className="text-[10px] text-slate-500 font-semibold leading-tight mt-1">CDN-backed delivery</div>
                </div>
              </div>

              {/* Connector */}
              <FlowArrow />

              {/* Col 5 — Stage */}
              <div className="flex flex-col items-center text-center">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700] shadow-[0_0_20px_rgba(255,231,0,0.06)] transition-all duration-200 hover:bg-[#FFE700]/15 hover:border-[#FFE700]/30">
                  <Play size={22} strokeWidth={1.8} />
                </div>
                <div className="mt-3">
                  <div className="text-[13px] font-black text-white font-outfit tracking-wide leading-none">Learn</div>
                  <div className="text-[10px] text-slate-500 font-semibold leading-tight mt-1">Secure playback</div>
                </div>
              </div>
            </div>

            {/* ── Mobile layout: vertical stack ── */}
            <div className="flex flex-col md:hidden gap-5">
              {flowStages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <React.Fragment key={stage.label}>
                    {index > 0 && (
                      <div className="flex items-center gap-1 ml-6" aria-hidden="true">
                        <div className="w-5 h-px bg-[#FFE700]/40" />
                        <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-[#FFE700]/50" />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#FFE700] shadow-[0_0_20px_rgba(255,231,0,0.06)]">
                        <Icon size={22} strokeWidth={1.8} />
                      </div>
                      <div className="text-left">
                        <div className="text-[13px] font-black text-white font-outfit tracking-wide leading-none">
                          {stage.label}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold leading-tight mt-1">
                          {stage.sub}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

          </div>

          {/* Yellow bottom edge glow */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFE700]/30 to-transparent" />
        </div>

        {/* ── Technical Annotations ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-8">
          {annotations.map((a, i) => {
            const Icon = a.icon;
            const isRight = i % 2 === 1;
            return (
              <div
                key={a.num}
                className={`flex items-start gap-4 ${isRight ? "md:mt-5" : ""}`}
              >
                {/* Number + vertical line */}
                <div className="shrink-0 flex flex-col items-center">
                  <span className="text-[11px] font-black text-[#FFE700] font-mono tracking-wider leading-none">
                    {a.num}
                  </span>
                  <div className="w-px flex-1 min-h-[32px] bg-[#FFE700]/20 mt-2" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-px">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="shrink-0 w-6 h-6 rounded-lg bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center">
                      <Icon size={12} strokeWidth={2.5} className="text-[#998A00]" />
                    </div>
                    <h3 className="text-[13px] font-black text-[#111111] font-outfit tracking-wide leading-none">
                      {a.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    {a.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ArchitectureSection;
