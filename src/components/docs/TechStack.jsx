import React from "react";
import { Server, Database, Cloud, Code, ShieldCheck, Layers } from "lucide-react";

const stackItems = [
  {
    category: "Frontend SPA Client",
    icon: Code,
    items: [
      { name: "React 18", desc: "Single Page App client framework" },
      { name: "Vite 6", desc: "Ultrafast development server & compiler" },
      { name: "Tailwind CSS", desc: "Utility-first design styling structure" },
      { name: "Framer Motion", desc: "Subtle micro-animations and route transitions" },
      { name: "Plyr.js / HLS.js", desc: "Adaptive video streaming player layout engine" },
    ],
  },
  {
    category: "Backend Engine",
    icon: Server,
    items: [
      { name: "Node.js & Express", desc: "RESTful server endpoint controllers" },
      { name: "JWT & Cookie Sessions", desc: "Secure stateless server token authentication" },
      { name: "Mongoose ODM", desc: "MongoDB structural data validation schemas" },
    ],
  },
  {
    category: "Database Storage",
    icon: Database,
    items: [
      { name: "MongoDB", desc: "Document database storing user metadata and course progress" },
    ],
  },
  {
    category: "AWS Media Engine",
    icon: Cloud,
    items: [
      { name: "AWS S3 Input/Output", desc: "Direct browser presigned upload temporary storage" },
      { name: "AWS Elemental MediaConvert", desc: "Automated HLS segment encoding" },
      { name: "AWS EventBridge & Lambda", desc: "Asynchronous webhook triggers on completion" },
    ],
  },
  {
    category: "Low-Cost Egress Delivery",
    icon: Layers,
    items: [
      { name: "rclone CLI", desc: "Multi-threaded parallel transfers from S3 to B2" },
      { name: "Backblaze B2 Storage", desc: "Primary secure storage for transcoding outputs" },
      { name: "Cloudflare Workers", desc: "Token HMAC security gate & CDN edge cache delivery" },
    ],
  },
];

const TechStack = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none font-outfit text-[#111111]">
      {stackItems.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.category} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Icon size={16} className="text-[#998A00]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{group.category}</span>
            </div>
            
            <div className="space-y-2 flex-grow">
              {group.items.map((tech) => (
                <div key={tech.name} className="text-xs">
                  <span className="font-bold text-slate-800">{tech.name}</span>
                  <span className="text-slate-300 mx-1.5">·</span>
                  <span className="text-slate-500">{tech.desc}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TechStack;
