import { useState } from "react";
import ProfileCard from "../../features/account/components/ProfileCard";
import ChangePassword from "../../features/account/components/ChangePassword";
import SetPassword from "../../features/account/components/SetPassword";
import { Settings, User, Shield } from "lucide-react";

const SettingsTab = ({ profile, onLogoutSuccess }) => {
  const [activeTab, setActiveTab] = useState("profile");

  if (!profile) {
    return (
      <div className="bg-white p-6 text-center border border-slate-200 rounded-xl">
        <p className="text-slate-500 text-sm">Please sign in to view account settings.</p>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 border-brand-100 flex items-center justify-center text-brand-200 shrink-0 mt-0.5">
          <Settings size={18} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-outfit">Settings</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage your account profile and security.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1 -mb-px" aria-label="Settings tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
                  active
                    ? "border-brand-200 text-brand-200 bg-brand-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "profile" && (
          <ProfileCard profile={profile} onLogoutSuccess={onLogoutSuccess} />
        )}

        {activeTab === "security" && (
          profile.isPassAvailable ? (
            <ChangePassword email={profile.email} onSuccess={onLogoutSuccess} />
          ) : (
            <SetPassword email={profile.email} onSuccess={onLogoutSuccess} />
          )
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
