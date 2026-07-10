import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { makeRequest } from "../../../services/api/apiClient";

const SignUp = ({ onSignUpSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async () => {
    if (!email) {
      setOtpError("Please enter email address first");
      return;
    }
    setOtpError(null);
    setOtpLoading(true);
    try {
      const res = await makeRequest("/auth/send-otp", {
        method: "POST",
        body: { email, purpose: "REGISTER" },
      });
      if (res.success) {
        setOtpSent(true);
        setCooldown(60);
      } else {
        setOtpError(res.data?.error || "Failed to send OTP code");
      }
    } catch (err) {
      setOtpError(err.message || "Failed to send OTP code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setOtpError("Please enter OTP code");
      return;
    }
    setOtpError(null);
    setOtpLoading(true);
    try {
      const res = await makeRequest("/auth/verify-otp", {
        method: "POST",
        body: { email, otp: otpCode, purpose: "REGISTER" },
      });
      if (res.success) {
        setIsEmailVerified(true);
      } else {
        setOtpError(res.data?.error || "Invalid OTP code");
      }
    } catch (err) {
      setOtpError(err.message || "Invalid OTP code");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isEmailVerified) {
      setError("Please verify your email first");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await makeRequest("/user/register", {
        method: "POST",
        body: { username, email, password },
      });
      if (res.success) {
        if (onSignUpSuccess) onSignUpSuccess();
      } else {
        setError(res.data?.error || "Registration failed");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
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
        if (onSignUpSuccess) onSignUpSuccess();
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
      <div className="flex justify-center mb-2">
        <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center text-indigo-600">
          <UserPlus size={18} className="stroke-[2.5]" />
        </div>
      </div>

      <div className="text-center space-y-1 mb-3">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Create Account
        </h1>
        <p className="text-xs font-semibold text-slate-450">
          Register to get started on veoLMS
        </p>
      </div>

      {error && (
        <div className="mb-3 p-3 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 animate-shake">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User size={16} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full pl-12 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
              required
              disabled={isEmailVerified}
            />
          </div>
        </div>

        <div className="space-y-1">
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
              className="w-full pl-12 pr-[80px] py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
              required
              disabled={otpSent || isEmailVerified}
            />
            {!isEmailVerified && !otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading}
                className="absolute inset-y-1.5 right-2 px-3 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-650 font-extrabold text-[10px] rounded-lg transition-all cursor-pointer flex items-center justify-center"
              >
                {otpLoading ? <Loader2 size={12} className="animate-spin" /> : "Verify"}
              </button>
            )}
            {isEmailVerified && (
              <div className="absolute inset-y-0 right-3 flex items-center text-emerald-500 font-extrabold text-xs">
                <CheckCircle2 size={16} className="mr-1" />
                Verified
              </div>
            )}
          </div>
        </div>

        {!isEmailVerified && otpSent && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2.5 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-650 tracking-wide uppercase">
                Email Verification
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode("");
                  setOtpError(null);
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Change Email
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={14} />
                </div>
                <input
                  type="number"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800 tracking-wider placeholder-slate-400 outline-none text-xs transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {otpError && (
              <p className="text-[10px] font-bold text-rose-500">{otpError}</p>
            )}

            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpLoading}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-sm text-xs transition-all cursor-pointer flex items-center justify-center"
              >
                {otpLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : "Confirm Code"}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={cooldown > 0 || otpLoading}
                className="py-2 px-3 border border-slate-250 hover:bg-slate-50 text-slate-650 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend"}
              </button>
            </div>
          </div>
        )}

        {isEmailVerified && (
          <div className="space-y-2 animate-fade-in">
            <div className="space-y-1">
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
                  placeholder="Create a password"
                  className="w-full pl-12 pr-12 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm"
                  required
                  minLength="6"
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

            <div className="space-y-1">
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-12 pr-12 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer mt-3 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </div>
        )}
      </form>

      <div className="relative my-2.5 text-center">
        <div className="absolute inset-y-1/2 left-0 right-0 border-t border-slate-200"></div>
        <span className="relative z-10 px-3 bg-white text-[9px] font-black text-slate-400 uppercase tracking-wider">
          or continue with
        </span>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          shape="pill"
          text="continue_with"
          theme="filled_blue"
          onError={() => setError("Google Sign-In failed")}
        />
      </div>

      <div className="text-xs font-semibold text-slate-500 text-center mt-3">
        Already have an account?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-indigo-650 hover:text-indigo-700 font-bold hover:underline transition-colors cursor-pointer"
        >
          Login here
        </button>
      </div>
    </>
  );
};

export default SignUp;
