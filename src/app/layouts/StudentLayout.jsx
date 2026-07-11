import React from "react";
import AppNavbar from "../../components/shared/AppNavbar";

const StudentLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col text-slate-800 font-sans">
      <AppNavbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
