import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../services/api/apiClient";

export const useCourses = (viewMode, filters, limit = 10) => {
  const queryClient = useQueryClient();

  const queryKey = ["courses", viewMode, filters, limit];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = null }) => {
      if (viewMode === "enrolled") {
        const res = await makeRequest("/course/enrollments/me");
        if (res.success) {
          const courses = (res.data.enrollments || [])
            .map((e) => e.course)
            .filter((c) => !!c);
          return {
            courses,
            nextCursor: null,
            hasNextPage: false,
          };
        }
        throw new Error(res.data?.error || "Failed to fetch enrolled courses");
      }

      let url = viewMode === "my-courses"
        ? `/course/creator/me?limit=${limit}`
        : `/course?limit=${limit}`;

      if (filters.status) url += `&status=${filters.status}`;
      if (filters.displayName) url += `&displayName=${encodeURIComponent(filters.displayName)}`;
      if (filters.level) url += `&level=${encodeURIComponent(filters.level)}`;
      if (pageParam) url += `&cursor=${pageParam}`;

      const res = await makeRequest(url);
      if (res.success) {
        return {
          courses: res.data.courses || [],
          nextCursor: res.data.nextCursor,
          hasNextPage: res.data.hasNextPage,
        };
      }
      throw new Error(res.data?.error || "Failed to fetch courses");
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60, // 1 minute
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData) => {
      const res = await makeRequest("/course", {
        method: "POST",
        body: courseData,
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to create course");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, body }) => {
      const res = await makeRequest(`/course/${id}`, {
        method: "PATCH",
        body,
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to update course");
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await makeRequest(`/course/${id}`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to delete course");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const publishCourseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await makeRequest(`/course/${id}/publish`, {
        method: "PATCH",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to publish course");
      return res.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });

  const unpublishCourseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await makeRequest(`/course/${id}/unpublish`, {
        method: "PATCH",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to unpublish course");
      return res.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", id] });
    },
  });

  return {
    ...query,
    courses: query.data?.pages.flatMap((page) => page.courses) || [],
    createCourse: createCourseMutation.mutateAsync,
    isCreating: createCourseMutation.isPending,
    updateCourse: updateCourseMutation.mutateAsync,
    isUpdating: updateCourseMutation.isPending,
    deleteCourse: deleteCourseMutation.mutateAsync,
    isDeleting: deleteCourseMutation.isPending,
    publishCourse: publishCourseMutation.mutateAsync,
    isPublishing: publishCourseMutation.isPending,
    unpublishCourse: unpublishCourseMutation.mutateAsync,
    isUnpublishing: unpublishCourseMutation.isPending,
  };
};
