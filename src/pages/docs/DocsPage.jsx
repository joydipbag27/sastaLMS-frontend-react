import React, { useState, useEffect } from "react";
import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";
import ArchitectureDiagram from "../../components/docs/ArchitectureDiagram";
import BackendArchitecture from "../../components/docs/BackendArchitecture";
import PipelineFlow from "../../components/docs/PipelineFlow";
import TechStack from "../../components/docs/TechStack";
import { BookOpen, ExternalLink, Menu, X, Check, Code, ShieldCheck, HelpCircle, ArrowRight, Server, FileText, Lock, ShieldAlert } from "lucide-react";

const docSections = [
  { id: "intro", label: "Introduction" },
  { id: "features", label: "Core Features" },
  { id: "architecture", label: "System Topology" },
  { id: "backend", label: "Backend Architecture" },
  { id: "pipeline", label: "Video Processing Pipeline" },
  { id: "learning", label: "Learning Flow" },
  { id: "auth", label: "Authentication & Access" },
  { id: "stack", label: "Technology Stack" },
  { id: "decisions", label: "Engineering Decisions" },
  { id: "security", label: "Security Model" },
  { id: "limitations", label: "Known Limitations" },
  { id: "roadmap", label: "Future Roadmap" },
  { id: "detailed-repositories", label: "Detailed Repos" },
];

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState("intro");
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    docSections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80; // offset for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setMobileTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EB] text-[#111111] font-sans antialiased">
      {/* Brand Navigation */}
      <LandingNavbar />

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        
        {/* Header Block */}
        <div className="border-b border-slate-200/80 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black font-outfit tracking-tight flex items-center gap-2">
              SastaLMS <span className="bg-[#FFE700] text-[#111111] text-xs font-black px-2 py-0.5 rounded-md border border-[#E6CF00]/30 shadow-sm font-mono tracking-widest uppercase">System Specs</span>
            </h1>
            <p className="text-sm text-slate-500 font-semibold max-w-xl">
              Complete architectural documentation, event-driven video engineering pipelines, and security layers of the SastaLMS platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://github.com/joydipbag27/veoLMS-frontend-react"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 text-[#111111] text-xs font-bold font-outfit px-3 py-2 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Code size={13} />
              Frontend Repo <ExternalLink size={11} />
            </a>
            <a
              href="https://github.com/joydipbag27/sastaLMS-backend"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 text-[#111111] text-xs font-bold font-outfit px-3 py-2 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Server size={13} />
              Backend Repo <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Responsive Mobile TOC Trigger */}
        <div className="lg:hidden mb-4 sticky top-[68px] z-30 bg-[#F6F4EB] py-2 border-b border-slate-200/40">
          <button
            onClick={() => setMobileTocOpen(!mobileTocOpen)}
            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs font-bold text-slate-700 shadow-sm"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-600 font-outfit">
              <BookOpen size={14} className="text-[#998A00]" /> Table of Contents
            </span>
            <span className="text-[#998A00] flex items-center gap-1 font-mono uppercase">
              {docSections.find((s) => s.id === activeSection)?.label}
              {mobileTocOpen ? <X size={14} /> : <Menu size={14} />}
            </span>
          </button>

          {mobileTocOpen && (
            <div className="bg-white border border-slate-200 rounded-lg mt-1 p-2 shadow-lg max-h-60 overflow-y-auto space-y-1 z-30 relative animate-zoom-in-95 font-outfit">
              {docSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleScrollTo(sec.id)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-md font-semibold transition-all flex items-center justify-between ${
                    activeSection === sec.id
                      ? "bg-[#FFE700]/10 text-[#998A00] border-l-4 border-[#FFE700]"
                      : "text-slate-655 hover:bg-slate-50"
                  }`}
                >
                  {sec.label}
                  {activeSection === sec.id && <Check size={11} className="stroke-[3]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sticky left sidebar: Desktop Only */}
          <nav className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[80vh] overflow-y-auto pr-4 border-r border-slate-200/50 space-y-1 select-none font-outfit">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-3 mb-3 font-mono">Documentation Sections</h3>
            {docSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleScrollTo(sec.id)}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg font-bold transition-all flex items-center justify-between ${
                  activeSection === sec.id
                    ? "bg-[#FFE700] text-[#111111] shadow-sm"
                    : "text-slate-600 hover:text-[#111111] hover:bg-slate-200/40"
                }`}
              >
                {sec.label}
                {activeSection === sec.id && <Check size={11} className="stroke-[3]" />}
              </button>
            ))}
          </nav>

          {/* Main docs content panels */}
          <main className="col-span-1 lg:col-span-9 space-y-12">
            
            {/* 1. Introduction */}
            <section id="intro" className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase">1. Introduction</h2>
              <div className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed space-y-3">
                <p>
                  <strong>SastaLMS</strong> is an production-ready, open-source Learning Management System architected for self-hosters, content creators, and independent educators who seek absolute ownership over their media pipeline without incurring high platform subscription overheads.
                </p>
                <p>
                  The platform is built on two primary structural paths—an automated, enterprise-ready **AWS MediaConvert** workflow and a low-cost, fully serverless **Manual Ingestion** local FFmpeg encoder—allowing complete deployment flexibility depending on budget constraints and hosting environments.
                </p>
              </div>
            </section>

            {/* 2. Core Features */}
            <section id="features" className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase">2. Core Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold leading-relaxed text-slate-600">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-black text-slate-800">Secure Playback Protection</h4>
                  <p className="text-[11px] text-slate-500">Short-lived HMAC playback signatures protect variant HLS manifest files, preventing content piracy and hotlinking.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-black text-slate-800">Adaptive Video streaming</h4>
                  <p className="text-[11px] text-slate-500">Video streaming automatically adjusts between 360p and 720p renditions dynamically to fit local bandwidth rates.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-black text-slate-800">Resume Learning Engine</h4>
                  <p className="text-[11px] text-slate-500">Automatically tracks the student's current timestamp offset and resumes lessons where they left off.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-1.5">
                  <h4 className="font-black text-slate-800">Creator Dashboards & Analytics</h4>
                  <p className="text-[11px] text-slate-500">Robust revenue graphs, transaction history, student promote logs, and course management wizards for creators.</p>
                </div>
              </div>
            </section>

            {/* 3. System Topology */}
            <section id="architecture" className="space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase pl-1">3. System Topology</h2>
              <ArchitectureDiagram />
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-600 leading-relaxed">
                <p>
                  SastaLMS achieves high scalability by offloading high-bandwidth video storage and delivery tasks from the Express backend API. Raw user-facing pages are rendered by the client, session metadata is validated against the MongoDB cluster, and encrypted video segments are streamed securely through Cloudflare Workers connected directly to Backblaze B2.
                </p>
              </div>
            </section>

            {/* 4. Backend Architecture */}
            <section id="backend" className="space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase pl-1">4. Backend Architecture</h2>
              <BackendArchitecture />
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-slate-600">
                <div className="text-xs font-semibold leading-relaxed space-y-3">
                  <h3 className="text-sm font-bold text-slate-850">Application Logic Coordination</h3>
                  <p>
                    The SastaLMS backend functions as the centralized domain orchestrator of the entire platform. Rather than performing simple database operations, it hosts custom middleware, handles multi-provider authentication strategies, validates content scopes, triggers serverless transcoder jobs, coordinates file transfers, and processes webhooks.
                  </p>
                </div>

                {/* API Domains Section */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono mb-3">API Domain Route Groups</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <p className="font-bold text-slate-800">/auth</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Handles email registration, login verification, Google OAuth setups, and cookie invalidation.</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <p className="font-bold text-slate-800">/course</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Manages course setups, publishing states, pricing in INR, and creator ownership filters.</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <p className="font-bold text-slate-800">/classroom</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Serves curriculum index, lesson metadata, and signed playbacks to authenticated students.</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                      <p className="font-bold text-slate-800">/payment</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Processes Razorpay order generation, verifies signatures, and maps successful transactions to database logs.</p>
                    </div>
                  </div>
                </div>

                {/* Reliability & Recovery Section */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <h4 className="text-xs font-black text-[#998A00] uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Backend Reliability & Recovery Engine
                  </h4>
                  <p className="text-xs font-semibold leading-relaxed">
                    Media processing employs an explicit state machine: <code>UPLOADED</code> → <code>PROCESSING</code> → <code>COPY_PENDING</code> → <code>READY</code>/<code>FAILED</code>. 
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed pl-1 border-l-2 border-slate-200">
                    If an EventBridge network drop or S3-to-B2 transfer fails, the media status enters <code>COPY_PENDING</code>. The backend logs the failed files and provides a retry/repair endpoint. This allows creators to manually re-run parallel rclone sync operations to B2 and confirm playlists presence without re-paying for expensive AWS MediaConvert transcodes. Finalization verifies manifest syntax prior to deleting intermediate S3 uploads.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <a
                    href="https://github.com/joydipbag27/sastaLMS-backend/blob/main/backend_overview.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-700 hover:text-[#998A00] inline-flex items-center gap-1 transition-colors"
                  >
                    <FileText size={13} /> View Backend Overview Document <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </section>

            {/* 5. Video Processing Pipeline */}
            <section id="pipeline" className="space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase pl-1">5. Video Processing Pipeline</h2>
              <PipelineFlow />
            </section>

            {/* 6. Learning Flow */}
            <section id="learning" className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase">6. Learning Flow</h2>
              <div className="flex flex-wrap items-center gap-2 font-outfit select-none">
                {["Discover", "Enroll", "Classroom", "Select Lesson", "Secure Stream", "Track Progress"].map((step, idx) => (
                  <React.Fragment key={step}>
                    <span className="bg-slate-100 border border-slate-200 text-[#111111] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {step}
                    </span>
                    {idx < 5 && <ArrowRight size={13} className="text-slate-400 shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-550 leading-relaxed">
                Students discover course modules on the catalog, buy or enroll in them via Razorpay secure channels, view custom playlists inside the immersive video theater dashboard, select lessons to stream via tokenized HLS playlists, and have their completion states synced in real-time.
              </p>
            </section>

            {/* 7. Authentication & Auth */}
            <section id="auth" className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase">7. Authentication and Access Control</h2>
              <div className="text-xs font-semibold text-slate-600 space-y-4 leading-relaxed">
                
                {/* Auth flow lifecycle */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] text-slate-500 select-none pb-2 border-b border-slate-100">
                  <span>Form Auth / Google OAuth</span>
                  <ArrowRight size={11} className="shrink-0" />
                  <span>connect-mongo Session Creation</span>
                  <ArrowRight size={11} className="shrink-0" />
                  <span>Secure HTTP-only Cookie</span>
                  <ArrowRight size={11} className="shrink-0" />
                  <span>Role check (STUDENT / CREATOR)</span>
                  <ArrowRight size={11} className="shrink-0" />
                  <span>Ownership Gate</span>
                </div>

                <div className="flex gap-2.5">
                  <ShieldCheck size={18} className="text-[#998A00] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Session Security Architecture</p>
                    <p className="text-slate-550 mt-0.5">
                      Uses server-side sessions stored inside the MongoDB cluster via <code>connect-mongo</code>. The session ID is transmitted via a secure, HTTP-only, cookie that cannot be accessed by client-side scripts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <ShieldCheck size={18} className="text-[#998A00] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Role-Based Authorization</p>
                    <p className="text-slate-550 mt-0.5">
                      Enforces strict role segmentation. Accounts are verified as either <code>STUDENT</code> (allowing classroom viewings) or <code>CREATOR</code> (which unlocks course builders, payments dashboards, and learner promote operations). No global system administrators exist.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <ShieldCheck size={18} className="text-[#998A00] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Playback Tokens Security Lifecycle</p>
                    <p className="text-slate-550 mt-0.5">
                      To prevent stream hotlinking or unauthorized sharing, the backend signs a playback URL with a short-lived token utilizing SHA-256 HMAC keys. The Edge Cloudflare Worker decodes this signature to verify parameters (user session, media identity, expiration) prior to piping data from B2 storage.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. Technology Stack */}
            <section id="stack" className="space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase pl-1">8. Technology Stack</h2>
              <TechStack />
            </section>

            {/* 9. Engineering Decisions */}
            <section id="decisions" className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase">9. Engineering Decisions</h2>
              <div className="text-xs font-semibold text-slate-600 space-y-3 leading-relaxed">
                <p>
                  <strong>Why Backblaze B2 instead of AWS S3 for final delivery?</strong> AWS charges high data egress rates ($0.09/GB). Backblaze B2 offers highly cost-efficient egress rates ($0.01/GB), resulting in a significant reduction in bandwidth charges.
                </p>
                <p>
                  <strong>Why Cloudflare Workers for security gate check?</strong> Manifest rewriting (appending authentication tokens to video segment chunks in the `.m3u8` playlist files) is computationally heavy for the Node.js process. Delegating signature verification and rewriting to Cloudflare Workers ensures low-latency delivery.
                </p>
                <p>
                  <strong>Why separating upload bucket and streaming bucket?</strong> Keeping upload buckets separate prevents creators from overwriting verified media, and isolates processing streams from clean delivery files.
                </p>
              </div>
            </section>

            {/* 10. Security Model */}
            <section id="security" className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase">10. Security Model</h2>
              <div className="text-xs font-semibold text-slate-655 space-y-2 leading-relaxed">
                <p>1. <strong>HMAC Signature Verification:</strong> Cloudflare edge worker checks the query param signature key before forwarding requests to the private B2 storage bucket.</p>
                <p>2. <strong>JWT Stateful Authorization:</strong> Backend token expirations automatically terminate active classroom media sessions after one hour.</p>
                <p>3. <strong>Restricted CORS configuration:</strong> S3 upload paths accept only origin requests coming from verified SastaLMS subdomains.</p>
              </div>
            </section>

            {/* 11. Known Limitations */}
            <section id="limitations" className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase">11. Known Limitations</h2>
              <div className="text-xs font-semibold text-slate-600 space-y-2.5 leading-relaxed">
                <div className="flex gap-2">
                  <HelpCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <p><strong>Egress Overload:</strong> Direct media piping from Cloudflare to B2 without edge caching will spike API calls if cache rules are misconfigured.</p>
                </div>
                <div className="flex gap-2">
                  <HelpCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <p><strong>Mobile Fullscreen Stacking:</strong> Native browser controls sometimes override custom Plyr skins when fullscreen is enabled on mobile Safari devices.</p>
                </div>
              </div>
            </section>

            {/* 12. Future Roadmap */}
            <section id="roadmap" className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase">12. Future Roadmap</h2>
              <ul className="text-xs font-semibold text-slate-600 space-y-2 leading-relaxed">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-350 shrink-0" />
                  Multi-language audio track switching inside Plyr players.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-350 shrink-0" />
                  Adaptive Dynamic Bitrate auto-switching updates on high packet loss.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-350 shrink-0" />
                  DRM stream support (Widevine / FairPlay) for highly sensitive learning material.
                </li>
              </ul>
            </section>

            {/* 13. Detailed Repos */}
            <section id="detailed-repositories" className="space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-800 uppercase pl-1">13. Detailed Repositories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-outfit select-none text-[#111111]">
                
                {/* Frontend Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[180px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Code size={16} className="text-[#998A00]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Frontend Client SPA</span>
                    </div>
                    <ul className="text-[11px] text-slate-500 space-y-1.5">
                      <li>• Vite + React SPA client structure</li>
                      <li>• Playback component with custom Plyr wrappers</li>
                      <li>• Creator dashboards, earnings logs, and settings</li>
                      <li>• CSS transitions, Tailwind templates, & responsive menus</li>
                    </ul>
                  </div>
                  <a
                    href="https://github.com/joydipbag27/veoLMS-frontend-react"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 bg-slate-900 border border-slate-800 text-white text-[11px] font-bold py-2 rounded-lg hover:bg-slate-800 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    View Frontend Repository <ExternalLink size={11} />
                  </a>
                </div>

                {/* Backend Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[180px]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Server size={16} className="text-[#998A00]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Express API Engine</span>
                    </div>
                    <ul className="text-[11px] text-slate-500 space-y-1.5">
                      <li>• Express.js APIs, middleware scopes, and MongoDB</li>
                      <li>• Razorpay webhooks and S3 uploads integration</li>
                      <li>• AWS Elemental transcode orchestrations</li>
                      <li>• B2 verification, playback signatures, and rclone copies</li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <a
                      href="https://github.com/joydipbag27/sastaLMS-backend"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-900 border border-slate-800 text-white text-[11px] font-bold py-2 rounded-lg hover:bg-slate-800 text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      View Backend Repository <ExternalLink size={11} />
                    </a>
                    
                    {/* Inline deep documents links */}
                    <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-500 pt-1 border-t border-slate-100 mt-1">
                      <a
                        href="https://github.com/joydipbag27/sastaLMS-backend/blob/main/backend_overview.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#998A00] inline-flex items-center gap-1"
                      >
                        <FileText size={11} /> Backend Overview Spec <ExternalLink size={8} />
                      </a>
                      <a
                        href="https://github.com/joydipbag27/sastaLMS-backend/blob/main/Media_Pipeline_Architecture.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#998A00] inline-flex items-center gap-1"
                      >
                        <FileText size={11} /> Media Pipeline Doc <ExternalLink size={8} />
                      </a>
                      <a
                        href="https://github.com/joydipbag27/sastaLMS-backend/blob/main/Manual_Media_Pipeline_Guide.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#998A00] inline-flex items-center gap-1"
                      >
                        <FileText size={11} /> Manual Ingestion Guide <ExternalLink size={8} />
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </section>

          </main>

        </div>

      </div>

      {/* Brand Footer */}
      <LandingFooter />
    </div>
  );
};

export default DocsPage;
