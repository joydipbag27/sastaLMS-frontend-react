import React, { useState } from "react";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Input from "../common/Input";
import Button from "../common/Button";
import StepFlow from "../common/StepFlow";

const ForgotPassword = ({ onResetSuccess }) => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const res = await makeRequest("/auth/send-otp", {
      method: "POST",
      body: { email, purpose: "FORGOT_PASSWORD" },
    });
    setLoading(false);
    if (res.success) {
      setMessage(res.data?.message || `OTP sent to ${email}`);
      setStep(2);
    } else {
      setError(res.data?.error || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const res = await makeRequest("/auth/verify-otp", {
      method: "POST",
      body: { email, otp, purpose: "FORGOT_PASSWORD" },
    });
    setLoading(false);
    if (res.success) {
      setMessage("OTP verified successfully! You can now reset your password.");
      setStep(3);
    } else {
      setError(res.data?.error || "OTP verification failed");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const res = await makeRequest("/user/forgotPassword", {
      method: "POST",
      body: { email, newPassword },
    });
    setLoading(false);
    if (res.success) {
      alert("Password updated successfully! Please log in with your new password.");
      setEmail("");
      setOtp("");
      setNewPassword("");
      setStep(1);
      if (onResetSuccess) onResetSuccess();
    } else {
      setError(res.data?.error || "Failed to reset password");
    }
  };

  return (
    <Card title="Reset Password" subtitle="Recover access via secure email OTP">
      <StepFlow currentStep={step} />

      {error && <div className="text-xs text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded border border-rose-900/40 mb-3">{error}</div>}
      {message && <div className="text-xs text-emerald-400 font-bold bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40 mb-3">{message}</div>}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            label="Account Email"
            id="forgot-email"
            type="email"
            required
            placeholder="enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" variant="primary" isLoading={loading} className="w-full">
            Send Reset OTP
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800 text-xs text-slate-400 mb-2">
            Sending reset code to: <span className="text-sky-300 font-bold">{email}</span>
          </div>
          <Input
            label="Verification Code"
            id="forgot-otp"
            type="text"
            required
            maxLength={6}
            placeholder="Enter 6-digit OTP code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(1)}
              disabled={loading}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" variant="success" isLoading={loading} className="flex-1">
              Verify OTP
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800 text-xs text-slate-400 mb-2">
            Resetting password for: <span className="text-sky-300 font-bold">{email}</span>
          </div>
          <Input
            label="New Password"
            id="forgot-new-password"
            type="password"
            required
            placeholder="Enter new password (min 8 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep(2)}
              disabled={loading}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" variant="success" isLoading={loading} className="flex-1">
              Reset Password
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default ForgotPassword;
