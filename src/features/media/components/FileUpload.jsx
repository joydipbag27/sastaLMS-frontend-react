import React, { useState, useRef, useCallback } from "react";
import { Upload, FileUp, X, CheckCircle, AlertCircle } from "lucide-react";
import { useS3Upload } from "../hooks/useS3Upload";
import Toast from "../../../components/shared/Toast";

const FileUpload = ({ onUploadSuccess, useMediaHook, accept = "video/*" }) => {
  const { getUploadUrl, confirmUpload } = useMediaHook;
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  const {
    isUploading,
    uploadPercent,
    uploadStage,
    statusText,
    uploadFile,
    resetUpload,
  } = useS3Upload();

  const handleFileSelect = useCallback((file) => {
    if (file) {
      if (accept && accept.startsWith("video/") && !file.type.startsWith("video/")) {
        showToast("Only video files are allowed.", "error");
        return;
      }
      setSelectedFile(file);
      resetUpload();
    }
  }, [resetUpload, accept]);

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

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

  const handleResetForm = () => {
    setSelectedFile(null);
    resetUpload();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadFile(selectedFile, getUploadUrl, confirmUpload);
      if (result) {
        onUploadSuccess({
          ...result.media,
          originalName: selectedFile.name,
        });
        setTimeout(handleResetForm, 1500);
      }
    } catch (err) {
      console.error("Upload error details:", err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragging
            ? "border-brand-300 bg-brand-50 scale-[1.01]"
            : selectedFile
              ? "border-slate-300 bg-slate-50"
              : "border-slate-300 bg-white hover:border-brand-300 hover:bg-brand-50/30"
          }
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 ${isDragging ? "bg-brand-100 scale-110" : "bg-slate-100"}`}>
              <Upload size={28} className={`transition-colors ${isDragging ? "text-brand-200" : "text-slate-400"}`} />
            </div>
             <p className="text-sm font-semibold text-slate-700 mb-1">
               {isDragging ? "Drop your video here" : "Drag & drop a video here"}
             </p>
             <p className="text-xs text-slate-500">
               or <span className="text-brand-200 hover:text-brand-300 font-medium">browse from your computer</span>
             </p>
             <p className="text-[11px] text-slate-400 mt-3 font-medium">
               Only video files are allowed
             </p>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                🎬
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{selectedFile.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-mono">{selectedFile.type || "unknown"}</span>
                </div>
              </div>
              {!isUploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleResetForm(); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {isUploading && (
              <div className="mt-4 space-y-2">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      uploadStage === "error" ? "bg-rose-500" : "bg-brand-200"
                    }`}
                    style={{
                      width: uploadStage === "presign" ? "5%" :
                             uploadStage === "uploading" ? `${Math.max(5, uploadPercent * 0.85)}%` :
                             uploadStage === "confirming" ? "90%" :
                             uploadStage === "done" ? "100%" : `${uploadPercent}%`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {uploadStage === "error" ? (
                      <AlertCircle size={14} className="text-rose-500" />
                    ) : uploadStage === "done" ? (
                      <CheckCircle size={14} className="text-emerald-500" />
                    ) : (
                      <div className="w-3.5 h-3.5 border-2 border-brand-200 border-t-transparent rounded-full animate-spin" />
                    )}
                    <span className={`text-xs font-medium ${
                      uploadStage === "error" ? "text-rose-600" :
                      uploadStage === "done" ? "text-emerald-600" : "text-brand-200"
                    }`}>
                      {statusText}
                    </span>
                  </div>
                  {uploadStage === "uploading" && (
                    <span className="text-xs font-mono text-slate-500">{uploadPercent}%</span>
                  )}
                </div>
              </div>
            )}

            {!isUploading && uploadStage !== "done" && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-200 hover:bg-brand-300 text-[#111111] rounded-lg font-semibold text-sm transition-all duration-150 shadow-sm"
                >
                  <FileUp size={16} />
                  Upload File
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleResetForm(); }}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-lg font-medium text-sm transition-colors border border-slate-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default FileUpload;
