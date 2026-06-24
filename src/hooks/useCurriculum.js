import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../apiClient";

export const useCurriculum = (courseId, isCreatorOrAdmin) => {
  const queryClient = useQueryClient();

  // 1. Fetch Sections Query
  const sectionsQuery = useQuery({
    queryKey: ["sections", courseId, isCreatorOrAdmin],
    queryFn: async () => {
      const url = isCreatorOrAdmin
        ? `/section/creator/course/${courseId}`
        : `/section/course/${courseId}`;
      const res = await makeRequest(url);
      if (res.success) {
        return res.data.sections || [];
      }
      throw new Error(res.data?.error || "Failed to fetch sections");
    },
    enabled: !!courseId,
  });

  // 1b. Fetch Enrollment Status Query
  const enrollmentQuery = useQuery({
    queryKey: ["enrollment", courseId],
    queryFn: async () => {
      const res = await makeRequest(`/course/${courseId}/enrollment`);
      if (res.success) {
        return "enrolled";
      }
      return "not-enrolled";
    },
    enabled: !!courseId && !isCreatorOrAdmin,
  });

  // 2. Enroll Mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await makeRequest(`/course/${courseId}/enroll`, { method: "POST" });
      if (!res.success && res.status !== 409) {
        throw new Error(res.data?.error || "Enrollment failed");
      }
      return res.data;
    },
    onSuccess: () => {
      // Invalidate sections and lessons queries to refresh access
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
    },
  });

  // 3. Section Mutations
  const createSectionMutation = useMutation({
    mutationFn: async (sectionBody) => {
      const res = await makeRequest("/section", {
        method: "POST",
        body: { ...sectionBody, course: courseId },
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to create section");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ sectionId, body }) => {
      const res = await makeRequest(`/section/${sectionId}`, {
        method: "PATCH",
        body,
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to update section");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId) => {
      const res = await makeRequest(`/section/${sectionId}`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to delete section");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", courseId] });
    },
  });

  return {
    sections: sectionsQuery.data || [],
    sectionsLoading: sectionsQuery.isLoading,
    refetchSections: sectionsQuery.refetch,
    enroll: enrollMutation.mutateAsync,
    enrollLoading: enrollMutation.isPending || enrollmentQuery.isFetching,
    enrollmentStatus: isCreatorOrAdmin ? "enrolled" : (enrollmentQuery.data || "not-enrolled"),
    createSection: createSectionMutation.mutateAsync,
    updateSection: updateSectionMutation.mutateAsync,
    deleteSection: deleteSectionMutation.mutateAsync,
  };
};

// Hook for fetching lessons of a specific section (used by nested components)
export const useLessons = (sectionId, isCreatorOrAdmin) => {
  const queryClient = useQueryClient();

  const lessonsQuery = useQuery({
    queryKey: ["lessons", sectionId, isCreatorOrAdmin],
    queryFn: async () => {
      const url = isCreatorOrAdmin
        ? `/lesson/creator/section/${sectionId}`
        : `/lesson/section/${sectionId}`;
      const res = await makeRequest(url);
      if (res.success) {
        return res.data.lessons || [];
      }
      throw new Error(res.data?.error || "Failed to fetch lessons");
    },
    enabled: !!sectionId,
  });

  const createLessonMutation = useMutation({
    mutationFn: async (lessonBody) => {
      const res = await makeRequest("/lesson", {
        method: "POST",
        body: { ...lessonBody, section: sectionId },
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to create lesson");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ lessonId, body }) => {
      const res = await makeRequest(`/lesson/${lessonId}`, {
        method: "PATCH",
        body,
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to update lesson");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId) => {
      const res = await makeRequest(`/lesson/${lessonId}`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to delete lesson");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", sectionId] });
    },
  });

  return {
    lessons: lessonsQuery.data || [],
    lessonsLoading: lessonsQuery.isLoading,
    refetchLessons: lessonsQuery.refetch,
    createLesson: createLessonMutation.mutateAsync,
    updateLesson: updateLessonMutation.mutateAsync,
    deleteLesson: deleteLessonMutation.mutateAsync,
  };
};

export const useLesson = (lessonId) => {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const res = await makeRequest(`/lesson/${lessonId}`);
      if (res.success) {
        return res.data.lesson;
      }
      throw new Error(res.data?.error || "Failed to fetch lesson");
    },
    enabled: !!lessonId,
  });
};

