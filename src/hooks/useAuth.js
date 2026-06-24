import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../apiClient";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const {
    data: profile = null,
    isLoading: profileLoading,
    refetch: fetchProfile,
  } = useQuery({
    queryKey: ["authProfile"],
    queryFn: async () => {
      const res = await makeRequest("/user");
      if (res.success) {
        return res.data;
      }
      return null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // In this codebase, logout is handled by clearing client state,
      // but if there's a backend endpoint we can call it.
      // We will just return true and let the client handle state clearing.
      return true;
    },
    onSuccess: () => {
      queryClient.setQueryData(["authProfile"], null);
    },
  });

  return {
    profile,
    profileLoading,
    fetchProfile,
    logout: logoutMutation.mutateAsync,
  };
};
