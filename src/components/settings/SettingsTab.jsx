import React from "react";
import ProfileCard from "./ProfileCard";
import ChangePassword from "./ChangePassword";
import SetPassword from "./SetPassword";

const SettingsTab = ({ profile, onLogoutSuccess }) => {
  if (!profile) {
    return (
      <div className="bg-slate-950 p-6 text-center border border-slate-800 rounded-lg">
        <p className="text-slate-400 italic">Please sign in to view account settings.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <ProfileCard profile={profile} onLogoutSuccess={onLogoutSuccess} />
      </div>

      <div>
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
