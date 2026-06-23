import React, { useState, useEffect } from "react";
import { makeRequest, getApiBaseUrl, setApiBaseUrl, registerLogCallback } from "./apiClient";
import AuthTab from "./components/auth/AuthTab";
import SettingsTab from "./components/settings/SettingsTab";
import RbacTab from "./components/rbac/RbacTab";
import FileTab from "./components/file/FileTab";
import ConsoleLog from "./components/console/ConsoleLog";

const App = () => {
  // Config state
  const [baseUrl, setBaseUrl] = useState(getApiBaseUrl());
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("auth");

  // Logger state
  const [logs, setLogs] = useState([]);

  // Register log callback on mount and load initial profile
  useEffect(() => {
    registerLogCallback((newLog) => {
      setLogs((prev) => [...prev, newLog]);
    });
    fetchProfile();
  }, []);

  const updateBaseUrl = (e) => {
    const url = e.target.value;
    setBaseUrl(url);
    setApiBaseUrl(url);
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    const res = await makeRequest("/user");
    setProfileLoading(false);
    if (res.success) {
      setCurrentProfile(res.data);
    } else {
      setCurrentProfile(null);
    }
  };

  const handleAddLog = (customLog) => {
    setLogs((prev) => [...prev, customLog]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased">
      {/* Header section */}
      <header className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-black text-sky-400 tracking-tight flex items-center gap-2">
            <span>veoLMS</span>
            <span className="text-xs bg-sky-950 text-sky-300 px-2 py-0.5 rounded font-mono border border-sky-850">Playground</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono">Interactive Developer Control Board & Session Inspector</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="api-base-url" className="text-xs font-semibold text-slate-500 font-mono">API Base:</label>
            <input
              id="api-base-url"
              type="text"
              value={baseUrl}
              onChange={updateBaseUrl}
              className="bg-slate-900 border border-slate-700 text-sky-300 rounded px-2.5 py-1 text-xs w-48 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            onClick={fetchProfile}
            disabled={profileLoading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded px-3 py-1 text-xs font-bold transition-all"
          >
            {profileLoading ? "Reloading..." : "Sync Profile"}
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded px-3 py-1 flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500">Status:</span>
          {currentProfile ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected ({currentProfile.role || "User"})
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Not Authenticated
            </span>
          )}
        </div>
      </header>

      {/* Main Workspace Split */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: Interactive Playground Panel */}
        <section className="flex-1 p-5 overflow-y-auto flex flex-col gap-5">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800/80 font-mono text-xs">
            <button
              onClick={() => setActiveTab("auth")}
              className={`px-4 py-2.5 border-b-2 font-bold transition-all ${
                activeTab === "auth"
                  ? "border-sky-500 text-sky-400 bg-slate-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              🔐 Auth Gateway
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2.5 border-b-2 font-bold transition-all ${
                activeTab === "settings"
                  ? "border-sky-500 text-sky-400 bg-slate-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚙️ Account Settings
            </button>
            <button
              onClick={() => setActiveTab("rbac")}
              className={`px-4 py-2.5 border-b-2 font-bold transition-all ${
                activeTab === "rbac"
                  ? "border-sky-500 text-sky-400 bg-slate-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              👥 RBAC Control
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`px-4 py-2.5 border-b-2 font-bold transition-all ${
                activeTab === "file"
                  ? "border-sky-500 text-sky-400 bg-slate-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              📦 S3 File Manager
            </button>
          </div>

          {/* Profile Quick Summary Header */}
          {currentProfile && (
            <div className="bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 text-xs flex justify-between items-center flex-wrap gap-2 font-mono shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Active User:</span>{" "}
                <span className="text-sky-300 font-bold">{currentProfile.username}</span>{" "}
                <span className="text-slate-600">({currentProfile.email})</span>
              </div>
              <div className="text-slate-500 flex items-center gap-2">
                <span>Role:</span>
                <span className="text-amber-400 font-bold">{currentProfile.role || "User"}</span>
              </div>
            </div>
          )}

          {/* Tab Content Display */}
          <div className="flex-1">
            {activeTab === "auth" && (
              <AuthTab onLoginSuccess={fetchProfile} />
            )}
            {activeTab === "settings" && (
              <SettingsTab profile={currentProfile} onLogoutSuccess={fetchProfile} />
            )}
            {activeTab === "rbac" && (
              <RbacTab currentProfile={currentProfile} />
            )}
            {activeTab === "file" && (
              <FileTab currentProfile={currentProfile} onAddLog={handleAddLog} />
            )}
          </div>
        </section>

        {/* Right Column: Console Activity Stream */}
        <ConsoleLog logs={logs} onClear={handleClearLogs} />
      </main>
    </div>
  );
};

export default App;