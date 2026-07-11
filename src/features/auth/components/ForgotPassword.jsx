import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { makeRequest } from "../../../services/api/apiClient";

const ForgotPassword = ({ onResetSuccess, onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await makeRequest("/auth/send-otp", {
        method: "POST",
        body: { email, purpose: "FORGOT_PASSWORD" },
      });
      if (res.success) {
        setStep(2);
        setCooldown(60);
      } else {
        setError(res.data?.error || "Failed to send OTP code");
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await makeRequest("/auth/verify-otp", {
        method: "POST",
        body: { email, otp, purpose: "FORGOT_PASSWORD" },
      });
      if (res.success) {
        setStep(3);
      } else {
        setError(res.data?.error || "Invalid OTP code");
      }
    } catch (err) {
      setError(err.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await makeRequest("/user/forgotPassword", {
        method: "POST",
        body: { email, newPassword },
      });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onResetSuccess) onResetSuccess();
        }, 2000);
      } else {
        setError(res.data?.error || "Failed to reset password");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      await makeRequest("/auth/send-otp", {
        method: "POST",
        body: { email, purpose: "FORGOT_PASSWORD" },
      });
      setCooldown(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center text-brand-200 mx-auto">
          <KeyRound size={20} className="stroke-[2.5]" />
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Forgot Password?</h3>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          {step === 1 && "Enter your email to request a reset code."}
          {step === 2 && `We sent a 6-digit code to ${email}`}
          {step === 3 && "Create a secure new password for your account."}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
            !
          </span>
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-200 focus:ring-1 focus:ring-brand-200 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-200 hover:bg-brand-300 text-[#111111] font-black rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              "Send Code"
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <KeyRound size={16} />
              </div>
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-200 focus:ring-1 focus:ring-brand-200 font-medium text-slate-800 tracking-widest placeholder-slate-400 outline-none text-sm transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-200 hover:bg-brand-300 text-[#111111] font-black rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              "Verify Code"
            )}
          </button>

          <div className="text-center mt-2">
            {cooldown > 0 ? (
              <span className="text-xs font-semibold text-slate-400">
                Resend code in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-xs font-black text-brand-200 hover:text-brand-300 cursor-pointer"
              >
                Resend Verification Code
              </button>
            )}
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          {success ? (
            <div className="text-center py-6 space-y-3 animate-fade-in">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-black text-slate-800">Password Changed Successfully!</h4>
              <p className="text-[10px] text-slate-400 font-bold">You can now login with your new password.</p>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-200 focus:ring-1 focus:ring-brand-200 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm"
                    required
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-200 focus:ring-1 focus:ring-brand-200 font-medium text-slate-800 placeholder-slate-400 outline-none text-sm transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
            className="w-full py-3.5 bg-brand-200 hover:bg-brand-300 text-[#111111] font-black rounded-xl shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 text-sm cursor-pointer flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  "Reset Password"
                )}
              </button>
            </>
          )}
        </form>
      )}

      <div className="text-xs font-semibold text-slate-500 text-center mt-4">
        <button
          onClick={onBackToLogin}
          className="text-brand-200 hover:text-brand-300 font-bold hover:underline transition-colors cursor-pointer inline-flex items-center"
        >
          <ArrowLeft size={14} className="mr-1" />
          Back to Login
        </button>
      </div>
    </>
  );
};

export default ForgotPassword;
