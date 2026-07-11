import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminSummary,
  fetchAdminUsers,
  fetchUserSessionStatus,
  forceLogoutUser,
  toggleUserBlock,
  promoteUserToCreator,
  deleteUser,
} from "../api/adminApi";

export const useAdminSummary = () => {
  return useQuery({
    queryKey: ["adminSummary"],
    queryFn: fetchAdminSummary,
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdminUsers = (limit = 15) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["adminUsers", limit],
    queryFn: () => fetchAdminUsers({ cursor: null, limit }),
    staleTime: 1000 * 60,
  });

  const allUsers = query.data?.users || [];
  const nextCursor = query.data?.nextCursor || null;
  const hasMore = query.data?.hasMore || false;

  const loadMore = async () => {
    if (!hasMore || !nextCursor) return;
    const moreData = await fetchAdminUsers({ cursor: nextCursor, limit });
    queryClient.setQueryData(["adminUsers", limit], (old) => ({
      users: [...(old?.users || []), ...moreData.users],
      nextCursor: moreData.nextCursor,
      hasMore: moreData.hasMore,
    }));
  };

  return {
    ...query,
    users: allUsers,
    nextCursor,
    hasMore,
    loadMore,
  };
};

export const useUserSessionStatus = () => {
  return useMutation({
    mutationFn: fetchUserSessionStatus,
  });
};

export const useForceLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: forceLogoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};

export const useToggleBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleUserBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminSummary"] });
    },
  });
};

export const usePromoteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: promoteUserToCreator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminSummary"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminSummary"] });
    },
  });
};
