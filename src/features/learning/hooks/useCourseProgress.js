import { useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../services/api/apiClient";

/**
 * Fetches a lightweight course completion summary for the current user:
 *   GET /learning/courses/:courseId/progress
 *
 * Response data shape:
 *   { courseId, totalLessons, completedLessons, progressPercentage }
 *
 * @param {string} courseId
 * @param {object} options
 * @param {boolean} [options.enabled] - Set false to skip the fetch
 */
export const useCourseProgress = (courseId, { enabled = true } = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: async () => {
      const res = await makeRequest(`/learning/courses/${courseId}/progress`);
      if (res.success) {
        return res.data;
      }
      throw new Error(res.data?.error || "Failed to fetch course progress");
    },
    enabled: !!courseId && enabled,
    staleTime: 1000 * 30, // 30 seconds
  });

  /**
   * Invalidate the cached progress so the next render refetches from the
   * server. Call this after a lesson progress update is saved to keep the
   * header progress bar accurate.
   */
  const invalidateCourseProgress = () => {
    queryClient.invalidateQueries({ queryKey: ["courseProgress", courseId] });
  };

  return {
    courseProgress: query.data ?? null,
    courseProgressLoading: query.isLoading,
    refetchCourseProgress: query.refetch,
    invalidateCourseProgress,
  };
};

export default useCourseProgress;
