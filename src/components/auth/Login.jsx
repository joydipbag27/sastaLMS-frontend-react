import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Input from "../common/Input";
import Button from "../common/Button";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleToken, setGoogleToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await makeRequest("/user/login", {
      method: "POST",
      body: { email, password },
    });
    setLoading(false);
    if (res.success) {
      setPassword("");
      onLoginSuccess();
    } else {
      setError(res.data?.error || "Login failed");
    }
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGoogleLoading(true);
    const res = await makeRequest("/auth/google", {
      method: "POST",
      body: { idToken: googleToken },
    });
    setGoogleLoading(false);
    if (res.success) {
      setGoogleToken("");
      onLoginSuccess();
    } else {
      setError(res.data?.error || "Google login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setGoogleLoading(true);
    const res = await makeRequest("/auth/google", {
      method: "POST",
      body: { idToken: credentialResponse.credential },
    });
    setGoogleLoading(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.data?.error || "Google OAuth sign-in failed");
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In failed or was cancelled.");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Standard Login" subtitle="Authenticate with email & password">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            id="login-email"
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Password"
            id="login-password"
            type="password"
            required
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-xs text-rose-400 font-bold">{error}</div>}
          <Button type="submit" variant="primary" isLoading={loading} className="w-full">
            Login
          </Button>
        </form>
      </Card>

      <Card title="Google Sign-In" subtitle="Authenticate via Google OAuth or paste ID token">
        {error && <div className="text-xs text-rose-400 font-bold mb-3">{error}</div>}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center bg-slate-900/40 p-4 rounded-lg border border-slate-800/60">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_dark"
              shape="rectangular"
              text="signin_with"
            />
          </div>
          
          <div className="border-t border-slate-800/60 pt-3">
            <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-wider">Manual Token Simulation</p>
            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <textarea
                  id="google-token"
                  required
                  rows={3}
                  placeholder="Or paste mock Google JWT ID token here..."
                  value={googleToken}
                  onChange={(e) => setGoogleToken(e.target.value)}
                  disabled={googleLoading}
                  className="bg-slate-900 border border-slate-700 focus:border-sky-500 focus:ring-sky-500/20 text-slate-100 rounded p-2 text-xs font-mono focus:outline-none focus:ring-2 disabled:opacity-50"
                />
              </div>
              <Button type="submit" variant="secondary" isLoading={googleLoading} className="w-full text-violet-400 border-violet-850 hover:bg-violet-950/20">
                Submit Mock Token
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
