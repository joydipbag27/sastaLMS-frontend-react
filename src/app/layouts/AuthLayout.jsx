import React from "react";
import { BookOpen, Shield, BarChart3, Zap } from "lucide-react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#F8F9FD] flex items-center justify-center p-4 md:p-8 select-none relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-100/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-6xl lg:h-[90vh] lg:max-h-[700px] bg-white border border-slate-200 rounded-[40px] shadow-xl p-4 md:p-6 lg:p-8 lg:grid lg:grid-cols-12 lg:gap-8 items-stretch relative z-10">
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-4 h-full">
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight font-outfit">
                  Sasta<span className="text-brand-200">LMS</span>
                </span>
              </div>

              <div className="space-y-1 mt-3">
                <h2 className="text-xl font-black text-brand-200 tracking-wide">
                  Learn. Grow. Succeed.
                </h2>
                <p className="text-sm text-slate-500 font-semibold leading-relaxed max-w-sm">
                  Empowering your learning journey with modern tools and expert content.
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-[140px] my-3 w-full rounded-[28px] bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center relative overflow-hidden">
              <div
                className="absolute inset-0 bg-gradient-to-tr from-slate-100/20 to-brand-50/10 animate-pulse"
                style={{ animationDuration: "4s" }}
              ></div>
              <div className="relative z-10 flex flex-col items-center text-slate-400 font-bold text-xs tracking-wide space-y-1">
                <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-dashed flex items-center justify-center mb-1 text-slate-300">
                  <BookOpen size={18} className="text-slate-300 stroke-[1.5]" />
                </div>
                <span>Illustration Area</span>
                <span className="text-[10px] font-semibold text-slate-350">
                  Placeholder for visual assets
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm grid grid-cols-3 gap-2 mt-2">
            <div className="text-center space-y-0.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-200 mx-auto mb-1">
                <Shield size={16} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs">
                Secure
              </h4>
              <p className="text-[9px] text-slate-450 font-medium">
                Safe & private
              </p>
            </div>

            <div className="text-center space-y-0.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-200 mx-auto mb-1">
                <BarChart3 size={16} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs">
                Track Progress
              </h4>
              <p className="text-[9px] text-slate-450 font-medium">
                Analytics & insights
              </p>
            </div>

            <div className="text-center space-y-0.5">
              <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-200 mx-auto mb-1">
                <Zap size={16} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs">
                Fast Learning
              </h4>
              <p className="text-[9px] text-slate-450 font-medium">
                Streamlined courses
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex items-center justify-center p-2 h-full">
          <div className="w-full max-w-[450px] bg-white border border-slate-200 rounded-[32px] p-6 lg:p-8 shadow-lg flex flex-col justify-center h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
