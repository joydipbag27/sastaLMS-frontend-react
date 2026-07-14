import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "BUILD YOUR COURSE",
    description:
      "Create sections, lessons, pricing, and course details from Creator Studio. Structure your knowledge into a complete, publishable learning experience.",
    illustration: "/pixles market illustrations/Build1.png",
    illustrationAlt: "Designer building a course in Creator Studio",
    flip: false,
  },
  {
    number: "02",
    title: "DELIVER VIDEO LESSONS",
    description:
      "Upload lessons and deliver structured adaptive video learning experiences. Students stream your content in high quality from any device.",
    illustration: "/pixles market illustrations/Deliver.png",
    illustrationAlt: "Student watching an online learning video lesson",
    flip: true,
  },
  {
    number: "03",
    title: "ENROLL & START LEARNING",
    description:
      "Students discover courses, enroll, and access their learning content from one place. Free or paid — the whole flow is handled for you.",
    illustration: "/pixles market illustrations/Learning.png",
    illustrationAlt: "Students enrolling and starting their learning journey",
    flip: false,
  },
  {
    number: "04",
    title: "TRACK & MANAGE",
    description:
      "Manage users, payments, courses, enrollments, and learning progress from Creator Studio. Everything you need, in one dashboard.",
    illustration: "/pixles market illustrations/Performance Evaluation 2.png",
    illustrationAlt: "Creator reviewing student performance and progress data",
    flip: true,
  },
];

/* Reconfigured connector line designed to grow as the visitor scrolls */
const StepConnector = () => (
  <div className="flex justify-center my-1.5 md:my-2.5 pointer-events-none" aria-hidden="true">
    <div className="flex flex-col items-center">
      <div className="w-[2px] h-12 bg-[#FFE700]/70 origin-top transform scale-y-0 step-connector-line" />
      <div className="w-2.5 h-2.5 rounded-full bg-[#FFE700] border-2 border-[#111111] z-10 -mt-1 shadow-sm step-connector-dot opacity-0 scale-50" />
    </div>
  </div>
);

const HowItWorksSection = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // In case the visitor prefers reduced motion, leave everything in its fully visible static state
    if (prefersReduced) {
      gsap.set(".step-text-col, .step-img, .step-connector-dot", { opacity: 1, scale: 1 });
      gsap.set(".step-connector-line", { scaleY: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Step reveals
      const stepItems = gsap.utils.toArray(".workflow-step");
      const isMobile = window.innerWidth < 768;
      stepItems.forEach((step) => {
        const textCol = step.querySelector(".step-text-col");
        const img = step.querySelector(".step-img");
        const isFlipped = step.dataset.flip === "true";

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: "top 82%",
            toggleActions: "play none none none",
          }
        });

        tl.fromTo(textCol, 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        ).fromTo(img,
          { opacity: 0, x: isMobile ? 0 : (isFlipped ? 30 : -30), scale: 0.96 },
          { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        );
      });

      // Connector scrub lines
      const lines = gsap.utils.toArray(".step-connector-line");
      lines.forEach((line) => {
        const dot = line.nextSibling;

        gsap.to(line, {
          scaleY: 1,
          scrollTrigger: {
            trigger: line,
            start: "top 75%",
            end: "bottom 60%",
            scrub: 0.5,
          }
        });

        if (dot) {
          gsap.to(dot, {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: line,
              start: "bottom 60%",
              toggleActions: "play none none none",
            }
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#F6F4EB] py-8 lg:py-10 overflow-hidden select-none border-t border-slate-200/40"
      id="how-it-works"
    >
      {/* Decorative radial gradients */}
      <div className="absolute top-[5%] left-[-12%] w-[40%] h-[40%] bg-[#FFE700]/5 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-[5%] right-[-12%] w-[40%] h-[40%] bg-[#FFE700]/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-6">
        {/* ── Section Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 flex flex-col items-center space-y-4">
          <span className="inline-block bg-[#FFE700]/10 border border-[#FFE700]/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#998A00] uppercase font-outfit">
            FROM IDEA TO CLASSROOM
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#111111] leading-tight font-outfit tracking-tight">
            CREATE ONCE.{" "}
            <span className="relative inline-block">
              <span className="relative z-10">TEACH WITHOUT</span>
            </span>
            <br />
            <span className="bg-[#FFE700] px-2 py-0.5 rounded-xl -rotate-[0.5deg] inline-block mt-1 shadow-sm">
              THE CHAOS.
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed max-w-xl">
            SastaLMS brings course creation, video delivery, student access, and
            learning progress into one connected workflow.
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={step.number}>
              {/* Individual Step */}
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center py-4 lg:py-6 workflow-step ${
                  step.flip ? "lg:[direction:rtl]" : ""
                }`}
                data-flip={step.flip}
              >
                {/* Text column — always ltr text direction */}
                <div
                  className={`flex flex-col items-start text-left space-y-5 step-text-col opacity-0 ${
                    step.flip ? "lg:[direction:ltr]" : ""
                  }`}
                >
                  {/* Step number — faded large backdrop number */}
                  <div className="relative">
                    {/* Faded large background number */}
                    <span
                      className="absolute -top-8 -left-4 text-[5rem] sm:text-[7rem] md:text-[9rem] font-black text-[#111111]/[0.04] font-outfit leading-none select-none pointer-events-none"
                      aria-hidden="true"
                    >
                      {step.number}
                    </span>
                    {/* Foreground step pill */}
                    <span className="relative inline-flex items-center gap-2 bg-[#FFE700]/10 border border-[#FFE700]/25 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#998A00] uppercase font-outfit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FFE700]" />
                      STEP {step.number}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#111111] font-outfit tracking-tight leading-tight">
                    {step.title}
                  </h3>

                  <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>

                {/* Illustration column */}
                <div
                  className={`relative flex items-center justify-center ${
                    step.flip ? "lg:[direction:ltr]" : ""
                  }`}
                >
                  {/* Pale yellow halo behind each illustration */}
                  <div className="absolute w-4/5 h-4/5 bg-[#FFE700]/8 rounded-full blur-3xl pointer-events-none" />
                  <img
                    src={step.illustration}
                    alt={step.illustrationAlt}
                    className="relative z-10 w-full max-w-[180px] md:max-w-[220px] lg:max-w-[260px] h-auto object-contain drop-shadow-lg step-img opacity-0"
                    draggable="false"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Connector between steps (not after the last) */}
              {index < steps.length - 1 && <StepConnector />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

