import React, { useState, useEffect, useRef } from "react";
import { makeRequest, getApiBaseUrl, setApiBaseUrl, registerLogCallback } from "./apiClient";

const App = () => {
  // Config state
  const [baseUrl, setBaseUrl] = useState(getApiBaseUrl());
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("auth");

  // Logger state
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const logsEndRef = useRef(null);

  // Form states - OTP Request
  const [otpPurpose, setOtpPurpose] = useState("auth");
  const [otpAuthEmail, setOtpAuthEmail] = useState("");
  const [otpOldEmail, setOtpOldEmail] = useState("");
  const [otpNewEmail, setOtpNewEmail] = useState("");

  // Form states - Register
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regOtp, setRegOtp] = useState("");

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form states - Google Login
  const [googleToken, setGoogleToken] = useState("");

  // Form states - Change Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Form states - Change Email
  const [changeEmailNew, setChangeEmailNew] = useState("");
  const [changeEmailOldOtp, setChangeEmailOldOtp] = useState("");
  const [changeEmailNewOtp, setChangeEmailNewOtp] = useState("");
  const [changeEmailPassword, setChangeEmailPassword] = useState("");

  // Form states - RBAC
  const [usersList, setUsersList] = useState([]);
  const [usersCursor, setUsersCursor] = useState(null);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersLimit, setUsersLimit] = useState(10);
  const [rbacSelectedUser, setRbacSelectedUser] = useState(null);
  const [rbacChangeRoleTo, setRbacChangeRoleTo] = useState("User");
  const [sessionCheckResult, setSessionCheckResult] = useState(null);

  // Form states - File Upload
  const [uploadFileName, setUploadFileName] = useState("test_file.txt");
  const [uploadContentType, setUploadContentType] = useState("text/plain");
  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedUploadUrl, setGeneratedUploadUrl] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [downloadKey, setDownloadKey] = useState("");
  const [generatedDownloadUrl, setGeneratedDownloadUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  // Register log callback on mount
  useEffect(() => {
    registerLogCallback((newLog) => {
      setLogs((prev) => [...prev, newLog]);
    });
    // Attempt to load profile on start
    fetchProfile();
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const updateBaseUrl = (e) => {
    const url = e.target.value;
    setBaseUrl(url);
    setApiBaseUrl(url);
  };

  const fetchProfile = async () => {
    setProfileLoading(true);
    const res = await makeRequest("/user");
    if (res.success) {
      setCurrentProfile(res.data);
    } else {
      setCurrentProfile(null);
    }
    setProfileLoading(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    let body = {};
    if (otpPurpose === "auth") {
      body = { purpose: "auth", email: otpAuthEmail };
    } else {
      body = {
        purpose: "security",
        email: { oldEmail: otpOldEmail, newEmail: otpNewEmail }
      };
    }
    await makeRequest("/auth/send-otp", {
      method: "POST",
      body,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const body = {
      username: regUsername,
      email: regEmail,
      password: regPassword,
    };
    if (regOtp) {
      body.otp = regOtp;
    }
    const res = await makeRequest("/user/register", {
      method: "POST",
      body,
    });
    if (res.success) {
      alert("Registration Successful!");
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
      setRegOtp("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await makeRequest("/user/login", {
      method: "POST",
      body: { email: loginEmail, password: loginPassword },
    });
    if (res.success) {
      fetchProfile();
      setLoginPassword("");
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    const res = await makeRequest("/auth/google", {
      method: "POST",
      body: { idToken: googleToken },
    });
    if (res.success) {
      fetchProfile();
      setGoogleToken("");
    }
  };

  const handleLogout = async () => {
    const res = await makeRequest("/user/logout", { method: "POST" });
    if (res.success) {
      setCurrentProfile(null);
    }
  };

  const handleLogoutAll = async () => {
    const res = await makeRequest("/user/logoutall", { method: "POST" });
    if (res.success) {
      setCurrentProfile(null);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const body = { newPassword };
    if (oldPassword) {
      body.oldPassword = oldPassword;
    }
    const res = await makeRequest("/user/changePassword", {
      method: "PATCH",
      body,
    });
    if (res.success) {
      alert("Password changed successfully! You have been logged out.");
      setCurrentProfile(null);
      setNewPassword("");
      setOldPassword("");
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    const res = await makeRequest("/user/changeEmail", {
      method: "PATCH",
      body: {
        newEmail: changeEmailNew,
        oldEmailOtp: changeEmailOldOtp,
        newEmailOtp: changeEmailNewOtp,
        password: changeEmailPassword,
      },
    });
    if (res.success) {
      alert("Email changed successfully!");
      fetchProfile();
      setChangeEmailNew("");
      setChangeEmailOldOtp("");
      setChangeEmailNewOtp("");
      setChangeEmailPassword("");
    }
  };

  // RBAC Panel actions
  const handleListUsers = async (cursorVal = null) => {
    let url = `/users?limit=${usersLimit}`;
    if (cursorVal) {
      url += `&cursor=${cursorVal}`;
    }
    const res = await makeRequest(url);
    if (res.success) {
      if (cursorVal) {
        setUsersList((prev) => [...prev, ...res.data.users]);
      } else {
        setUsersList(res.data.users || []);
      }
      setUsersCursor(res.data.nextCursor);
      setUsersHasMore(res.data.hasMore);
    }
  };

  const checkUserSession = async (userId) => {
    setSessionCheckResult(null);
    const res = await makeRequest(`/users/session/${userId}`);
    if (res.success) {
      setSessionCheckResult({ userId, ...res.data });
    }
  };

  const handleAdminLogoutUser = async (userId) => {
    const res = await makeRequest("/users/logout", {
      method: "POST",
      body: { userId },
    });
    if (res.success) {
      alert(`User ${userId} logged out from all devices`);
      checkUserSession(userId);
    }
  };

  const handleAdminDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await makeRequest("/users/delete", {
      method: "DELETE",
      body: { userId },
    });
    if (res.success) {
      alert(`User ${userId} deleted successfully`);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      if (rbacSelectedUser?._id === userId) setRbacSelectedUser(null);
    }
  };

  const handleAdminBlockUser = async (userId) => {
    const res = await makeRequest("/users/block", {
      method: "PATCH",
      body: { userId },
    });
    if (res.success) {
      alert(res.data.message || `User status changed`);
      // Refresh user list row
      setUsersList((prev) =>
        prev.map((u) => {
          if (u._id === userId) {
            return { ...u, isBlocked: !u.isBlocked };
          }
          return u;
        })
      );
      if (rbacSelectedUser?._id === userId) {
        setRbacSelectedUser((prev) => ({ ...prev, isBlocked: !prev.isBlocked }));
      }
    }
  };

  const handleChangeRole = async (e) => {
    e.preventDefault();
    if (!rbacSelectedUser) return;
    const res = await makeRequest("/users/role", {
      method: "PATCH",
      body: { userId: rbacSelectedUser._id, changeTo: rbacChangeRoleTo },
    });
    if (res.success) {
      alert(`Role changed successfully!`);
      setUsersList((prev) =>
        prev.map((u) => {
          if (u._id === rbacSelectedUser._id) {
            return { ...u, role: rbacChangeRoleTo };
          }
          return u;
        })
      );
      setRbacSelectedUser((prev) => ({ ...prev, role: rbacChangeRoleTo }));
    }
  };

  // S3 Upload handlers
  const handleGetUploadUrl = async (e) => {
    e.preventDefault();
    setGeneratedUploadUrl("");
    setGeneratedKey("");
    const res = await makeRequest("/file/upload-url", {
      method: "POST",
      body: { fileName: uploadFileName, contentType: uploadContentType },
    });
    if (res.success) {
      setGeneratedUploadUrl(res.data.uploadUrl);
      setGeneratedKey(res.data.key);
      setDownloadKey(res.data.key);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadFileName(file.name);
      setUploadContentType(file.type || "application/octet-stream");
    }
  };

  const handleSimulatePutUpload = async () => {
    if (!generatedUploadUrl) {
      alert("Please request an Upload URL first.");
      return;
    }
    setUploadProgress("Uploading...");
    
    // Determine content to send
    let bodyData = "This is a test file content uploaded from veoLMS Backend Playground";
    if (selectedFile) {
      bodyData = selectedFile;
    }

    try {
      const startTime = Date.now();
      const response = await fetch(generatedUploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": uploadContentType,
        },
        body: bodyData,
      });

      const duration = Date.now() - startTime;
      const responseText = await response.text();
      const log = {
        timestamp: new Date().toLocaleTimeString(),
        method: "PUT (Presigned)",
        url: generatedUploadUrl.substring(0, 120) + "...",
        body: selectedFile ? `[Binary File: ${selectedFile.name}]` : bodyData,
        status: response.status,
        response: responseText || "[Empty Response]",
        duration: `${duration}ms`,
        success: response.ok,
      };

      setLogs((prev) => [...prev, log]);

      if (response.ok) {
        setUploadProgress("Upload successful!");
        alert("File uploaded successfully to S3 storage!");
      } else {
        setUploadProgress(`Upload failed: status ${response.status}`);
        alert(`Upload failed: status ${response.status}`);
      }
    } catch (err) {
      setUploadProgress(`Upload error: ${err.message}`);
      alert(`Upload error: ${err.message}`);
    }
  };

  const handleGetDownloadUrl = async (e) => {
    e.preventDefault();
    setGeneratedDownloadUrl("");
    const res = await makeRequest(`/file/download-url/${encodeURIComponent(downloadKey)}`);
    if (res.success) {
      setGeneratedDownloadUrl(res.data.downloadUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-mono text-sm flex flex-col">
      {/* Header section */}
      <header className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-sky-400">veoLMS Backend Playground</h1>
          <p className="text-xs text-slate-400">A developer tool for testing endpoints & session cookies</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-slate-400">API URL:</span>
          <input
            type="text"
            value={baseUrl}
            onChange={updateBaseUrl}
            className="bg-slate-900 border border-slate-700 text-sky-300 rounded px-2 py-1 w-64 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={fetchProfile}
            disabled={profileLoading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white rounded px-3 py-1 font-bold transition-colors"
          >
            {profileLoading ? "Loading..." : "Check Auth Profile"}
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded px-3 py-1 flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          {currentProfile ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              ● Connected as {currentProfile.role || "User"}
            </span>
          ) : (
            <span className="text-rose-400 font-bold">● Guest / Logged Out</span>
          )}
        </div>
      </header>

      {/* Main Workspace split */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: API Panel */}
        <section className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 border-r border-slate-800">
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("auth")}
              className={`px-4 py-2 border-b-2 font-bold ${
                activeTab === "auth"
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Authentication
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 border-b-2 font-bold ${
                activeTab === "settings"
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Account Settings
            </button>
            <button
              onClick={() => setActiveTab("rbac")}
              className={`px-4 py-2 border-b-2 font-bold ${
                activeTab === "rbac"
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              RBAC (Admin Control)
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`px-4 py-2 border-b-2 font-bold ${
                activeTab === "file"
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              File Storage (S3)
            </button>
          </div>

          {/* Profile Quick Summary */}
          {currentProfile && (
            <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs flex justify-between items-center flex-wrap gap-2">
              <div>
                <span className="text-slate-400">Current User:</span>{" "}
                <span className="text-amber-400 font-bold">{currentProfile.username}</span>{" "}
                <span className="text-slate-600">({currentProfile.email})</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-0.5 rounded"
                >
                  Logout
                </button>
                <button
                  onClick={handleLogoutAll}
                  className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 px-2 py-0.5 rounded"
                >
                  Logout All Devices
                </button>
              </div>
            </div>
          )}

          {/* Tab content area */}
          <div className="flex-1 mt-2">
            {/* AUTHENTICATION TAB */}
            {activeTab === "auth" && (
              <div className="space-y-6">
                {/* Send OTP Form */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">1. Request Email OTP (/auth/send-otp)</h3>
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 w-24">Purpose:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="purpose"
                          value="auth"
                          checked={otpPurpose === "auth"}
                          onChange={() => setOtpPurpose("auth")}
                        />
                        <span>Auth (Signup)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="purpose"
                          value="security"
                          checked={otpPurpose === "security"}
                          onChange={() => setOtpPurpose("security")}
                        />
                        <span>Security (Change Email)</span>
                      </label>
                    </div>

                    {otpPurpose === "auth" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-24">Email:</span>
                        <input
                          type="email"
                          required
                          placeholder="user@example.com"
                          value={otpAuthEmail}
                          onChange={(e) => setOtpAuthEmail(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 w-24">Old Email:</span>
                          <input
                            type="email"
                            required
                            placeholder="old@example.com"
                            value={otpOldEmail}
                            onChange={(e) => setOtpOldEmail(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 w-24">New Email:</span>
                          <input
                            type="email"
                            required
                            placeholder="new@example.com"
                            value={otpNewEmail}
                            onChange={(e) => setOtpNewEmail(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                          />
                        </div>
                      </div>
                    )}
                    <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white rounded px-3 py-1 font-bold mt-1">
                      Send OTP
                    </button>
                  </form>
                </div>

                {/* Register Form */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">2. Register User (/user/register)</h3>
                  <form onSubmit={handleRegister} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">Username:</span>
                      <input
                        type="text"
                        required
                        placeholder="john_doe (alphanumeric, -, _, .)"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">Email:</span>
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">Password:</span>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 8 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">OTP (optional):</span>
                      <input
                        type="text"
                        placeholder="6-digit verification code"
                        maxLength={6}
                        value={regOtp}
                        onChange={(e) => setRegOtp(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-48 text-slate-100"
                      />
                    </div>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1 font-bold mt-1">
                      Register Account
                    </button>
                  </form>
                </div>

                {/* Login Form */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">3. Standard Login (/user/login)</h3>
                  <form onSubmit={handleLogin} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">Email:</span>
                      <input
                        type="email"
                        required
                        placeholder="user@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-24">Password:</span>
                      <input
                        type="password"
                        required
                        placeholder="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white rounded px-3 py-1 font-bold mt-1">
                      Login
                    </button>
                  </form>
                </div>

                {/* Google Login Simulation */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">4. Google Sign-In Simulator (/auth/google)</h3>
                  <form onSubmit={handleGoogleLogin} className="space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-slate-400">Google ID Token:</span>
                      <textarea
                        required
                        rows={3}
                        placeholder="Paste mock or real Google JWT ID token here"
                        value={googleToken}
                        onChange={(e) => setGoogleToken(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white rounded px-3 py-1 font-bold">
                      Login With Google Token
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Change Password Form */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">Change Password (/user/changePassword)</h3>
                  <form onSubmit={handleChangePassword} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-36">Old Password:</span>
                      <input
                        type="password"
                        placeholder="Optional if password is not set (e.g. Google user)"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-36">New Password:</span>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white rounded px-3 py-1 font-bold mt-1">
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Change Email Form */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">Change Email (/user/changeEmail)</h3>
                  <p className="text-xs text-slate-400 mb-2">Note: You must request security OTPs for both emails first via Auth tab.</p>
                  <form onSubmit={handleChangeEmail} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-36">New Email:</span>
                      <input
                        type="email"
                        required
                        placeholder="new_email@example.com"
                        value={changeEmailNew}
                        onChange={(e) => setChangeEmailNew(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-36">Old Email OTP:</span>
                      <input
                        type="text"
                        required
                        placeholder="6-digit numeric"
                        maxLength={6}
                        value={changeEmailOldOtp}
                        onChange={(e) => setChangeEmailOldOtp(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-36">New Email OTP:</span>
                      <input
                        type="text"
                        required
                        placeholder="6-digit numeric"
                        maxLength={6}
                        value={changeEmailNewOtp}
                        onChange={(e) => setChangeEmailNewOtp(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-36">Confirm Password:</span>
                      <input
                        type="password"
                        required
                        placeholder="Your password to confirm change"
                        value={changeEmailPassword}
                        onChange={(e) => setChangeEmailPassword(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-3 py-1 font-bold mt-1">
                      Update Email Address
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* RBAC (ADMIN CONTROL) TAB */}
            {activeTab === "rbac" && (
              <div className="space-y-6">
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-base font-bold text-sky-400">List and Manage Users (/users)</h3>
                    <div className="flex items-center gap-2">
                      <span>Limit:</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={usersLimit}
                        onChange={(e) => setUsersLimit(parseInt(e.target.value) || 10)}
                        className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 w-16 text-slate-100 text-center"
                      />
                      <button
                        onClick={() => handleListUsers()}
                        className="bg-sky-600 hover:bg-sky-500 text-white rounded px-3 py-1 font-bold"
                      >
                        Refresh Users
                      </button>
                    </div>
                  </div>

                  {usersList.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-900/50 rounded border border-slate-800">
                      No users loaded. Click "Refresh Users" to load (Requires Admin/Manager/Owner privileges).
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 rounded">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                            <th className="p-2 border-r border-slate-800">Username</th>
                            <th className="p-2 border-r border-slate-800">Email</th>
                            <th className="p-2 border-r border-slate-800">Role</th>
                            <th className="p-2 border-r border-slate-800">Status</th>
                            <th className="p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map((user) => (
                            <tr
                              key={user._id}
                              className={`border-b border-slate-800 hover:bg-slate-900/50 cursor-pointer ${
                                rbacSelectedUser?._id === user._id ? "bg-sky-950/20" : ""
                              }`}
                              onClick={() => setRbacSelectedUser(user)}
                            >
                              <td className="p-2 border-r border-slate-800 text-slate-200 font-bold">{user.username}</td>
                              <td className="p-2 border-r border-slate-800 text-slate-400 text-xs">{user.email}</td>
                              <td className="p-2 border-r border-slate-800">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  user.role === "Owner" ? "bg-purple-950 text-purple-300 border border-purple-800" :
                                  user.role === "Admin" ? "bg-rose-950 text-rose-300 border border-rose-800" :
                                  user.role === "Manager" ? "bg-sky-950 text-sky-300 border border-sky-800" :
                                  "bg-slate-800 text-slate-400"
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-2 border-r border-slate-800">
                                {user.isBlocked ? (
                                  <span className="text-rose-400 font-bold bg-rose-950/20 px-1 rounded text-[10px]">Blocked</span>
                                ) : (
                                  <span className="text-emerald-400 bg-emerald-950/20 px-1 rounded text-[10px]">Active</span>
                                )}
                              </td>
                              <td className="p-2 flex gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => checkUserSession(user._id)}
                                  className="text-xs bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-700"
                                >
                                  Session
                                </button>
                                <button
                                  onClick={() => handleAdminBlockUser(user._id)}
                                  className={`text-xs px-1.5 py-0.5 rounded border ${
                                    user.isBlocked
                                      ? "bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800"
                                      : "bg-amber-950 hover:bg-amber-900 text-amber-300 border-amber-800"
                                  }`}
                                >
                                  {user.isBlocked ? "Unblock" : "Block"}
                                </button>
                                <button
                                  onClick={() => handleAdminLogoutUser(user._id)}
                                  className="text-xs bg-slate-800 hover:bg-slate-700 text-rose-400 px-1.5 py-0.5 rounded border border-slate-700"
                                >
                                  Kill Sid
                                </button>
                                <button
                                  onClick={() => handleAdminDeleteUser(user._id)}
                                  className="text-xs bg-rose-950 hover:bg-rose-900 text-rose-300 px-1.5 py-0.5 rounded border border-rose-800"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {usersHasMore && (
                    <button
                      onClick={() => handleListUsers(usersCursor)}
                      className="mt-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 w-full py-1.5 rounded"
                    >
                      Load More Users...
                    </button>
                  )}
                </div>

                {/* Session Check Details */}
                {sessionCheckResult && (
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs">
                    <h4 className="font-bold text-sky-400 mb-1.5">Session Status for User: {sessionCheckResult.userId}</h4>
                    <pre className="bg-slate-900 p-2 rounded border border-slate-800 text-sky-300">
                      {JSON.stringify(sessionCheckResult, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Role Changer panel */}
                {rbacSelectedUser && (
                  <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <h3 className="text-base font-bold text-sky-400 mb-3">
                      Change Role for "{rbacSelectedUser.username}" (/users/role)
                    </h3>
                    <form onSubmit={handleChangeRole} className="flex flex-wrap items-center gap-3">
                      <span className="text-slate-400">Target User ID:</span>
                      <span className="text-slate-300 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-850">
                        {rbacSelectedUser._id}
                      </span>
                      <span className="text-slate-400">Current Role:</span>
                      <span className="text-amber-400 font-bold">{rbacSelectedUser.role}</span>

                      <span className="text-slate-400 ml-4">Assign Role:</span>
                      <select
                        value={rbacChangeRoleTo}
                        onChange={(e) => setRbacChangeRoleTo(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-2 py-1"
                      >
                        <option value="User">User</option>
                        <option value="Manager">Manager</option>
                        <option value="Admin">Admin</option>
                        <option value="Owner">Owner</option>
                      </select>

                      <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white rounded px-3 py-1 font-bold">
                        Apply Role Change
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* FILE STORAGE TAB */}
            {activeTab === "file" && (
              <div className="space-y-6">
                {/* Request Upload URL */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">1. Get Presigned Upload URL (/file/upload-url)</h3>
                  <form onSubmit={handleGetUploadUrl} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-32">Select Local File:</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-32">File Name (Key):</span>
                      <input
                        type="text"
                        required
                        placeholder="test_file.txt"
                        value={uploadFileName}
                        onChange={(e) => setUploadFileName(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-32">Content Type:</span>
                      <input
                        type="text"
                        required
                        placeholder="text/plain"
                        value={uploadContentType}
                        onChange={(e) => setUploadContentType(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white rounded px-3 py-1 font-bold">
                      Get Presigned PUT URL
                    </button>
                  </form>
                </div>

                {/* Upload Simulator */}
                {generatedUploadUrl && (
                  <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                    <h3 className="text-base font-bold text-sky-400">2. Upload File (PUT direct to Storage)</h3>
                    <div>
                      <span className="text-slate-400 block text-xs mb-1">Generated Presigned Upload URL:</span>
                      <textarea
                        readOnly
                        value={generatedUploadUrl}
                        rows={2}
                        className="bg-slate-900 text-slate-400 font-mono text-[10px] w-full p-1.5 border border-slate-850 rounded focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleSimulatePutUpload}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-4 py-1.5 font-bold"
                      >
                        Execute PUT Request
                      </button>
                      <span className="text-xs text-sky-300 font-bold">{uploadProgress}</span>
                    </div>
                  </div>
                )}

                {/* Download URL Form */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">3. Get Download URL (/file/download-url/:key)</h3>
                  <form onSubmit={handleGetDownloadUrl} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-32">File Key (Filename):</span>
                      <input
                        type="text"
                        required
                        placeholder="Name of key to download"
                        value={downloadKey}
                        onChange={(e) => setDownloadKey(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 flex-1 text-slate-100"
                      />
                    </div>
                    <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white rounded px-3 py-1 font-bold">
                      Get Presigned GET URL
                    </button>
                  </form>

                  {generatedDownloadUrl && (
                    <div className="mt-3 bg-slate-900 p-2 border border-slate-800 rounded text-xs space-y-1">
                      <div className="text-slate-400">Presigned Download URL Generated:</div>
                      <a
                        href={generatedDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 underline break-all font-mono hover:text-sky-300 block my-1"
                      >
                        {generatedDownloadUrl.substring(0, 100)}... (Open in New Tab)
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Live Console Log */}
        <section className="w-full md:w-96 bg-slate-950 p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <h2 className="text-sm font-bold text-slate-300">Live Request/Response Console</h2>
            <button
              onClick={() => {
                setLogs([]);
                setSelectedLog(null);
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-700"
            >
              Clear
            </button>
          </div>

          {/* Logs feed */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[150px]">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-600 italic text-center py-8">No requests logged yet.</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedLog(log)}
                  className={`p-1.5 rounded cursor-pointer border text-[11px] hover:border-slate-600 transition-colors ${
                    log.success
                      ? "bg-slate-900/60 border-slate-850"
                      : "bg-rose-950/15 border-rose-900/40 text-rose-200"
                  } ${selectedLog === log ? "ring-1 ring-sky-500 border-transparent" : ""}`}
                >
                  <div className="flex justify-between items-center gap-1.5 font-bold mb-0.5">
                    <span className={log.success ? "text-emerald-400" : "text-rose-400"}>
                      [{log.status}] {log.method}
                    </span>
                    <span className="text-slate-500 font-normal text-[9px]">{log.timestamp}</span>
                  </div>
                  <div className="text-slate-400 truncate text-[10px]">{log.url}</div>
                  <div className="text-[9px] text-slate-500 text-right mt-0.5">took {log.duration}</div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Expanded Log detail popup/drawer */}
          {selectedLog && (
            <div className="border-t border-slate-800 pt-3 mt-3 bg-slate-950 text-[10px] space-y-2 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between font-bold">
                <span className="text-sky-400 text-xs">Log Inspector</span>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-rose-400 font-bold hover:text-rose-300"
                >
                  [Close]
                </button>
              </div>

              <div>
                <span className="text-slate-500 block">HTTP Request:</span>
                <span className="text-slate-300 font-bold">{selectedLog.method}</span>{" "}
                <span className="text-slate-400 break-all">{selectedLog.url}</span>
              </div>

              {selectedLog.body && (
                <div>
                  <span className="text-slate-500 block">Payload sent:</span>
                  <pre className="bg-slate-900 p-1.5 rounded border border-slate-850 text-slate-300 overflow-x-auto text-[9px]">
                    {typeof selectedLog.body === "string"
                      ? selectedLog.body
                      : JSON.stringify(selectedLog.body, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <span className="text-slate-500 block">Response JSON/Text:</span>
                <pre className="bg-slate-900 p-1.5 rounded border border-slate-850 text-sky-300 overflow-x-auto text-[9px]">
                  {JSON.stringify(selectedLog.response, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;