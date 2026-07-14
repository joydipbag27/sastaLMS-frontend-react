import React from "react";
import { Server, Database, Cloud, Globe, Monitor, Shield, CreditCard } from "lucide-react";

const ArchitectureDiagram = () => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 text-white font-outfit shadow-inner relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,231,0,0.02),transparent_70%)] pointer-events-none" />
      
      <h4 className="text-xs font-black uppercase tracking-widest text-[#FFE700] mb-4">SastaLMS Topology</h4>
      
      {/* High level flow container */}
      <div className="flex flex-col gap-6 md:gap-8">
        
        {/* Core Layers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          
          {/* Layer 1: Client/Edge */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
              <Monitor size={16} className="text-[#FFE700]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Presentation & Edge</span>
            </div>
            
            <div className="space-y-2 text-xs flex-grow">
              <div className="bg-slate-900/60 border border-slate-700/30 p-2.5 rounded-lg">
                <p className="font-bold text-[#FFE700]">React SPA Frontend</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Vite-powered SPA, Tailwind UI, Plyr.js HLS playback client.</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/30 p-2.5 rounded-lg">
                <p className="font-bold text-[#FFE700]">Cloudflare Workers</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Manifest rewriter, token checks & Edge cache delivery.</p>
              </div>
            </div>
          </div>

          {/* Connection Arrow Desktop */}
          <div className="hidden md:flex flex-col items-center justify-center text-slate-600 self-center">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-1">REST APIs</span>
            <div className="w-full h-[2px] bg-gradient-to-r from-slate-700 via-[#FFE700]/30 to-slate-700 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border-t-2 border-r-2 border-slate-400" />
            </div>
            <span className="text-[9px] font-mono text-slate-500 mt-1">Cookie Session & HMAC</span>
          </div>

          {/* Layer 2: API Gateway / Core App Server */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
              <Server size={16} className="text-[#FFE700]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Express API Backend</span>
            </div>
            
            <div className="space-y-2 text-xs flex-grow">
              <div className="bg-slate-900/60 border border-slate-700/30 p-2.5 rounded-lg">
                <p className="font-bold text-[#FFE700]">Express Router & Middleware</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Session cookies, JWT signs, role & resource authorization gates.</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/30 p-2 ml-1 rounded-lg">
                <p className="font-bold text-slate-350 text-[11px] mb-1 uppercase tracking-wider font-mono">Domain Modules</p>
                <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400">
                  <span className="bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800">Auth & Sessions</span>
                  <span className="bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800">Courses & Content</span>
                  <span className="bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800">Payments & razorpay</span>
                  <span className="bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800">Learning Progress</span>
                  <span className="bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800">Media Orchestration</span>
                  <span className="bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800">Creator Stats</span>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/30 p-2 flex items-center justify-between rounded-lg">
                <div>
                  <p className="font-bold text-[#FFE700] text-[11px]">MongoDB Core</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Persistent database schema.</p>
                </div>
                <Database size={16} className="text-slate-500 shrink-0 ml-2" />
              </div>
            </div>
          </div>

        </div>

        {/* Cloud Media pipeline section */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Cloud size={16} className="text-[#FFE700]" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">External Integrations & Media Pipe</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-200">Razorpay API</p>
                <p className="text-[10px] text-slate-400 mt-1">Accepts webhook confirmations to fulfill course enrollments.</p>
              </div>
              <span className="text-[9px] text-[#FFE700] uppercase font-mono font-bold mt-2">Payments Gate</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-200">AWS Cloud Media</p>
                <p className="text-[10px] text-slate-400 mt-1">S3 inputs, MediaConvert transcoding, and EventBridge notifications to Lambda.</p>
              </div>
              <span className="text-[9px] text-emerald-400 uppercase font-mono font-bold mt-2">Transcoding</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-200">Backblaze B2 Storage</p>
                <p className="text-[10px] text-slate-400 mt-1">Host for ready static course segments with minimal egress transfer cost.</p>
              </div>
              <span className="text-[9px] text-cyan-400 uppercase font-mono font-bold mt-2">Static Vault</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-200">rclone Sync Engine</p>
                <p className="text-[10px] text-slate-400 mt-1">Triggered by backend to move files reliably from S3 to B2 bucket.</p>
              </div>
              <span className="text-[9px] text-pink-400 uppercase font-mono font-bold mt-2">File Copy</span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
          <Shield size={10} className="text-[#FFE700]" /> Session Cookie
        </span>
        <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
          <Globe size={10} className="text-[#FFE700]" /> Cloudflare Edge Rewrite
        </span>
        <span className="flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
          <CreditCard size={10} className="text-[#FFE700]" /> Secure Webhook
        </span>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
