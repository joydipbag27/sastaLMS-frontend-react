import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Button from "../ui/Button";
import ProfilePanel from "./ProfilePanel";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  Search,
  LogIn,
} from "lucide-react";

const AppNavbar = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const triggerRef = useRef(null);

  const isCreator = profile?.role === "CREATOR";
  const isStudent = profile?.role === "STUDENT";

  const navLinks = isCreator
    ? [
      { name: "Explore Catalog", path: "/courses", icon: LayoutDashboard },
      { name: "Payments", path: "/creator/payments", icon: CreditCard },
      { name: "Users & Stats", path: "/creator/users", icon: Users },
      { name: "Course Manager", path: "/creator/courses", icon: BookOpen },
    ]
    : isStudent
      ? [
        { name: "Explore Catalog", path: "/courses", icon: Search },
        { name: "My Learning", path: "/my-learning", icon: BookOpen },
      ]
      : [{ name: "Explore Catalog", path: "/courses", icon: Search }];

  const isActive = (path) => {
    if (path === "/courses") return location.pathname.startsWith("/courses");
    if (path === "/my-learning")
      return location.pathname.startsWith("/my-learning");
    if (path === "/creator/payments")
      return location.pathname.startsWith("/creator/payments");
    return (
      location.pathname === path ||
      (path !== "/courses" &&
        path !== "/my-learning" &&
        path !== "/creator/payments" &&
        location.pathname.startsWith(path + "/"))
    );
  };

  return (
    <header className="sticky top-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0 select-none">
      <div className="flex items-center gap-6">
        <Link
          to="/courses"
          className="text-2xl font-black text-[#111111] tracking-tight font-outfit flex items-center"
        >
          sasta<span className="bg-[#FFE700] text-[#111111] px-1.5 py-0.5 rounded-lg ml-1 shadow-sm font-black">LMS</span>
        </Link>
        {isCreator && (
          <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-outfit hidden sm:inline">
            STUDIO
          </span>
        )}
        {isStudent && (
          <span className="bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-outfit hidden sm:inline">
            STUDENT
          </span>
        )}
        {!profile && (
          <span className="bg-brand-50 text-brand-600 border border-brand-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
            Course Catalog
          </span>
        )}

        <nav
          className="flex items-center gap-1"
          role="navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                to={link.path}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 font-semibold text-xs ${active
                  ? "bg-brand-200 text-[#111111] shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
              >
                <Icon
                  size={14}
                  className={active ? "text-[#111111]" : "text-slate-400"}
                />
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {profile ? (
        <div className="relative shrink-0">
          <button
            ref={triggerRef}
            onClick={() => setPanelOpen(!panelOpen)}
            aria-expanded={panelOpen}
            aria-haspopup="dialog"
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-700 leading-tight">
                {profile.username}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {profile.email}
              </div>
            </div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isCreator
                ? "bg-amber-50 border border-amber-100 text-amber-600"
                : "bg-brand-50 border border-brand-100 text-brand-200"
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
      ) : (
        <div>
          <Link to="/login">
            <Button
              variant="primary"
              className="py-1.5 px-3 text-xs flex items-center gap-1.5"
            >
              <LogIn size={14} />
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

export default AppNavbar;
