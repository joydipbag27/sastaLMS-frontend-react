import React, { useState, useRef, useCallback } from "react";
import { Upload, FileUp, X, CheckCircle, AlertCircle } from "lucide-react";

const FileUpload = ({ onUploadSuccess, useMediaHook }) => {
  const { getUploadUrl, confirmUpload } = useMediaHook;
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadStage, setUploadStage] = useState(""); // "presign" | "uploading" | "confirming" | "done" | "error"
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((file) => {
    if (file) {
      setSelectedFile(file);
      setStatusText("");
      setUploadPercent(0);
      setUploadStage("");
    }
  }, []);

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  // Drag-and-drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadPercent(0);
    setUploadStage("");
    setStatusText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const mimeType = selectedFile.type || "application/octet-stream";

    setIsUploading(true);
    setUploadPercent(0);

    try {
      // Stage 1: Get presigned upload URL
      setUploadStage("presign");
      setStatusText("Generating secure upload URL...");
      const { uploadUrl, storageKey } = await getUploadUrl(mimeType);

      // Stage 2: Upload binary to B2 via XHR (for progress tracking)
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
        xhr.send(selectedFile);
      });

      // Stage 3: Confirm upload with backend
      setUploadStage("confirming");
      setStatusText("Confirming with server...");
      const result = await confirmUpload({
        storageKey,
        mimeType,
        size: selectedFile.size,
      });

      // Success!
      setUploadStage("done");
      setStatusText("Upload complete!");

      onUploadSuccess({
        ...result.media,
        originalName: selectedFile.name,
      });

      // Auto-reset after a brief moment
      setTimeout(resetForm, 1500);
    } catch (err) {
      setUploadStage("error");
      setStatusText(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (type) => {
    if (!type) return "📄";
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎬";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📕";
    if (type.includes("zip") || type.includes("rar") || type.includes("tar")) return "📦";
    if (type.includes("document") || type.includes("word")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    return "📄";
  };

  return (
    <div className="space-y-4">
      {/* Drag-and-drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragging
            ? "border-sky-400 bg-sky-500/10 scale-[1.01] shadow-lg shadow-sky-500/10"
            : selectedFile
              ? "border-slate-700 bg-slate-900/30"
              : "border-slate-700 bg-slate-900/20 hover:border-slate-500 hover:bg-slate-900/40"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isDragging ? "bg-sky-500/20 scale-110" : "bg-slate-800/80"}`}>
              <Upload size={28} className={`transition-colors ${isDragging ? "text-sky-400" : "text-slate-500"}`} />
            </div>
            <p className="text-sm font-semibold text-slate-300 mb-1">
              {isDragging ? "Drop your file here" : "Drag & drop a file here"}
            </p>
            <p className="text-xs text-slate-500">
              or <span className="text-sky-400 hover:text-sky-300 font-medium">browse from your computer</span>
            </p>
            <p className="text-[11px] text-slate-600 mt-3">
              Supports video, images, documents, and archives
            </p>
          </div>
        ) : (
          <div className="p-5">
            {/* Selected file preview card */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
                {getFileIcon(selectedFile.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-200 truncate">{selectedFile.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-500 font-mono">{selectedFile.type || "unknown"}</span>
                </div>
              </div>
              {!isUploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); resetForm(); }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Upload progress */}
            {isUploading && (
              <div className="mt-4 space-y-2">
                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      uploadStage === "error" ? "bg-rose-500" : "bg-sky-500"
                    }`}
                    style={{
                      width: uploadStage === "presign" ? "5%" :
                             uploadStage === "uploading" ? `${Math.max(5, uploadPercent * 0.85)}%` :
                             uploadStage === "confirming" ? "90%" :
                             uploadStage === "done" ? "100%" : `${uploadPercent}%`
                    }}
                  />
                </div>

                {/* Upload stage indicators */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {uploadStage === "error" ? (
                      <AlertCircle size={14} className="text-rose-400" />
                    ) : uploadStage === "done" ? (
                      <CheckCircle size={14} className="text-emerald-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className={`text-xs font-medium ${
                      uploadStage === "error" ? "text-rose-400" :
                      uploadStage === "done" ? "text-emerald-400" : "text-sky-400"
                    }`}>
                      {statusText}
                    </span>
                  </div>
                  {uploadStage === "uploading" && (
                    <span className="text-xs font-mono text-slate-400">{uploadPercent}%</span>
                  )}
                </div>
              </div>
            )}

            {/* Upload button */}
            {!isUploading && uploadStage !== "done" && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-500/25"
                >
                  <FileUp size={16} />
                  Upload File
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); resetForm(); }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-sm transition-colors border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
