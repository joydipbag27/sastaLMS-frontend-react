import React, { useState } from "react";
import { Play, CheckCircle, ArrowRight, ShieldAlert, Cpu } from "lucide-react";

const pipelineSteps = [
  {
    step: 1,
    title: "Initiate Upload",
    desc: "Creator requests a secure upload route. The backend requests an AWS S3 presigned URL.",
    path: "automated",
  },
  {
    step: 2,
    title: "Direct Upload",
    desc: "The browser uploads the raw video file directly to the temporary S3 input bucket.",
    path: "automated",
  },
  {
    step: 3,
    title: "Upload Confirmation",
    desc: "Backend receives metadata verification, checks object size, and confirms the file is successfully placed on S3.",
    path: "automated",
  },
  {
    step: 4,
    title: "Transcode Trigger",
    desc: "Express Backend kicks off an AWS Elemental MediaConvert job to convert raw MP4 into segmented HLS streams.",
    path: "automated",
  },
  {
    step: 5,
    title: "HLS Output Generation",
    desc: "MediaConvert generates variant playlists (360p, 720p), segment files (.ts), and a master.m3u8 playlist.",
    path: "automated",
  },
  {
    step: 6,
    title: "Event Notification",
    desc: "AWS EventBridge captures job completion state and sends a notification message.",
    path: "automated",
  },
  {
    step: 7,
    title: "Lambda Handling",
    desc: "Lambda handler triggers, parsing the event and calling the SastaLMS webhook API to notify the backend.",
    path: "automated",
  },
  {
    step: 8,
    title: "B2 Transfer (rclone)",
    desc: "The app backend executes an rclone script to copy the output files asynchronously from S3 to a secure Backblaze B2 bucket.",
    path: "automated",
  },
  {
    step: 9,
    title: "Integrity Verification",
    desc: "The backend checks B2 for playlists presence, correct content-types, and calculates total folder size.",
    path: "both",
  },
  {
    step: 10,
    title: "State Update",
    desc: "Database state updates to READY, unlocking the video for students.",
    path: "both",
  },
  {
    step: 11,
    title: "S3 Cleanup",
    desc: "Temporary source and intermediate transcode outputs in the AWS S3 buckets are deleted to save storage costs.",
    path: "automated",
  },
  {
    step: 12,
    title: "Cloudflare Playback",
    desc: "Students stream the verified HLS video securely via Cloudflare Worker token validation and manifest rewriting.",
    path: "both",
  },
];

const PipelineFlow = () => {
  const [activeTab, setActiveTab] = useState("automated"); // "automated" | "manual"

  const filteredSteps = pipelineSteps.filter(
    (s) => activeTab === "automated" || s.path === "both"
  );

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm select-none font-outfit">
      
      {/* Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-3 mb-5">
        <button
          onClick={() => setActiveTab("automated")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "automated"
              ? "bg-[#FFE700] text-[#111111]"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          AWS MediaConvert Path
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === "manual"
              ? "bg-[#FFE700] text-[#111111]"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Manual Local (FFmpeg) Path
        </button>
      </div>

      {activeTab === "manual" && (
        <div className="mb-4 p-3 bg-amber-50/60 border border-amber-200/50 rounded-lg text-[11px] text-amber-700 font-semibold leading-relaxed flex gap-2">
          <Cpu size={14} className="shrink-0 mt-0.5" />
          <span>
            <strong>Manual Ingestion Model:</strong> Bypasses AWS resources by encoding HLS playlists (360p + 720p) locally using FFmpeg scripts, uploading folder directories directly to B2 using rclone, and calling the manual verification endpoint. Perfect for self-hosting.
          </span>
        </div>
      )}

      {/* Steps List */}
      <div className="relative border-l-2 border-slate-100 pl-4 space-y-4">
        {activeTab === "automated" ? (
          pipelineSteps.map((step) => (
            <div key={step.step} className="relative group">
              {/* Stepper Bullet */}
              <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-slate-300 group-hover:bg-[#FFE700] transition-colors flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              
              <div className="text-xs">
                <span className="font-mono text-[#998A00] font-bold">Step {step.step}: </span>
                <span className="font-bold text-slate-800">{step.title}</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#FFE700] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="text-xs">
                <span className="font-mono text-[#998A00] font-bold">Step 1: </span>
                <span className="font-bold text-slate-800">Transcode Locally via FFmpeg</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Creator transcodes course videos locally using standard configurations (HLS 360p + 720p playlists, video fragments index, and master.m3u8).
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="text-xs">
                <span className="font-mono text-[#998A00] font-bold">Step 2: </span>
                <span className="font-bold text-slate-800">Direct Directory Upload to B2</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Creator uploads processed directories directly to the private Backblaze B2 bucket using `rclone copy` commands.
                </p>
              </div>
            </div>

            {pipelineSteps.filter(s => s.path === "both").map((step, idx) => (
              <div key={step.step} className="relative group">
                <div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <div className="text-xs">
                  <span className="font-mono text-[#998A00] font-bold">Step {idx + 3}: </span>
                  <span className="font-bold text-slate-800">{step.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PipelineFlow;
