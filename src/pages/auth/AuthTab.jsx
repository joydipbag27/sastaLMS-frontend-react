import React, { useState } from "react";
import Login from "../../features/auth/components/Login";
import SignUp from "../../features/auth/components/SignUp";
import ForgotPassword from "../../features/auth/components/ForgotPassword";

const AuthTab = ({ onLoginSuccess }) => {
  const [subTab, setSubTab] = useState("login");

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1.5 bg-slate-100/60 p-1 rounded-xl mb-5">
        <button
          onClick={() => setSubTab("login")}
          className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all duration-200 ${
            subTab === "login"
              ? "bg-white text-indigo-650 shadow-sm border border-slate-200/80"
              : "text-slate-450 hover:text-slate-650"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setSubTab("signup")}
          className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all duration-200 ${
            subTab === "signup"
              ? "bg-white text-indigo-650 shadow-sm border border-slate-200/80"
              : "text-slate-450 hover:text-slate-650"
          }`}
        >
          Create Account
        </button>
        <button
          onClick={() => setSubTab("forgot")}
          className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all duration-200 ${
            subTab === "forgot"
              ? "bg-white text-indigo-650 shadow-sm border border-slate-200/80"
              : "text-slate-450 hover:text-slate-650"
          }`}
        >
          Reset Password
        </button>
      </div>

      <div className="flex-1">
        {subTab === "login" && (
          <Login
            onLoginSuccess={onLoginSuccess}
            onSwitchToRegister={() => setSubTab("signup")}
            onSwitchToForgot={() => setSubTab("forgot")}
          />
        )}
        {subTab === "signup" && (
          <SignUp
            onSignUpSuccess={() => setSubTab("login")}
            onSwitchToLogin={() => setSubTab("login")}
          />
        )}
        {subTab === "forgot" && (
          <ForgotPassword
            onResetSuccess={() => setSubTab("login")}
            onBackToLogin={() => setSubTab("login")}
          />
        )}
      </div>
    </div>
  );
};

export default AuthTab;
