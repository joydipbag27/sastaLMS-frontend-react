import React from "react";

const StepFlow = ({ currentStep, steps = ["Send OTP", "Verify OTP", "Complete Action"] }) => {
  return (
    <div className="flex items-center justify-between w-full bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 mb-4">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isActive
                    ? "bg-sky-500 text-white ring-4 ring-sky-500/20 animate-pulse"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isActive ? "text-sky-400 font-bold" : isCompleted ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {step}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                  isCompleted ? "bg-emerald-600/60" : "bg-slate-800"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepFlow;
