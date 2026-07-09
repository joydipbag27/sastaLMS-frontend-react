import { useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../../services/api/apiClient";

/**
 * Hook for media API operations.
 *
 * Video uploads are lesson-scoped — use the helpers below with a lessonId.
 * The old generic /media/upload-url endpoint no longer exists.
 */
export const useMedia = () => {
  // ── Lesson-scoped S3 video upload ──────────────────────────────────────────

  /**
   * Returns a { getUploadUrl, confirmUpload } pair bound to a specific lesson.
   * Pass this object as `useMediaHook` to <FileUpload />.
   *
   * @param {string} lessonId
   * @param {boolean} hasVideo - true if the lesson already has a video (triggers replace-url)
   */
  const getLessonVideoHook = (lessonId, hasVideo = false) => ({
    getUploadUrl: async (mimeType) => {
      const endpoint = hasVideo
        ? `/media/s3/lesson/${lessonId}/replace-url`
        : `/media/s3/lesson/${lessonId}/upload-url`;
      const res = await makeRequest(endpoint, {
        method: "POST",
        body: { mimeType },
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to get upload URL");
      return res.data; // { uploadUrl, mediaId }
    },
    confirmUpload: async ({ mediaId, mimeType, size }) => {
      const res = await makeRequest(`/media/s3/lesson/${lessonId}/confirm`, {
        method: "POST",
        body: { mediaId, mimeType, size },
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to confirm upload");
      return res.data; // { lesson, media }
    },
  });

  // ── Delete media (B2 + MongoDB) ────────────────────────────────────────────
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId) => {
      const res = await makeRequest(`/media/${mediaId}`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to delete media");
      return res.data;
    },
  });

  // ── Presigned download URL ─────────────────────────────────────────────────
  const getDownloadUrl = async (mediaId) => {
    const res = await makeRequest(`/media/${mediaId}/download`);
    if (!res.success) throw new Error(res.data?.error || "Failed to get download URL");
    return res.data.downloadUrl;
  };

  // ── Admin: retry COPY_PENDING transfer ────────────────────────────────────
  const retryTransferMutation = useMutation({
    mutationFn: async (mediaId) => {
      const res = await makeRequest(`/media/${mediaId}/retry-transfer`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to retry transfer");
      return res.data;
    },
  });

  // ── Manual ingestion: Step 1 — create media record ─────────────────────────
  /**
   * POST /media/manual
   * Creates a PROCESSING media document and links it to the given lesson.
   * Returns { mediaId } — the creator uses this ID as the B2 folder name.
   */
  const createManualMediaMutation = useMutation({
    mutationFn: async (lessonId) => {
      const res = await makeRequest("/media/manual", {
        method: "POST",
        body: { lessonId },
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to create manual media");
      return res.data; // { mediaId }
    },
  });

  // ── Manual ingestion: Step 3 — verify B2 upload ────────────────────────────
  /**
   * POST /media/manual/:mediaId/verify
   * Backend lists B2 objects, validates playlists + segments + MIME types,
   * then marks the media READY and syncs duration to the lesson.
   * Returns { media } with status READY.
   */
  const verifyManualMediaMutation = useMutation({
    mutationFn: async (mediaId) => {
      const res = await makeRequest(`/media/manual/${mediaId}/verify`, {
        method: "POST",
      });
      if (!res.success) throw new Error(res.data?.error || "Verification failed");
      return res.data; // { media }
    },
  });

  return {
    // Lesson-scoped upload helpers
    getLessonVideoHook,

    // Delete
    deleteMedia: deleteMediaMutation.mutateAsync,
    isDeleting: deleteMediaMutation.isPending,

    // Download
    getDownloadUrl,

    // Admin retry
    retryTransfer: retryTransferMutation.mutateAsync,
    isRetrying: retryTransferMutation.isPending,

    // Manual ingestion
    createManualMedia: createManualMediaMutation.mutateAsync,
    isCreatingManual: createManualMediaMutation.isPending,
    verifyManualMedia: verifyManualMediaMutation.mutateAsync,
    isVerifyingManual: verifyManualMediaMutation.isPending,
  };
};
