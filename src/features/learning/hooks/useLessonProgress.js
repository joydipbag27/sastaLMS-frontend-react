import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../services/api/apiClient";

export const useLessonProgress = (lessonId, isCreatorOrAdmin) => {
  const queryClient = useQueryClient();

  const progressQuery = useQuery({
    queryKey: ["lessonProgress", lessonId],
    queryFn: async () => {
      const res = await makeRequest(`/lesson/${lessonId}/progress`);
      if (res.success) {
        return res.data.progress || null;
      }
      throw new Error(res.data?.error || "Failed to fetch lesson progress");
    },
    enabled: !!lessonId && !isCreatorOrAdmin,
  });

  const progressMutation = useMutation({
    mutationFn: async (lastPosition) => {
      const res = await makeRequest(`/lesson/${lessonId}/progress`, {
        method: "PATCH",
        body: { lastPosition },
      });
      if (res.success) {
        return res.data.progress;
      }
      throw new Error(res.data?.error || "Failed to update progress");
    },
    onSuccess: (updatedProgress) => {
      queryClient.setQueryData(["lessonProgress", lessonId], updatedProgress);
    },
  });

  return {
    progress: progressQuery.data,
    progressLoading: progressQuery.isLoading,
    refetchProgress: progressQuery.refetch,
    updateProgress: progressMutation.mutateAsync,
    isUpdating: progressMutation.isPending,
  };
};
