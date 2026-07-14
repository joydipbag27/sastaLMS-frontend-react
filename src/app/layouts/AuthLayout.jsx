import React from "react";
import { BookOpen, Shield, BarChart3, Zap } from "lucide-react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F6F4EB] flex items-center justify-center p-4 md:p-6 lg:p-8 select-none font-sans">
      {/* Background Accent Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFE700]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Single Card Layout Wrapper */}
      <div className="w-full max-w-5xl bg-white border border-slate-200/80 rounded-[32px] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch relative z-10 min-h-[600px] lg:h-[90vh] lg:max-h-[720px]">
        
        {/* Left Column: Specs and Illustration (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-6 bg-[#FCFAF2] border-r border-slate-100 flex-col justify-between p-8 relative">
          {/* SastaLMS branding */}
          <div className="space-y-4">
            <div>
              <span className="text-3xl font-black text-slate-800 tracking-tight font-outfit">
                Sasta<span className="text-[#998A00]">LMS</span>
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-700">
                Learn. Grow. Succeed.
              </h2>
              <p className="text-xs text-slate-450 font-semibold leading-relaxed max-w-xs">
                Empowering your learning journey with modern tools and expert content.
              </p>
            </div>
          </div>

          {/* Real Learning Illustration from public folder */}
          <div className="flex-1 flex items-center justify-center my-6 max-h-[300px]">
            <img
              src="/pixles market illustrations/Authentication 1.png"
              alt="SastaLMS Online Learning Experience"
              className="w-full max-w-[280px] h-auto object-contain drop-shadow-md select-none"
              draggable="false"
            />
          </div>

          {/* Three Feature Badges */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-200/40 pt-6">
            <div className="text-center space-y-0.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#998A00] mx-auto mb-1">
                <Shield size={16} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-[11px]">
                Secure
              </h4>
              <p className="text-[9px] text-slate-450 font-semibold">
                Safe & private
              </p>
            </div>

            <div className="text-center space-y-0.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#998A00] mx-auto mb-1">
                <BarChart3 size={16} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-[11px]">
                Track Progress
              </h4>
              <p className="text-[9px] text-slate-450 font-semibold">
                Analytics & insights
              </p>
            </div>

            <div className="text-center space-y-0.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFE700]/10 border border-[#FFE700]/20 flex items-center justify-center text-[#998A00] mx-auto mb-1">
                <Zap size={16} />
              </div>
              <h4 className="font-extrabold text-slate-800 text-[11px]">
                Fast Learning
              </h4>
              <p className="text-[9px] text-slate-450 font-semibold">
                Streamlined HLS
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Form Container (Children) */}
        <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-10 md:p-12 overflow-y-auto">
          <div className="w-full max-w-[360px] py-4">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
