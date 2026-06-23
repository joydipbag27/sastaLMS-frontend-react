import React, { useState } from "react";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Button from "../common/Button";

const ProfileCard = ({ profile, onLogoutSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [killLoading, setKillLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const res = await makeRequest("/user/logout", { method: "POST" });
    setLoading(false);
    if (res.success) {
      onLogoutSuccess();
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm("Are you sure you want to log out from all devices? This will invalidate all active sessions.")) return;
    setKillLoading(true);
    const res = await makeRequest("/user/logoutall", { method: "POST" });
    setKillLoading(false);
    if (res.success) {
      onLogoutSuccess();
    }
  };

  return (
    <Card title="Your Profile" subtitle="Active session details">
      <div className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/40 p-4 rounded-lg border border-slate-800/80">
          <div>
            <span className="text-slate-500 block">Username</span>
            <span className="text-slate-200 font-bold text-sm">{profile.username}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Email Address</span>
            <span className="text-slate-200 font-mono">{profile.email}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Role Assignment</span>
            <span className={`inline-block px-2 py-0.5 mt-1 rounded font-bold text-[10px] uppercase border ${
              profile.role === "Owner" ? "bg-purple-950 text-purple-300 border-purple-800" :
              profile.role === "Admin" ? "bg-rose-950 text-rose-300 border-rose-800" :
              profile.role === "Manager" ? "bg-sky-950 text-sky-300 border-sky-850" :
              "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              {profile.role || "User"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Password Status</span>
            <span className={`inline-block px-2 py-0.5 mt-1 rounded font-bold text-[10px] uppercase border ${
              profile.isPassAvailable
                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                : "bg-amber-950 text-amber-300 border-amber-800"
            }`}>
              {profile.isPassAvailable ? "Password Set" : "Google Sign-In Only"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <Button onClick={handleLogout} variant="secondary" isLoading={loading} className="flex-1 min-w-[140px]">
            Sign Out
          </Button>
          <Button onClick={handleLogoutAll} variant="danger" isLoading={killLoading} className="flex-1 min-w-[140px] text-rose-300 border-rose-800 hover:bg-rose-950/20 bg-rose-950/10">
            Sign Out All Devices
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
