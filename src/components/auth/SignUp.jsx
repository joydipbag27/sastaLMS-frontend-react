import React, { useState } from "react";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Input from "../common/Input";
import Button from "../common/Button";
import StepFlow from "../common/StepFlow";

const SignUp = ({ onSignUpSuccess }) => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Register
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      body: { email, purpose: "REGISTER" },
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
      body: { email, otp, purpose: "REGISTER" },
    });
    setLoading(false);
    if (res.success) {
      setMessage("OTP verified successfully! Now complete your registration details.");
      setStep(3);
    } else {
      setError(res.data?.error || "OTP verification failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const res = await makeRequest("/user/register", {
      method: "POST",
      body: { username, email, password },
    });
    setLoading(false);
    if (res.success) {
      alert("Registration successful! You can now log in.");
      setEmail("");
      setOtp("");
      setUsername("");
      setPassword("");
      setStep(1);
      if (onSignUpSuccess) onSignUpSuccess();
    } else {
      setError(res.data?.error || "Registration failed");
    }
  };

  return (
    <Card title="Register New Account" subtitle="Create a user profile using verified email">
      <StepFlow currentStep={step} />

      {error && <div className="text-xs text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded border border-rose-900/40 mb-3">{error}</div>}
      {message && <div className="text-xs text-emerald-400 font-bold bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40 mb-3">{message}</div>}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            label="Email Address"
            id="register-email"
            type="email"
            required
            placeholder="enter your email (e.g. name@domain.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" variant="primary" isLoading={loading} className="w-full">
            Send Verification OTP
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800 text-xs text-slate-400 mb-2">
            Sending to: <span className="text-sky-300 font-bold">{email}</span>
          </div>
          <Input
            label="Verification OTP"
            id="register-otp"
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
              Verify OTP
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800 text-xs text-slate-400 mb-2">
            Registering Email: <span className="text-sky-300 font-bold">{email}</span>
          </div>
          <Input
            label="Username"
            id="register-username"
            type="text"
            required
            placeholder="Choose username (letters, numbers, _, -, .)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Password"
            id="register-password"
            type="password"
            required
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              Complete Sign Up
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default SignUp;
