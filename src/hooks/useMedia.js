import { useMutation } from "@tanstack/react-query";
import { makeRequest } from "../apiClient";

/**
 * Hook for media API operations (upload-url, confirm-upload, download, delete).
 * Does NOT manage a list query — the parent component holds the media array in state.
 */
export const useMedia = () => {
  // 1. Get presigned PUT URL + storageKey
  const uploadUrlMutation = useMutation({
    mutationFn: async (mimeType) => {
      const res = await makeRequest("/media/upload-url", {
        method: "POST",
        body: { mimeType },
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to get upload URL");
      return res.data; // { uploadUrl, storageKey }
    },
  });

  // 2. Confirm upload → creates Media document
  const confirmUploadMutation = useMutation({
    mutationFn: async ({ storageKey, mimeType, size }) => {
      const res = await makeRequest("/media/confirm-upload", {
        method: "POST",
        body: { storageKey, mimeType, size },
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to confirm upload");
      return res.data; // { media }
    },
  });

  // 3. Delete media (B2 + MongoDB)
  const deleteMediaMutation = useMutation({
    mutationFn: async (mediaId) => {
      const res = await makeRequest(`/media/${mediaId}`, {
        method: "DELETE",
      });
      if (!res.success) throw new Error(res.data?.error || "Failed to delete media");
      return res.data;
    },
  });

  // 4. Get presigned download URL (standalone function, not a mutation)
  const getDownloadUrl = async (mediaId) => {
    const res = await makeRequest(`/media/${mediaId}/download`);
    if (!res.success) throw new Error(res.data?.error || "Failed to get download URL");
    return res.data.downloadUrl;
  };

  return {
    getUploadUrl: uploadUrlMutation.mutateAsync,
    isGettingUploadUrl: uploadUrlMutation.isPending,

    confirmUpload: confirmUploadMutation.mutateAsync,
    isConfirming: confirmUploadMutation.isPending,

    deleteMedia: deleteMediaMutation.mutateAsync,
    isDeleting: deleteMediaMutation.isPending,

    getDownloadUrl,
  };
};
