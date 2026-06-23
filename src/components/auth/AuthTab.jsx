import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";

const AuthTab = ({ onLoginSuccess }) => {
  const [subTab, setSubTab] = useState("login"); // login | signup | forgot

  return (
    <div className="space-y-6">
      {/* Sub navigation for Auth */}
      <div className="flex gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800/80 max-w-md">
        <button
          onClick={() => setSubTab("login")}
          className={`flex-1 py-1.5 rounded font-bold text-xs transition-all duration-200 ${
            subTab === "login" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setSubTab("signup")}
          className={`flex-1 py-1.5 rounded font-bold text-xs transition-all duration-200 ${
            subTab === "signup" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Create Account
        </button>
        <button
          onClick={() => setSubTab("forgot")}
          className={`flex-1 py-1.5 rounded font-bold text-xs transition-all duration-200 ${
            subTab === "forgot" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Forgot Password
        </button>
      </div>

      <div>
        {subTab === "login" && <Login onLoginSuccess={onLoginSuccess} />}
        {subTab === "signup" && <SignUp onSignUpSuccess={() => setSubTab("login")} />}
        {subTab === "forgot" && <ForgotPassword onResetSuccess={() => setSubTab("login")} />}
      </div>
    </div>
  );
};

export default AuthTab;
