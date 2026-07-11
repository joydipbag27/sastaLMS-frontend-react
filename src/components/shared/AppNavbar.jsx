import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { makeRequest } from "../../services/api/apiClient";
import Button from "../ui/Button";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  User,
  CreditCard,
  Search,
  LogIn
} from "lucide-react";

const AppNavbar = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await makeRequest("/user/logout", { method: "POST" });
    if (logout) logout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCreator = profile?.role === "CREATOR";
  const isStudent = profile?.role === "STUDENT";

  // Centralized navigation items schema
  const navLinks = isCreator
    ? [
        { name: "Explore Catalog", path: "/courses", icon: LayoutDashboard },
        { name: "Payments", path: "/my-learning", icon: CreditCard },
        { name: "Users & Stats", path: "/creator/users", icon: Users },
        { name: "Course Manager", path: "/creator/courses", icon: BookOpen },
        { name: "Settings", path: "/creator/settings", icon: Settings },
      ]
    : isStudent
      ? [
          { name: "Explore Catalog", path: "/courses", icon: Search },
          { name: "My Learning", path: "/my-learning", icon: BookOpen },
          { name: "Settings", path: "/dashboard/settings", icon: Settings },
        ]
      : [
          { name: "Explore Catalog", path: "/courses", icon: Search },
        ];

  const isActive = (path) => {
    if (path === "/courses") return location.pathname.startsWith("/courses");
    if (path === "/my-learning") return location.pathname.startsWith("/my-learning");
    return location.pathname === path || (path !== "/courses" && path !== "/my-learning" && location.pathname.startsWith(path + "/"));
  };

  const settingsPath = isCreator ? "/creator/settings" : "/dashboard/settings";

  return (
    <header className="sticky top-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0 select-none">
      <div className="flex items-center gap-6">
        <Link to="/courses" className="text-xl font-black text-indigo-650 tracking-tight flex items-center gap-2">
          veoLMS
        </Link>
        {isCreator && (
          <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-outfit hidden sm:inline">
            STUDIO
          </span>
        )}
        {isStudent && (
          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-outfit hidden sm:inline">
            STUDENT
          </span>
        )}
        {!profile && (
          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
            Course Catalog
          </span>
        )}

        <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                to={link.path}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 font-semibold text-xs ${
                  active
                    ? "bg-indigo-650 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                <Icon size={14} className={active ? "text-white" : "text-slate-400"} />
                <span className="hidden md:inline">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {profile ? (
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-150 select-none"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-700 leading-tight">{profile.username}</div>
              <div className="text-[10px] text-slate-400 font-medium">{profile.email}</div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
              isCreator
                ? "bg-amber-50 border border-amber-100 text-amber-600"
                : "bg-indigo-50 border border-indigo-100 text-indigo-650"
            }`}>
              {profile.username?.charAt(0).toUpperCase()}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1 z-30 animate-zoom-in-95" role="menu">
              <div className="px-3 py-2 border-b border-slate-100 sm:hidden">
                <div className="text-xs font-bold text-slate-800">{profile.username}</div>
                <div className="text-[10px] text-slate-400 truncate">{profile.email}</div>
              </div>
              <Link
                to={settingsPath}
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                role="menuitem"
              >
                <User size={14} className="text-slate-400" />
                <span>{isCreator ? "Studio Settings" : "My Settings"}</span>
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
                role="menuitem"
              >
                <LogOut size={14} className="text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Link to="/login">
            <Button variant="primary" className="py-1.5 px-3 text-xs flex items-center gap-1.5">
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
