import React from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import Button from "../../components/ui/Button";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-slate-200 font-sans">
      <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/courses">
            <h1 className="text-2xl font-black text-sky-500 tracking-tight">veoLMS</h1>
          </Link>
          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider hidden sm:block">
            Course Catalog
          </span>
        </div>
        <div>
          <Link to="/login">
            <Button variant="primary" className="py-1.5 px-4 flex items-center gap-2">
              <LogIn size={16} />
              Sign In
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0b1120]">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default PublicLayout;
