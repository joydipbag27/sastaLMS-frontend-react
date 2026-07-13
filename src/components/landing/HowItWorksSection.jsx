import React from "react";

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

/* Restrained dashed vertical connector rendered between steps */
const StepConnector = () => (
  <div className="flex justify-center my-1.5 md:my-2.5 pointer-events-none" aria-hidden="true">
    <div className="flex flex-col items-center gap-1">
      {/* Three small yellow dashes stacked vertically */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-px h-4 bg-[#FFE700]/50"
          style={{ opacity: 1 - i * 0.25 }}
        />
      ))}
      <div className="w-1.5 h-1.5 rounded-full bg-[#FFE700]/60" />
    </div>
  </div>
);

const HowItWorksSection = () => {
  return (
    <section
      className="relative bg-[#F6F4EB] py-8 lg:py-10 overflow-hidden select-none border-t border-slate-200/40"
      id="product"
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
            veoLMS brings course creation, video delivery, student access, and
            learning progress into one connected workflow.
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={step.number}>
              {/* Individual Step */}
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center py-4 lg:py-6 ${
                  step.flip ? "lg:[direction:rtl]" : ""
                }`}
              >
                {/* Text column — always ltr text direction */}
                <div
                  className={`flex flex-col items-start text-left space-y-5 ${
                    step.flip ? "lg:[direction:ltr]" : ""
                  }`}
                >
                  {/* Step number — faded large backdrop number */}
                  <div className="relative">
                    {/* Faded large background number */}
                    <span
                      className="absolute -top-8 -left-4 text-[7rem] md:text-[9rem] font-black text-[#111111]/[0.04] font-outfit leading-none select-none pointer-events-none"
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
                    className="relative z-10 w-full max-w-[180px] md:max-w-[220px] lg:max-w-[260px] h-auto object-contain drop-shadow-lg animate-fade-in"
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
