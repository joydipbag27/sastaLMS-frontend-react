import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Settings, LogOut, Search } from "lucide-react";
import { makeRequest } from "../../apiClient";

const StudentLayout = ({ profile, onLogout, children }) => {
  const location = useLocation();

  const handleLogout = async () => {
    await makeRequest("/user/logout", { method: "POST" });
    onLogout();
  };

  const navLinks = [
    { name: "My Learning", path: "/dashboard/courses", icon: BookOpen },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <h1 className="text-2xl font-black text-sky-600 tracking-tight">veoLMS</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold ${
                  isActive 
                    ? "bg-sky-50 text-sky-700 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={20} className={isActive ? "text-sky-600" : "text-slate-400"} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors font-semibold"
          >
            <LogOut size={20} className="text-slate-400 group-hover:text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-0">
          <div className="flex items-center gap-4 flex-1">
             {/* Mobile logo placeholder */}
             <h1 className="md:hidden text-xl font-black text-sky-600 tracking-tight">veoLMS</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-800">{profile?.username}</div>
              <div className="text-xs text-slate-500 font-medium">Student</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold border-2 border-sky-200">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
