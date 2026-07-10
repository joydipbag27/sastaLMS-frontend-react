import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { makeRequest } from "../../../services/api/apiClient";

const Login = ({ onLoginSuccess, onSwitchToRegister, onSwitchToForgot }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await makeRequest("/user/login", {
        method: "POST",
        body: { email, password },
      });
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.data?.error || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await makeRequest("/auth/google", {
        method: "POST",
        body: { idToken: credentialResponse.credential },
      });
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.data?.error || "Google authentication failed");
      }
    } catch (err) {
      setError(err.message || "Google authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-600">
          <LogIn size={20} className="stroke-[2.5]" />
        </div>
      </div>

      <div className="text-center space-y-1 mb-5">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Welcome Back!
        </h1>
        <p className="text-xs font-semibold text-slate-450">
          Login to continue to veoLMS
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 animate-shake">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-3">
        <div className="space-y-1.5">
          <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-xs font-extrabold text-indigo-650 hover:text-indigo-700 transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer mt-3 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>

      <div className="relative my-4 text-center">
        <div className="absolute inset-y-1/2 left-0 right-0 border-t border-slate-200"></div>
        <span className="relative z-10 px-3 bg-white text-[9px] font-black text-slate-400 uppercase tracking-wider">
          or continue with
        </span>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          shape="pill"
          theme="filled_blue"
          text="continue_with"
          onError={() => setError("Google Sign-In failed")}
        />
      </div>

      <div className="text-xs font-semibold text-slate-500 text-center mt-5">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-indigo-650 hover:text-indigo-700 font-bold hover:underline transition-colors cursor-pointer"
        >
          Register here
        </button>
      </div>
    </>
  );
};

export default Login;
