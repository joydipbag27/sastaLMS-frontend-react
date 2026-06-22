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

  // Form states - File Upload & Manager
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadContentType, setUploadContentType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    try {
      const saved = localStorage.getItem("veo_uploaded_files");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [uploadPercent, setUploadPercent] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewingFileKey, setPreviewingFileKey] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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

  // S3 Upload & Manager handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadFileName(file.name);
      setUploadContentType(file.type || "application/octet-stream");
      setUploadProgress("");
    }
  };

  const startFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const fileName = uploadFileName.trim();
    if (!fileName) {
      alert("File name/key cannot be empty.");
      return;
    }

    setIsUploading(true);
    setUploadPercent(0);
    setUploadProgress("Signing upload request...");

    // 1. Request presigned upload URL
    const res = await makeRequest("/file/upload-url", {
      method: "POST",
      body: { fileName, contentType: uploadContentType },
    });

    if (!res.success) {
      setUploadProgress(`Signing failed: ${res.data?.error || "Unknown error"}`);
      setIsUploading(false);
      return;
    }

    const { uploadUrl, key } = res.data;
    setUploadProgress("Uploading file directly to S3...");

    // 2. Upload with progress via XHR
    const startTime = Date.now();
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadPercent(percent);
      }
    });

    xhr.addEventListener("load", () => {
      const duration = Date.now() - startTime;
      const isSuccess = xhr.status >= 200 && xhr.status < 300;
      const responseText = xhr.statusText || "";

      // Log PUT request to local logger console
      const log = {
        timestamp: new Date().toLocaleTimeString(),
        method: "PUT (Presigned)",
        url: uploadUrl.substring(0, 80) + "...",
        body: `[Binary File: ${selectedFile.name}]`,
        status: xhr.status,
        response: responseText || `[Direct S3 code: ${xhr.status}]`,
        duration: `${duration}ms`,
        success: isSuccess,
      };
      setLogs((prev) => [...prev, log]);

      if (isSuccess) {
        setUploadProgress("Upload completed successfully!");

        // Add file entry to local table list
        const newEntry = {
          key,
          name: selectedFile.name,
          size: selectedFile.size,
          type: uploadContentType,
          date: new Date().toLocaleString(),
        };

        const updatedList = [newEntry, ...uploadedFiles];
        setUploadedFiles(updatedList);
        localStorage.setItem("veo_uploaded_files", JSON.stringify(updatedList));

        setSelectedFile(null);
        setUploadFileName("");
        setUploadContentType("");
        setUploadPercent(0);
        setIsUploading(false);
      } else {
        setUploadProgress(`Upload failed: status ${xhr.status}`);
        setIsUploading(false);
      }
    });

    xhr.addEventListener("error", () => {
      const duration = Date.now() - startTime;
      const log = {
        timestamp: new Date().toLocaleTimeString(),
        method: "PUT (Presigned)",
        url: uploadUrl.substring(0, 80) + "...",
        body: `[Binary File: ${selectedFile.name}]`,
        status: 0,
        response: "XHR connection error",
        duration: `${duration}ms`,
        success: false,
      };
      setLogs((prev) => [...prev, log]);

      setUploadProgress("Network error during upload.");
      setIsUploading(false);
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", uploadContentType);
    xhr.send(selectedFile);
  };

  const downloadFile = async (key) => {
    const res = await makeRequest(`/file/download-url/${encodeURIComponent(key)}`);
    if (res.success) {
      const downloadUrl = res.data.downloadUrl;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", key);
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Download URL generation failed: ${res.data?.error || "Unknown error"}`);
    }
  };

  const previewFile = async (key) => {
    if (previewingFileKey === key) {
      setPreviewingFileKey(null);
      setPreviewUrl("");
      return;
    }
    const res = await makeRequest(`/file/download-url/${encodeURIComponent(key)}`);
    if (res.success) {
      setPreviewingFileKey(key);
      setPreviewUrl(res.data.downloadUrl);
    } else {
      alert(`Preview URL generation failed: ${res.data?.error || "Unknown error"}`);
    }
  };

  const removeLocalFile = (key) => {
    const updated = uploadedFiles.filter((f) => f.key !== key);
    setUploadedFiles(updated);
    localStorage.setItem("veo_uploaded_files", JSON.stringify(updated));
    if (previewingFileKey === key) {
      setPreviewingFileKey(null);
      setPreviewUrl("");
    }
  };

  const clearLocalLibrary = () => {
    if (confirm("Are you sure you want to clear your local file history? (This does not delete files from S3)")) {
      setUploadedFiles([]);
      localStorage.removeItem("veo_uploaded_files");
      setPreviewingFileKey(null);
      setPreviewUrl("");
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
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
                {/* Upload File Panel */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800">
                  <h3 className="text-base font-bold text-sky-400 mb-3">Upload File directly to S3 (/file/upload-url)</h3>
                  
                  <div className="space-y-4">
                    {/* Drag/Drop Zone simulation */}
                    <div className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-lg p-6 text-center cursor-pointer transition-colors relative bg-slate-900/50">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-xs space-y-1">
                        <p className="text-slate-300 font-bold">Drag and drop file here, or click to select</p>
                        <p className="text-slate-500">Selected file is signed and uploaded directly to secure storage</p>
                      </div>
                    </div>

                    {/* Selected File Details */}
                    {selectedFile && (
                      <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500">Local Name:</span>{" "}
                            <span className="text-slate-200 font-bold">{selectedFile.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Size:</span>{" "}
                            <span className="text-slate-200">{formatBytes(selectedFile.size)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Content Type:</span>{" "}
                            <span className="text-slate-200">{uploadContentType}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-400 text-xs">S3 Key (Destination Name):</span>
                            <input
                              type="text"
                              value={uploadFileName}
                              onChange={(e) => setUploadFileName(e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-sky-300 flex-1 focus:outline-none focus:border-sky-500"
                            />
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-slate-400 text-xs">Content Type Header:</span>
                            <input
                              type="text"
                              value={uploadContentType}
                              onChange={(e) => setUploadContentType(e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300 flex-1 focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>

                        {/* Progress display */}
                        {isUploading && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-sky-400">
                              <span>Uploading to S3 Bucket...</span>
                              <span className="font-bold">{uploadPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-sky-500 h-1.5 transition-all duration-150"
                                style={{ width: `${uploadPercent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            onClick={startFileUpload}
                            disabled={isUploading}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded px-4 py-1.5 font-bold text-xs"
                          >
                            {isUploading ? "Uploading..." : "Start Direct Upload"}
                          </button>
                          <button
                            onClick={() => setSelectedFile(null)}
                            disabled={isUploading}
                            className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-slate-400 px-3 py-1.5 rounded text-xs"
                          >
                            Cancel
                          </button>
                          {uploadProgress && (
                            <span className="text-xs text-sky-300 font-bold truncate max-w-xs">{uploadProgress}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded Files Library */}
                <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-sky-400">File Manager Library (localStorage)</h3>
                    {uploadedFiles.length > 0 && (
                      <button
                        onClick={clearLocalLibrary}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Clear History
                      </button>
                    )}
                  </div>

                  {uploadedFiles.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-4 bg-slate-900/30 rounded border border-slate-850">
                      No uploaded files recorded. Upload a file above to add it to the library.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="overflow-x-auto border border-slate-850 rounded">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-850 text-slate-400">
                              <th className="p-2 border-r border-slate-850">File Key / Name</th>
                              <th className="p-2 border-r border-slate-850">Size</th>
                              <th className="p-2 border-r border-slate-850">MIME Type</th>
                              <th className="p-2 border-r border-slate-850">Upload Date</th>
                              <th className="p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadedFiles.map((file) => (
                              <React.Fragment key={file.key}>
                                <tr className="border-b border-slate-850 hover:bg-slate-900/30">
                                  <td className="p-2 border-r border-slate-850 text-slate-200 font-bold break-all">
                                    {file.key}
                                  </td>
                                  <td className="p-2 border-r border-slate-850 text-slate-300 font-mono">
                                    {formatBytes(file.size)}
                                  </td>
                                  <td className="p-2 border-r border-slate-850 text-slate-400 font-mono">
                                    {file.type}
                                  </td>
                                  <td className="p-2 border-r border-slate-850 text-slate-500">
                                    {file.date}
                                  </td>
                                  <td className="p-2 flex gap-1.5 flex-wrap">
                                    <button
                                      onClick={() => downloadFile(file.key)}
                                      className="bg-sky-950 hover:bg-sky-900 border border-sky-800 text-sky-300 px-2 py-0.5 rounded text-[10px]"
                                    >
                                      Download
                                    </button>
                                    
                                    {file.type && file.type.startsWith("image/") && (
                                      <button
                                        onClick={() => previewFile(file.key)}
                                        className="bg-violet-950 hover:bg-violet-900 border border-violet-800 text-violet-300 px-2 py-0.5 rounded text-[10px]"
                                      >
                                        {previewingFileKey === file.key ? "Hide Preview" : "Preview"}
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(file.key);
                                        alert("File key copied to clipboard!");
                                      }}
                                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]"
                                    >
                                      Copy Key
                                    </button>
                                    
                                    <button
                                      onClick={() => removeLocalFile(file.key)}
                                      className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 px-2 py-0.5 rounded text-[10px]"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>

                                {/* Inline preview row */}
                                {previewingFileKey === file.key && previewUrl && (
                                  <tr className="bg-slate-950 border-b border-slate-850">
                                    <td colSpan={5} className="p-4">
                                      <div className="flex flex-col items-center bg-slate-900 rounded p-2 border border-slate-800 max-w-md mx-auto">
                                        <div className="text-[10px] text-slate-500 mb-1.5 font-bold">Image Preview: {file.key}</div>
                                        <img
                                          src={previewUrl}
                                          alt={file.key}
                                          className="max-h-64 object-contain rounded border border-slate-750 bg-slate-950"
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
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