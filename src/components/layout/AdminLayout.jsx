import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Users, Image, Settings, LogOut } from "lucide-react";
import { makeRequest } from "../../apiClient";

const AdminLayout = ({ profile, onLogout, children }) => {
  const location = useLocation();

  const handleLogout = async () => {
    await makeRequest("/user/logout", { method: "POST" });
    onLogout();
  };

  const isCreator = profile?.role === "CREATOR" || profile?.role === "ADMIN";
  const isAdmin = profile?.role === "ADMIN";

  const navLinks = [
    isCreator && { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
    isCreator && { name: "Course Creator", path: "/admin/courses", icon: BookOpen },
    isCreator && { name: "Media Manager", path: "/admin/media", icon: Image },
    isAdmin && { name: "RBAC Control", path: "/admin/users", icon: Users },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col hidden md:flex shadow-xl z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <h1 className="text-2xl font-black text-sky-500 tracking-tight flex items-center gap-2">
            veoLMS <span className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-bold uppercase tracking-wider">STUDIO</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          {navLinks.map((link) => {
            const isActive = link.exact 
              ? location.pathname === link.path 
              : location.pathname.startsWith(link.path) && link.path !== "/admin";
              
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold ${
                  isActive 
                    ? "bg-sky-600 text-white shadow-md" 
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-slate-500"} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-slate-400 hover:bg-slate-900 hover:text-rose-400 transition-colors font-semibold"
          >
            <LogOut size={20} className="text-slate-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8 shadow-sm z-0">
          <div className="flex items-center gap-3 flex-1">
             <h1 className="md:hidden text-xl font-black text-sky-500 tracking-tight">veoLMS</h1>
             <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider hidden sm:block">
               {profile?.role}
             </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-200">{profile?.username}</div>
              <div className="text-xs text-slate-500 font-medium">{profile?.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold border border-slate-600 text-slate-300">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0b1120]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
