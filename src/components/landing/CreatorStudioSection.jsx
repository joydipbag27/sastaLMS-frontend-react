import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  BookOpen,
  Users,
  CreditCard,
  Server,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const capabilities = [
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Create, publish, update, and organize courses and lessons end-to-end.",
  },
  {
    icon: Users,
    title: "User & Access Control",
    description:
      "Manage students, creator roles, blocked users, and active sessions.",
  },
  {
    icon: CreditCard,
    title: "Payments & Revenue",
    description:
      "Review revenue, successful purchases, payment history, and invoices.",
  },
  {
    icon: Server,
    title: "Self-Hosted Control",
    description:
      "Deploy and operate the platform with full control over your infrastructure.",
  },
];

const CreatorStudioSection = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isCreator = profile?.role === "CREATOR";

  const handleCTA = () => {
    if (!profile) {
      navigate("/login?returnTo=/creator/courses");
    } else if (isCreator) {
      navigate("/creator/courses");
    } else {
      navigate("/courses");
    }
  };

  return (
    <section
      className="relative bg-[#FEFCE6] py-10 lg:py-14 overflow-hidden select-none border-t border-[#FFE700]/30"
      id="creators"
    >
      {/* Restrained decorative shapes */}
      <div className="absolute top-[-8%] right-[-8%] w-[30%] h-[30%] bg-[#FFE700]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-8%] left-[-8%] w-[25%] h-[25%] bg-[#FFE700]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Subtle top edge dot line accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#FFE700]/50 to-transparent" />

      <div className="max-w-5xl mx-auto px-6">
        {/* ── Two-column editorial layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* ── Left: Illustration Composition ── */}
          <div className="relative flex items-center justify-center order-2 lg:order-1">
            {/* Pale yellow ambient halo */}
            <div className="absolute w-4/5 h-4/5 bg-[#FFE700]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Small decorative rotated square accent */}
            <div
              className="absolute top-4 left-4 w-8 h-8 border-2 border-[#FFE700]/40 rounded-md rotate-12 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-4 right-6 w-4 h-4 bg-[#FFE700]/30 rounded-full pointer-events-none"
              aria-hidden="true"
            />

            <img
              src="/pixles market illustrations/Market Fair 1.png"
              alt="Creator reviewing platform performance and student data"
              className="relative z-10 w-full max-w-[240px] md:max-w-[380px] lg:max-w-[480px] h-auto object-contain drop-shadow-lg animate-fade-in"
              draggable="false"
              loading="lazy"
            />
          </div>

          {/* ── Right: Content ── */}
          <div className="flex flex-col items-start text-left space-y-6 order-1 lg:order-2">
            {/* Eyebrow */}
            <span className="inline-block bg-[#FFE700]/20 border border-[#FFE700]/40 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#998A00] uppercase font-outfit">
              CREATOR STUDIO
            </span>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-black text-[#111111] leading-tight font-outfit tracking-tight">
              CREATE THE CONTENT.{" "}
              <br />
              <span className="bg-[#FFE700] px-2 py-0.5 rounded-xl -rotate-[0.5deg] inline-block mt-1 shadow-sm">
                RUN THE PLATFORM.
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed max-w-md">
              Manage courses, students, enrollments, payments, and platform
              access from one connected Creator Studio.
            </p>

            {/* Capabilities List */}
            <div className="w-full space-y-0">
              {capabilities.map((cap, index) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.title}>
                    <div className="flex items-start gap-4 py-4">
                      {/* Icon */}
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-[#FFE700]/20 border border-[#FFE700]/30 flex items-center justify-center text-[#998A00]">
                        <Icon size={14} strokeWidth={2.5} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-black text-[#111111] font-outfit tracking-wide">
                            {cap.title}
                          </h3>
                          <ChevronRight
                            size={13}
                            className="shrink-0 text-[#CCB800]/60"
                          />
                        </div>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
                          {cap.description}
                        </p>
                      </div>
                    </div>

                    {/* Subtle divider — not after last item */}
                    {index < capabilities.length - 1 && (
                      <div className="h-px bg-[#FFE700]/20" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button
              onClick={handleCTA}
              className="group inline-flex items-center gap-2 bg-[#111111] hover:bg-[#111111]/85 active:scale-[0.98] text-white px-6 py-3 rounded-xl font-bold font-outfit text-sm shadow-md shadow-black/10 transition-all duration-150"
            >
              Open Creator Studio
              <ArrowRight
                size={16}
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorStudioSection;
