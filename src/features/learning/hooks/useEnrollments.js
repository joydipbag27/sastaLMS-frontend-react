import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../services/api/apiClient";

export const useEnrollments = () => {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const res = await makeRequest("/course/enrollments/me");
      if (res.success) {
        return res.data.enrollments || [];
      }
      throw new Error(res.data?.error || "Failed to fetch enrolled courses");
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache validity
  });
};

export default useEnrollments;
