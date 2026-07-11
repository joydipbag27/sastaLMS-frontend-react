import React, { useState } from "react";
import { makeRequest } from "../../services/api/apiClient";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const RbacTab = ({ currentProfile }) => {
  const [usersList, setUsersList] = useState([]);
  const [usersCursor, setUsersCursor] = useState(null);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersLimit, setUsersLimit] = useState(10);
  const [rbacSelectedUser, setRbacSelectedUser] = useState(null);
  const [rbacChangeRoleTo, setRbacChangeRoleTo] = useState("STUDENT");
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
      alert(res.data?.error || "Failed to fetch users. Requires CREATOR or ADMIN privilege.");
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

  if (!currentProfile) {
    return (
      <div className="bg-white p-6 text-center border border-slate-200 rounded-xl">
        <p className="text-slate-500 text-sm">Please sign in to access RBAC administration.</p>
      </div>
    );
  }

  const hasPrivileges = ["CREATOR", "ADMIN"].includes(currentProfile.role);
  const isAdmin = currentProfile.role === "ADMIN";

  if (!hasPrivileges) {
    return (
      <div className="bg-white p-6 border border-slate-200 rounded-xl text-center space-y-2">
        <p className="text-rose-600 font-bold">Access Denied</p>
        <p className="text-xs text-slate-500">Your role ({currentProfile.role || "STUDENT"}) does not have permissions to view user records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-outfit">User Administration</h2>
        <p className="text-sm text-slate-500 mt-1">Manage user accounts, credentials, status, and permissions.</p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">User List</h3>
            <p className="text-xs text-slate-500">Load and manage user records</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Limit:</span>
            <input
              type="number"
              min={1}
              max={50}
              value={usersLimit}
              onChange={(e) => setUsersLimit(parseInt(e.target.value) || 10)}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 text-xs w-16 text-center focus:outline-none focus:border-brand-200 focus:ring-2 focus:ring-brand/10"
            />
            <Button onClick={() => handleListUsers()} variant="primary" isLoading={loading} className="py-1.5 px-3 text-xs">
              Load Users
            </Button>
          </div>
        </div>

        {usersList.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-xs">
            Click "Load Users" to retrieve list.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3 border-r border-slate-200">Username</th>
                  <th className="p-3 border-r border-slate-200">Email</th>
                  <th className="p-3 border-r border-slate-200">Role</th>
                  <th className="p-3 border-r border-slate-200">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => {
                  const isSelected = rbacSelectedUser?._id === user._id;
                  return (
                    <tr
                      key={user._id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? "bg-brand-50/50" : ""
                      }`}
                      onClick={() => {
                        setRbacSelectedUser(user);
                        setRbacChangeRoleTo(user.role || "STUDENT");
                      }}
                    >
                      <td className="p-3 border-r border-slate-200 text-slate-800 font-bold">{user.username}</td>
                      <td className="p-3 border-r border-slate-200 text-slate-500 font-mono text-[11px]">{user.email}</td>
                      <td className="p-3 border-r border-slate-200">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          user.role === "ADMIN" ? "bg-rose-50 text-rose-600 border border-rose-200" :
                          user.role === "CREATOR" ? "bg-brand-50 text-brand-200 border-brand-100" :
                          "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3 border-r border-slate-200">
                        {user.isBlocked ? (
                          <span className="text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold">Blocked</span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-bold">Active</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                          <Button
                            onClick={() => checkUserSession(user._id)}
                            variant="secondary"
                            isLoading={actionLoadingId === `${user._id}-session`}
                            className="px-2 py-1 text-[10px]"
                          >
                            Session
                          </Button>
                          <Button
                            onClick={() => handleAdminLogoutUser(user._id)}
                            variant="secondary"
                            isLoading={actionLoadingId === `${user._id}-logout`}
                            className="px-2 py-1 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            Kill Sid
                          </Button>

                          {isAdmin && (
                            <>
                              <Button
                                onClick={() => handleAdminBlockUser(user._id)}
                                variant={user.isBlocked ? "success" : "warning"}
                                isLoading={actionLoadingId === `${user._id}-block`}
                                className="px-2 py-1 text-[10px]"
                              >
                                {user.isBlocked ? "Unblock" : "Block"}
                              </Button>
                              <Button
                                onClick={() => handleAdminDeleteUser(user._id)}
                                variant="danger"
                                isLoading={actionLoadingId === `${user._id}-delete`}
                                className="px-2 py-1 text-[10px]"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
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
          <pre className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 text-xs overflow-x-auto font-mono max-h-48">
            {JSON.stringify(sessionCheckResult, null, 2)}
          </pre>
          <div className="flex justify-end">
            <Button onClick={() => setSessionCheckResult(null)} variant="secondary" className="px-3 py-1 text-xs">
              Close Inspection
            </Button>
          </div>
        </Card>
      )}

      {isAdmin && rbacSelectedUser && (
        <Card title={`Assign Role to "${rbacSelectedUser.username}"`} subtitle={`ID: ${rbacSelectedUser._id}`}>
          <form onSubmit={handleChangeRole} className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Current Role</span>
              <span className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-sm font-bold">
                {rbacSelectedUser.role}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <label htmlFor="new-role-select" className="text-xs font-semibold text-slate-600">
                New Role Assignment
              </label>
              <select
                id="new-role-select"
                value={rbacChangeRoleTo}
                onChange={(e) => setRbacChangeRoleTo(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-200 focus:ring-2 focus:ring-brand/10"
              >
                <option value="STUDENT">STUDENT</option>
                <option value="CREATOR">CREATOR</option>
                <option value="ADMIN">ADMIN</option>
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
