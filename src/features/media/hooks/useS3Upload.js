import { useState, useCallback } from "react";

export const useS3Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStage, setUploadStage] = useState("idle"); // "idle" | "presign" | "uploading" | "confirming" | "done" | "error"
  const [statusText, setStatusText] = useState("");

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadPercent(0);
    setUploadStage("idle");
    setStatusText("");
  }, []);

  const uploadFile = useCallback(async (file, getUploadUrlFn, confirmUploadFn) => {
    if (!file) return null;

    let mimeType = file.type || "";
    const extension = file.name.split(".").pop().toLowerCase();

    // Map extensions to exact mime types accepted by the backend validator schemas
    if (extension === "mkv") {
      mimeType = "video/x-matroska";
    } else if (extension === "mov") {
      mimeType = "video/quicktime";
    } else if (extension === "mp4") {
      mimeType = "video/mp4";
    } else if (extension === "webm") {
      mimeType = "video/webm";
    } else if (["jpg", "jpeg"].includes(extension)) {
      mimeType = "image/jpeg";
    } else if (extension === "png") {
      mimeType = "image/png";
    } else if (extension === "webp") {
      mimeType = "image/webp";
    }

    if (!mimeType) {
      mimeType = "application/octet-stream";
    }

    setIsUploading(true);
    setUploadPercent(0);

    try {
      // Stage 1: Get presigned upload URL
      setUploadStage("presign");
      setStatusText("Generating secure upload URL...");
      const { uploadUrl, mediaId } = await getUploadUrlFn(mimeType);

      // Stage 2: Upload binary to cloud via XHR
      setUploadStage("uploading");
      setStatusText("Uploading to cloud storage...");

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            setUploadPercent(Math.round((event.loaded / event.total) * 100));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with HTTP ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled")));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", mimeType);
        xhr.send(file);
      });

      // Stage 3: Confirm upload with backend
      setUploadStage("confirming");
      setStatusText("Confirming with server...");
      const result = await confirmUploadFn({
        mediaId,
        mimeType,
        size: file.size,
      });

      // Success!
      setUploadStage("done");
      setStatusText("Upload complete!");
      return result;
    } catch (err) {
      setUploadStage("error");
      setStatusText(err.message || "Upload failed");
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    uploadPercent,
    uploadStage,
    statusText,
    uploadFile,
    resetUpload,
  };
};
