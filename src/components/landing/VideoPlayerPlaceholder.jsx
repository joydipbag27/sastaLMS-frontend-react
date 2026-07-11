import React from "react";
import { Play, Volume2, Settings, Maximize, RotateCcw } from "lucide-react";

const VideoPlayerPlaceholder = () => {
  return (
    <div className="w-full aspect-video bg-[#0B0F19] rounded-2xl border border-slate-800/80 shadow-2xl relative flex flex-col justify-between overflow-hidden group select-none ring-1 ring-white/5 ring-inset">
      {/* Decorative Grid Lines to simulate video content context */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,231,0,0.03),transparent)] pointer-events-none"></div>
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
        <div className="w-full h-full border-t border-b border-white border-dashed flex items-center justify-center">
          <div className="h-full border-l border-r border-white border-dashed w-1/2"></div>
        </div>
      </div>

      {/* Main Big Center Play Button */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <button
          className="w-16 h-16 rounded-full bg-[#FFE700] hover:bg-[#FFE700]/90 hover:scale-105 active:scale-95 text-[#111111] flex items-center justify-center shadow-xl shadow-[#FFE700]/15 transition-all duration-200 cursor-pointer"
          aria-label="Play Lesson Video"
        >
          <Play size={20} fill="currentColor" className="ml-1 stroke-none" />
        </button>
      </div>

      {/* Top Bar Indicators (Optional, simulated title) */}
      <div className="p-4 flex items-center justify-between relative z-10 w-full bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
          <span className="text-[11px] font-bold text-slate-300 font-outfit uppercase tracking-widest leading-none">Lesson 1: Platform Overview</span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 bg-black/30 border border-slate-800 px-2 py-0.5 rounded-full font-outfit">HLS STREAM</span>
      </div>

      {/* Bottom Controls Bar (Presentation UI) */}
      <div className="w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-4 px-5 flex flex-col gap-3 absolute bottom-0 left-0 right-0 z-10">
        
        {/* Seek/Progress Bar */}
        <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden relative cursor-pointer group/progress">
          {/* Progress Filled */}
          <div className="absolute top-0 left-0 h-full w-[38%] bg-[#FFE700] rounded-full"></div>
          {/* Progress Seeker Thumb */}
          <div className="absolute top-1/2 left-[38%] -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#FFE700] rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition-transform"></div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between text-slate-350">
          {/* Left Side Controls */}
          <div className="flex items-center gap-4">
            <button className="hover:text-white transition-colors" aria-label="Play">
              <Play size={14} fill="currentColor" className="stroke-none" />
            </button>
            <button className="hover:text-white transition-colors" aria-label="Rewind 10 seconds">
              <RotateCcw size={13} />
            </button>
            <div className="flex items-center gap-1.5">
              <button className="hover:text-white transition-colors" aria-label="Volume">
                <Volume2 size={14} />
              </button>
              <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-white"></div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold tracking-wide text-slate-400 select-none">
              04:32 / 12:54
            </span>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-white bg-white/10 px-1 py-0.5 rounded font-outfit uppercase select-none tracking-wide">
              1080p
            </span>
            <button className="hover:text-white transition-colors" aria-label="Settings">
              <Settings size={14} />
            </button>
            <button className="hover:text-white transition-colors" aria-label="Fullscreen">
              <Maximize size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoPlayerPlaceholder;
