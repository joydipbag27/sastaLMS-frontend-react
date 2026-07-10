import React, { useState } from "react";
import { makeRequest } from "../../../services/api/apiClient";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

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
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div>
            <span className="text-slate-500 text-xs block mb-1">Username</span>
            <span className="text-slate-800 font-bold">{profile.username}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1">Email Address</span>
            <span className="text-slate-700 font-mono text-xs">{profile.email}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1">Role Assignment</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
              profile.role === "ADMIN" ? "bg-rose-50 text-rose-600 border-rose-200" :
              profile.role === "CREATOR" ? "bg-indigo-50 text-indigo-600 border-indigo-200" :
              "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              {profile.role || "User"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block mb-1">Password Status</span>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
              profile.isPassAvailable
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-amber-50 text-amber-600 border-amber-200"
            }`}>
              {profile.isPassAvailable ? "Password Set" : "Google Sign-In Only"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <Button onClick={handleLogout} variant="secondary" isLoading={loading} className="flex-1 min-w-[140px]">
            Sign Out
          </Button>
          <Button onClick={handleLogoutAll} variant="danger" isLoading={killLoading} className="flex-1 min-w-[140px]">
            Sign Out All Devices
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
