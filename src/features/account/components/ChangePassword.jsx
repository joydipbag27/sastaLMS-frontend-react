import React, { useState } from "react";
import { makeRequest } from "../../../services/api/apiClient";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import StepFlow from "../../../components/shared/StepFlow";

const ChangePassword = ({ email, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Change Password
  const [otp, setOtp] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    const res = await makeRequest("/auth/send-otp", {
      method: "POST",
      body: { email, purpose: "CHANGE_PASSWORD" },
    });
    setLoading(false);
    if (res.success) {
      setMessage(`OTP code sent to your email: ${email}`);
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
      body: { email, otp, purpose: "CHANGE_PASSWORD" },
    });
    setLoading(false);
    if (res.success) {
      setMessage("OTP verified successfully! Now fill in your old and new password.");
      setStep(3);
    } else {
      setError(res.data?.error || "OTP verification failed");
    }
  };

  const handleChangePass = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const res = await makeRequest("/user/changePassword", {
      method: "PATCH",
      body: { oldPassword, newPassword },
    });
    setLoading(false);
    if (res.success) {
      alert("Password changed successfully! You have been logged out.");
      onSuccess();
    } else {
      setError(res.data?.error || "Failed to change password");
    }
  };

  return (
    <Card title="Change Password" subtitle="Update account password (requires old password)">
      <StepFlow currentStep={step} />

      {error && <div className="text-xs text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded border border-rose-900/40 mb-3">{error}</div>}
      {message && <div className="text-xs text-emerald-400 font-bold bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40 mb-3">{message}</div>}

      {step === 1 && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded border border-slate-800">
            For security, we will send an OTP verification email to your registered address: <span className="text-sky-300 font-bold">{email}</span>
          </div>
          <Button onClick={handleSendOtp} variant="primary" isLoading={loading} className="w-full">
            Send Change Password OTP
          </Button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="Verification OTP"
            id="change-otp"
            type="text"
            required
            maxLength={6}
            placeholder="Enter the 6-digit OTP code"
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
        <form onSubmit={handleChangePass} className="space-y-4">
          <Input
            label="Old Password"
            id="change-old-password"
            type="password"
            required
            placeholder="Enter current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={loading}
          />
          <Input
            label="New Password"
            id="change-new-password"
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
              Update Password
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default ChangePassword;
