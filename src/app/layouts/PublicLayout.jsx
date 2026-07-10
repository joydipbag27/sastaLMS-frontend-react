import React from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import Button from "../../components/ui/Button";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col text-slate-800 font-sans">
      <header className="sticky top-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/courses" className="flex items-center gap-2">
            <h1 className="text-xl font-black text-indigo-650 tracking-tight">veoLMS</h1>
          </Link>
          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
            Course Catalog
          </span>
        </div>
        <div>
          <Link to="/login">
            <Button variant="primary" className="py-1.5 px-3 text-xs flex items-center gap-1.5">
              <LogIn size={14} />
              Sign In
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;
