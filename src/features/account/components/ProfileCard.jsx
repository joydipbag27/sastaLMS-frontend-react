import { useState } from "react";
import { makeRequest } from "../../../services/api/apiClient";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { User, Mail, Shield, Lock, LogOut, LogOutIcon } from "lucide-react";

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

  const isCreator = profile.role === "CREATOR";

  return (
    <Card>
      <div className="space-y-5">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
              isCreator
                ? "bg-amber-50 border-2 border-amber-200 text-amber-600"
                : "bg-brand-50 border-2 border-brand-100 text-brand-200"
            }`}
          >
            {profile.username?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-800 truncate">{profile.username}</h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                isCreator
                  ? "bg-amber-50 text-amber-600 border border-amber-100"
                  : "bg-brand-50 text-brand-200 border border-brand-100"
              }`}>
                <Shield size={10} />
                {profile.role}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                profile.isPassAvailable
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-slate-50 text-slate-500 border border-slate-200"
              }`}>
                <Lock size={10} />
                {profile.isPassAvailable ? "Password Set" : "Google Only"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Account Details */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Account Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                <User size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium">Username</p>
                <p className="text-xs font-bold text-slate-700 truncate">{profile.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                <Mail size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-medium">Email</p>
                <p className="text-xs font-bold text-slate-700 truncate font-mono">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <Button
            onClick={handleLogout}
            variant="secondary"
            isLoading={loading}
            className="flex-1 gap-2"
          >
            <LogOut size={14} />
            Sign Out
          </Button>
          <Button
            onClick={handleLogoutAll}
            variant="danger"
            isLoading={killLoading}
            className="flex-1 gap-2"
          >
            <LogOutIcon size={14} />
            Sign Out All Devices
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
