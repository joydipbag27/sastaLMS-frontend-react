import { useState } from "react";
import { makeRequest } from "../../../services/api/apiClient";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import StepFlow from "../../../components/shared/StepFlow";
import { ShieldCheck, KeyRound, Lock } from "lucide-react";

const ChangePassword = ({ email, onSuccess }) => {
  const [step, setStep] = useState(1);
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
    <Card>
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <KeyRound size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-outfit text-slate-800">Change Password</h3>
            <p className="text-[11px] text-slate-400">Update your account password</p>
          </div>
        </div>

        <StepFlow currentStep={step} />

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
            <ShieldCheck size={14} className="shrink-0" />
            {error}
          </div>
        )}
        {message && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <ShieldCheck size={14} className="shrink-0" />
            {message}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              For security, we will send a verification code to{" "}
              <span className="text-brand-600 font-bold">{email}</span>
            </div>
            <Button onClick={handleSendOtp} variant="primary" isLoading={loading} className="w-full">
              Send Verification Code
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input
              label="Verification Code"
              id="change-otp"
              type="text"
              required
              maxLength={6}
              placeholder="Enter the 6-digit code"
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
                Verify Code
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleChangePass} className="space-y-4">
            <Input
              label="Current Password"
              id="change-old-password"
              type="password"
              required
              placeholder="Enter your current password"
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
                <Lock size={14} />
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
};

export default ChangePassword;
