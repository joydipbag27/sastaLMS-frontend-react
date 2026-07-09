import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Settings, LogOut, Search, User } from "lucide-react";
import { makeRequest } from "../../services/api/apiClient";

const StudentLayout = ({ profile, onLogout, children }) => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await makeRequest("/user/logout", { method: "POST" });
    onLogout();
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Explore Catalog", path: "/courses", icon: Search },
    { name: "My Learning", path: "/my-learning", icon: BookOpen },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col text-slate-800 font-sans">
      {/* Top Header Navbar */}
      <header className="sticky top-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sm:px-8 shadow-sm z-30 shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/courses" className="text-2xl font-black text-indigo-650 tracking-tight flex items-center gap-2">
            veoLMS
          </Link>
          <span className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-outfit hidden sm:inline">
            STUDENT
          </span>
          
          {/* Horizontal Navbar Navigation Links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-semibold text-xs ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                  <span className="hidden md:inline">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile Dropdown Area */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all select-none"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-700 leading-tight">{profile?.username}</div>
              <div className="text-[9px] text-slate-400 font-medium">{profile?.email}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-650 flex items-center justify-center font-bold text-xs">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 sm:hidden">
                <div className="text-xs font-bold text-slate-800">{profile?.username}</div>
                <div className="text-[9px] text-slate-400 truncate">{profile?.email}</div>
              </div>
              <Link 
                to="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <User size={14} className="text-slate-400" />
                <span>My Settings</span>
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/50 transition-colors border-t border-slate-50 mt-1"
              >
                <LogOut size={14} className="text-rose-450" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Page Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8F9FD] w-full">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
