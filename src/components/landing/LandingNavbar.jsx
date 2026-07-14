import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Button from "../ui/Button";
import ProfilePanel from "../shared/ProfilePanel";
import { Menu, X, BookOpen, LayoutDashboard, LogIn, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const LandingNavbar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerRef = useRef(null);

  // Lock body scroll when mobile menu or profile panel is open
  useEffect(() => {
    const isLocked = mobileMenuOpen || panelOpen;
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, panelOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const isCreator = profile?.role === "CREATOR";
  const isStudent = profile?.role === "STUDENT";

  const handleOpenStudio = () => {
    if (!profile) {
      navigate("/login?returnTo=/creator/courses");
    } else if (isCreator) {
      navigate("/creator/courses");
    } else {
      // If a student tries to open studio, they can see a warning or redirect to courses
      navigate("/courses");
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 w-full bg-[#F6F4EB]/90 backdrop-blur-md border-b border-slate-200/50 z-40 select-none">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-2xl font-black text-[#111111] tracking-tight font-outfit flex items-center"
          >
            sasta<span className="bg-[#FFE700] text-[#111111] px-1.5 py-0.5 rounded-lg ml-1 shadow-sm font-black">LMS</span>
          </Link>
        </div>

        {/* Center Links - Desktop Only */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Landing page sections">
          <a
            href="#product"
            className="text-sm font-semibold text-slate-600 hover:text-[#111111] transition-colors duration-150"
          >
            Product
          </a>
          <a
            href="#experience"
            className="text-sm font-semibold text-slate-600 hover:text-[#111111] transition-colors duration-150"
          >
            Experience
          </a>
          <a
            href="#creators"
            className="text-sm font-semibold text-slate-600 hover:text-[#111111] transition-colors duration-150"
          >
            For Creators
          </a>
          <a
            href="#architecture"
            className="text-sm font-semibold text-slate-600 hover:text-[#111111] transition-colors duration-150"
          >
            Architecture
          </a>
        </nav>

        {/* Right Actions - Desktop Only */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/courses">
            <motion.div whileHover={{ y: -1.5, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Button
                variant="secondary"
                className="py-2 px-4 text-xs font-bold border-slate-300 hover:bg-slate-100/60"
              >
                Explore Courses
              </Button>
            </motion.div>
          </Link>

          {(!profile || isCreator) && (
            <motion.div whileHover={{ y: -1.5, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Button
                variant="primary"
                onClick={handleOpenStudio}
                className="py-2 px-4 text-xs font-bold bg-[#FFE700] hover:bg-[#FFE700]/85 text-[#111111]"
              >
                Open Studio
              </Button>
            </motion.div>
          )}

          {profile && isStudent && (
            <Link to="/my-learning">
              <motion.div whileHover={{ y: -1.5, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <Button
                  variant="primary"
                  className="py-2 px-4 text-xs font-bold bg-[#FFE700] hover:bg-[#FFE700]/85 text-[#111111]"
                >
                  My Learning
                </Button>
              </motion.div>
            </Link>
          )}

          {/* User Profile dropdown */}
          {profile && (
            <div className="relative shrink-0 border-l border-slate-200 pl-4 ml-1">
              <button
                ref={triggerRef}
                onClick={() => setPanelOpen(!panelOpen)}
                aria-expanded={panelOpen}
                aria-haspopup="dialog"
                className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100/80 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs border ${isCreator
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-[#FFE700]/20 border-[#FFE700]/30 text-slate-800"
                    }`}
                >
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
              </button>

              <ProfilePanel
                isOpen={panelOpen}
                onClose={() => setPanelOpen(false)}
                triggerRef={triggerRef}
              />
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex items-center md:hidden gap-3">
          {profile && (
            <button
              ref={triggerRef}
              onClick={() => {
                setMobileMenuOpen(false);
                setPanelOpen(!panelOpen);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs border bg-[#FFE700]/20 border-[#FFE700]/30 text-slate-800"
              aria-label="Open profile menu"
              aria-expanded={panelOpen}
            >
              {profile.username?.charAt(0).toUpperCase()}
            </button>
          )}
          <button
            onClick={() => {
              setPanelOpen(false);
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden border-t border-slate-200/50 bg-[#F6F4EB] px-6 py-6 space-y-6 shadow-lg animate-slide-in-from-top-4"
          aria-label="Mobile navigation"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-4">
            <a
              href="#product"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-[#111111]"
            >
              Product
            </a>
            <a
              href="#experience"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-[#111111]"
            >
              Experience
            </a>
            <a
              href="#creators"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-[#111111]"
            >
              For Creators
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-700 hover:text-[#111111]"
            >
              Architecture
            </a>
          </div>

          <div className="border-t border-slate-200/80 pt-4 flex flex-col gap-3">
            <Link to="/courses" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="secondary"
                className="w-full py-2.5 text-sm font-bold border-slate-300 bg-white"
              >
                Explore Courses
              </Button>
            </Link>

            {(!profile || isCreator) && (
              <Button
                variant="primary"
                onClick={handleOpenStudio}
                className="w-full py-2.5 text-sm font-bold bg-[#FFE700] hover:bg-[#FFE700]/85 text-[#111111]"
              >
                Open Studio
              </Button>
            )}

            {profile && isStudent && (
              <Link to="/my-learning" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="primary"
                  className="w-full py-2.5 text-sm font-bold bg-[#FFE700] hover:bg-[#FFE700]/85 text-[#111111]"
                >
                  My Learning
                </Button>
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* Hidden container to mount profile panel dropdown on mobile properly */}
      {profile && (
        <ProfilePanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          triggerRef={triggerRef}
        />
      )}
    </header>
  );
};

export default LandingNavbar;
