import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-sky-400 tracking-tight">veoLMS</h1>
          <p className="text-slate-400 mt-2 font-medium">Empowering Your Learning Journey</p>
        </div>
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
