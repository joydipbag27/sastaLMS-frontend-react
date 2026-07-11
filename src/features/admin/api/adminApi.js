import { makeRequest } from "../../../services/api/apiClient";

export const fetchAdminSummary = async () => {
  const res = await makeRequest("/admin/dashboard/summary");
  if (!res.success) throw new Error(res.data?.error || "Failed to fetch admin summary");
  return res.data;
};

export const fetchAdminUsers = async ({ cursor = null, limit = 15 } = {}) => {
  let url = `/users?limit=${limit}`;
  if (cursor) url += `&cursor=${cursor}`;
  const res = await makeRequest(url);
  if (!res.success) throw new Error(res.data?.error || "Failed to fetch users");
  return {
    users: res.data.users || [],
    nextCursor: res.data.nextCursor,
    hasMore: res.data.hasMore,
  };
};

export const fetchUserSessionStatus = async (userId) => {
  const res = await makeRequest(`/users/session/${userId}`);
  if (!res.success) throw new Error(res.data?.error || "Failed to check session status");
  return res.data;
};

export const forceLogoutUser = async (userId) => {
  const res = await makeRequest("/users/logout", {
    method: "POST",
    body: { userId },
  });
  if (!res.success) throw new Error(res.data?.error || "Failed to force logout user");
  return res.data;
};

export const toggleUserBlock = async (userId) => {
  const res = await makeRequest("/users/block", {
    method: "PATCH",
    body: { userId },
  });
  if (!res.success) throw new Error(res.data?.error || "Failed to toggle block status");
  return res.data;
};

export const promoteUserToCreator = async (userId) => {
  const res = await makeRequest(`/users/users/${userId}/promote`, {
    method: "PATCH",
  });
  if (!res.success) throw new Error(res.data?.error || "Failed to promote user");
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await makeRequest("/users/delete", {
    method: "DELETE",
    body: { userId },
  });
  if (!res.success) throw new Error(res.data?.error || "Failed to delete user");
  return res.data;
};
