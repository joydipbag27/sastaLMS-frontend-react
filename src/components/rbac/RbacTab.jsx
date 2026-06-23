import React, { useState } from "react";
import { makeRequest } from "../../apiClient";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";

const RbacTab = ({ currentProfile }) => {
  const [usersList, setUsersList] = useState([]);
  const [usersCursor, setUsersCursor] = useState(null);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersLimit, setUsersLimit] = useState(10);
  const [rbacSelectedUser, setRbacSelectedUser] = useState(null);
  const [rbacChangeRoleTo, setRbacChangeRoleTo] = useState("User");
  const [sessionCheckResult, setSessionCheckResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const handleListUsers = async (cursorVal = null) => {
    setLoading(true);
    let url = `/users?limit=${usersLimit}`;
    if (cursorVal) {
      url += `&cursor=${cursorVal}`;
    }
    const res = await makeRequest(url);
    setLoading(false);
    if (res.success) {
      if (cursorVal) {
        setUsersList((prev) => [...prev, ...res.data.users]);
      } else {
        setUsersList(res.data.users || []);
      }
      setUsersCursor(res.data.nextCursor);
      setUsersHasMore(res.data.hasMore);
    } else {
      alert(res.data?.error || "Failed to fetch users. Requires appropriate role.");
    }
  };

  const checkUserSession = async (userId) => {
    setSessionCheckResult(null);
    setActionLoadingId(`${userId}-session`);
    const res = await makeRequest(`/users/session/${userId}`);
    setActionLoadingId(null);
    if (res.success) {
      setSessionCheckResult({ userId, ...res.data });
    } else {
      alert(res.data?.error || "Failed to check session");
    }
  };

  const handleAdminLogoutUser = async (userId) => {
    if (!confirm(`Are you sure you want to terminate sessions for user ${userId}?`)) return;
    setActionLoadingId(`${userId}-logout`);
    const res = await makeRequest("/users/logout", {
      method: "POST",
      body: { userId },
    });
    setActionLoadingId(null);
    if (res.success) {
      alert(`Sessions terminated for user ${userId}`);
      if (sessionCheckResult && sessionCheckResult.userId === userId) {
        checkUserSession(userId);
      }
    } else {
      alert(res.data?.error || "Failed to logout user");
    }
  };

  const handleAdminDeleteUser = async (userId) => {
    if (!confirm(`Are you sure you want to delete user ${userId}? This cannot be undone.`)) return;
    setActionLoadingId(`${userId}-delete`);
    const res = await makeRequest("/users/delete", {
      method: "DELETE",
      body: { userId },
    });
    setActionLoadingId(null);
    if (res.success) {
      alert(`User ${userId} deleted successfully`);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      if (rbacSelectedUser?._id === userId) setRbacSelectedUser(null);
      if (sessionCheckResult && sessionCheckResult.userId === userId) setSessionCheckResult(null);
    } else {
      alert(res.data?.error || "Failed to delete user");
    }
  };

  const handleAdminBlockUser = async (userId) => {
    setActionLoadingId(`${userId}-block`);
    const res = await makeRequest("/users/block", {
      method: "PATCH",
      body: { userId },
    });
    setActionLoadingId(null);
    if (res.success) {
      alert(res.data.message || `User status changed`);
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
    } else {
      alert(res.data?.error || "Failed to toggle block status");
    }
  };

  const handleChangeRole = async (e) => {
    e.preventDefault();
    if (!rbacSelectedUser) return;
    setActionLoadingId("role-change");
    const res = await makeRequest("/users/role", {
      method: "PATCH",
      body: { userId: rbacSelectedUser._id, changeTo: rbacChangeRoleTo },
    });
    setActionLoadingId(null);
    if (res.success) {
      alert(`Role updated to ${rbacChangeRoleTo} for user ${rbacSelectedUser.username}`);
      setUsersList((prev) =>
        prev.map((u) => {
          if (u._id === rbacSelectedUser._id) {
            return { ...u, role: rbacChangeRoleTo };
          }
          return u;
        })
      );
      setRbacSelectedUser((prev) => ({ ...prev, role: rbacChangeRoleTo }));
    } else {
      alert(res.data?.error || "Failed to update role");
    }
  };

  // If user is guest
  if (!currentProfile) {
    return (
      <div className="bg-slate-950 p-6 text-center border border-slate-800 rounded-lg">
        <p className="text-slate-400 italic">Please sign in to access RBAC administration.</p>
      </div>
    );
  }

  // If user role is not admin/manager/owner
  const hasPrivileges = ["Admin", "Manager", "Owner"].includes(currentProfile.role);
  if (!hasPrivileges) {
    return (
      <div className="bg-slate-950 p-6 border border-slate-850 rounded-lg text-center space-y-2">
        <p className="text-rose-400 font-bold">Access Denied</p>
        <p className="text-xs text-slate-500">Your role ({currentProfile.role || "User"}) does not have permissions to view user records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80 mb-3">
          <div>
            <h3 className="text-base font-bold text-sky-400">User Administration</h3>
            <p className="text-xs text-slate-500">Manage user accounts, credentials, status, and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Limit:</span>
            <input
              type="number"
              min={1}
              max={50}
              value={usersLimit}
              onChange={(e) => setUsersLimit(parseInt(e.target.value) || 10)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs w-16 text-center focus:outline-none focus:border-sky-500"
            />
            <Button onClick={() => handleListUsers()} variant="primary" isLoading={loading} className="py-1 px-3 text-xs">
              Load Users
            </Button>
          </div>
        </div>

        {usersList.length === 0 ? (
          <div className="text-center py-6 bg-slate-900/30 rounded border border-dashed border-slate-800 text-slate-500 text-xs italic">
            Click "Load Users" to retrieve list.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-850 text-slate-400 font-bold">
                  <th className="p-2.5 border-r border-slate-850">Username</th>
                  <th className="p-2.5 border-r border-slate-850">Email</th>
                  <th className="p-2.5 border-r border-slate-850">Role</th>
                  <th className="p-2.5 border-r border-slate-850">Status</th>
                  <th className="p-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => {
                  const isSelected = rbacSelectedUser?._id === user._id;
                  return (
                    <tr
                      key={user._id}
                      className={`border-b border-slate-850 hover:bg-slate-900/40 cursor-pointer ${
                        isSelected ? "bg-sky-950/20" : ""
                      }`}
                      onClick={() => {
                        setRbacSelectedUser(user);
                        setRbacChangeRoleTo(user.role || "User");
                      }}
                    >
                      <td className="p-2.5 border-r border-slate-850 text-slate-200 font-bold">{user.username}</td>
                      <td className="p-2.5 border-r border-slate-850 text-slate-400 font-mono text-[11px]">{user.email}</td>
                      <td className="p-2.5 border-r border-slate-850">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          user.role === "Owner" ? "bg-purple-950 text-purple-300 border border-purple-800" :
                          user.role === "Admin" ? "bg-rose-950 text-rose-300 border border-rose-800" :
                          user.role === "Manager" ? "bg-sky-950 text-sky-300 border border-sky-850" :
                          "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-850">
                        {user.isBlocked ? (
                          <span className="text-rose-400 bg-rose-950/40 border border-rose-900/60 px-1.5 py-0.5 rounded text-[10px] font-bold">Blocked</span>
                        ) : (
                          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-1.5 py-0.5 rounded text-[10px] font-bold">Active</span>
                        )}
                      </td>
                      <td className="p-2.5 flex items-center gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={() => checkUserSession(user._id)}
                          variant="secondary"
                          isLoading={actionLoadingId === `${user._id}-session`}
                          className="px-1.5 py-0.5 text-[10px] font-medium"
                        >
                          Session
                        </Button>
                        <Button
                          onClick={() => handleAdminBlockUser(user._id)}
                          variant={user.isBlocked ? "success" : "warning"}
                          isLoading={actionLoadingId === `${user._id}-block`}
                          className="px-1.5 py-0.5 text-[10px] font-medium"
                        >
                          {user.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button
                          onClick={() => handleAdminLogoutUser(user._id)}
                          variant="secondary"
                          isLoading={actionLoadingId === `${user._id}-logout`}
                          className="px-1.5 py-0.5 text-[10px] font-medium text-rose-400 border-rose-850 hover:bg-rose-950/20"
                        >
                          Kill Sid
                        </Button>
                        <Button
                          onClick={() => handleAdminDeleteUser(user._id)}
                          variant="danger"
                          isLoading={actionLoadingId === `${user._id}-delete`}
                          className="px-1.5 py-0.5 text-[10px] font-medium"
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {usersHasMore && (
          <Button
            onClick={() => handleListUsers(usersCursor)}
            variant="secondary"
            className="w-full mt-3 py-1.5"
            isLoading={loading}
          >
            Load More Users
          </Button>
        )}
      </Card>

      {sessionCheckResult && (
        <Card title="Session Inspection Result" subtitle={`Active Redis sessions for user ID: ${sessionCheckResult.userId}`}>
          <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-sky-400 text-xs overflow-x-auto font-mono max-h-48">
            {JSON.stringify(sessionCheckResult, null, 2)}
          </pre>
          <div className="flex justify-end">
            <Button onClick={() => setSessionCheckResult(null)} variant="secondary" className="px-3 py-1 text-xs font-bold">
              Close Inspection
            </Button>
          </div>
        </Card>
      )}

      {rbacSelectedUser && (
        <Card title={`Assign Role to "${rbacSelectedUser.username}"`} subtitle={`ID: ${rbacSelectedUser._id}`}>
          <form onSubmit={handleChangeRole} className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Current Role</span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 rounded px-3 py-1.5 text-sm font-bold">
                {rbacSelectedUser.role}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <label htmlFor="new-role-select" className="text-xs font-semibold text-slate-400">
                New Role Assignment
              </label>
              <select
                id="new-role-select"
                value={rbacChangeRoleTo}
                onChange={(e) => setRbacChangeRoleTo(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-100 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="User">User</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Owner">Owner</option>
              </select>
            </div>
            <Button type="submit" variant="success" isLoading={actionLoadingId === "role-change"}>
              Apply Role
            </Button>
            <Button onClick={() => setRbacSelectedUser(null)} variant="secondary">
              Cancel
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default RbacTab;
