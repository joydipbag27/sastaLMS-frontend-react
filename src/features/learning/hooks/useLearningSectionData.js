import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../services/api/apiClient";

/**
 * Fetches all Classroom data for a section from the new Learning endpoint:
 *   GET /learning/courses/:courseId/sections/:sectionId
 *
 * Returns:
 *   - course summary, access flags, enrollment
 *   - courseProgress (totalLessons, completedLessons, progressPercentage, totalWatchTime)
 *   - section metadata
 *   - lessons sorted by order with inline per-lesson progress
 *
 * @param {string} courseId
 * @param {string} sectionId
 * @param {object} options
 * @param {boolean} [options.enabled] - Set false to skip the fetch
 */
export const useLearningSectionData = (courseId, sectionId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: ["learningSectionData", courseId, sectionId],
    queryFn: async () => {
      const res = await makeRequest(
        `/learning/courses/${courseId}/sections/${sectionId}`
      );
      if (res.success) {
        return res.data;
      }
      throw new Error(res.data?.error || "Failed to fetch section data");
    },
    enabled: !!courseId && !!sectionId && enabled,
    staleTime: 1000 * 30, // 30 seconds — progress should stay reasonably fresh
  });
};

export default useLearningSectionData;
