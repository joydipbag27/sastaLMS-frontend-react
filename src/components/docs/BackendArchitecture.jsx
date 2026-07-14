import React from "react";
import { ShieldCheck, Cpu, Layers, Database, ArrowRight } from "lucide-react";

const layers = [
  {
    name: "Layer 1: HTTP Gateway & Middleware",
    icon: ShieldCheck,
    color: "border-blue-200 bg-blue-50/60 text-blue-800",
    badgeColor: "bg-blue-100 text-blue-800",
    bullets: [
      "Express Router endpoints security",
      "Server-side session validation middleware (session cookies via connect-mongo)",
      "Role-based authorization checks (restricting access to STUDENT or CREATOR)",
      "Course & Lesson resource ownership logic",
      "Secure CORS configurations, JSON input sanitization, and central error catching",
    ],
  },
  {
    name: "Layer 2: Domain Business Modules",
    icon: Cpu,
    color: "border-emerald-200 bg-emerald-50/60 text-emerald-800",
    badgeColor: "bg-emerald-100 text-emerald-800",
    bullets: [
      "Auth: Email/password validations, Google OAuth redirects, and session state",
      "Courses: Course settings metadata, publishes, levels, and list filtering",
      "Curriculum: Structural section additions and lesson durations metadata",
      "Learning: Student course classrooms access and resume lesson checkpoints",
      "Payments: Razorpay orders and webhook signature validations",
      "Media: Upload URL signing, transcode processing states, and HLS playback token signatures",
    ],
  },
  {
    name: "Layer 3: Integrations & Services",
    icon: Layers,
    color: "border-purple-200 bg-purple-50/60 text-purple-800",
    badgeColor: "bg-purple-100 text-purple-800",
    bullets: [
      "Razorpay webhook fulfiller (verifying transactions and updating enrollments)",
      "AWS Elemental MediaConvert job configs builder (360p + 720p renditions presets)",
      "rclone child-process orchestrator (reliable multi-threaded S3 to B2 copy scripts)",
      "Media lifecycle status logic (handling transitions UPLOADED -> PROCESSING -> READY/FAILED)",
      "B2 Storage integrity inspector (checking variant playlists before marking ready)",
      "Short-lived playback URL signer (HMAC SHA-256 tokens generation)",
      "Orphaned file cleaner & manual sync failed-transfers repair endpoint",
    ],
  },
  {
    name: "Layer 4: Persistence & External Systems",
    icon: Database,
    color: "border-slate-200 bg-slate-50/60 text-slate-800",
    badgeColor: "bg-slate-200 text-slate-800",
    bullets: [
      "MongoDB: Core state persistence (Users, Session Store, Courses, Payments)",
      "AWS S3: Ephemeral staging storage for uploads and transcoder intermediates",
      "Backblaze B2: Cost-efficient private storage vault for finalized streams",
      "Cloudflare Workers: Edge route filters, caching, and manifest token injects",
    ],
  },
];

const BackendArchitecture = () => {
  return (
    <div className="w-full space-y-4 font-outfit select-none text-[#111111]">
      <div className="flex flex-col gap-6">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;
          return (
            <div key={layer.name} className="relative">
              {/* Vertical connector line */}
              {idx < 3 && (
                <div className="absolute left-6 top-12 bottom-[-16px] w-[2px] bg-slate-200 z-0 hidden sm:block" />
              )}
              
              <div className={`border rounded-xl p-4 shadow-sm z-10 relative bg-white`}>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${layer.color} shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">{layer.name}</h4>
                  </div>
                </div>
                
                <ul className="space-y-2 pl-1">
                  {layer.bullets.map((b, bidx) => (
                    <li key={bidx} className="flex gap-2 text-xs font-semibold text-slate-600 leading-relaxed items-start">
                      <span className="text-[#998A00] mt-1 shrink-0 font-mono">▸</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BackendArchitecture;
