import React from "react";
import ProfileCard from "../../features/account/components/ProfileCard";
import ChangePassword from "../../features/account/components/ChangePassword";
import SetPassword from "../../features/account/components/SetPassword";

const SettingsTab = ({ profile, onLogoutSuccess }) => {
  if (!profile) {
    return (
      <div className="bg-white p-6 text-center border border-slate-200 rounded-xl">
        <p className="text-slate-500 text-sm">Please sign in to view account settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your account profile and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileCard profile={profile} onLogoutSuccess={onLogoutSuccess} />

        {profile.isPassAvailable ? (
          <ChangePassword email={profile.email} onSuccess={onLogoutSuccess} />
        ) : (
          <SetPassword email={profile.email} onSuccess={onLogoutSuccess} />
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
