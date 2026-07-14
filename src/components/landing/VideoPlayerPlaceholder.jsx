import React, { useState } from "react";
import { Play } from "lucide-react";
import VideoPlayer from "../shared/VideoPlayer";

const VideoPlayerPlaceholder = ({ onPlaybackChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const demoVideoUrl = import.meta.env.VITE_DEMO_VIDEO_URL || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
  const demoPosterUrl = import.meta.env.VITE_DEMO_VIDEO_POSTER || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200";

  const handleStartPlay = () => {
    setIsPlaying(true);
    onPlaybackChange?.(true);
  };

  return (
    <div className="w-full aspect-video bg-[#0B0F19] rounded-2xl border border-slate-800/80 shadow-2xl relative flex flex-col justify-between overflow-hidden group select-none ring-1 ring-white/5 ring-inset">
      {!isPlaying ? (
        <>
          {/* Poster Image Backdrop */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-300 group-hover:opacity-40"
            style={{ backgroundImage: `url(${demoPosterUrl})` }}
          />

          {/* Decorative Grid Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,231,0,0.03),transparent)] pointer-events-none"></div>
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
            <div className="w-full h-full border-t border-b border-white border-dashed flex items-center justify-center">
              <div className="h-full border-l border-r border-white border-dashed w-1/2"></div>
            </div>
          </div>

          {/* Main Big Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <button
              onClick={handleStartPlay}
              className="w-16 h-16 rounded-full bg-[#FFE700] hover:bg-[#FFE700]/90 hover:scale-105 active:scale-95 text-[#111111] flex items-center justify-center shadow-xl shadow-[#FFE700]/15 transition-all duration-200 cursor-pointer"
              aria-label="Play Lesson Video"
            >
              <Play size={20} fill="currentColor" className="ml-1 stroke-none" />
            </button>
          </div>

          {/* Top Bar Indicators */}
          <div className="p-4 flex items-center justify-between relative z-10 w-full bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-300 font-outfit uppercase tracking-widest leading-none">Lesson 1: Platform Overview</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 bg-black/30 border border-slate-800 px-2 py-0.5 rounded-full font-outfit">HLS STREAM</span>
          </div>

          {/* Bottom Info Overlay */}
          <div className="p-4 relative z-10 w-full bg-gradient-to-t from-black/80 to-transparent text-slate-400 flex justify-between items-center text-xs mt-auto">
            <span>Demo Preview</span>
            <span>12:54</span>
          </div>
        </>
      ) : (
        <VideoPlayer
          src={demoVideoUrl}
          poster={demoPosterUrl}
          autoplay={true}
          controls={true}
          onPlay={() => onPlaybackChange?.(true)}
          onPause={() => onPlaybackChange?.(false)}
          onEnded={() => onPlaybackChange?.(false)}
        />
      )}
    </div>
  );
};

export default VideoPlayerPlaceholder;
